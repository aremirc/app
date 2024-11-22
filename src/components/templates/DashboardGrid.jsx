const DashboardGrid = ({ children }) => {
  return (
    <div className="grid lg:grid-cols-[repeat(auto-fit,_minmax(100px,_1fr))] gap-4 p-4">
      {children}
    </div>
  )
}

export default DashboardGrid