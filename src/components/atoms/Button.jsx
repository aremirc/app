const Button = ({ children, type = "button", onClick, className = "", disabled = false, ...props }) => {
  return (
    <button
      {...props}
      type={type}
      onClick={onClick}
      className={`dark:bg-background-dark hover:bg-border-light dark:hover:bg-border-dark text-text-light dark:text-text-dark text-sm font-bold rounded-lg focus:outline-hidden focus:ring-3 focus:ring-blue-300 transition py-2 px-4 cursor-pointer ${disabled && 'disabled:bg-gray-100 text-gray-500 cursor-not-allowed'} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button