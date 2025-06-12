"use client"

import LoadingOverlay from "@/components/atoms/LoadingOverlay"
import { createContext, useContext, useEffect, useState, useRef } from "react"
import { io } from "socket.io-client"

const SocketContext = createContext(null)

// El componente SocketProvider será el encargado de manejar la conexión
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null)
  const socketRef = useRef(null) // Usamos un ref para evitar crear varias conexiones

  useEffect(() => {
    let hasConnected = false

    // Solo crear la conexión si no existe
    if (socketRef.current && socketRef.current.connected !== false) return

    // Determina si estamos en desarrollo o en producción
    const isDevelopment = process.env.NODE_ENV === 'development'

    // Usa '/' para desarrollo y window.location.origin para producción
    const socketUrl = isDevelopment ? '/' : (typeof window !== 'undefined' ? window.location.origin : '')

    // Solo continuar si tenemos una URL válida
    if (!socketUrl) {
      console.error('No se pudo determinar la URL del WebSocket.')
      return
    }

    // Crear la conexión WebSocket con reconexión automática
    socketRef.current = io(socketUrl, {
      reconnection: true, // Habilitar reconexión automática
      reconnectionAttempts: 5, // Intentos de reconexión
      reconnectionDelay: 1000, // Retraso entre intentos de reconexión
      reconnectionDelayMax: 5000, // Retraso máximo entre intentos
      timeout: 10000, // Tiempo máximo de espera para establecer la conexión
      withCredentials: true, // Esto asegura que las cookies se envíen con la solicitud
    })

    socketRef.current.on("connect", () => {
      hasConnected = true
      console.log("✅ Conectado al WebSocket con ID:", socketRef.current.id)
    })

    // socketRef.current.on('response', (msg) => {
    //   console.log('📩 Respuesta del servidor:', msg)
    // })

    // Enviar mensaje al servidor
    // socketRef.current.emit('message', 'Hola desde el cliente!')

    socketRef.current.on("connect_error", (err) => {
      if (!hasConnected) {
        console.error("❌ Error de conexión inicial:", err)
      } else {
        console.warn("⚠️ Error de reconexión:", err)
      }
    })

    // Cuando la conexión se pierde, tratamos de reconectar
    socketRef.current.on("disconnect", () => {
      console.warn("🔌 Desconectado del WebSocket")
    })

    socketRef.current.on("reconnect_attempt", (attempt) => {
      console.warn(`🔁 Intento de reconexión #${attempt}`)
    })

    setSocket(socketRef.current)

    return () => {
      // Desconectar solo si la conexión no está siendo usada en otro lugar
      if (socketRef.current) {
        if (socketRef.current.connected) {
          socketRef.current.disconnect()
          console.log("🔒 Conexión WebSocket cerrada")
        }
        socketRef.current = null
      }
    }
  }, [])

  return (
    <SocketContext.Provider value={socket}>
      {socket ? children : <LoadingOverlay fullscreen />}
    </SocketContext.Provider>
  )
}

// Custom hook para usar el socket en cualquier componente
export const useSocket = () => {
  const socket = useContext(SocketContext)
  if (!socket) {
    throw new Error("useSocket debe ser utilizado dentro de un SocketProvider")
  }
  return socket
}
