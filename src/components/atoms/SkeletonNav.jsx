const SkeletonNav = () => {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 p-2 rounded-md animate-pulse bg-gray-200 dark:bg-gray-700"
        >
          <div className="w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          <div className="h-4 w-3/4 bg-gray-300 dark:bg-gray-600 rounded"></div>
        </div>
      ))}
    </div>
  )
}

export default SkeletonNav
