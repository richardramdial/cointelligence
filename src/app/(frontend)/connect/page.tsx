import { getPayload } from 'payload'
import config from '@/payload.config'
import InquiryForm from '@/components/connect/InquiryForm'
import ContactLinks from '@/components/connect/ContactLinks'

export const metadata = {
  title: 'Connect | Cointelligence',
  description: 'Get in touch with Richard Ramdial.',
}

export default async function ConnectPage() {
  const payload = await getPayload({ config })

  const siteSettings = await payload.findGlobal({
    slug: 'site-settings',
  })

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-5xl font-serif font-bold mb-8">Connect</h1>

      <div className="space-y-12">
        {/* Inquiry Form */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">Send an Inquiry</h2>
          <InquiryForm contactEmail={siteSettings?.contactEmail} />
        </div>

        {/* Direct Contact Links */}
        <div>
          <h2 className="text-2xl font-serif font-bold mb-6">Direct Contact</h2>
          <ContactLinks settings={siteSettings} />
        </div>
      </div>
    </div>
  )
}
