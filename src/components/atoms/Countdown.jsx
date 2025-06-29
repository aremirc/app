import { useState, useEffect, useRef } from 'react'
import { useAuth } from "@/context/AuthContext"
import { toast } from 'sonner'

const Countdown = ({ className = '', visible = true }) => {
  const { logout, refreshTokens } = useAuth() // Obtener la función logout y refreshTokens desde el contexto
  const initialTime = 3600 // 1 hora (en segundos)

  // Utilizamos useRef para guardar el startTime y no causar re-renderizados innecesarios
  const startTimeRef = useRef(null)

  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [toastActive, setToastActive] = useState(false) // Estado para controlar si el toast está activo

  // Esta función obtiene el tiempo restante basado en el startTime guardado
  const getTimeLeft = () => {
    const elapsedTime = Math.floor((Date.now() - startTimeRef.current) / 1000)
    const timeLeft = initialTime - elapsedTime

    // Verificar si el tiempo está a punto de expirar y renovar el token
    if (timeLeft <= 300 && timeLeft > 0 && !toastActive) { // Si quedan menos de 5 minutos y el toast no está activo
      const toastId = 'session-expiring-toast'
      toast.dismiss(toastId) // Forzar cierre previo si quedara "colgado"
      setToastActive(true) // Activar el estado del toast      

      const durationMs = timeLeft <= 60 ? timeLeft * 1000 : 30000

      toast('Tu sesión está a punto de expirar. ¿Quieres renovar los tokens?', {
        id: toastId,
        duration: durationMs,
        dismissible: true,
        action: {
          label: 'Renovar tokens',
          onClick: async () => {
            await refreshTokens() // Renueva el token
            toast.dismiss(toastId) // Descartar el toast
            setToastActive(false) // Desactivar el estado del toast
          },
        },
        // Agregar onDismiss para manejar cuando el toast desaparece (ya sea por expiración o por el usuario)
        onDismiss: () => {
          setToastActive(false) // Desactivar el estado del toast cuando desaparezca
        },
      })

      setTimeout(() => {
        setToastActive(false)
      }, durationMs) // sincronizado con duration
    }

    // Si el tiempo ha expirado, cerramos la sesión
    if (timeLeft <= 0) {
      logout() // Llamar a logout cuando el tiempo se agote
    }

    return timeLeft >= 0 ? timeLeft : 0
  }

  // Cargamos el tiempo de inicio desde localStorage cuando el componente se monta
  useEffect(() => {
    const savedStartTime = localStorage.getItem('startTime')
    if (!savedStartTime) {
      return // Si no hay startTime en localStorage, no hacemos nada
    } else {
      startTimeRef.current = parseInt(savedStartTime, 10)
    }

    // Actualizamos el tiempo restante cuando el componente se monta
    setTimeLeft(getTimeLeft())
  }, []) // Solo se ejecuta una vez al montar el componente

  // Usamos un intervalo para actualizar el tiempo restante cada segundo
  useEffect(() => {
    if (timeLeft <= 0) {
      logout() // Llamar a logout cuando el tiempo se agote
      return
    }

    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft())
    }, 1000)

    // Limpiar el intervalo al desmontar el componente o al llegar a cero
    return () => clearInterval(interval)
  }, [timeLeft]) // Dependencia para re-calcular cuando el tiempo cambie

  // Función para formatear el tiempo en formato HH:MM:SS
  const formatTime = (seconds) => {
    const hours = String(Math.floor(seconds / 3600)).padStart(2, '0')
    const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')
    const secs = String(seconds % 60).padStart(2, '0')
    return `${hours}:${minutes}:${secs}`
  }

  // Si no hay startTime en localStorage, no renderizamos el componente
  if (!startTimeRef.current) return null

  return (
    <div className={`${!visible && 'hidden'} mt-1 text-sm text-center text-gray-500 dark:text-gray-300 ${className}`}>
      <p>{formatTime(timeLeft)}</p>
    </div>
  )
}

export default Countdown