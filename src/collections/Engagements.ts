import { CollectionConfig } from 'payload'

export const Engagements: CollectionConfig = {
  slug: 'engagements',
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
      label: 'Engagement Type',
    },
    {
      name: 'description',
      type: 'textarea',
      required: true,
      label: 'Description',
    },
  ],
}

export default Engagements
