const Title = ({ children }) => {
  return <h3 className={`text-primary dark:text-primary-dark text-xl font-semibold ${children && "mb-3"}`}>{children}</h3>
}

export default Title