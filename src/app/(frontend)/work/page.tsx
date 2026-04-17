import { getPayload } from 'payload'
import config from '@/payload.config'

export const metadata = {
  title: 'Work With Richard | Cointelligence',
  description: 'Explore ways to work with Richard Ramdial.',
}

export default async function WorkPage() {
  const payload = await getPayload({ config })

  const workPage = await payload.findGlobal({
    slug: 'work-page',
  })

  const engagements = await payload.find({
    collection: 'engagements',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">Work With Richard</h1>

      <div className="mb-12">
        <p className="text-lg text-foreground/80 leading-relaxed mb-8">
          {workPage?.introCopy || 'Learn about engagement options.'}
        </p>
      </div>

      <div className="space-y-8">
        {engagements.docs.map(engagement => (
          <div key={engagement.id} className="border-l-4 border-primary pl-6">
            <h2 className="text-2xl font-serif font-bold mb-3">{engagement.title}</h2>
            <p className="text-foreground/70 leading-relaxed">{engagement.description}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
