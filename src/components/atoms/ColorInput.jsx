const ColorInput = ({ name = "bgColor", value, onChange }) => {
  // Extrae el valor hex desde el string de clases
  const extractColor = (classString) => {
    const match = classString?.match(/#(?:[0-9a-fA-F]{3}){1,2}/)
    return match ? match[0] : "#4FD1C5" // fallback: teal
  }

  // Convierte el hex a clases tailwind arbitrarias
  const makeColorClasses = (hex) => {
    return `bg-[${hex}] hover:bg-[${hex}] dark:bg-[${hex}] dark:hover:bg-[${hex}]`
  }

  const handleChange = (e) => {
    const hex = e.target.value
    onChange({
      target: {
        name,
        value: makeColorClasses(hex),
      },
    })
  }

  const hex = extractColor(value)

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Color de la tarjeta
      </label>
      <div className="flex items-center gap-4">
        {/* Input de color */}
        <input
          type="color"
          value={hex}
          onChange={handleChange}
          className="w-10 h-10 border rounded dark:border-gray-600 cursor-pointer bg-transparent"
          title="Elige un color"
        />

        {/* Hex visible */}
        <span className="text-sm text-gray-600 dark:text-gray-400">{hex}</span>

        {/* Vista previa */}
        <div
          className={`w-32 h-12 flex items-center justify-center text-white rounded shadow ${makeColorClasses(hex)}`}
        >
          Preview
        </div>
      </div>
    </div>
  )
}

export default ColorInput
