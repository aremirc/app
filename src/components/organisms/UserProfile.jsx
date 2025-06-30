'use client'

import { useState, useEffect } from "react"
import EditProfileForm from '@/components/molecules/EditProfileForm'
import LoadingSpinner from "@/components/atoms/LoadingSpinner"
import DashboardGrid from "./DashboardGrid"
import Icon from "../atoms/Icon"
import api from "@/lib/axios"
import Card from "../molecules/Card"

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
        <Card className="absolute w-[90%] flex flex-col sm:flex-row items-center justify-between bg-white/85 dark:bg-gray-800/95 shadow-lg rounded-lg p-6 top-1/4 sm:top-3/4 left-1/2 transform -translate-x-1/2">
          {/* Vista: Información del Usuario */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button
                onClick={toggleEditMode}
                className="absolute bottom-0 right-0"
                title="Editar perfil"
              >
                <Icon name="edit" size={21} color="dark:hover:bg-primary-dark/80" active />
              </button>
              <img
                src={user.avatar || '/default-avatar.webp'}
                alt="Avatar del usuario"
                className="w-16 h-16 rounded-full object-cover border-2 border-primary dark:border-primary-dark"
                onError={(e) => {
                  e.target.src = "/default-avatar.webp"
                }}
              />
            </div>
            <div>
              <h2 className="text-xl font-bold text-primary dark:text-white">{user.username}</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">{user.email}</p>
            </div>
          </div>

          {/* Redes Sociales */}
          <div className="flex gap-3 mt-4 sm:mt-0">
            {Object.entries(user.socialLinks || {}).map(([key, url]) => (
              <a
                key={key}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-primary transition"
              >
                <Icon name={key} size={32} color="dark:bg-transparent dark:hover:bg-shadow-light" />
              </a>
            ))}
          </div>
        </Card>
      </div>

      <DashboardGrid className="shadow-lg rounded-lg gap-4 p-0 sm:p-8 mt-12 sm:mt-24">
        {!isEditing ? (
          <Card title="Información de Perfil" className="p-6">
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li><strong>Rol:</strong> {user.role.name}</li>
              <li><strong>DNI:</strong> {user.dni}</li>
              <li><strong>Nombre:</strong> {user.firstName} {user.lastName}</li>
              <li><strong>Correo:</strong> {user.email}</li>
              <li><strong>Celular:</strong> {user.phone}</li>
              <li><strong>Ubicación:</strong> {user.country ?? "Perú"}</li>
              <li><strong>Miembro desde:</strong> {new Date(user.hiredAt || user.createdAt).toLocaleDateString()}</li>
            </ul>

            <button
              onClick={toggleEditMode}
              className="absolute top-3 right-3"
              title="Editar perfil"
            >
              <Icon name="edit" size={25} color="dark:hover:bg-primary-dark/80 transition" active />
            </button>
          </Card>
        ) : (
          <EditProfileForm user={user} onCancel={toggleEditMode} onSuccess={(updatedData) => {
            setUser(prev => ({ ...prev, ...updatedData }))
          }} />
        )}

        <Card title="Actividad Reciente" className="p-6">
          <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li><strong>Último login:</strong> {new Date(user.lastLogin).toLocaleDateString()}</li>
            <li><strong>Última actualización:</strong> {new Date(user.updatedAt).toLocaleDateString()}</li>
          </ul>

          <h4 className="mt-4 mb-2 font-semibold text-sm text-primary dark:text-primary-dark">Tareas Pendientes</h4>
          {user.notifications?.length > 0 ? (
            <ul className="space-y-2">
              {user.notifications.map((n) => (
                <li key={n.id} className="bg-muted p-2 rounded shadow-sm">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-medium">{n.title}</span>
                    <span className={`text-xs rounded px-2 py-0.5 font-semibold
                ${n.priority === 'HIGH' ? 'bg-red-200 text-red-700' :
                        n.priority === 'MEDIUM' ? 'bg-yellow-200 text-yellow-700' :
                          'bg-green-200 text-green-700'}
              `}>
                      {n.priority}
                    </span>
                  </div>
                  <p className="text-sm">{n.message}</p>
                  {n.actionUrl && (
                    <a href={n.actionUrl} className="text-blue-500 hover:underline text-xs">
                      Ver más
                    </a>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-500">No hay notificaciones activas.</p>
          )}
        </Card>
      </DashboardGrid>
    </div>
  )
}

export default UserProfile
