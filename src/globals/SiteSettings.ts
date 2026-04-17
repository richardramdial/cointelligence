import { GlobalConfig } from 'payload'

const SiteSettings: GlobalConfig = {
  slug: 'site-settings',
  label: 'Site Settings',
  admin: {
    group: 'Settings',
  },
  fields: [
    {
      name: 'siteName',
      type: 'text',
      label: 'Site Name',
      required: true,
      defaultValue: 'Cointelligence',
    },
    {
      name: 'tagline',
      type: 'text',
      label: 'Tagline',
      required: false,
    },
    {
      name: 'contactEmail',
      type: 'email',
      label: 'Contact Email',
      required: true,
    },
    {
      name: 'linkedinUrl',
      type: 'text',
      label: 'LinkedIn URL',
      required: false,
    },
    {
      name: 'whatsappNumber',
      type: 'text',
      label: 'WhatsApp Number (without +)',
      required: false,
      admin: {
        description: 'International format without +, e.g. 27821234567',
      },
    },
  ],
}

export default SiteSettings
