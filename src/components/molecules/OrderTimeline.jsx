import { useState, useEffect } from 'react'
import Link from "next/link"
import { CalendarIcon } from "lucide-react"
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet'
import L from 'leaflet'
import Icon from "@/components/atoms/Icon"
import PrintPreviewModal from '../organisms/PrintPreviewModal'

const MapAutoCenter = ({ lat, lng }) => {
  const map = useMap()

  useEffect(() => {
    map.setView([lat, lng], map.getZoom())
  }, [lat, lng, map])

  return null
}

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const formatScheduledDate = (scheduledDate) => {
  if (!scheduledDate) return "(Sin fecha)"
  const date = new Date(scheduledDate)
  const today = new Date()
  const diffInDays = Math.floor(
    (date.setHours(0, 0, 0, 0) - today.setHours(0, 0, 0, 0)) / (1000 * 60 * 60 * 24)
  )

  if (diffInDays === 0) return "Hoy"
  if (diffInDays === 1) return "Mañana"
  if (diffInDays === 2) return "Pasado mañana"

  const formatted = date.toLocaleDateString("es-PE", {
    weekday: "long",
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  return formatted.charAt(0).toUpperCase() + formatted.slice(1)
}

const OrderTimeline = ({ orders = [] }) => {
  const [selectedLocations, setSelectedLocations] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showPreviewMap, setShowPreviewMap] = useState(false)

  if (!orders.length) {
    return <p className="text-sm text-gray-500 dark:text-text-dark">No hay órdenes pendientes.</p>
  }

  const openMapModal = (locations = []) => {
    if (!locations.length) return
    setSelectedLocations(locations)
    setCurrentIndex(0)
    setShowPreviewMap(true)
  }

  return (
    <ol className="relative border-s border-border-light dark:border-border-dark ms-2">
      {orders.map((order) => (
        <li key={order.id} className="mb-2 ms-4 relative">
          <div onClick={() => openMapModal(order.locations)} className="cursor-pointer absolute left-[-25px] top-1/2 transform -translate-y-1/2">
            <Icon
              name={order.client?.name?.includes("Hospital") ? "hospital" : "building"}
              size={24}
              color="text-background-dark bg-transparent dark:hover:bg-background-muted-dark hover:bg-primary/35"
            />
          </div>
          <Link
            href={`/orders/${order.id}`}
            className="group block rounded-lg ml-2 transition-colors hover:bg-primary/10 dark:hover:bg-background-muted-dark"
          >
            {/* Punto en la línea de tiempo */}
            <span className="hidden absolute left-[-22px] top-1/2 transform -translate-y-1/2 w-3 h-3 rounded-full border border-background-light dark:border-background-dark bg-primary" />

            <div className="group-hover:text-primary dark:group-hover:text-primary-dark flex items-center gap-2 p-2">
              <div className="flex flex-col">
                <h5 className="font-semibold text-primary dark:text-primary-dark">
                  {order.client?.name ?? "(Sin cliente)"}
                </h5>
                <time
                  className="text-xs text-text-light dark:text-text-dark flex items-center gap-1"
                  title={new Date(order.scheduledDate).toLocaleString("es-PE")}
                >
                  <CalendarIcon className="w-3 h-3 text-text-light dark:text-text-dark" />
                  {formatScheduledDate(order.scheduledDate)}
                </time>
              </div>
            </div>
          </Link>
        </li>
      ))}

      <PrintPreviewModal isOpen={showPreviewMap} onClose={() => setShowPreviewMap(false)}>
        <div id="printable-content">
          <h2 className="text-xl font-semibold mb-4">Vista previa de la ubicación - {selectedLocations[currentIndex]?.label ?? currentIndex + 1}</h2>

          {selectedLocations.length > 0 && (
            <>
              <MapContainer
                center={[
                  selectedLocations[currentIndex].latitude,
                  selectedLocations[currentIndex].longitude,
                ]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-64 w-full rounded-xl"
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker
                  position={[
                    selectedLocations[currentIndex].latitude,
                    selectedLocations[currentIndex].longitude,
                  ]}
                  icon={defaultIcon}
                />
                <MapAutoCenter
                  lat={selectedLocations[currentIndex].latitude}
                  lng={selectedLocations[currentIndex].longitude}
                />
              </MapContainer>

              <p className="text-sm text-muted-foreground mt-2">
                <strong>Coordenadas:</strong>{" "}
                {selectedLocations[currentIndex].latitude.toFixed(5)},{" "}
                {selectedLocations[currentIndex].longitude.toFixed(5)}
              </p>

              <div className="flex justify-between items-center mt-3 text-sm text-muted-foreground print:hidden">
                <button
                  onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                  disabled={currentIndex === 0}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Anterior
                </button>

                <span>
                  Ubicación {currentIndex + 1} de {selectedLocations.length}
                </span>

                <button
                  onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, selectedLocations.length - 1))}
                  disabled={currentIndex === selectedLocations.length - 1}
                  className="px-3 py-1 border rounded disabled:opacity-40"
                >
                  Siguiente
                </button>
              </div>
            </>
          )}
        </div>
      </PrintPreviewModal>
    </ol>
  )
}

export default OrderTimeline
