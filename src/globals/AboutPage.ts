import { GlobalConfig } from 'payload'

export const AboutPage: GlobalConfig = {
  slug: 'about-page',
  access: {
    read: () => true,
    update: ({ req }) => req.user?.collection === 'users',
  },
  admin: {
    group: 'Content',
  },
  fields: [
    {
      name: 'bioParagraphOne',
      type: 'textarea',
      required: true,
      label: 'Bio Paragraph One',
    },
    {
      name: 'bioParagraphTwo',
      type: 'textarea',
      required: true,
      label: 'Bio Paragraph Two',
    },
  ],
}

export default AboutPage
