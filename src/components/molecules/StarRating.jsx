import { StarIcon as StarSolid } from 'lucide-react'
import { StarIcon as StarOutline } from 'lucide-react'

const StarRating = ({ rating = 0 }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) =>
        i <= rating ? (
          <StarSolid key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
        ) : (
          <StarOutline key={i} className="w-5 h-5 text-gray-300 dark:text-gray-500" />
        )
      )}
    </div>
  )
}

export default StarRating