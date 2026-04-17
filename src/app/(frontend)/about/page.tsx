import { getPayload } from 'payload'
import config from '@/payload.config'

export const metadata = {
  title: 'About Richard',
  description: 'Learn more about Richard Ramdial.',
}

export default async function AboutPage() {
  const payload = await getPayload({ config })

  const aboutPage = await payload.findGlobal({
    slug: 'about-page',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">About Richard</h1>

      <div className="space-y-6 text-lg text-foreground/80 leading-relaxed">
        <p>{aboutPage?.bioParagraphOne || 'Bio not yet configured.'}</p>
        <p>{aboutPage?.bioParagraphTwo || ''}</p>
      </div>
    </div>
  )
}
