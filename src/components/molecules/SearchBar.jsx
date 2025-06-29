import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import Input from "../atoms/Input"
import Icon from "../atoms/Icon"

const SearchBar = ({ placeholder = "Buscar...", onSearch, total, className = "" }) => {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const debouncedValue = useDebounce(inputValue, 500)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  return (
    <div className="relative">
      <label htmlFor="search" className="absolute top-1/2 left-2 transform -translate-y-1/2">
        <Icon name="search" color="" active={isFocused} />
      </label>
      <Input
        id="search"
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-1/3 pl-10 ${className}`}
      />
      {total !== undefined &&
        <span className="text-gray-500 absolute top-1/2 right-3 transform -translate-y-1/2">
          Total: {total}
        </span>
      }
    </div>
  )
}

export default SearchBar
