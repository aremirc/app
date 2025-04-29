import { useState, useEffect } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import Input from "../atoms/Input"
import Icon from "../atoms/Icon"

const SearchBar = ({ placeholder = "Buscar...", onSearch, className = "" }) => {
  const [inputValue, setInputValue] = useState("")
  const [isFocused, setIsFocused] = useState(false)
  const debouncedValue = useDebounce(inputValue, 500)

  useEffect(() => {
    onSearch(debouncedValue)
  }, [debouncedValue, onSearch])

  return (
    <div className="relative">
      <Icon name="search" color="absolute top-1/2 left-2 transform -translate-y-1/2" active={isFocused} />
      <Input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        className={`w-1/3 pl-10 ${className}`}
      />
    </div>
  )
}

export default SearchBar
