"use client"

import { useEffect, useState } from "react"
import { Pencil, Cake } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { isBirthday } from '@/lib/utils'
import api from "@/lib/axios"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import VisitList from "./VisitList"
import LoadingSpinner from "../atoms/LoadingSpinner"
import UserCard from "../molecules/UserCard"

const UserDetail = ({ userId }) => {
  const { user } = useAuth()
  const [userR, setUserR] = useState(null)  // Estado para el usuario
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        // Hacemos la solicitud a la API con el `userId`
        const response = await api.get(`/api/users/${userId}`)
        setUserR(response.data)  // Guardamos los datos del usuario en el estado
      } catch (error) {
        setError("No se pudieron cargar los detalles del usuario.")  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchUser()  // Llamamos a la función para obtener el usuario
  }, [userId])  // Dependencia para que se ejecute cuando cambie el `userId`

  // Mostrar "loading" mientras se obtiene el usuario
  if (loading) return <LoadingSpinner />

  // Si hubo un error
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>

  // Si no se encuentra el usuario
  if (!userR) return <div className="text-center mt-10">Usuario no encontrado.</div>

  return (
    <div className="p-6 space-y-5 w-full mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Perfil */}
        <Card className="col-span-1 xl:col-span-2 p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-8 xl:gap-12">
          {user?.role?.name === 'ADMIN' && (
            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} className="absolute top-3 right-3">
              <Pencil className="w-4 h-4" />
            </Button>
          )}

          {isModalOpen && (
            <UserCard
              user={userR}
              handleCancel={() => setIsModalOpen(false)}
            />
          )}

          <div className="rounded-lg p-7 bg-primary aspect-square w-full max-w-[224px] flex-shrink-0">
            <img
              src={userR.avatar || "/default-avatar.webp"}
              alt={userR.username}
              className="w-full h-full rounded-lg object-cover border shadow-sm"
              onError={(e) => {
                e.target.src = "/default-avatar.webp"
              }}
            />
          </div>
          <div className="flex-1 flex flex-col justify-center">
            <div className="relative flex flex-col justify-center items-center mb-10">
              <h2 className="text-2xl font-semibold text-primary dark:text-white ">{userR.username}</h2>
              <p>{userR.role.name}</p>
              {isBirthday(userR.birthDate) && (
                <Cake className="absolute top-2 left-2 w-5 h-5 text-pink-500 animate-bounce" title="¡Feliz cumpleaños!" />
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-5 gap-x-20">
              <p className="truncate text-primary dark:text-primary-dark">Nombre completo <br /> <span className="text-gray-600  dark:text-gray-300">{userR.firstName + ' ' + userR.lastName}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">N° DNI <br /> <span className="text-gray-600  dark:text-gray-300">{userR.dni}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Teléfono <br /> <span className="text-gray-600  dark:text-gray-300">{userR.phone}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Estado <br /> <span className="text-gray-600  dark:text-gray-300">{userR.status}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Correo <br /> <span className="text-gray-600  dark:text-gray-300">{userR.email}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Creado <br /> <span className="text-gray-600  dark:text-gray-300">{new Date(userR.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
        </Card>

        {/* Disponibilidad */}
        <Card title="Disponibilidad" className="col-span-1 p-6 rounded-2xl">
          {/* <Button size="sm" variant="outline" className="absolute top-3 right-3"><Pencil className="w-4 h-4" /></Button> */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {userR.availability?.map((day, index) => (
              <div key={index} className="border border-border-light dark:border-border-dark p-4 rounded-lg shadow-xs bg-background-muted dark:bg-background-muted-dark text-center">
                <p className="font-medium text-indigo-600 dark:text-indigo-400">{day.day}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{new Date(day.startDate).toLocaleDateString()} - {new Date(day.endDate).toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Visitas realizadas */}
      <VisitList visits={userR.visits} userID={userId} />
    </div >
  )
}

export default UserDetail
