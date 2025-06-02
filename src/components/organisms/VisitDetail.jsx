"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"
import { Pencil } from "lucide-react"
import LoadingSpinner from "../atoms/LoadingSpinner"
import InfoItem from "../molecules/InfoItem"
import StarRating from "../molecules/StarRating"
import Card from "../molecules/Card"
import Button from "../atoms/Button"

const VisitDetail = ({ visitId }) => {
  const [visit, setVisit] = useState(null)  // Estado para la visita
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        // Hacemos la solicitud a la API con el `visitId`
        const response = await api.get(`/api/visits/${visitId}`)
        setVisit(response.data)  // Guardamos los datos de la visita en el estado
      } catch (error) {
        setError('Error loading visit details. Please try again later.')  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchVisit()  // Llamamos a la función para obtener la visita
  }, [visitId])  // Dependencia para que se ejecute cuando cambie el `visitId`

  // Mostrar "loading" mientras se obtiene la visita
  if (loading) {
    return <LoadingSpinner />
  }

  // Si hubo un error
  if (error) {
    return <div>{error}</div>
  }

  // Si no se encuentra la visita
  if (!visit) {
    return <div>Visit not found.</div>
  }

  return (
    <Card>
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-primary dark:bg-primary-dark px-6 py-4">
          <h2 className="text-2xl font-bold text-white">🗓️ Detalles de la Visita</h2>
          <p className="text-sm text-gray-200">Información completa del registro seleccionado</p>
        </div>

        <div className="p-6 space-y-4 relative">
          <Button size="sm" variant="outline" className="absolute top-2 right-2"><Pencil className="w-4 h-4" /></Button>

          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="ID de Visita" value={visit.id} />
            <InfoItem label="ID de Orden" value={visit.orderId} />
            <InfoItem label="Trabajador" value={visit.user.firstName + ' ' + visit.user.lastName} />
            <InfoItem label="Fecha" value={new Date(visit.date).toLocaleString()} />
          </div>

          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Descripción:</p>
            <p className="text-md text-gray-800 dark:text-gray-100 mt-1">{visit.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InfoItem label="Cliente" value={visit.client.name} />
            <InfoItem
              label="Revisado"
              value={
                visit.isReviewed
                  ? "Sí"
                  : "No evaluado"
              }
            />
          </div>

          {visit.isReviewed && (
            <>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300">Evaluación:</span>
                <StarRating rating={visit.evaluation} />
                <span className={`px-3 py-1 text-sm rounded-full font-semibold ${visit.evaluation >= 4 ? 'bg-green-100 text-green-800' :
                  visit.evaluation >= 2 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {visit.evaluation ?? 'No evaluado'}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                <div
                  className={`h-2.5 rounded-full ${visit.evaluation >= 4
                    ? 'bg-green-400'
                    : visit.evaluation >= 2
                      ? 'bg-yellow-400'
                      : 'bg-red-400'
                    }`}
                  style={{ width: `${(visit.evaluation / 5) * 100}%` }}
                ></div>
              </div>
            </>
          )}

          {visit.evidences?.length > 0 && (
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Evidencias:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {visit.evidences.map((evidence) => (
                  <div
                    key={evidence.id}
                    className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    {evidence.type === "PHOTO" ? (
                      <img
                        src={evidence.url}
                        alt="Evidencia fotográfica"
                        className="w-full h-48 object-cover rounded-md mb-2"
                      />
                    ) : (
                      <video
                        controls
                        src={evidence.url}
                        className="w-full h-48 rounded-md mb-2"
                      >
                        Tu navegador no soporta video.
                      </video>
                    )}
                    {evidence.comment && (
                      <p className="text-sm text-gray-800 dark:text-gray-100">
                        <strong>Comentario:</strong> {evidence.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

export default VisitDetail
