import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import { Timer, CalendarDays, Users, ClipboardList } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { useAuth } from "@/context/AuthContext"
import DashboardGrid from "./DashboardGrid"
import Card from "../molecules/Card"
import api from "@/lib/axios"
import Icon from "../atoms/Icon"
import Button from '../atoms/Button'
import Table from "../molecules/Table"
import CardForm from '../molecules/CardForm'
import CardGrid from '../organisms/CardGrid'
import SearchBar from "../molecules/SearchBar"
import LoadingSpinner from "../atoms/LoadingSpinner"
import LoadingOverlay from "../atoms/LoadingOverlay"
import Link from "next/link"

const cardMetric = [
  {
    title: "Órdenes Completadas",
    icon: <ClipboardList className="h-6 w-6 text-primary" />,
    value: "532",
    description: "+12 este mes",
  },
  {
    title: "Visitas",
    icon: <CalendarDays className="h-6 w-6 text-primary" />,
    value: "214",
    description: "+8% desde abril",
  },
  {
    title: "Usuarios Activos",
    icon: <Users className="h-6 w-6 text-primary" />,
    value: "58",
    description: "78% verificados",
  },
  {
    title: "Horas Trabajadas",
    icon: <Timer className="h-6 w-6 text-primary" />,
    value: "1,450",
    description: "Promedio mensual",
  },
]

const ordersPerMonth = [
  { name: "Ene", Órdenes: 45 },
  { name: "Feb", Órdenes: 62 },
  { name: "Mar", Órdenes: 53 },
  { name: "Abr", Órdenes: 70 },
  { name: "May", Órdenes: 60 },
  { name: "Jun", Órdenes: 75 },
]

const visitsPerMonth = [
  { month: "Ene", Visitas: 32 },
  { month: "Feb", Visitas: 40 },
  { month: "Mar", Visitas: 38 },
  { month: "Abr", Visitas: 50 },
  { month: "May", Visitas: 54 },
  { month: "Jun", Visitas: 58 },
]

