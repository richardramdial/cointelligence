import { GlobalConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'

export const CoIntelligencePage: GlobalConfig = {
  slug: 'co-intelligence-page',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.collection === 'users',
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      label: 'Page Content',
    },
  ],
}

export default CoIntelligencePage
