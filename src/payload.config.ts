import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'

import Users from './collections/Users'
import Media from './collections/Media'
import Articles from './collections/Articles'
import Engagements from './collections/Engagements'
import SiteSettings from './globals/SiteSettings'
import HomePage from './globals/HomePage'
import CoIntelligencePage from './globals/CoIntelligencePage'
import AboutPage from './globals/AboutPage'
import WorkPage from './globals/WorkPage'

export default buildConfig({
  admin: {
    user: Users.slug,
  },
  collections: [Users, Media, Articles, Engagements],
  globals: [SiteSettings, HomePage, CoIntelligencePage, AboutPage, WorkPage],
  editor: lexicalEditor({}),
  secret: process.env.PAYLOAD_SECRET || 'secret-key-change-me',
  typescript: {
    outputFile: path.resolve(__dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URI || '',
    },
  }),
})
