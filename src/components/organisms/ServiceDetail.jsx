"use client"

import { useEffect, useState } from "react"
import { Pencil, CalendarDays } from "lucide-react"
import api from "@/lib/axios"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import DashboardGrid from "./DashboardGrid"
import LoadingSpinner from "../atoms/LoadingSpinner"
import ServiceCard from "../molecules/ServiceCard"

const ServiceDetail = ({ serviceId }) => {
  const [service, setService] = useState(null)  // Estado para el servicio
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchService = async () => {
      try {
        // Hacemos la solicitud a la API con el `serviceId`
        const response = await api.get(`/api/services/${serviceId}`)
        setService(response.data)  // Guardamos los datos del servicio en el estado
      } catch (error) {
        setError("No se pudieron cargar los detalles del servicio.")  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchService()  // Llamamos a la función para obtener el servicio
  }, [serviceId])  // Dependencia para que se ejecute cuando cambie el `serviceId`

  // Mostrar "loading" mientras se obtiene el servicio
  if (loading) return <LoadingSpinner />

  // Si hubo un error
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>

  // Si no se encuentra el servicio
  if (!service) return <div className="text-center mt-10">Servicio no encontrado.</div>

  return (
    <div className="p-6 space-y-6">
      <DashboardGrid>
        {/* Panel izquierdo: resumen visual */}
        <div className="2xl:col-span-2 flex flex-col justify-between text-white bg-linear-to-r from-indigo-900 to-indigo-700 p-6 rounded-2xl shadow-md">
          <p className="text-sm">N° Servicio: {String(service.id).padStart(3, '0')}</p>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold">{service.name}</h2>
            <p className="text-sm">{service.description}</p>
            <p className="text-base font-medium">S/. {service.price}</p>
          </div>
        </div>

        {/* Panel derecho: detalles */}
        <Card title="Detalles del Servicio" className="p-6">
          <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)} className="absolute top-3 right-3">
            <Pencil className="w-4 h-4" />
          </Button>

          {isModalOpen && (
            <ServiceCard
              service={service}
              setService={(n) => setService((prevService) => ({ ...prevService, ...n }))}
              handleCancel={() => setIsModalOpen(false)}
            />
          )}

          <div className="space-y-4 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">Estado:</span>
              <span className={`px-3 py-1 text-xs rounded-full font-semibold
                ${service.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                {service.status === 'ACTIVE' ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex justify-between">
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4" />
                <span className="font-medium">Fecha de Creación:</span>
              </div>
              <span>
                {new Date(service.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </Card>
      </DashboardGrid>
    </div>
  )
}

export default ServiceDetail
