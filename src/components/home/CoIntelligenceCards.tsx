interface Card {
  title: string
  body: string
}

interface CoIntelligenceCardsProps {
  cards: Card[]
}

export default function CoIntelligenceCards({ cards }: CoIntelligenceCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {cards.map((card, idx) => (
        <div key={idx} className="p-6 border border-border rounded-lg hover:border-primary transition-colors">
          <h3 className="text-xl font-serif font-bold mb-3 text-foreground">{card.title}</h3>
          <p className="text-foreground/70 leading-relaxed">{card.body}</p>
        </div>
      ))}
    </div>
  )
}
