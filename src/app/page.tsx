import { getPayload } from 'payload'
import config from '@/payload.config'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import Hero from '@/components/home/Hero'
import ThemesGrid from '@/components/home/ThemesGrid'
import FeaturedArticles from '@/components/home/FeaturedArticles'
import CoIntelligenceCards from '@/components/home/CoIntelligenceCards'
import ArticlesByTheme from '@/components/home/ArticlesByTheme'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: {
    absolute: 'Cointelligence',
  },
  description: 'Editorial and thought-leadership platform by Richard Ramdial',
}

export default async function HomePage() {
  const payload = await getPayload({ config })

  const homePage = await payload.findGlobal({
    slug: 'home-page',
  })

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main id="main-content" className="flex-1">
        <div className="space-y-20 py-12">
          <Hero data={homePage} />

          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ThemesGrid />
          </section>

          {homePage?.featuredArticles && homePage.featuredArticles.length > 0 && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-serif font-bold mb-8">Featured Articles</h2>
              <FeaturedArticles articles={homePage.featuredArticles} />
            </section>
          )}

          {homePage?.coIntelligenceCards && homePage.coIntelligenceCards.length > 0 && (
            <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <h2 className="text-4xl font-serif font-bold mb-8">Co-Intelligence</h2>
              <CoIntelligenceCards cards={homePage.coIntelligenceCards} />
            </section>
          )}

          <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <ArticlesByTheme />
          </section>
        </div>
      </main>
      <Footer />
    </div>
  )
}
