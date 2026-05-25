import { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'
import webpush from 'web-push'

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VITE_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
)

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body: { clerk_id: string; title: string; body: string; url?: string; tag?: string }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { clerk_id, title, body: msgBody, url = '/', tag } = body

  if (!clerk_id || !title) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  const { data: subs, error } = await supabase
    .from('push_subscriptions')
    .select('endpoint, p256dh, auth')
    .eq('clerk_id', clerk_id)

  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  if (!subs?.length) return { statusCode: 200, body: JSON.stringify({ sent: 0 }) }

  const payload = JSON.stringify({ title, body: msgBody, url, tag })
  const results = await Promise.allSettled(
    subs.map((sub) =>
      webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        payload
      )
    )
  )

  // Remove expired subscriptions (410 Gone)
  const expired = subs.filter((_, i) => {
    const r = results[i]
    return r.status === 'rejected' && (r.reason as any)?.statusCode === 410
  })

  if (expired.length) {
    await supabase
      .from('push_subscriptions')
      .delete()
      .in('endpoint', expired.map((s) => s.endpoint))
  }

  const sent = results.filter((r) => r.status === 'fulfilled').length
  return { statusCode: 200, body: JSON.stringify({ sent }) }
}
