"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios'; // Instancia personalizada de Axios
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({ // Inicializar como invitado (usuario sin permisos)
    name: "Invitado",  // Nombre genérico para el invitado
    roleId: 0,         // roleId 0, indicando que no es un usuario con permisos especiales
    avatar: "https://static-00.iconduck.com/assets.00/user-icon-2046x2048-9pwm22pp.png"
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Verificar si hay un usuario almacenado
  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);

      const promise = () => api.get('/api/status').then((response) => {
        if (response.data.status === 'success') {
          if (response.data && response.data.data) {
            return response.data.data;
          } else {
            return response.data.message;
          }
        } else {
          throw new Error(response.data.message || 'Error en la API');
        }
      });

      toast.promise(promise(), {
        loading: 'Verificando sesión...',
        success: (response) => response?.user?.name ? `¡Sesión verificada! Bienvenido, ${response.user.name}` : response,
        error: (err) => `Error: ${err.message || 'No autenticado o sesión inválida'}`,
      });

      const response = await promise();
      if (response && response.user) {
        setUser(response.user);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error('Error al verificar la sesión:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Función para renovar los tokens
  const refreshTokens = async () => {
    try {
      setLoading(true);
      const response = await api.post('/api/status'); // Llamar a la API para renovar los tokens
      if (response.data.status === 'success') {
        toast.success('Tokens renovados exitosamente');
      }
    } catch (error) {
      console.error('Error al renovar el token:', error);
      toast.error('Error al renovar el token');
    } finally {
      setLoading(false);
    }
  };

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/api/auth', credentials); // Intentar iniciar sesión

      if (response.data?.userData) {
        setUser(response.data.userData); // Establecer el usuario

        // Guardar el tiempo de inicio en localStorage
        localStorage.setItem('startTime', Date.now());

        // Obtener el parámetro 'next' de la URL (si existe) o redirigir al home
        const urlParams = new URLSearchParams(window.location.search);
        const redirectTo = urlParams.get('next') || '/';

        // Asegúrate de que la URL de redirección sea válida
        if (redirectTo && typeof redirectTo === 'string') {
          router.push(redirectTo); // Redirigir a la página de destino
        } else {
          router.push('/'); // Redirigir al home si no hay 'next'
        }
      } else {
        setError('Datos de usuario no encontrados.');
      }
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);

      // Manejo de errores de la API o de red
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        'Error desconocido. Por favor, inténtelo de nuevo.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await api.delete('/api/auth'); // Llamar a la API para cerrar sesión
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }

    // Elimina los datos almacenados en localStorage
    localStorage.removeItem('startTime'); // Si solo quieres eliminar un ítem específico
    // localStorage.clear(); // Si quieres eliminar todo el contenido del localStorage

    setUser(null);
    router.push('/login'); // Redirigir al login después de cerrar sesión
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, refreshTokens }}>
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