const headers = [
  { key: "cliente", label: "Cliente" },
  { key: "responsable", label: "T. Responsable" },
  // { key: "tecnicos", label: "Técnicos" },
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
  const { user } = useAuth()
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
  const [showForm, setShowForm] = useState(false)
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
      <DashboardGrid className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cardMetric.map((card) => (
          <Card key={card.title} className="rounded-2xl shadow-md p-4 bg-background-muted dark:bg-background-muted-dark">
            <div className="flex items-center space-x-4">
              <div className="p-2 rounded-full bg-background-light dark:bg-background-dark shadow" style={{ boxShadow: '0 2px 4px var(--color-shadow-light)' }}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-text-light dark:text-text-dark">{card.title}</p>
                <p className="text-xl font-semibold text-primary dark:text-primary-dark">{card.value}</p>
                <p className="text-xs text-text-light dark:text-text-dark">{card.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </DashboardGrid>

      <DashboardGrid>
        <Card title={`Órdenes pendientes (${pendingOrders.length})`}>
          {pendingOrders.length === 0 ? (
            <p className="text-sm text-gray-500">No hay órdenes pendientes.</p>
          ) : (
            <ol className="relative border-s border-gray-200 dark:border-gray-700 ms-2">
              {pendingOrders.map((order) => (
                <li key={order.id} className="mb-2 ms-4 relative">
                  <Link href={`/orders/${order.id}`} className="group block hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    {/* Punto en la línea de tiempo */}
                    <span className="absolute left-[-22px] top-1/2 transform -translate-y-1/2 w-3 h-3 bg-primary rounded-full border border-white dark:border-gray-900" />

                    <div className="flex items-center gap-2 p-2">
                      <Icon
                        name={order.client?.name.includes('Hospital') ? 'hospital' : 'building'}
                        size={20}
                        color="group-hover:text-primary dark:group-hover:text-primary-dark"
                      />
                      <div className="flex flex-col">
                        <h5 className="font-semibold">
                          {order.client?.name ?? '(Sin cliente)'}
                        </h5>
                        <time className="text-xs text-gray-500 dark:text-text-dark">
                          {order.scheduledDate
                            ? new Date(order.scheduledDate).toLocaleDateString('es-PE', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })
                            : '(Sin fecha)'}
                        </time>
                      </div>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </Card>

        <Card title="Métricas">
          {metrics.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {metrics.map((item) => (
                <Link
                  key={item.dni}
                  href={`/users/${item.dni}`}
                  className="p-3 rounded-md bg-primary/10 dark:bg-primary-dark/20 hover:bg-primary/20 dark:hover:bg-primary-dark/40 transition-colors shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-primary-dark dark:text-primary-light truncate">
                      {item.firstName} {item.lastName}
                    </h3>
                    {item.icon && <Icon name={item.icon} size={20} />}
                  </div>

                  <div className="text-xs text-gray-700 dark:text-gray-300">
                    <div className="mb-1 flex justify-between">
                      <span className="font-medium">Visitas:</span>
                      <span className="font-semibold">{item.totalVisits}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tiempo:</span>
                      <span className="font-semibold">{item.totalTime}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No se encontraron métricas para mostrar.</p>
          )}
        </Card>
      </DashboardGrid>

      {user?.role?.name === 'ADMIN' && (
        <>
          <DashboardGrid>
            <Card title={<div className="flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Órdenes por Mes</div>} className="rounded-2xl shadow-md">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" stroke="var(--color-text)" />
                  <YAxis stroke="var(--color-text)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-background-light)', borderColor: 'var(--color-border-light)', color: 'var(--color-text-light)' }}
                    itemStyle={{ color: 'var(--color-text-light)' }}
                  />
                  <Bar dataKey="Órdenes" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <p className="text-xs text-right text-gray-500 dark:text-text-dark mt-2">
                Total este año: {ordersPerMonth.reduce((sum, item) => sum + item.Órdenes, 0)}
              </p>
            </Card>

            <Card title={<div className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Visitas por Mes</div>} className="rounded-2xl shadow-md">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={visitsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" />
                  <XAxis dataKey="month" stroke="var(--color-text)" />
                  <YAxis stroke="var(--color-text)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-background-light)', borderColor: 'var(--color-border-light)', color: 'var(--color-text-light)' }}
                    itemStyle={{ color: 'var(--color-text-light)' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Visitas"
                    stroke="var(--color-success-dark)"
                    strokeWidth={3}
                    dot={{ r: 4, fill: 'var(--color-success-dark)' }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <p className="text-xs text-right text-gray-500 dark:text-text-dark mt-2">
                Total este año: {visitsPerMonth.reduce((sum, item) => sum + item.Visitas, 0)}
              </p>
            </Card>
          </DashboardGrid>

          <DashboardGrid>
            <Card>
              <Link href={`/services`}>
                <div className="h-full flex flex-col xl:flex-row justify-between gap-3 xl:gap-8">
                  <div className="flex-1">
                    <h3 className="text-primary dark:text-primary-dark text-xl font-semibold mb-3">Servicios</h3>
                    <p>Ve los servicios disponibles y realiza modificaciones en ellos si fuera necesario.</p>
                  </div>
                  <div className="w-full xl:w-64 flex items-center">
                    <img className="object-cover rounded-md w-full h-auto" src="https://images.pexels.com/photos/96612/pexels-photo-96612.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" alt="Servicios" />
                  </div>
                </div>
              </Link>
            </Card>

            <Card>
              <Link href={`/users`}>
                <div className="aspect-video w-full h-full xl:max-h-48">
                  <img
                    className="w-full h-full object-cover rounded-md"
                    src="https://images.pexels.com/photos/11139140/pexels-photo-11139140.jpeg?auto=compress&cs=tinysrgb&w=600&lazy=load"
                    alt="Imagen de ejemplo"
                  />
                </div>
              </Link>
            </Card>
          </DashboardGrid>
        </>
      )}

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
            <>
              <Table data={filteredOrders} headers={headers} showActions={false} searchTerm={searchTerm} />

              {filteredOrders.length === 0 && (
                <p className="text-center text-sm text-gray-500 dark:text-text-dark mt-3">
                  No se encontraron órdenes con ese criterio.
                </p>
              )}
            </>
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
