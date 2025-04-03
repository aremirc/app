import axios from 'axios';

// Definir valores predeterminados
const DEFAULT_API_URL = 'http://localhost:3000';
const TIMEOUT = 30000;

// Verificar si NEXT_PUBLIC_API_URL está definida
const baseURL = process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_URL;

// Configurar la URL base para Axios
axios.defaults.baseURL = baseURL;

if (process.env.NODE_ENV === 'development' && !process.env.NEXT_PUBLIC_API_URL) {
  console.debug('¡Atención! NEXT_PUBLIC_API_URL no está definida. Usando la URL predeterminada.');
}

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: axios.defaults.baseURL,  // Usar la URL base configurada
  timeout: TIMEOUT,  // Definir un tiempo de espera para las solicitudes (en milisegundos)
  withCredentials: true, // Asegúrate de que las cookies HttpOnly se envíen con las solicitudes
});

// Interceptor para agregar el token JWT a cada solicitud (si es necesario, depende de tu servidor)
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
