import ReusableCard from '../molecules/ReusableCard'

const CardGrid = ({ cards }) => {
  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {cards.map((card, i) => (
          <ReusableCard key={i} card={card} />
        ))}
      </div>
    </div>
  )
}

export default CardGrid