'use client'

import { useState } from 'react'
import { MapPin, Tag, List, Map } from 'lucide-react'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import L from 'leaflet'
import Button from '../atoms/Button'
import PrintPreviewModal from '../organisms/PrintPreviewModal'

const defaultIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
})

const LocationMapPreview = ({ locations = [] }) => {
  const [view, setView] = useState('map') // 'map' | 'list'
  const [showPreviewMap, setShowPreviewMap] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState(null)

  if (!locations.length) {
    return <p className="text-center text-gray-500">No hay ubicaciones para mostrar.</p>
  }

  const openMapModal = (loc) => {
    setSelectedLocation(loc)
    setShowPreviewMap(true)
  }

  return (
    <div className="space-y-4">
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setView(view === 'map' ? 'list' : 'map')}
          className="flex items-center gap-2"
        >
          {view === 'map' ? <List className="w-4 h-4" /> : <Map className="w-4 h-4" />}
          {view === 'map' ? 'Ver lista' : 'Ver mapa'}
        </Button>
      </div>

      {view === 'map' ? (
        <MapContainer
          center={[locations[0].latitude, locations[0].longitude]}
          zoom={13}
          scrollWheelZoom={false}
          dragging={false}
          doubleClickZoom={false}
          zoomControl={false}
          className="h-64 w-full rounded-xl print:h-[300px]"
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {locations.map((loc, i) => (
            <Marker
              key={i}
              position={[loc.latitude, loc.longitude]}
              icon={defaultIcon}
            />
          ))}
        </MapContainer>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {locations.map((loc, i) => (
            <div
              key={i}
              onClick={() => openMapModal(loc)}
              className="cursor-pointer border rounded-xl p-4 bg-muted flex flex-col gap-1 hover:bg-muted/70 transition"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <p className="text-sm"><strong>Lat:</strong> {loc.latitude}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground rotate-180" />
                <p className="text-sm"><strong>Lng:</strong> {loc.longitude}</p>
              </div>
              {loc.label && (
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm"><strong>Etiqueta:</strong> {loc.label}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <PrintPreviewModal isOpen={showPreviewMap} onClose={() => setShowPreviewMap(false)}>
        <div id="printable-content">
          <h2 className="text-xl font-semibold mb-4">Vista previa de la ubicación</h2>
          {selectedLocation && (
            <MapContainer
              center={[selectedLocation.latitude, selectedLocation.longitude]}
              zoom={15}
              scrollWheelZoom={false}
              className="h-64 w-full rounded-xl"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker
                position={[selectedLocation.latitude, selectedLocation.longitude]}
                icon={defaultIcon}
              />
            </MapContainer>
          )}
        </div>
      </PrintPreviewModal>
    </div>
  )
}

export default LocationMapPreview
