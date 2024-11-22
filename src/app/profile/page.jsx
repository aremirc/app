"use client"

import DashboardByRole from "@/components/organisms/DashboardByRole"
import api from "@/lib/axios";

const Profile = () => {
  // Usamos Axios para hacer una solicitud GET protegida
  const obtenerPerfil = async () => {
    try {
      const response = await api.get('/profile'); // Solicitud a la API
      console.log('Perfil del usuario:', response.data);
    } catch (error) {
      console.error('Error al obtener el perfil:', error);
      if (error.response && error.response.status === 401) {
        // El token es inválido o ha expirado, redirigir al login
        window.location.href = '/';
      } else {
        console.error('Error en la solicitud:', error);
      }
    }
  };

  return (
    <DashboardByRole />
  )
}

export default Profile