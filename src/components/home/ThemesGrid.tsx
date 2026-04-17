import Link from 'next/link'

const THEMES = [
  { name: 'Leadership and Perception', slug: 'leadership-and-perception' },
  { name: 'Systems and Transformation', slug: 'systems-and-transformation' },
  { name: 'Thinking in the Age of AI', slug: 'thinking-in-the-age-of-ai' },
  { name: 'The Craft of Leadership', slug: 'the-craft-of-leadership' },
]

export default function ThemesGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {THEMES.map(theme => (
        <Link
          key={theme.slug}
          href={`/articles?theme=${encodeURIComponent(theme.name)}`}
          className="group p-8 border border-border rounded-lg hover:border-primary hover:bg-muted transition-all"
        >
          <h3 className="text-xl font-serif font-bold text-foreground group-hover:text-primary transition-colors">
            {theme.name}
          </h3>
          <p className="text-foreground/60 text-sm mt-2">Explore articles in this theme</p>
        </Link>
      ))}
    </div>
  )
}
