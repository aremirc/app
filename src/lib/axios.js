import axios from 'axios';

// Definir un tiempo de espera predeterminado
const TIMEOUT = 30000;

// Verificar si estás en un entorno de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Verificar si estamos en el cliente antes de acceder a `window`
const isBrowser = typeof window !== "undefined";

// Configuración base de Axios
const api = axios.create({
  baseURL: isDevelopment ? '/' : (isBrowser ? window.location.origin : ''),  // En desarrollo, usa la raíz, en producción usa el dominio actual
  timeout: TIMEOUT,  // Definir un tiempo de espera para las solicitudes (en milisegundos)
  withCredentials: true, // Asegúrate de que las cookies HttpOnly se envíen con las solicitudes
});

// Interceptor para agregar el token JWT a cada solicitud (si es necesario)
api.interceptors.request.use(
  (config) => {
    // Si es necesario agregar encabezados o manejar autenticación, lo harías aquí
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de respuesta para manejar errores globalmente
api.interceptors.response.use(
  (response) => response, // Pasa la respuesta tal cual si todo está bien
  (error) => {
    // Manejo de errores global
    return Promise.reject(error);  // Propaga el error para que pueda ser manejado por el bloque onError
  }
);

export default api;
