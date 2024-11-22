const Card = ({ title, children }) => {
  return (
    <div className="bg-background-light dark:bg-border-dark text-text-light dark:text-text-dark rounded-lg p-4 shadow-md shadow-shadow-light">
      <h3 className="text-primary dark:text-primary-dark font-semibold">{title}</h3>
      {children}
    </div>
  )
}

export default Card