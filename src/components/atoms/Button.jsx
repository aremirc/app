const Button = ({ children, type = "button", onClick, className = "", disabled = false }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-primary-light dark:bg-background-dark text-text-light dark:text-text-dark hover:bg-background-light dark:hover:bg-border-dark hover:dark:text-text-dark text-sm font-bold py-2 px-4 rounded-lg focus:outline-none focus:ring focus:ring-blue-300 transition ${disabled && 'disabled:bg-gray-100 text-gray-500 cursor-not-allowed'} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button