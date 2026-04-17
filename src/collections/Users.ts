import { CollectionConfig } from 'payload'

const Users: CollectionConfig = {
  slug: 'users',
  admin: {
    useAsTitle: 'email',
  },
  auth: {
    disableLocalStrategy: true,
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
      unique: true,
      admin: {
        position: 'sidebar',
      },
    },
  ],
}

export default Users
