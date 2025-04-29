"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { FileText, Pencil, Trash2, MessageSquare } from "lucide-react"
import LoadingSpinner from "../atoms/LoadingSpinner"
import Card from "../molecules/Card"
import Button from "../atoms/Button"

const OrderDetail = ({ orderId }) => {
  const [order, setOrder] = useState(null)  // Estado para la orden
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Hacemos la solicitud a la API con el `orderId`
        const response = await api.get(`/api/orders/${orderId}`)
        setOrder(response.data)  // Guardamos los datos de la orden en el estado
      } catch (error) {
        setError('No se pudieron cargar los detalles de la orden.')  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchOrder()  // Llamamos a la función para obtener la orden
  }, [orderId])  // Dependencia para que se ejecute cuando cambie el `orderId`

  // Mostrar "loading" mientras se obtiene la orden
  if (loading) return <LoadingSpinner />

  // Si hubo un error
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>

  // Si no se encuentra la orden
  if (!order) return <div className="text-center mt-10">Orden no encontrada.</div>

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="col-span-1 xl:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="col-span-2 flex flex-col justify-between text-white bg-gradient-to-r from-indigo-900 to-indigo-700 p-6 rounded-2xl shadow-md">
          <p className="text-sm">N° Orden: {order.id}</p>
          <div>
            <h2 className="text-2xl font-semibold">{order.client?.name}</h2>
            <p className="text-sm mt-2">DIRECCIÓN</p>
            <p className="text-sm">{order.client?.address}</p>
          </div>
        </div>

        {/* Aquí podrías incluir los empleados asignados si los tienes en order */}
        <Card className="flex gap-6">
          {order.workers?.map(emp => (
            <div key={emp.dni} className="flex flex-col items-center">
              <img src={emp.avatarUrl} className="w-16 h-16 rounded-full border" alt={emp.name} />
              <p className="text-teal-700 font-medium">{emp.name}</p>
              <p className="text-sm text-gray-500">Empleado</p>
            </div>
          ))}
        </Card>
        <Card className="flex gap-6">
          {order.workers?.map(emp => (
            <div key={emp.dni} className="flex flex-col items-center">
              <img src={emp.avatarUrl} className="w-16 h-16 rounded-full border" alt={emp.name} />
              <p className="text-teal-700 font-medium">{emp.name}</p>
              <p className="text-sm text-gray-500">Empleado</p>
            </div>
          ))}
        </Card>

        <Card className="col-span-2 md:col-span-4 flex gap-4 items-center">
          {order.locations?.map((loc, i) => (
            <div key={i} className="w-1/2">
              <input className="w-full border rounded px-2 py-1" value={loc} disabled />
            </div>
          ))}
          <Button>Agregar Ubicación</Button>
        </Card>
      </div>

      <Card title="Detalles" className="p-8 flex flex-col gap-3 text-sm text-gray-700">
        <Button variant="outline" size="sm" className="absolute top-2 right-2 flex items-center gap-2">
          <FileText className="w-4 h-4" /> <span>Imprimir PDF</span>
        </Button>
        <p><strong>Fecha de creación:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Servicio:</strong> {order.description}</p>
        <p><strong>Estado:</strong> <span className={`font-semibold ${order.status === "completed" ? "text-green-500" : "text-yellow-500"}`}>{order.status}</span></p>
        <p><strong>Fecha Programada:</strong> {order.scheduledDate}</p>
        <p><strong>Fecha de Finalización:</strong> {order.endDate}</p>
      </Card>

      {/* Visitas realizadas */}
      <Card title="Visitas Realizadas" className="col-span-1 p-6 rounded-2xl">
        <Button size="sm" variant="outline" className="absolute top-2 right-2">CREAR NUEVA VISITA</Button>
        <div className="space-y-4">
          {order.visits?.map((visit, i) => (
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

      <div className="col-span-full flex justify-end pt-4">
        <Button className="bg-primary hover:bg-primary/75 text-white px-6 py-2 rounded-xl transition duration-200 ease-in-out" onClick={() => window.history.back()}>Volver</Button>
      </div>
    </div>
  )
}

export default OrderDetail
