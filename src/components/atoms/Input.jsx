const Input = ({ id, type = "text", value, onChange, placeholder, className = "", disabled = false, required = true, ...props }) => {
  return <input
    id={id}
    type={type}
    value={value ?? ""}
    onChange={onChange}
    placeholder={placeholder}
    className={`dark:bg-background-dark shadow-sm appearance-none border rounded-sm w-full py-2 px-3 text-text-light dark:text-text-dark leading-tight focus:outline-hidden focus:ring-3 focus:ring-primary ${className}`}
    disabled={disabled}
    required={required}
    {...props}
  />
}

export default Input