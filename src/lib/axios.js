import axios from 'axios';

// Verificar si NEXT_PUBLIC_API_URL está definida
const baseURL = process.env.NEXT_PUBLIC_API_URL;

if (!baseURL) {
  if (process.env.NODE_ENV === 'development') {
    console.warn('¡Atención! NEXT_PUBLIC_API_URL no está definida. Usando la URL predeterminada.');
  }
  // Si no está definida, asignar una URL por defecto
  axios.defaults.baseURL = 'http://localhost:3000';  // URL por defecto en desarrollo
} else {
  axios.defaults.baseURL = baseURL;
}

// Crear una instancia de Axios con la configuración base
const api = axios.create({
  baseURL: axios.defaults.baseURL, // La URL base de tu API
  timeout: 30000, // Definir un tiempo de espera para la solicitud (en milisegundos)
});

// Función para manejar la expiración de la sesión
const handleSessionExpiration = (logout) => {
  logout() // Limpiar el estado global
  console.error('Sesión expirada o no autorizada. Redirigiendo a login...');
}

// Interceptor para agregar el token JWT a cada solicitud
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('authToken') || localStorage.getItem('authToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
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
    // Solo manejar el error si es un 401
    if (error.response && error.response.status === 401) {
      // if (typeof window !== 'undefined') {
      //   // Este código solo debe ejecutarse en el cliente
      //   import('@/context/AuthContext').then((module) => {
      //     const { useAuth } = module; // Importa dinámicamente el hook de AuthContext
      //     const { logout } = useAuth(); // Obtén la función logout
      //     handleSessionExpiration(logout); // Maneja la expiración de la sesión
      //   }).catch((err) => {
      //     console.error('Error al intentar importar AuthContext', err);
      //   });
      // }
    }
    return Promise.reject(error); // Rechaza el error para que se maneje en otro lugar si es necesario
  }
);

export default api;

// finally {
//   await prisma.$disconnect();
// }