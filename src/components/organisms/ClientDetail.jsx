"use client"

import { useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import OrderList from "./OrderList"
import VisitList from "./VisitList"
import LoadingSpinner from "../atoms/LoadingSpinner"
import ClientCard from "../molecules/ClientCard"

const ClientDetail = ({ clientId }) => {
  const { user } = useAuth()
  const [client, setClient] = useState(null)  // Estado para el cliente
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchClient = async () => {
      try {
        // Hacemos la solicitud a la API con el `clientId`
        const response = await api.get(`/api/clients/${clientId}`)
        setClient(response.data)  // Guardamos los datos del cliente en el estado
      } catch (error) {
        setError("No se pudieron cargar los detalles del cliente.")  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchClient()  // Llamamos a la función para obtener el cliente
  }, [clientId])  // Dependencia para que se ejecute cuando cambie el `clientId`

  // Mostrar "loading" mientras se obtiene el cliente
  if (loading) {
    return <LoadingSpinner />
  }

  // Si hubo un error
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>

  // Si no se encuentra el cliente
  if (!client) return <div className="text-center mt-10">Cliente no encontrado.</div>

  return (
    <div className="p-6 space-y-5 w-full mx-auto">
      {/* Sección superior */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Perfil */}
        <Card className="col-span-1 xl:col-span-2 p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-8 xl:gap-12">
          {user?.role?.name === 'ADMIN' && (
            <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} className="absolute top-3 right-3">
              <Pencil className="w-4 h-4" />
            </Button>
          )}

          {isModalOpen && (
            <ClientCard
              client={client}
              handleCancel={() => setIsModalOpen(false)}
            />
          )}

          <div className="rounded-lg p-7 bg-primary aspect-square w-full max-w-[224px] flex-shrink-0">
            <img
              src={client.logo || "/globe.svg"}
              alt={client.name}
              className="w-full h-full rounded-lg object-cover border shadow-sm"
              onError={(e) => {
                e.target.src = "/globe.svg"
              }}
            />
          </div>

          <div className="flex-1 flex flex-col justify-center">
            <div className="flex flex-col justify-center items-center mb-5 xl:mb-10">
              <h2 className="text-2xl font-semibold text-primary dark:text-white ">{client.name}</h2>
              <p>Cliente</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-5 md:gap-x-12 xl:gap-x-20">
              <p className="truncate text-primary dark:text-primary-dark">Nombre completo <br /> <span className="text-gray-600 dark:text-gray-300">{client.name}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">
                {client.type === "COMPANY" ? "N° RUC" : "N° DNI"} <br />
                <span className="text-gray-600 dark:text-gray-300">{client.id}</span>
              </p>
              <p className="truncate text-primary dark:text-primary-dark">Teléfono <br /> <span className="text-gray-600 dark:text-gray-300">{client.phone}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Dirección <br /> <span className="text-gray-600 dark:text-gray-300">{client.address}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Correo <br /> <span className="text-gray-600 dark:text-gray-300">{client.email}</span></p>
              <p className="truncate text-primary dark:text-primary-dark">Creado <br /> <span className="text-gray-600 dark:text-gray-300">{new Date(client.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
        </Card>

        {/* Órdenes */}
        <OrderList orders={client.orders} clientID={clientId} />
      </div>

      {/* Visitas realizadas */}
      <VisitList visits={client.visits} clientID={clientId} />
    </div >
  )
}

export default ClientDetail
