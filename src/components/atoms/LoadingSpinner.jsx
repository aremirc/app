const LoadingSpinner = () => {
  return (
    <div className="min-h-screen flex justify-center items-center space-x-2 bg-background-dark">
      <div className="w-3 h-3 rounded-full bg-primary-light animate-bounce delay-0"></div>
      <div className="w-3 h-3 rounded-full bg-primary animate-bounce delay-200"></div>
      <div className="w-3 h-3 rounded-full bg-primary-dark animate-bounce delay-400"></div>
    </div>
  )
}

export default LoadingSpinner
