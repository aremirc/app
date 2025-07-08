import { MapContainer, TileLayer, Marker, useMapEvents, Tooltip } from "react-leaflet"
import { useState } from "react"
import { MapPin, Trash2, X } from "lucide-react"
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

  const handleAdd = (location) => {
    setLocations((prev) => {
      if (prev.length >= 2) return prev
      return [...prev, { ...location, id: null, label: "" }]
    })
  }

  const handleRemove = (index) => {
    setIndexToDelete(index)
  }

  const confirmDelete = () => {
    setLocations((prev) => prev.filter((_, i) => i !== indexToDelete))
    setIndexToDelete(null)
  }

  const cancelDelete = () => {
    setIndexToDelete(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(locations)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <>
      {isSaving && <LoadingOverlay />}

      <Button onClick={onClose} className="absolute top-3 right-3">
        <X className="w-5 h-5" />
      </Button>

      <div className="space-y-4 relative">
        <MapContainer
          center={[locations[0]?.latitude || -34.6, locations[0]?.longitude || -58.4]}
          zoom={13}
          scrollWheelZoom={true}
          className="h-80 w-full rounded-2xl z-0"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker onAdd={handleAdd} disabled={locations.length >= 2} />
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

        <ul className="space-y-2">
          {locations.map((loc, i) => (
            <li key={i} className="flex flex-col gap-1 bg-muted p-2 rounded">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  {loc.latitude.toFixed(5)}, {loc.longitude.toFixed(5)}
                </span>
                <button
                  className="text-red-500 hover:text-red-700 text-sm"
                  onClick={() => handleRemove(i)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <input
                type="text"
                placeholder={`Etiqueta para ubicación #${i + 1}`}
                value={loc.label || ""}
                onChange={(e) => {
                  const newLabel = e.target.value
                  setLocations((prev) =>
                    prev.map((item, idx) => idx === i ? { ...item, label: newLabel } : item)
                  )
                }}
                className="text-sm mt-1 px-2 py-1 border rounded bg-background-light dark:bg-background-dark text-gray-800 dark:text-white"
              />
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
            message={`¿Estás seguro de eliminar la ubicación (${locations[indexToDelete].latitude.toFixed(5)}, ${locations[indexToDelete].longitude.toFixed(5)})?`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
          />
        )}
      </div>
    </>
  )
}

export default LocationMapEditor
