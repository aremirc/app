"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import LoadingSpinner from "../atoms/LoadingSpinner"
import { Pencil, Trash2, MessageSquare, Cake } from "lucide-react"
import Card from "../molecules/Card"
import Button from "../atoms/Button"

const UserDetail = ({ userId }) => {
  const [user, setUser] = useState(null)  // Estado para el usuario
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Hacemos la solicitud a la API con el `userId`
        const response = await api.get(`/api/users/${userId}`)
        setUser(response.data)  // Guardamos los datos del usuario en el estado
      } catch (error) {
        setError('No se pudieron cargar los detalles del usuario.')  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchUser()  // Llamamos a la función para obtener el usuario
  }, [userId])  // Dependencia para que se ejecute cuando cambie el `userId`

  const isBirthday = (birthDateStr) => {
    if (!birthDateStr) return false

    const [year, month, day] = birthDateStr.split("T")[0].split("-").map(Number)
    const today = new Date()

    return today.getDate() === day && today.getMonth() === month - 1
  }

  // Mostrar "loading" mientras se obtiene el usuario
  if (loading) return <LoadingSpinner />

  // Si hubo un error
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>

  // Si no se encuentra el usuario
  if (!user) return <div className="text-center mt-10">Usuario no encontrado.</div>

  return (
    <div className="p-6 space-y-5 w-full mx-auto">
      {/* Sección superior */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Perfil */}
        <Card className="col-span-1 xl:col-span-2 p-8 rounded-2xl flex flex-col sm:flex-row gap-12">
          <Button size="sm" variant="outline" className="absolute top-2 right-2"><Pencil className="w-4 h-4" /></Button>
          <div className="rounded-lg p-7 bg-primary">
            <img
              src={user.avatarUrl || "/default-avatar.webp"}
              alt={user.username}
              className="w-full sm:w-56 h-56 rounded-lg object-cover border shadow"
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative flex flex-col justify-center items-center mb-10">
              <h2 className="text-2xl font-semibold text-primary dark:text-white ">{user.username}</h2>
              <p>{user.role.name}</p>
              {isBirthday(user.birthDate) && (
                <Cake className="absolute top-2 left-2 w-5 h-5 text-pink-500 animate-bounce" title="¡Feliz cumpleaños!" />
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-5 gap-x-20">
              <p className="text-primary dark:text-primary-dark">Nombre completo <br /> <span className="text-gray-600  dark:text-gray-300">{user.firstName + ' ' + user.lastName}</span></p>
              <p className="text-primary dark:text-primary-dark">N° DNI <br /> <span className="text-gray-600  dark:text-gray-300">{user.dni}</span></p>
              <p className="text-primary dark:text-primary-dark">Teléfono <br /> <span className="text-gray-600  dark:text-gray-300">{user.phone}</span></p>
              <p className="text-primary dark:text-primary-dark">Estado <br /> <span className="text-gray-600  dark:text-gray-300">{user.status}</span></p>
              <p className="text-primary dark:text-primary-dark">Correo <br /> <span className="text-gray-600  dark:text-gray-300">{user.email}</span></p>
              <p className="text-primary dark:text-primary-dark">Creado <br /> <span className="text-gray-600  dark:text-gray-300">{new Date(user.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
        </Card>

        {/* Disponibilidad */}
        <Card title="Disponibilidad" className="col-span-1 p-6 rounded-2xl">
          <Button size="sm" variant="outline" className="absolute top-2 right-2"><Pencil className="w-4 h-4 mr-1" /></Button>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {user.availability?.map((day, index) => (
              <div key={index} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-center">
                <p className="font-medium text-indigo-600 dark:text-indigo-400">{day.day}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(day.startDate).toLocaleDateString()} - {new Date(day.endDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Visitas realizadas */}
      <Card title="Visitas Realizadas" className="col-span-1 p-6 rounded-2xl">
        <Button size="sm" variant="outline" className="absolute top-2 right-2">CREAR NUEVA VISITA</Button>
        <div className="space-y-4">
          {user.visits?.map((visit, i) => (
            <div key={visit.id} className="border p-4 rounded-lg shadow-sm bg-gray-50 dark:bg-gray-900">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">Visita #{i + 1}</h4>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost"><MessageSquare className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost"><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
              <p><strong>Fecha:</strong> {new Date(visit.date).toLocaleDateString()}</p>
              <p><strong>Hora de Inicio:</strong> {new Date(visit.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
              <p><strong>Hora de Finalización:</strong> {new Date(visit.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
            </div>
          ))}
        </div>
      </Card>
    </div >
  )
}

export default UserDetail
