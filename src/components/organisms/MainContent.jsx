import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import DashboardGrid from "./DashboardGrid"
import Card from "../molecules/Card"
import api from "@/lib/axios"
import Icon from "../atoms/Icon"
import Table from "../molecules/Table"
import LoadingSpinner from "../atoms/LoadingSpinner"
import CardForm from '../molecules/CardForm'
import CardGrid from '../organisms/CardGrid'
import Button from '../atoms/Button'
import ReusableCard from "../molecules/ReusableCard"
import SearchBar from "../molecules/SearchBar"
import BarChart from "./Chart"

const headers = [
  { key: "cliente", label: "Cliente" },
  { key: "responsable", label: "Responsable" },
  { key: "tecnicos", label: "Técnicos" },
  { key: "fecha", label: "Fecha programada" },
  { key: "estado", label: "Estado" },
  { key: "hide", label: "" }
]

const fetchOrders = async (query = '') => {
  const params = new URLSearchParams()
  if (query) params.append('q', query)
  const { data } = await api.get(`/api/orders?${params.toString()}`)
  return Array.isArray(data) ? data : []
}

const fetchMetrics = async () => {
  const { data } = await api.get("/api/metrics")
  return data?.data || []
}

const fetchPendingOrders = async ({ status = 'PENDING' }) => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)

  const { data } = await api.get(`/api/orders?${params.toString()}`)
  return data
}

const MainContent = () => {
  const [showForm, setShowForm] = useState(false)
  const [cards, setCards] = useState([
    {
      title: 'Órdenes',
      description: 'Gestiona las órdenes',
      href: '/orders',
      bgColor: 'bg-teal-400 hover:bg-teal-500 dark:bg-teal-300 dark:hover:bg-teal-400',
    },
    {
      title: 'Hikvision',
      description: 'Revisa los productos destacados',
      href: 'https://www.hikvision.com/es-la/',
      bgColor: 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500',
    },
  ])
  const [searchTerm, setSearchTerm] = useState("")

  const { data: pendingOrders = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: fetchPendingOrders
  })

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  })

  const { data: allOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', searchTerm],
    queryFn: () => fetchOrders(searchTerm),
  })

  const chartData = metrics.map(user => ({
    label: `${user.firstName} ${user.lastName}`,
    value: user.totalVisits
  }))

  const mapOrders = (orders) => {
    return orders.map(order => {
      const responsable = order.workers.find(w => w.isResponsible)?.user
      const tecnicos = order.workers
        .filter(w => !w.isResponsible)
        .map(w => `${w.user.firstName} ${w.user.lastName}`)
        .join(", ")

      return {
        id: order.id,
        cliente: order.client?.name ?? "(Sin nombre)",
        responsable: `${responsable?.firstName ?? "-"} ${responsable?.lastName ?? "-"}`,
        tecnicos: tecnicos || "-",
        fecha: order.scheduledDate
          ? new Date(order.scheduledDate).toLocaleDateString()
          : "-",
        estado: order.status ?? "-"
      }
    })
  }

  // Mapeo y filtrado en tiempo real
  const mappedOrders = mapOrders(allOrders)

  const filteredOrders = searchTerm
    ? mappedOrders : mappedOrders.filter(order =>
      Object.values(order).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    )

  const handleAddCard = (newCard) => {
    setCards((prev) => [...prev, newCard])
    setShowForm(false)
  }

  return (
    <>
      <DashboardGrid>
        <Card>
          <div className="h-full flex flex-col xl:flex-row justify-between gap-3 xl:gap-8">
            <div>
              <h3 className="text-primary dark:text-primary-dark text-xl font-semibold mb-3">Servicios</h3>
              <p>Ve los servicios disponibles y realiza modificaciones en ellos si fuera necesario.</p>
            </div>
            <div className="w-full flex items-center">
              <img className="object-cover rounded-md" src="https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Servicios" />
            </div>
          </div>
        </Card>

        <Card>
          <img className="w-full xl:h-48 object-cover rounded-md" src="https://images.pexels.com/photos/11139140/pexels-photo-11139140.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load" alt="Imagen de ejemplo" />
        </Card>
      </DashboardGrid>

      <DashboardGrid>
        <Card title="Órdenes" className="space-y-2">
          <div className="w-full px-4">
            <SearchBar
              placeholder="Buscar por cliente, servicio o fecha..."
              onSearch={setSearchTerm}
            />
          </div>
          {loadingOrders ? (
            <LoadingSpinner />
          ) : (
            <Table data={filteredOrders} headers={headers} showActions={false} />
          )}
        </Card>

        <Card title="Órdenes pendientes">
          {loadingPending ? (
            <LoadingSpinner />
          ) : pendingOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No hay órdenes pendientes.</p>
          ) : (
            pendingOrders.map((order) => (
              <div key={order.id} className="flex items-center gap-5 p-3">
                <div><Icon name={order.client?.name.includes('Hospital') ? 'hospital' : 'building'} size={20} /></div>
                <div className="flex flex-col gap-2">
                  <h5 className="font-semibold">{order.client?.name ?? '(Sin cliente)'}</h5>
                  <p className="text-xs">Agendado: {order.scheduledDate
                    ? new Date(order.scheduledDate).toLocaleDateString('es-PE', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })
                    : '(Sin fecha)'}</p>
                </div>
              </div>
            ))
          )}
        </Card>
      </DashboardGrid>

      <DashboardGrid>
        <Card title="Visitas por técnico">
          {loadingMetrics ? (
            <LoadingSpinner />
          ) : (
            <BarChart data={chartData} />
          )}
        </Card>

        <Card title="Métricas">
          {loadingMetrics ? (
            <LoadingSpinner />
          ) : (
            metrics.length > 0 ? (
              <div className="grid gap-2">
                {metrics.map((item) => (
                  <ReusableCard key={item.dni} card={item} link={`/users/${item.dni}`} bgColor={'bg-secondary-dark'}>
                    <h3>{item.firstName} {item.lastName}</h3>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4>Visitas Totales</h4>
                        <p className="text-primary dark:text-primary-dark font-semibold">{item.totalVisits}</p>
                      </div>
                      {item.icon && <Icon name={item.icon} size={28} active />}
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <div>
                        <h4>Tiempo Total</h4>
                        <p className="text-primary dark:text-primary-dark font-semibold">{item.totalTime}</p>
                      </div>
                    </div>
                  </ReusableCard>
                ))}
              </div>
            ) : (
              <p>No se encontraron métricas para mostrar.</p>
            )
          )}
        </Card>
      </DashboardGrid>

      <DashboardGrid>
        <Card title={showForm ? 'Crear nueva tarjeta' : 'Enlaces'}>
          <div className="flex justify-between items-center absolute top-2 right-2">
            <Button onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Ver tarjetas' : '+ Agregar tarjeta'}
            </Button>
          </div>

          {showForm ? (
            <CardForm onAdd={handleAddCard} />
          ) : (
            <CardGrid cards={cards} />
          )}
        </Card>
      </DashboardGrid>
    </>
  )
}

export default MainContent
