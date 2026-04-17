import Link from 'next/link'
import { Mail, ExternalLink } from 'lucide-react'

interface ContactLinksProps {
  settings?: {
    contactEmail?: string
    linkedinUrl?: string
    whatsappNumber?: string
  }
}

export default function ContactLinks({ settings }: ContactLinksProps) {
  return (
    <div className="space-y-4">
      {/* Email */}
      {settings?.contactEmail && (
        <Link
          href={`mailto:${settings.contactEmail}`}
          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all group"
        >
          <Mail className="text-primary group-hover:scale-110 transition-transform" size={24} />
          <div>
            <div className="font-medium">Email</div>
            <div className="text-sm text-foreground/60">{settings.contactEmail}</div>
          </div>
        </Link>
      )}

      {/* LinkedIn */}
      {settings?.linkedinUrl && (
        <Link
          href={settings.linkedinUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all group"
        >
          <ExternalLink className="text-primary group-hover:scale-110 transition-transform" size={24} />
          <div>
            <div className="font-medium">LinkedIn</div>
            <div className="text-sm text-foreground/60">Connect on LinkedIn</div>
          </div>
        </Link>
      )}

      {/* WhatsApp */}
      {settings?.whatsappNumber && (
        <Link
          href={`https://wa.me/${settings.whatsappNumber}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-4 p-4 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all group"
        >
          <MessageCircle className="text-primary group-hover:scale-110 transition-transform" size={24} />
          <div>
            <div className="font-medium">WhatsApp</div>
            <div className="text-sm text-foreground/60">Send a message</div>
          </div>
        </Link>
      )}
    </div>
  )
}
