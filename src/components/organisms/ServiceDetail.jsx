"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Pencil } from "lucide-react"
import LoadingSpinner from "../atoms/LoadingSpinner"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import DashboardGrid from "./DashboardGrid"

const ServiceDetail = ({ serviceId }) => {
  const [service, setService] = useState(null)  // Estado para el servicio
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Hacemos la solicitud a la API con el `serviceId`
        const response = await api.get(`/api/services/${serviceId}`)
        setService(response.data)  // Guardamos los datos del servicio en el estado
      } catch (error) {
        setError('Error loading service details. Please try again later.')  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchService()  // Llamamos a la función para obtener el servicio
  }, [serviceId])  // Dependencia para que se ejecute cuando cambie el `serviceId`

  // Mostrar "loading" mientras se obtiene el servicio
  if (loading) {
    return <LoadingSpinner />
  }

  // Si hubo un error
  if (error) {
    return <div>{error}</div>
  }

  // Si no se encuentra el servicio
  if (!service) {
    return <div>Service not found.</div>
  }

  return (
    <div className="p-6 space-y-5 w-full mx-auto">
      <DashboardGrid>
        <div className="col-span-2 flex flex-col justify-between text-white bg-gradient-to-r from-indigo-900 to-indigo-700 p-6 rounded-2xl shadow-md">
          <p className="text-sm">N° Servicio: {service.id}</p>
          <div>
            <h2 className="text-2xl font-semibold">{service.name}</h2>
            <p className="text-sm mt-2">{service.description}</p>
            <p className="text-sm mt-2">S/ {service.price}</p>
          </div>
        </div>

        <Card title="Detalles" className="rounded-lg p-6">
          <Button size="sm" variant="outline" className="absolute top-2 right-2"><Pencil className="w-4 h-4" /></Button>
          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Estado:</p>
            <p className={`text-lg font-semibold ${service.status === 'ACTIVE' ? 'text-green-500' : 'text-red-500'} dark:text-gray-200`}>
              {service.status}
            </p>
          </div>

          <div className="flex justify-between items-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">Fecha de Creación:</p>
            <p className="text-lg text-gray-900 dark:text-gray-100">{new Date(service.createdAt).toLocaleDateString()}</p>
          </div>
        </Card>
      </DashboardGrid>
    </div>
  )
}

export default ServiceDetail
