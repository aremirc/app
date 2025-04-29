'use client'

import { useState, useEffect } from "react"
import EditProfileForm from '@/components/molecules/EditProfileForm'
import LoadingSpinner from "@/components/atoms/LoadingSpinner"
import DashboardGrid from "./DashboardGrid"
import Icon from "../atoms/Icon"
import api from "@/lib/axios"

const socialLinks = {
  facebook: "https://facebook.com/usuario",
  twitter: "https://twitter.com/usuario",
  linkedin: "https://linkedin.com/in/usuario",
  instagram: "https://instagram.com/usuario"
}

const UserProfile = () => {
  const [user, setUser] = useState(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Obtener el perfil de usuario al montar el componente
  useEffect(() => {
    const obtenerPerfil = async () => {
      try {
        const response = await api.get('/api/profile')
        const data = response.data.user
        data.socialLinks = socialLinks
        setUser(data)
      } catch (err) {
        console.error('Error al obtener el perfil:', err)
        setError('No se pudo cargar el perfil.')
      } finally {
        setLoading(false)
      }
    }

    obtenerPerfil()
  }, [])

  const toggleEditMode = () => {
    setIsEditing(prev => !prev)
  }

  if (loading) {
    return (
      <div className="text-center mt-10 text-gray-500">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center mt-10 text-red-500">
        {error}
      </div>
    )
  }

  if (!user) {
    return (
      <div className="text-center mt-10 text-gray-500">
        No se encontró información del usuario.
      </div>
    )
  }

  return (
    <div className="p-5">
      <div className="relative w-full h-40 bg-primary dark:bg-primary-dark rounded-lg">
        <div className="absolute w-[90%] flex flex-col sm:flex-row items-center justify-between bg-white/85 dark:bg-gray-800/95 shadow-lg rounded-lg p-6 top-3/4 left-1/2 transform -translate-x-1/2">
          {/* Vista: Información del Usuario */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="absolute bottom-0 right-0">
                <Icon name='edit' size={21} active />
              </button>
              <img
                src={user.avatar || '/default-avatar.webp'}
                alt="Avatar del usuario"
                className="w-16 h-16 rounded-full object-cover"
              />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-primary dark:text-white">
                {user.username}
              </h2>
              <p className="text-sm font-light text-gray-600 dark:text-gray-300">{user.email}</p>

            </div>
          </div>
          {/* Redes Sociales */}
          <div className="mt-2 flex space-x-4">
            {user.socialLinks?.facebook && (
              <a href={user.socialLinks.facebook} target="_blank" rel="noopener noreferrer">
                <Icon name="facebook" size={32} color="dark:bg-transparent dark:hover:bg-shadow-light" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 transition" />
              </a>
            )}
            {user.socialLinks?.twitter && (
              <a href={user.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                <Icon name="twitter" size={32} color="dark:bg-transparent dark:hover:bg-shadow-light" className="text-blue-400 dark:text-blue-300 hover:text-blue-500 transition" />
              </a>
            )}
            {user.socialLinks?.linkedin && (
              <a href={user.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                <Icon name="linkedin" size={32} color="dark:bg-transparent dark:hover:bg-shadow-light" className="text-blue-700 dark:text-blue-500 hover:text-blue-800 transition" />
              </a>
            )}
            {user.socialLinks?.instagram && (
              <a href={user.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                <Icon name="instagram" size={32} color="dark:bg-transparent dark:hover:bg-shadow-light" className="text-pink-500 dark:text-pink-400 hover:text-pink-600 transition" />
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 mt-24">
        {!isEditing ? (
          <>
            <DashboardGrid>
              <div className="">
                <h3 className="text-lg font-semibold text-primary dark:text-gray-200 mb-2">Información de Perfil</h3>
                <ul className="text-gray-600 dark:text-gray-300 space-y-1">
                  <li><strong>Rol:</strong> {user.role.name || 'Desconocido'}</li>
                  <li><strong>N° DNI:</strong> {user.dni}</li>
                  <li><strong>Nombre Completo:</strong> {user.firstName + ' ' + user.lastName || 'Desconocido'}</li>
                  <li><strong>Correo:</strong> {user.email || ''}</li>
                  <li><strong>Celular:</strong> {user.phone || ''}</li>
                  <li><strong>Ubicación:</strong> {user.location || 'Perú'}</li>
                  <li><strong>Miembro desde:</strong> {new Date(user.createdAt).toLocaleDateString()}</li>
                </ul>
              </div>
              <div className="">
                <h3 className="text-lg font-semibold text-primary dark:text-gray-200 mb-2">Actividad Reciente</h3>
                <ul className="text-gray-600 dark:text-gray-300">
                  <li><strong>Último inicio de sesión:</strong> {new Date(user.lastLogin).toLocaleString()}</li>
                  <li><strong>Última actualización de perfil:</strong> {new Date(user.lastUpdated).toLocaleString()}</li>
                  <li><strong>Tarea pendiente:</strong> {user.pendingTask || "No hay tareas pendientes."}</li>
                </ul>
              </div>
            </DashboardGrid>

            <div className="mt-5 text-center">
              <button
                onClick={toggleEditMode}
                className="bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600"
              >
                Editar Perfil
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Vista: Formulario de Edición */}
            <div className="text-right mb-4">
              <button
                onClick={toggleEditMode}
                className="text-sm text-blue-500 hover:underline"
              >
                ← Cancelar edición
              </button>
            </div>
            <EditProfileForm user={user} />
          </>
        )}
      </div>
    </div>
  )
}

export default UserProfile
