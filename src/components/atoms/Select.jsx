const Select = ({ options = [], ...props }) => {
  return (
    <select
      {...props}
      className="p-2 border rounded-sm w-full dark:bg-gray-800 dark:text-white"
    >
      {options.map((opt, i) => (
        <option key={i} value={opt.value}>{opt.name}</option>
      ))}
    </select>
  )
}

export default Select