import { CollectionConfig } from 'payload'

const Media: CollectionConfig = {
  slug: 'media',
  upload: {
    staticDir: '/app/media',
    staticURL: '/media',
    imageSizes: [
      {
        name: 'thumbnail',
        width: 400,
        height: 300,
        crop: 'center',
      },
      {
        name: 'medium',
        width: 900,
        height: 600,
        crop: 'center',
      },
      {
        name: 'large',
        width: 1400,
        height: 900,
        crop: 'center',
      },
    ],
    formatOptions: {
      format: 'webp',
    },
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      label: 'Alt Text',
      required: true,
    },
  ],
}

export default Media
