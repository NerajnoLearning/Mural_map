import { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST' && event.httpMethod !== 'DELETE') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body: { clerk_id: string; subscription: PushSubscriptionJSON }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { clerk_id, subscription } = body

  if (!clerk_id || !subscription?.endpoint) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields' }) }
  }

  if (event.httpMethod === 'DELETE') {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('clerk_id', clerk_id)
      .eq('endpoint', subscription.endpoint)

    if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
    return { statusCode: 200, body: JSON.stringify({ ok: true }) }
  }

  // Upsert subscription
  const { error } = await supabase
    .from('push_subscriptions')
    .upsert(
      {
        clerk_id,
        endpoint: subscription.endpoint,
        p256dh: (subscription.keys as any)?.p256dh,
        auth: (subscription.keys as any)?.auth,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'endpoint' }
    )

  if (error) return { statusCode: 500, body: JSON.stringify({ error: error.message }) }
  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
