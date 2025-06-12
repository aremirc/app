"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import LoadingSpinner from "../atoms/LoadingSpinner"
import { Pencil } from "lucide-react"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import VisitList from "./VisitList"

const ClientDetail = ({ clientId }) => {
  const [client, setClient] = useState(null)  // Estado para el cliente
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error

  useEffect(() => {
    const fetchClient = async () => {
      try {
        // Hacemos la solicitud a la API con el `clientId`
        const response = await api.get(`/api/clients/${clientId}`)
        setClient(response.data)  // Guardamos los datos del cliente en el estado
      } catch (error) {
        setError('Error loading client details. Please try again later.')  // Si hay error, guardamos el mensaje
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
  if (error) {
    return <div>{error}</div>
  }

  // Si no se encuentra el cliente
  if (!client) {
    return <div>Client not found.</div>
  }

  return (
    <div className="p-6 space-y-5 w-full mx-auto">
      {/* Sección superior */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Perfil */}
        <Card className="col-span-1 xl:col-span-2 p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-8 xl:gap-12">
          <Button size="sm" variant="outline" className="absolute top-2 right-2">
            <Pencil className="w-4 h-4" />
          </Button>
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
              <p className="text-primary dark:text-primary-dark">Nombre completo <br /> <span className="text-gray-600  dark:text-gray-300">{client.name}</span></p>
              <p className="text-primary dark:text-primary-dark">
                {client.type === "COMPANY" ? "N° RUC" : "N° DNI"} <br />
                <span className="text-gray-600 dark:text-gray-300">{client.id}</span>
              </p>
              <p className="text-primary dark:text-primary-dark">Teléfono <br /> <span className="text-gray-600  dark:text-gray-300">{client.phone}</span></p>
              <p className="text-primary dark:text-primary-dark">Dirección <br /> <span className="text-gray-600  dark:text-gray-300">{client.address}</span></p>
              <p className="text-primary dark:text-primary-dark">Correo <br /> <span className="text-gray-600  dark:text-gray-300">{client.email}</span></p>
              <p className="text-primary dark:text-primary-dark">Creado <br /> <span className="text-gray-600  dark:text-gray-300">{new Date(client.createdAt).toLocaleDateString()}</span></p>
            </div>
          </div>
        </Card>

        {/* Órdenes */}
        <Card title="Órdenes" className="col-span-1 p-6 rounded-2xl">
          <Button size="sm" variant="outline" className="absolute top-2 right-2"><Pencil className="w-4 h-4 mr-1" /></Button>
          <div className="grid grid-cols-2 gap-4">
            {client.orders?.map((order, index) => (
              <div key={index} className="border border-border-light dark:border-border-dark p-4 rounded-lg shadow-xs bg-background-muted dark:bg-background-muted-dark text-center">
                <p className="font-medium text-primary dark:text-primary-dark">N° {String(order.id).padStart(3, '0')}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{order.status}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Visitas realizadas */}
      <Card title="Visitas Realizadas" className="col-span-1 xl:col-span-3 p-6 rounded-2xl bg-background-light dark:bg-background-dark shadow-md">
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 border border-border-light dark:border-border-dark text-primary dark:text-primary-dark hover:bg-primary-light/10"
        >
          CREAR NUEVA VISITA
        </Button>

        <VisitList visits={client.visits} />
      </Card>
    </div >
  )
}

export default ClientDetail
