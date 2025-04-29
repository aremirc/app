import { useState, useEffect } from 'react'

/**
 * Hook de debounce optimizado.
 * Espera hasta que el usuario haya dejado de escribir por un tiempo
 * específico antes de devolver el valor debounced.
 *
 * @param value El valor que se desea debounced.
 * @param delay El tiempo en milisegundos de retraso antes de aplicar el debounce (default 500ms).
 * @returns El valor debounced.
 */

export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    // Configura el temporizador para el debounce
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Limpiar el temporizador cuando el valor o el retraso cambian
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
