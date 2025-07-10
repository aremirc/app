import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  Tooltip,
} from "react-leaflet"
import { useState, useEffect, useRef } from "react"
import { MapPin, Tag, Trash2, X, LocateFixed } from "lucide-react"
import { handleToast } from "@/lib/toast"
import L from "leaflet"
import Button from "../atoms/Button"
import ConfirmDialog from "../atoms/ConfirmDialog"
import LoadingOverlay from "../atoms/LoadingOverlay"

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function LocationMarker({ onAdd, disabled }) {
  useMapEvents({
    click(e) {
      if (disabled) return
      const { lat, lng } = e.latlng
      onAdd({ latitude: lat, longitude: lng })
    },
  })
  return null
}

const LocationMapEditor = ({ initialLocations = [], onSave, onClose }) => {
  const [locations, setLocations] = useState(initialLocations)
  const [indexToDelete, setIndexToDelete] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [manualLat, setManualLat] = useState("")
  const [manualLng, setManualLng] = useState("")
  const [mapCenter, setMapCenter] = useState([
    initialLocations[0]?.latitude || -13.1588,
    initialLocations[0]?.longitude || -74.2239,
  ])

  const mapRef = useRef()

  // Centrar mapa al cargar si hay acceso a geolocalización
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        setMapCenter([latitude, longitude])
        mapRef.current?.setView([latitude, longitude], 14)
      })
    }
  }, [])

  const handleAdd = (location) => {
    setLocations((prev) => {
      // if (prev.length >= 2) return prev
      return [...prev, { ...location, id: null, label: "" }]
    })
  }

  const handleRemove = (index) => setIndexToDelete(index)

  const confirmDelete = () => {
    setLocations((prev) => prev.filter((_, i) => i !== indexToDelete))
    setIndexToDelete(null)
  }

  const cancelDelete = () => setIndexToDelete(null)

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(locations)
    } finally {
      setIsSaving(false)
    }
  }

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      handleToast("La geolocalización no está disponible.", "error")
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        handleAdd({ latitude, longitude })
        setMapCenter([latitude, longitude])
        mapRef.current?.setView([latitude, longitude], 14)
      },
      (err) => {
        handleToast("Error al obtener ubicación", "error", err?.message)
      }
    )
  }

  const handleAddManual = () => {
    const lat = parseFloat(manualLat)
    const lng = parseFloat(manualLng)
    if (isNaN(lat) || isNaN(lng)) {
      handleToast("Coordenadas inválidas.", "error")
      return
    }
    handleAdd({ latitude: lat, longitude: lng })
    setManualLat("")
    setManualLng("")
  }

  return (
    <>
      {isSaving && <LoadingOverlay />}

      <Button onClick={onClose} className="absolute top-3 right-3">
        <X className="w-5 h-5" />
      </Button>

      <div className="space-y-4 relative">
        <MapContainer
          center={mapCenter}
          zoom={13}
          scrollWheelZoom={true}
          className="h-80 w-full rounded-2xl z-0"
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker
            onAdd={handleAdd}
          // disabled={locations.length >= 2}
          />
          {locations.map((loc, i) => (
            <Marker
              key={i}
              position={[loc.latitude, loc.longitude]}
              icon={defaultIcon}
            >
              {loc.label && (
                <Tooltip direction="top" offset={[1, -30]} opacity={0.9}>
                  {loc.label}
                </Tooltip>
              )}
            </Marker>
          ))}
        </MapContainer>

        {/* Botón para usar ubicación actual */}
        <Button
          onClick={handleUseMyLocation}
          className="w-full flex items-center justify-center gap-2"
        >
          <LocateFixed className="w-4 h-4" />
          Usar mi ubicación actual
        </Button>

        {/* Agregar coordenadas manuales */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Latitud"
              value={manualLat}
              onChange={(e) => setManualLat(e.target.value)}
              className="w-1/2 px-2 py-1 border dark:border-none rounded text-sm bg-background-light dark:bg-background-dark text-gray-800 dark:text-white"
            />
            <input
              type="number"
              placeholder="Longitud"
              value={manualLng}
              onChange={(e) => setManualLng(e.target.value)}
              className="w-1/2 px-2 py-1 border dark:border-none rounded text-sm bg-background-light dark:bg-background-dark text-gray-800 dark:text-white"
            />
          </div>
          <Button onClick={handleAddManual} className="w-full">
            Agregar por coordenadas
          </Button>
        </div>

        <ul className="space-y-2">
          {locations.map((loc, i) => (
            <li key={i} className="bg-background-muted dark:bg-background-muted-dark p-2 rounded">
              <div className="flex justify-between items-center gap-2">
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-3">
                  <span className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={`Etiqueta para ubicación #${i + 1}`}
                      value={loc.label || ""}
                      onChange={(e) => {
                        const newLabel = e.target.value
                        setLocations((prev) =>
                          prev.map((item, idx) =>
                            idx === i ? { ...item, label: newLabel } : item
                          )
                        )
                      }}
                      className="w-full text-sm px-2 py-1 border dark:border-none rounded bg-background-light dark:bg-background-dark text-gray-800 dark:text-white bg-background-light dark:bg-background-dark text-gray-800 dark:text-white"
                    />
                  </span>
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                  </span>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={() => handleRemove(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>

        <Button
          onClick={handleSave}
          className="w-full flex items-center justify-center gap-2"
          disabled={locations.length === 0 || isSaving}
        >
          {isSaving && (
            <span className="loader w-4 h-4 border-2 border-t-transparent rounded-full animate-spin" />
          )}
          {isSaving ? "Guardando..." : "Guardar ubicaciones"}
        </Button>

        {indexToDelete !== null && (
          <ConfirmDialog
            title="¿Eliminar ubicación?"
            message={`¿Estás seguro de eliminar la ubicación (${locations[
              indexToDelete
            ].latitude.toFixed(5)}, ${locations[
              indexToDelete
            ].longitude.toFixed(5)})?`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </>
  )
}

export default LocationMapEditor
