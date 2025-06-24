import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet"
import { useState } from "react"
import L from "leaflet"
import Button from "../atoms/Button"
import { MapPin, Trash2 } from "lucide-react"
import ConfirmDialog from "../atoms/ConfirmDialog"

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

function LocationMarker({ onAdd }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      onAdd({ latitude: lat, longitude: lng })
    },
  })
  return null
}

const LocationMapEditor = ({ initialLocations = [], onSave }) => {
  const [locations, setLocations] = useState(initialLocations)
  const [indexToDelete, setIndexToDelete] = useState(null)

  const handleAdd = (location) => {
    setLocations((prev) => [...prev, { ...location, id: null }])
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

  return (
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
        <LocationMarker onAdd={handleAdd} />
        {locations.map((loc, i) => (
          <Marker
            key={i}
            position={[loc.latitude, loc.longitude]}
            icon={defaultIcon}
          />
        ))}
      </MapContainer>

      <ul className="space-y-2">
        {locations.map((loc, i) => (
          <li key={i} className="flex items-center justify-between bg-muted p-2 rounded">
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
          </li>
        ))}
      </ul>

      <Button onClick={() => onSave(locations)} className="w-full">
        Guardar ubicaciones
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
  )
}

export default LocationMapEditor
