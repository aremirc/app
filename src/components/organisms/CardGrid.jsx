import ReusableCard from '../molecules/ReusableCard'

const CardGrid = ({ cards }) => {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <ReusableCard key={i} href={card.href} bgColor={card.bgColor}>
            <h3 className="text-lg font-semibold">{card.title}</h3>
            <p className="text-sm">{card.description}</p>
          </ReusableCard>
        ))}
      </div>
    </div>
  )
}

export default CardGrid