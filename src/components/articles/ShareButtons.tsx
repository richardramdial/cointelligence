'use client'

import { Mail, MessageCircle, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface ShareButtonsProps {
  title: string
  excerpt: string
  slug: string
}

export default function ShareButtons({ title, excerpt, slug }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.href : `${process.env.NEXT_PUBLIC_SITE_URL}/articles/${slug}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleEmail = () => {
    const subject = `Check out: ${title}`
    const body = `${excerpt}\n\n${url}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleWhatsApp = async () => {
    // Fetch SiteSettings to get WhatsApp number
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'site-settings',
    })

    const whatsappNumber = settings?.whatsappNumber
    if (!whatsappNumber) {
      console.warn('WhatsApp number not configured')
      return
    }

    const message = `${title}\n\n${excerpt}\n\n${url}`
    const wa_link = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    window.open(wa_link, '_blank')
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <span className="text-sm font-medium text-foreground/60">Share:</span>
      <button
        onClick={handleEmail}
        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/70 hover:text-foreground"
        title="Share via Email"
        aria-label="Share via email"
      >
        <Mail size={20} />
      </button>
      <button
        onClick={handleWhatsApp}
        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/70 hover:text-foreground"
        title="Share on WhatsApp"
        aria-label="Share on WhatsApp"
      >
        <MessageCircle size={20} />
      </button>
      <button
        onClick={handleCopyLink}
        className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground/70 hover:text-foreground"
        title="Copy link"
        aria-label="Copy article link"
      >
        {copied ? <Check size={20} className="text-green-600" /> : <Copy size={20} />}
      </button>
    </div>
  )
}
