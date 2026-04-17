import { CollectionConfig } from 'payload'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { revalidatePath } from 'next/cache'

const THEMES = [
  'Leadership and Perception',
  'Systems and Transformation',
  'Thinking in the Age of AI',
  'The Craft of Leadership',
]

export const Articles: CollectionConfig = {
  slug: 'articles',
  access: {
    read: () => true,
    create: ({ req }) => req.user?.collection === 'users',
    update: ({ req }) => req.user?.collection === 'users',
    delete: ({ req }) => req.user?.collection === 'users',
  },
  admin: {
    useAsTitle: 'title',
    group: 'Content',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
      label: 'Article Title',
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      label: 'Slug',
      admin: {
        readOnly: true,
      },
    },
    {
      name: 'theme',
      type: 'select',
      required: true,
      options: THEMES.map(t => ({ label: t, value: t })),
      label: 'Theme',
    },
    {
      name: 'coverImage',
      type: 'relationship',
      relationTo: 'media',
      required: true,
      label: 'Cover Image',
    },
    {
      name: 'body',
      type: 'richText',
      editor: lexicalEditor(),
      required: true,
      label: 'Article Body',
    },
    {
      name: 'excerpt',
      type: 'textarea',
      required: true,
      label: 'Excerpt',
    },
    {
      name: 'readingTime',
      type: 'number',
      admin: {
        readOnly: true,
      },
      label: 'Reading Time (minutes)',
    },
    {
      name: 'featured',
      type: 'checkbox',
      label: 'Featured Article',
    },
    {
      name: 'publishedDate',
      type: 'date',
      required: true,
      label: 'Published Date',
    },
  ],
  versions: {
    drafts: true,
  },
  hooks: {
    beforeValidate: [
      ({ data }) => {
        if (data && data.title && !data.slug) {
          data.slug = data.title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
        }
        return data
      },
    ],
    beforeChange: [
      ({ data }) => {
        if (data && data.body && typeof data.body === 'object') {
          // Count words in Lexical JSON
          const countWords = (node: any): number => {
            let count = 0
            if (typeof node === 'string') {
              count = node.trim().split(/\s+/).filter((w: string) => w.length > 0).length
            } else if (Array.isArray(node)) {
              count = node.reduce((sum, item) => sum + countWords(item), 0)
            } else if (node && typeof node === 'object') {
              Object.values(node).forEach(value => {
                count += countWords(value)
              })
            }
            return count
          }
          const wordCount = countWords(data.body)
          data.readingTime = Math.ceil(wordCount / 200)
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc }) => {
        // Revalidate article pages on change
        try {
          revalidatePath('/articles')
          revalidatePath(`/articles/${doc.slug}`)
        } catch (e) {
          console.error('Failed to revalidate paths:', e)
        }
      },
    ],
  },
}

export default Articles
