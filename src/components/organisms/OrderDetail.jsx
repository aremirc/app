"use client"

import { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { handleToast } from "@/lib/toast"
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import api from "@/lib/axios"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import VisitList from "./VisitList"
import WorkerCard from "../molecules/WorkerCard"
import LoadingSpinner from "../atoms/LoadingSpinner"
import PdfOrderReport from "./PdfOrderReport"
import PrintPreviewModal from "./PrintPreviewModal"
import OrderPdfExporter from "./OrderPdfExporter"
import DownloadPdfOptions from "./DownloadPdfOptions"
import LocationMapEditor from "../molecules/LocationMapEditor"
import LocationMapPreview from "../molecules/LocationMapPreview"

const OrderDetail = ({ orderId }) => {
  const { user } = useAuth()
  const [order, setOrder] = useState(null)  // Estado para la orden
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error
  const [mapEditor, setMapEditor] = useState(false)
  const [showPreview, setShowPreview] = useState(false)

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        // Hacemos la solicitud a la API con el `orderId`
        const response = await api.get(`/api/orders/${orderId}`)
        const data = response.data
        setOrder(data)  // Guardamos los datos de la orden en el estado
      } catch (error) {
        setError("No se pudieron cargar los detalles de la orden.")  // Si hay error, guardamos el mensaje
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
      <Card title="Detalles" className="p-8 flex flex-col gap-3 text-sm text-gray-700">
        <Button onClick={() => setShowPreview(true)} variant="outline" size="sm" className="absolute top-4 right-4 flex items-center gap-2">
          Ver reporte PDF
        </Button>

        <PrintPreviewModal isOpen={showPreview} onClose={() => setShowPreview(false)}>
          <PdfOrderReport order={order} />
          {/* <DownloadPdfOptions elementId="printable-order" orderId={order.id} /> */}
        </PrintPreviewModal>

        <p><strong>Fecha de creación:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        <p><strong>Servicio:</strong> {order.description}</p>
        <p><strong>Estado:</strong>{" "}
          <span
            className={`font-semibold ${order.status === "COMPLETED"
              ? "text-green-500"
              : order.status === "IN_PROGRESS"
                ? "text-yellow-500"
                : order.status === "FAILED" || order.status === "CANCELLED"
                  ? "text-red-500"
                  : "text-gray-500"
              }`}
          >
            {order.status}
          </span>
        </p>

        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div
            className={`h-2.5 rounded-full ${order.status === "COMPLETED"
              ? "bg-green-400"
              : order.status === "IN_PROGRESS"
                ? "bg-yellow-400"
                : order.status === "FAILED" || order.status === "CANCELLED"
                  ? "bg-red-400"
                  : "bg-gray-400"
              }`}
            style={{
              width: (() => {
                if (order.status === "PENDING") return "0%"
                if (order.status === "COMPLETED") return "100%"
                if (order.status === "FAILED" || order.status === "CANCELLED") return "100%"

                if (
                  order.status === "IN_PROGRESS" &&
                  order.visits?.length > 0 &&
                  order.scheduledDate &&
                  order.endDate
                ) {
                  const start = new Date(order.scheduledDate).getTime()
                  const end = new Date(order.endDate).getTime()
                  const now = Date.now()

                  if (end <= start) return "0%" // prevent division by zero or invalid ranges

                  const progress = ((now - start) / (end - start)) * 100
                  return `${Math.min(Math.max(progress, 5), 95)}%` // clamp to range 5–95%
                }

                return "20%" // default for undefined cases
              })(),
            }}
          ></div>
        </div>

        <p><strong>Fecha Programada:</strong> {new Date(order.scheduledDate).toLocaleDateString()}</p>
        <p><strong>Fecha de Finalización:</strong> {new Date(order.endDate || '').toLocaleDateString()}</p>
        {order.alternateContactName && order.alternateContactPhone && (
          <p>
            <strong>Contacto Alternativo:</strong> {order.alternateContactName} ({order.alternateContactPhone})
          </p>
        )}
      </Card>

      <div className="col-span-1 xl:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-5">
        <div className="relative col-span-2 flex flex-col justify-between text-white bg-linear-to-r from-indigo-900 to-indigo-700 p-6 rounded-2xl shadow-md">
          <p className="text-sm">N° Orden: {String(order.id).padStart(3, '0')}</p>
          <div>
            {user?.role?.name === 'TECHNICIAN' ? (
              <h2 className="text-2xl font-semibold">{order.client?.name}</h2>
            ) : (
              <Link href={`/clients/${order.clientId}`}>
                <h2 className="text-2xl font-semibold">{order.client?.name}</h2>
              </Link>
            )}

            {order.client?.contactPersonName && order.client?.contactPersonPhone ? (
              <p className="text-sm mt-2">{order.client?.contactPersonName} ({order.client?.contactPersonPhone})</p>
            ) : (
              <p className="text-sm mt-2">{order.client?.phone}</p>
            )}

            <p className="text-sm">{order.client?.address}</p>
          </div>

          <OrderPdfExporter order={order} className="absolute top-2 right-2" />
        </div>

        <WorkerCard worker={order.workers?.[0]} />
        <WorkerCard worker={order.workers?.[1]} />

        {order.conformity && (
          <Card title="Condormidad del Cliente" className="col-span-2 p-8 space-y-2 rounded-2xl">
            <p><strong>Descripción:</strong> {order.conformity.description}</p>

            <p>
              <strong>Estado:</strong>{" "}
              <span className={order.conformity.accepted ? "text-green-600" : "text-red-500"}>
                {order.conformity.accepted ? "Aceptado" : "Rechazado"}
              </span>
            </p>

            {!order.conformity.accepted && order.conformity.rejectionReason && (
              <p><strong>Motivo del Rechazo:</strong> {order.conformity.rejectionReason}</p>
            )}

            {order.conformity.signature && (
              <div>
                <p className="font-medium">Firma:</p>
                <img src={order.conformity.signature} alt="Firma del cliente" className="w-48 border rounded-sm mt-1" />
              </div>
            )}

            {order.conformity.files && Array.isArray(order.conformity.files) && order.conformity.files.length > 0 && (
              <div>
                <p className="font-medium">Archivos Adjuntos:</p>
                <ul className="list-disc list-inside space-y-1">
                  {order.conformity.files.map((file, idx) => (
                    <li key={idx}>
                      <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                        {file.name || `Archivo ${idx + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {order.conformity.rating && (
              <p><strong>Calificación:</strong> {order.conformity.rating} / 5</p>
            )}

            {order.conformity.feedback && (
              <p><strong>Comentario del Cliente:</strong> {order.conformity.feedback}</p>
            )}

            {order.conformity.conformityDate && (
              <p><strong>Fecha de Conformidad:</strong> {new Date(order.conformity.conformityDate).toLocaleDateString()}</p>
            )}
          </Card>
        )}

        <Card title={mapEditor ? "Editar Ubicaciones" : "Ubicación"} className={`p-8 col-span-2 ${!order.conformity && 'md:col-span-4'}`}>
          {mapEditor ? (
            <LocationMapEditor
              initialLocations={order.locations}
              onSave={async (updatedLocations) => {
                try {
                  const payload = updatedLocations.map((loc) => ({
                    ...loc,
                    orderId: order.id,
                  }))

                  const response = await api.post('/api/locations', payload)

                  if (response.status === 200) {
                    setOrder((prevOrder) => ({
                      ...prevOrder,
                      locations: response.data,
                    }))
                    handleToast('Ubicaciones agregadas correctamente', 'success', 'Los cambios fueron guardados exitosamente.')
                    setMapEditor(false)
                  }
                } catch (err) {
                  console.error('Error al guardar ubicaciones:', err)
                  handleToast(err.response?.data?.error || 'Hubo un error al guardar las ubicaciones.', "error")
                }
              }}
              onClose={() => setMapEditor(false)}
            />
          ) : (
            <>
              <LocationMapPreview locations={order.locations} />

              <div className="mt-4">
                <Button variant="outline" onClick={() => setMapEditor(true)} className="w-full flex items-center sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  {order.locations.length > 1 ? 'Modificar Ubicación' : 'Agregar Ubicación'}
                </Button>
              </div>
            </>
          )}
        </Card>
      </div>

      <VisitList visits={order.visits} orderID={orderId} />
    </div>
  )
}

export default OrderDetail
