"use client";

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '@/lib/axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verificar si hay un usuario almacenado en localStorage al cargar la aplicación
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser)); // Establecer el usuario desde el almacenamiento
    } else {
      checkSession(); // Verificar sesión si no hay usuario almacenado
    }
  }, []);

  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/status'); // Verifica si el usuario está autenticado

      if (response.data.status === 'autenticado') {
        setUser(response.data.user);
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Guardar el usuario en localStorage
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

  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
  
    try {
      const response = await api.post('/api/auth', credentials);
      setUser(response.data.userData);
      localStorage.setItem('user', JSON.stringify(response.data.userData)); // Guardar el usuario en localStorage
  
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('next') || '/'; // Si no existe 'next', redirigir a la página principal
      router.push(redirectTo); // Redirigir a la página de destino
    } catch (error) {
      console.error('Error en el inicio de sesión:', error);
      const errorMessage = error.response?.data?.error || 'Error desconocido';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [router]);  

  const logout = useCallback(async () => {
    try {
      await api.delete('/api/auth');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }

    setUser(null);
    localStorage.removeItem('user'); // Eliminar el usuario de localStorage
    router.push('/login'); // Redirigir al login después de cerrar sesión
  }, [router]);

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
