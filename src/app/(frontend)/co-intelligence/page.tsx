import { getPayload } from 'payload'
import config from '@/payload.config'

export const metadata = {
  title: 'Co-Intelligence | Cointelligence',
  description: 'Understanding co-intelligence and its applications.',
}

export default async function CoIntelligencePage() {
  const payload = await getPayload({ config })

  const coIntelligencePage = await payload.findGlobal({
    slug: 'co-intelligence-page',
  })

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">Co-Intelligence</h1>

      <div className="prose prose-lg max-w-3xl">
        {typeof coIntelligencePage?.body === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: coIntelligencePage.body }} />
        ) : (
          <p className="text-foreground/70">
            Content not yet configured. Please use the Payload admin to add the co-intelligence page content.
          </p>
        )}
      </div>
    </article>
  )
}
