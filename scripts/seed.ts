import { getPayload } from 'payload'
import config from '../src/payload.config.js'

async function seed() {
  const payload = await getPayload({ config })

  // Check if admin user already exists
  const existingUsers = await payload.find({
    collection: 'users',
    where: {
      email: { equals: 'richard.ramdial@gmail.com' },
    },
  })

  if (existingUsers.docs.length > 0) {
    console.log('Admin user already exists')
    return
  }

  // Create admin user
  try {
    await payload.create({
      collection: 'users',
      data: {
        email: 'richard.ramdial@gmail.com',
        password: process.env.ADMIN_PASSWORD || 'change-me-in-production',
      },
    })
    console.log('Admin user created successfully')
  } catch (error) {
    console.error('Error creating admin user:', error)
    process.exit(1)
  }
}

seed()
