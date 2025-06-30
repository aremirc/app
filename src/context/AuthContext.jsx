"use client"

import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import queryClient from '@/lib/queryClient'
import { toast } from 'sonner'
import api from '@/lib/axios' // Instancia personalizada de Axios

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ // Inicializar como invitado (usuario sin permisos)
    name: "Invitado",  // Nombre genérico para el invitado
    roleId: 0,         // roleId 0, indicando que no es un usuario con permisos especiales
    avatar: "/default-avatar.webp"
  })

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const router = useRouter()

  // Verificar si hay un usuario almacenado
  useEffect(() => {
    checkSession()
  }, [])

  const checkSession = useCallback(async () => {
    try {
      setLoading(true)

      const promise = api.get('/api/status').then((response) => {
        if (response.data.status === 'success') {
          if (response.data && response.data.data) {
            return response.data.data
          } else {
            return response.data.message
          }
          // } else {
          //   throw new Error(response.data.message || 'Error en la API')
        }
      })

      const hora = new Date().getHours()
      let saludo

      if (hora < 12) {
        saludo = "¡Buenos días"
      } else if (hora < 18) {
        saludo = "¡Buenas tardes"
      } else {
        saludo = "¡Buenas noches"
      }

      toast.promise(promise, {
        loading: 'Verificando sesión...',
        success: (response) => response?.user?.firstName ? `${saludo}, ${response.user.firstName.split(" ")[0]}! ¡Qué alegría tenerte aquí!` : response,
        error: (err) => `${err.response.data.message || err.message || 'No autenticado o sesión inválida'}`,
      })

      const response = await promise
      if (response && response.user) {
        setUser(response.user)
        setIsAuthenticated(true)
      } else {
        setUser(null)
        setIsAuthenticated(false)
      }
    } catch (err) {
      console.error('Error al verificar la sesión:', err)
      setUser(null)
      logout()
    } finally {
      setLoading(false)
    }
  }, [])

  // Función para renovar los tokens
  const refreshTokens = async () => {
    try {
      setLoading(true)
      const response = await api.post('/api/status') // Llamar a la API para renovar los tokens
      if (response.data.status === 'success') {
        // Guardar el tiempo de inicio en localStorage
        localStorage.setItem('startTime', Date.now())
        toast.success('Tokens renovados exitosamente')
      }
    } catch (error) {
      console.error('Error al renovar el token:', error)
      toast.error('Error al renovar el token')
    } finally {
      setLoading(false)
    }
  }

  const login = useCallback(async (credentials) => {
    setLoading(true)
    setError(null)

    try {
      const response = await api.post('/api/auth', credentials) // Intentar iniciar sesión

      if (response.data?.userData) {
        setUser(response.data.userData) // Establecer el usuario
        setIsAuthenticated(true)

        // Guardar el tiempo de inicio en localStorage
        localStorage.setItem('startTime', Date.now())

        // Obtener el parámetro 'next' de la URL (si existe) o redirigir al home
        const urlParams = new URLSearchParams(window.location.search)
        const redirectTo = urlParams.get('next') || '/'

        // Asegúrate de que la URL de redirección sea válida
        if (redirectTo && typeof redirectTo === 'string') {
          router.push(redirectTo) // Redirigir a la página de destino
        } else {
          router.push('/') // Redirigir al home si no hay 'next'
        }
      } else {
        setError('Datos de usuario no encontrados.')
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error)

      // Manejo de errores de la API o de red
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Error desconocido. Por favor, inténtelo de nuevo.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [router])

  const logout = useCallback(async () => {
    try { // Llamar a la API para cerrar sesión
      await api.delete('/api/auth')
      // toast.promise(api.delete('/api/auth'), {
      //   loading: 'Cerrando sesión...',
      //   success: (response) => `¡${response.data.message}!`,
      //   error: (err) => `Error: ${err.config.response.data.message || err.message || 'No autenticado o sesión inválida'}`,
      // })
    } catch (error) {
      console.error('Error al cerrar sesión:', error)
    }

    // Elimina los datos almacenados en localStorage
    localStorage.removeItem('startTime') // Si solo quieres eliminar un ítem específico
    // localStorage.clear() // Si quieres eliminar todo el contenido del localStorage

    // 🧹 Limpia todos los datos cacheados por React Query
    queryClient.clear()

    setUser(null)
    setIsAuthenticated(false)
    router.push('/login') // Redirigir al login después de cerrar sesión
  }, [router])

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshTokens, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto en cualquier parte de la aplicación
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
