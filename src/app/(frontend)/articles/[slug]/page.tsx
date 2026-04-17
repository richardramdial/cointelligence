import { getPayload } from 'payload'
import config from '@/payload.config'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ShareButtons from '@/components/articles/ShareButtons'

async function getArticle(slug: string) {
  const payload = await getPayload({ config })
  const articles = await payload.find({
    collection: 'articles',
    where: {
      slug: { equals: slug },
      '_status': { equals: 'published' },
    },
  })

  return articles.docs[0] || null
}

export async function generateStaticParams() {
  const payload = await getPayload({ config })
  const articles = await payload.find({
    collection: 'articles',
    where: {
      '_status': { equals: 'published' },
    },
  })

  return articles.docs.map(article => ({
    slug: article.slug,
  }))
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await getArticle(params.slug)

  if (!article) {
    return {}
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://cointelligence.com'}/articles/${article.slug}`

  return {
    title: `${article.title} | Cointelligence`,
    description: article.excerpt,
    openGraph: {
      title: article.title,
      description: article.excerpt,
      url,
      type: 'article',
      publishedTime: article.publishedDate,
      authors: ['Richard Ramdial'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
    },
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await getArticle(params.slug)

  if (!article) {
    notFound()
  }

  return (
    <article className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Hero Image */}
      <div className="mb-12 aspect-video bg-muted rounded-lg overflow-hidden">
        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
      </div>

      {/* Header */}
      <header className="mb-12">
        <div className="mb-4">
          <p className="text-sm font-medium text-primary mb-2">{article.theme}</p>
          <p className="text-sm text-foreground/60">
            {new Date(article.publishedDate).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })} · {article.readingTime || 5} min read
          </p>
        </div>
        <h1 className="text-5xl font-serif font-bold leading-tight mb-6">{article.title}</h1>
        <p className="text-xl text-foreground/70 mb-6">{article.excerpt}</p>

        {/* Share Buttons */}
        <ShareButtons title={article.title} excerpt={article.excerpt} slug={article.slug} />
      </header>

      {/* Body */}
      <div className="prose prose-lg max-w-2xl">
        {typeof article.body === 'string' ? (
          <div dangerouslySetInnerHTML={{ __html: article.body }} />
        ) : (
          <p className="text-foreground/70">
            Article content not available in text format. Please use the Payload admin to view the full article.
          </p>
        )}
      </div>

      {/* Related Articles */}
      {/* Coming soon */}
    </article>
  )
}
