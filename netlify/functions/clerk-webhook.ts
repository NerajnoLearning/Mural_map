import { Handler, HandlerEvent } from '@netlify/functions'
import { Webhook } from 'svix'
import { createClient } from '@supabase/supabase-js'

// Initialize Supabase client with service role key (NOT anon key!)
const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

export const handler: Handler = async (event: HandlerEvent) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    }
  }

  try {
    // Verify webhook signature
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET!

    if (!webhookSecret) {
      console.error('CLERK_WEBHOOK_SECRET not configured')
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Webhook secret not configured' })
      }
    }

    // Get Svix headers
    const svixId = event.headers['svix-id']
    const svixTimestamp = event.headers['svix-timestamp']
    const svixSignature = event.headers['svix-signature']

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error('Missing svix headers')
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing svix headers' })
      }
    }

    // Verify the webhook
    const wh = new Webhook(webhookSecret)
    const payload = wh.verify(event.body!, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature
    })

    const { type, data } = payload as any

    console.log(`Webhook received: ${type}`)

    switch (type) {
      case 'user.created':
        await handleUserCreated(data)
        break

      case 'user.updated':
        await handleUserUpdated(data)
        break

      case 'user.deleted':
        await handleUserDeleted(data)
        break

      default:
        console.log(`Unhandled webhook type: ${type}`)
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    }
  } catch (err: any) {
    console.error('Webhook error:', err)
    return {
      statusCode: 400,
      body: JSON.stringify({ error: err.message || 'Webhook verification failed' })
    }
  }
}

async function handleUserCreated(data: any) {
  console.log('Creating user:', data.id)

  const email = data.email_addresses?.[0]?.email_address
  const username = data.username || email?.split('@')[0] || `user_${data.id.slice(0, 8)}`
  const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || username

  const { error } = await supabase.from('users').insert({
    clerk_id: data.id,
    email: email,
    username: username,
    display_name: displayName,
    avatar_url: data.image_url || null,
    bio: null
  })

  if (error) {
    console.error('Error creating user:', error)
    throw new Error(`Failed to create user: ${error.message}`)
  }

  console.log('User created successfully:', data.id)
}

async function handleUserUpdated(data: any) {
  console.log('Updating user:', data.id)

  const email = data.email_addresses?.[0]?.email_address
  const username = data.username || email?.split('@')[0]
  const displayName = [data.first_name, data.last_name].filter(Boolean).join(' ') || username

  const { error } = await supabase
    .from('users')
    .update({
      email: email,
      username: username,
      display_name: displayName,
      avatar_url: data.image_url || null
    })
    .eq('clerk_id', data.id)

  if (error) {
    console.error('Error updating user:', error)
    throw new Error(`Failed to update user: ${error.message}`)
  }

  console.log('User updated successfully:', data.id)
}

async function handleUserDeleted(data: any) {
  console.log('Deleting user:', data.id)

  const { error } = await supabase
    .from('users')
    .delete()
    .eq('clerk_id', data.id)

  if (error) {
    console.error('Error deleting user:', error)
    throw new Error(`Failed to delete user: ${error.message}`)
  }

  console.log('User deleted successfully:', data.id)
}
