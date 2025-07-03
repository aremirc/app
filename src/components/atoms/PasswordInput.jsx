import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import Input from "./Input"

const PasswordInput = ({ value, onChange, id, placeholder, ...props }) => {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => setShowPassword((prev) => !prev)

  return (
    <div className="relative">
      <Input
        value={value}
        onChange={onChange}
        id={id}
        type={showPassword ? "text" : "password"}
        placeholder={placeholder}
        className="pr-10" // espacio para el botón
        {...props}
      />
      <button
        type="button"
        onClick={togglePassword}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-sm cursor-pointer"
        tabIndex={-1}
        aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
        title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
      >
        {showPassword ? (
          <EyeOff size={18} strokeWidth={1.75} />
        ) : (
          <Eye size={18} strokeWidth={1.75} />
        )}
      </button>
    </div>
  )
}

export default PasswordInput
