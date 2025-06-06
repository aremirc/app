const DashboardGrid = ({ children }) => {
  return (
    <div className="grid lg:grid-cols-[repeat(auto-fit,_minmax(350px,_1fr))] gap-4">
      {children}
    </div>
  )
}

export default DashboardGrid
