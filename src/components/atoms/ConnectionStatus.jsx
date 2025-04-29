"use client"

import { useEffect, useState } from "react"

const ConnectionStatus = () => {
  const [isOnline, setIsOnline] = useState(true)

  // Conexión del navegador
  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  return (
    <div className="text-sm space-y-1">
      <p className={isOnline ? "text-green-600" : "text-red-600"}>
        Estado del navegador: {isOnline ? "Conectado" : "Sin conexión"}
      </p>
    </div>
  )
}

export default ConnectionStatus
