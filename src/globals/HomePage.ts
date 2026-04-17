import { GlobalConfig } from 'payload'
import { revalidatePath } from 'next/cache'

export const HomePage: GlobalConfig = {
  slug: 'home-page',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.collection === 'users',
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      type: 'collapsible',
      label: 'Hero Section',
      fields: [
        {
          name: 'heroHeading',
          type: 'text',
          required: true,
          label: 'Heading',
        },
        {
          name: 'heroSubheading',
          type: 'text',
          required: true,
          label: 'Subheading',
        },
        {
          name: 'heroBody',
          type: 'textarea',
          required: true,
          label: 'Body Text',
        },
        {
          name: 'primaryCtaLabel',
          type: 'text',
          required: true,
          label: 'Primary CTA Label',
        },
        {
          name: 'primaryCtaUrl',
          type: 'text',
          required: true,
          label: 'Primary CTA URL',
        },
        {
          name: 'secondaryCtaLabel',
          type: 'text',
          label: 'Secondary CTA Label',
        },
        {
          name: 'secondaryCtaUrl',
          type: 'text',
          label: 'Secondary CTA URL',
        },
      ],
    },
    {
      name: 'featuredArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      maxRows: 3,
      label: 'Featured Articles',
    },
    {
      type: 'array',
      name: 'coIntelligenceCards',
      label: 'Co-Intelligence Cards',
      maxRows: 4,
      fields: [
        {
          name: 'title',
          type: 'text',
          required: true,
        },
        {
          name: 'body',
          type: 'textarea',
          required: true,
        },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async () => {
        try {
          revalidatePath('/')
        } catch (e) {
          console.error('Failed to revalidate homepage:', e)
        }
      },
    ],
  },
}

export default HomePage
