const Input = ({ id, type = "text", value, onChange, placeholder, className = "", disabled = false }) => {
  return <input
    id={id}
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className={`dark:bg-background-dark shadow appearance-none border rounded w-full py-2 px-3 text-text-light dark:text-text-dark leading-tight focus:outline-none focus:ring focus:ring-primary ${className}`}
    disabled={disabled}
    required
  />
}

export default Input