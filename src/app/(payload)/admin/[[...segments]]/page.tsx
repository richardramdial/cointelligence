import type { Metadata } from 'next'

// Payload admin UI will be rendered at runtime via Payload's Next.js integration
// This is a placeholder - the actual admin interface is handled by @payloadcms/next

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Cointelligence Admin Panel',
}

export default function AdminPage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Admin Panel</h1>
      <p>Loading Payload CMS admin interface...</p>
    </div>
  )
}
