import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Sync NextAuth user with Payload Users collection
 * Called after successful NextAuth sign-in
 */
export async function POST(req: NextRequest) {
  try {
    const { email, name, image } = await req.json()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const payload = await getPayload({ config })

    // Check if user exists
    const existingUsers = await payload.find({
      collection: 'users',
      where: {
        email: { equals: email },
      },
    })

    let user

    if (existingUsers.docs.length > 0) {
      // User exists, return existing
      user = existingUsers.docs[0]
    } else {
      // Create new user from OAuth profile
      user = await payload.create({
        collection: 'users',
        data: {
          email,
          // OAuth users don't have passwords; Payload will handle this
        },
      })
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
      },
    })
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.json({ error: 'Auth callback failed' }, { status: 500 })
  }
}
