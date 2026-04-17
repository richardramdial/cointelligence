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

  // Seed Engagements
  const engagementsData = [
    {
      title: 'Executive Advisory',
      description: 'Work with Richard on strategic direction, organizational transformation, and leadership alignment.',
    },
    {
      title: 'Leadership Conversations',
      description: 'Facilitated conversations exploring leadership challenges, decision-making frameworks, and organizational dynamics.',
    },
    {
      title: 'Speaking and Workshops',
      description: 'Custom workshops and keynotes tailored to your organization\'s needs and context.',
    },
  ]

  try {
    for (const engagement of engagementsData) {
      const existing = await payload.find({
        collection: 'engagements',
        where: {
          title: { equals: engagement.title },
        },
      })

      if (existing.docs.length === 0) {
        await payload.create({
          collection: 'engagements',
          data: engagement,
        })
        console.log(`Created engagement: ${engagement.title}`)
      }
    }
    console.log('Engagements seeded successfully')
  } catch (error) {
    console.error('Error seeding engagements:', error)
    process.exit(1)
  }
}

seed()
