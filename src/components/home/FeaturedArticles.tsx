import Link from 'next/link'
import Image from 'next/image'
import { getPayload } from 'payload'
import config from '@/payload.config'

interface FeaturedArticlesProps {
  articles: (string | number | any)[]
}

export default async function FeaturedArticles({ articles }: FeaturedArticlesProps) {
  const payload = await getPayload({ config })

  // Fetch article details
  const articleDetails = await Promise.all(
    articles.slice(0, 3).map(async id => {
      try {
        return await payload.findByID({
          collection: 'articles',
          id: typeof id === 'object' ? id.id : id,
        })
      } catch {
        return null
      }
    })
  )

  const validArticles = articleDetails.filter((article): article is NonNullable<typeof article> => article !== null)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {validArticles.map(article => (
        <Link
          key={article.id}
          href={`/articles/${article.slug}`}
          className="group overflow-hidden rounded-lg border border-border hover:border-primary transition-all hover:shadow-lg"
        >
          <div className="aspect-video bg-muted relative overflow-hidden">
            {typeof article.coverImage === 'object' && article.coverImage.url ? (
              <Image
                src={article.coverImage.url}
                alt={article.coverImage.alt ?? article.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-foreground/40">No image</span>
              </div>
            )}
          </div>
          <div className="p-6">
            <p className="text-sm font-medium text-primary mb-2">{article.theme}</p>
            <h3 className="text-lg font-serif font-bold mb-3 line-clamp-2 group-hover:text-primary transition-colors">
              {article.title}
            </h3>
            <p className="text-sm text-foreground/60 line-clamp-2 mb-4">{article.excerpt}</p>
            <div className="flex items-center justify-between text-xs text-foreground/50">
              <span>{article.readingTime || 5} min read</span>
              <span>{new Date(article.publishedDate).toLocaleDateString()}</span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
