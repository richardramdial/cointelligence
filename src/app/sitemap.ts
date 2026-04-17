import type { MetadataRoute } from 'next'
import { getPayload } from 'payload'
import config from '@/payload.config'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const payload = await getPayload({ config })
  const articles = await payload.find({
    collection: 'articles',
    where: { '_status': { equals: 'published' } },
    sort: '-publishedDate',
    limit: 1000,
    select: { slug: true, updatedAt: true, publishedDate: true },
  })

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`,                changeFrequency: 'weekly',  priority: 1.0 },
    { url: `${SITE_URL}/co-intelligence`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/articles`,        changeFrequency: 'daily',   priority: 0.9 },
    { url: `${SITE_URL}/about`,           changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/work`,            changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/connect`,         changeFrequency: 'yearly',  priority: 0.6 },
  ]

  const articleRoutes: MetadataRoute.Sitemap = articles.docs.map(article => ({
    url: `${SITE_URL}/articles/${article.slug}`,
    lastModified: article.updatedAt
      ? new Date(typeof article.updatedAt === 'string' ? article.updatedAt : new Date())
      : new Date(typeof article.publishedDate === 'string' ? article.publishedDate : new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  return [...staticRoutes, ...articleRoutes]
}
