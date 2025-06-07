import { useState } from "react"
import { useQuery } from '@tanstack/react-query'
import DashboardGrid from "./DashboardGrid"
import Card from "../molecules/Card"
import api from "@/lib/axios"
import BarChart from "./Chart"
import Icon from "../atoms/Icon"
import Button from '../atoms/Button'
import Table from "../molecules/Table"
import CardForm from '../molecules/CardForm'
import CardGrid from '../organisms/CardGrid'
import SearchBar from "../molecules/SearchBar"
import ReusableCard from "../molecules/ReusableCard"
import LoadingSpinner from "../atoms/LoadingSpinner"
import LoadingOverlay from "../atoms/LoadingOverlay"

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

  const { data: allOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', searchTerm],
    queryFn: () => fetchOrders(searchTerm),
  })

  const { data: pendingOrders = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: fetchPendingOrders
  })

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  })

  const isInitialLoading = loadingPending || loadingMetrics

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

  if (isInitialLoading) {
    return <LoadingSpinner />
  }

  return (
    <>
      <DashboardGrid>
        <Card title="Órdenes">
          <div className="w-full px-4 mb-2">
            <SearchBar
              placeholder="Buscar por cliente, servicio o fecha..."
              onSearch={setSearchTerm}
            />
          </div>
          {loadingOrders ? (
            <LoadingOverlay />
          ) : (
            <Table data={filteredOrders} headers={headers} showActions={false} />
          )}
        </Card>

        <Card title="Órdenes pendientes">
          {pendingOrders.length === 0 ? (
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
        <Card>
          <div className="h-full flex flex-col xl:flex-row justify-between gap-3 xl:gap-8">
            <div className="flex-1">
              <h3 className="text-primary dark:text-primary-dark text-xl font-semibold mb-3">Servicios</h3>
              <p>Ve los servicios disponibles y realiza modificaciones en ellos si fuera necesario.</p>
            </div>
            <div className="w-full xl:w-64 flex items-center">
              <img className="object-cover rounded-md w-full h-auto" src="https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Servicios" />
            </div>
          </div>
        </Card>

        <Card>
          <div className="aspect-[16/9] w-full h-full xl:max-h-48">
            <img
              className="w-full h-full object-cover rounded-md"
              src="https://images.pexels.com/photos/11139140/pexels-photo-11139140.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
              alt="Imagen de ejemplo"
            />
          </div>
        </Card>
      </DashboardGrid>

      <DashboardGrid>
        <Card title="Visitas por técnico">
          <BarChart data={chartData} />
        </Card>

        <Card title="Métricas">
          {metrics.length > 0 ? (
            <div className="grid gap-2">
              {metrics.map((item) => (
                <a
                  key={item.dni}
                  href={`/users/${item.dni}`}
                  className="block p-4 rounded-lg bg-primary-dark dark:hover:bg-primary transition-colors duration-200"
                >
                  <h3 className="text-lg font-bold text-text-dark dark:text-text-light">
                    {item.firstName} {item.lastName}
                  </h3>

                  <div className="flex items-center justify-between mt-2">
                    <div>
                      <h4 className="text-sm text-text-dark dark:text-text-light">Visitas Totales</h4>
                      <p className="text-text-light font-semibold text-base">
                        {item.totalVisits}
                      </p>
                    </div>
                    {item.icon && <Icon name={item.icon} size={28} active />}
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <h4 className="text-sm text-text-dark dark:text-text-light">Tiempo Total</h4>
                      <p className="text-text-light font-semibold text-base">
                        {item.totalTime}
                      </p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <p>No se encontraron métricas para mostrar.</p>
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
