import { GlobalConfig } from 'payload'

export const WorkPage: GlobalConfig = {
  slug: 'work-page',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.collection === 'users',
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'introCopy',
      type: 'textarea',
      required: true,
      label: 'Intro Copy',
    },
  ],
}

export default WorkPage
