import { Handler, HandlerEvent } from '@netlify/functions'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export const handler: Handler = async (event: HandlerEvent) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  let body: { clerk_id: string }
  try {
    body = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { clerk_id } = body
  if (!clerk_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Missing clerk_id' }) }
  }

  // Delete from Supabase first (cascades to posts, favorites, etc. via FK)
  const { error: dbError } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', clerk_id)

  if (dbError) {
    return { statusCode: 500, body: JSON.stringify({ error: dbError.message }) }
  }

  // Delete from Clerk via backend API
  const clerkSecretKey = process.env.CLERK_SECRET_KEY
  if (clerkSecretKey) {
    const res = await fetch(`https://api.clerk.com/v1/users/${clerk_id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${clerkSecretKey}` },
    })
    if (!res.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Failed to delete Clerk user' }) }
    }
  }

  return { statusCode: 200, body: JSON.stringify({ ok: true }) }
}
