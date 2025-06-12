const DashboardGrid = ({ children, className = '' }) => {
  return (
    <div className={`grid lg:grid-cols-[repeat(auto-fit,minmax(350px,1fr))] gap-4 ${className}`}>
      {children}
    </div>
  )
}

export default DashboardGrid
