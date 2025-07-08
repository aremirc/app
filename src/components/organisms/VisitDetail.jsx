"use client"

import { useEffect, useState } from "react"
import { Pencil } from "lucide-react"
import api from "@/lib/axios"
import Card from "../molecules/Card"
import Button from "../atoms/Button"
import InfoItem from "../molecules/InfoItem"
import StarRating from "../molecules/StarRating"
import LoadingSpinner from "../atoms/LoadingSpinner"
import VisitCard from "../molecules/VisitCard"

const VisitDetail = ({ visitId }) => {
  const [visit, setVisit] = useState(null)  // Estado para la visita
  const [loading, setLoading] = useState(true)  // Estado de carga
  const [error, setError] = useState(null)  // Estado de error
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        // Hacemos la solicitud a la API con el `visitId`
        const response = await api.get(`/api/visits/${visitId}`)
        setVisit(response.data)  // Guardamos los datos de la visita en el estado
      } catch (error) {
        setError("No se pudieron cargar los detalles de la visita.")  // Si hay error, guardamos el mensaje
      } finally {
        setLoading(false)  // Terminamos de cargar
      }
    }

    fetchVisit()  // Llamamos a la función para obtener la visita
  }, [visitId])  // Dependencia para que se ejecute cuando cambie el `visitId`

  // Mostrar "loading" mientras se obtiene la visita
  if (loading) return <LoadingSpinner />

  // Si hubo un error
  if (error) return <div className="text-red-500 text-center mt-10">{error}</div>

  // Si no se encuentra la visita
  if (!visit) return <div className="text-center mt-10">Visita no encontrada.</div>

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {/* Card de Detalles */}
      <Card title="Detalles de la Visita" className="p-8 sm:col-span-2 flex flex-col gap-3 text-sm">
        <Button variant="outline" size="sm" onClick={() => setIsModalOpen(true)} className="absolute top-4 right-4">
          <Pencil className="w-4 h-4" />
        </Button>

        {isModalOpen && (
          <VisitCard
            visit={visit}
            setVisit={(n) => setVisit((prevVisit) => ({ ...prevVisit, ...n }))}
            handleCancel={() => setIsModalOpen(false)}
          />
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <InfoItem label="ID de Visita" value={String(visit.id).padStart(3, "0")} />
          <InfoItem
            label="ID de Orden"
            value={
              <span className="flex items-center gap-2">
                {String(visit.orderId).padStart(3, "0")}
                <span
                  className={`inline-block align-middle text-xs px-2 py-0.5 rounded-full font-semibold
                    ${visit.order?.status === "COMPLETED"
                      ? "bg-green-200 text-green-800"
                      : visit.order?.status === "IN_PROGRESS"
                        ? "bg-yellow-200 text-yellow-800"
                        : ["FAILED", "CANCELLED"].includes(visit.order?.status)
                          ? "bg-red-200 text-red-800"
                          : "bg-gray-200 text-gray-800"}
                  `}
                >
                  {visit.order?.status.replace("_", " ")}
                </span>
              </span>
            }
          />
          <InfoItem label="Cliente" value={visit.client.name} />
          <InfoItem label="Revisado" value={visit.isReviewed ? "Sí" : "No evaluado"} />
          <InfoItem label="Fecha de Inicio" value={new Date(visit.date).toLocaleString()} />
          <InfoItem label="Hora de Fin" value={new Date(visit.endTime).toLocaleString()} />
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Descripción:</p>
          <p className="text-md text-gray-800 dark:text-gray-100 mt-1">{visit.description}</p>
        </div>

        <InfoItem label="Trabajador" value={`${visit.user.firstName} ${visit.user.lastName}`} />
      </Card>

      {/* Card de Evaluación */}
      {visit.isReviewed && (
        <Card title="Evaluación" className="p-8 sm:col-span-2 xl:col-span-1 flex flex-col gap-3 text-sm">
          <div className="flex items-center gap-2">
            <StarRating rating={visit.evaluation} />
            <span className={`px-3 py-1 text-sm rounded-full font-semibold ${visit.evaluation >= 4 ? "bg-green-100 text-green-800" :
              visit.evaluation >= 2 ? "bg-yellow-100 text-yellow-800" :
                "bg-red-100 text-red-800"
              }`}>
              {visit.evaluation} / 5
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className={`h-2.5 rounded-full ${visit.evaluation >= 4 ? "bg-green-400" :
                visit.evaluation >= 2 ? "bg-yellow-400" :
                  "bg-red-400"
                }`}
              style={{ width: `${(visit.evaluation / 5) * 100}%` }}
            ></div>
          </div>
        </Card>
      )}

      {/* Card de Evidencias */}
      {visit.evidences?.length > 0 && (
        <Card title="Evidencias" className="p-8 sm:col-span-2 xl:col-span-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visit.evidences.map((evidence) => (
              <div key={evidence.id} className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg">
                {evidence.type === "PHOTO" ? (
                  <img src={evidence.url} alt="Evidencia" className="w-full h-48 object-cover rounded-md mb-2" />
                ) : (
                  <video controls src={evidence.url} className="w-full h-48 rounded-md mb-2">
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
        </Card>
      )}
    </div>
  )
}

export default VisitDetail
