import axios from 'axios'

// Definir un tiempo de espera predeterminado
const TIMEOUT = 10000

// Verificar si estás en un entorno de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development'

// Verificar si estamos en el cliente antes de acceder a `window`
const isBrowser = typeof window !== "undefined"

// Configuración base de Axios
const api = axios.create({
  baseURL: isDevelopment ? '/' : (isBrowser ? window.location.origin : ''),  // En desarrollo, usa la raíz, en producción usa el dominio actual
  timeout: TIMEOUT,  // Definir un tiempo de espera para las solicitudes (en milisegundos)
  withCredentials: true, // Asegúrate de que las cookies HttpOnly se envíen con las solicitudes
})

let csrfTokenCache = null

// Función para obtener el token CSRF desde el backend
const getCsrfToken = async () => {
  if (csrfTokenCache) return csrfTokenCache

  try {
    const response = await axios.get("/api/csrf-token")
    csrfTokenCache = response.data.csrfToken
    return csrfTokenCache
  } catch (error) {
    console.error("Error al obtener el token CSRF", error)
    return null
  }
}

const invalidateCsrfToken = () => {
  csrfTokenCache = null
}

// Interceptor para agregar el token CSRF a las solicitudes
api.interceptors.request.use(
  async (config) => {
    // Solo agregar CSRF Token en solicitudes modificadoras (POST, PUT, DELETE)
    if (['post', 'put', 'delete'].includes(config.method)) {
      const csrfToken = await getCsrfToken()
      if (csrfToken) {
        config.headers['csrf-token'] = csrfToken  // Añadir el token CSRF al encabezado
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Interceptor de respuesta para manejar errores globalmente
api.interceptors.response.use(
  (response) => response, // Pasa la respuesta tal cual si todo está bien
  async (error) => {
    const originalRequest = error.config

    // Si el backend responde con 403 (token CSRF inválido o expirado)
    if (
      error.response?.status === 403 &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true

      // Invalidamos el token cacheado
      invalidateCsrfToken()

      // Volvemos a obtener un nuevo token CSRF
      const newToken = await getCsrfToken()
      if (newToken) {
        originalRequest.headers['csrf-token'] = newToken
        return api(originalRequest) // Reintentar la petición original
      }
    }

    return Promise.reject(error)  // Propaga el error para que pueda ser manejado por el bloque onError
  }
)

export default api
