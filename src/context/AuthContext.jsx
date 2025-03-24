"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const loadUser = async () => {
      try {
        setLoading(true);
        const storedUser = JSON.parse(sessionStorage.getItem('user'));
        if (storedUser) {
          setUser(storedUser);
        }
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false); // Asegúrate de que esto se ejecute siempre
      }
    };

    const getStatus = async () => {
      try {
        const response = await api.get("/api/status")
        console.log(response.data.status);
      } catch (error) {
        console.log('Error al obtener status:', error);
      }
    }

    const interceptor = api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    loadUser();
    getStatus();

    const intervalId = setInterval(getStatus, 30000);

    return () => {
      // Limpiar interceptor cuando el componente que usa este hook se desmonte
      api.interceptors.response.eject(interceptor);
      
      clearInterval(intervalId);
    };
  }, []);

  const login = async (credentials) => {
    setLoading(true);

    try {
      const response = await api.post('/api/login', credentials); // Solicitud de login

      // Obtener el token de los encabezados de la respuesta
      // const token = response.headers['authorization'].split(' ')[1]; // El token suele estar en el formato "Bearer <token>"

      // Obtener el token de la respuesta
      const token = response.data.token;
      sessionStorage.setItem('authToken', token); // Almacenar el token en localStorage

      setUser(response.data.userData);
      sessionStorage.setItem('user', JSON.stringify(response.data.userData));

      console.log('Login exitoso, token:', token);
      setError(null); // Limpiar errores previos
      router.push('/');
    } catch (error) {
      setError('Error en el inicio de sesión: ' + error.response?.data?.error || error.message || error.request);

      if (error.response) {
        // La solicitud fue realizada y el servidor respondió con un código de estado fuera del rango 2xx
        console.error('Error de autenticación:', error.response.data.error);
      } else if (error.request) {
        // La solicitud fue realizada, pero no se recibió respuesta
        console.error('No se recibió respuesta del servidor');
      } else {
        // Algo ocurrió al configurar la solicitud
        console.error('Error desconocido:', error.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('authToken'); // Eliminar el token
    router.push('/'); // Redirige al login después de cerrar sesión
  };

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto en cualquier parte de la aplicación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};