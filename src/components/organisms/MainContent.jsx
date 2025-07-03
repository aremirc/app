import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts"
import { Timer, CalendarDays, Users, ClipboardList } from "lucide-react"
import { useQuery } from '@tanstack/react-query'
import { useAuth } from "@/context/AuthContext"
import Link from "next/link"
import api from "@/lib/axios"
import DashboardGrid from "./DashboardGrid"
import Card from "../molecules/Card"
import Button from '../atoms/Button'
import Table from "../molecules/Table"
import CardForm from '../molecules/CardForm'
import CardGrid from '../organisms/CardGrid'
import SearchBar from "../molecules/SearchBar"
import TechnicianMetrics from "./TechnicianMetrics"
import TechnicianAssignments from "./TechnicianAssignments"
import OrderTimeline from "../molecules/OrderTimeline"
import LoadingSpinner from "../atoms/LoadingSpinner"
import LoadingOverlay from "../atoms/LoadingOverlay"

const fetchOrders = async (query = '') => {
  const params = new URLSearchParams()
  if (query) params.append('q', query)
  const { data } = await api.get(`/api/orders?${params.toString()}`)
  return Array.isArray(data) ? data : []
}

const fetchAssignments = async () => {
  const { data } = await api.get('/api/assignments')
  return Array.isArray(data) ? data : []
}

const fetchPendingOrders = async ({ status = 'PENDING' }) => {
  const params = new URLSearchParams()
  if (status) params.append('status', status)

  const { data } = await api.get(`/api/orders?${params.toString()}`)
  return data || []
}

const fetchMetrics = async () => {
  const { data } = await api.get("/api/metrics")
  return data || []
}

const fetchOrdersPerMonth = async () => {
  const { data } = await api.get('/api/metrics/orders-per-month')
  return data || []
}

const fetchVisitsPerMonth = async () => {
  const { data } = await api.get('/api/metrics/visits-per-month')
  return data || []
}

const defaultCards = [
  // {
  //   title: 'Proyectos',
  //   description: 'Organiza y haz seguimiento de tus proyectos en curso',
  //   href: '/projects',
  //   bgColor: 'bg-indigo-400 hover:bg-indigo-500 dark:bg-indigo-300 dark:hover:bg-indigo-400',
  // },
  // {
  //   title: 'Clientes',
  //   description: 'Administra y supervisa la información de tus clientes',
  //   href: '/clients',
  //   bgColor: 'bg-teal-400 hover:bg-teal-500 dark:bg-teal-300 dark:hover:bg-teal-400',
  // },
  {
    title: 'Hikvision',
    description: 'Revisa los productos destacados',
    href: 'https://www.hikvision.com/es-la/',
    bgColor: 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500',
  },
  {
    title: 'Dahua',
    description: 'Tecnología avanzada en videovigilancia',
    href: 'https://www.dahuasecurity.com/',
    bgColor: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
  },
  {
    title: 'Ajax Systems',
    description: 'Sistemas de alarma inalámbricos de alta gama',
    href: 'https://ajax.systems/',
    bgColor: 'bg-gray-800 hover:bg-gray-900 dark:bg-gray-700 dark:hover:bg-gray-800',
  },
  {
    title: 'Bosch',
    description: 'Soluciones integradas para seguridad',
    href: 'https://www.boschsecurity.com/',
    bgColor: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
  }
]

const MainContent = () => {
  const { user } = useAuth()
  const [cards, setCards] = useState(defaultCards)
  const [showForm, setShowForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

  const headers = [
    { key: "cliente", label: "Cliente" },
    { key: "responsable", label: "T. Responsable" },
    // ["TECHNICIAN", "SUPERVISOR"].includes(user?.role?.name) && { key: "tecnicos", label: "Técnicos" },
    { key: "fecha", label: "Fecha programada" },
    { key: "estado", label: "Estado" },
    { key: "hide", label: "" }
  ].filter(Boolean)

  const { data: allOrders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ['orders', searchTerm],
    queryFn: () => fetchOrders(searchTerm),
    enabled: searchTerm.length > 0,
  })

  const { data: assignments = [], isLoading: loadingAssignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: fetchAssignments,
    enabled: ["ADMIN", "SUPERVISOR"].includes(user?.role?.name),
  })

  const shouldFetchPending = ["TECHNICIAN", "ADMIN", "SUPERVISOR"].includes(user?.role?.name)

  const { data: pendingOrders = [], isLoading: loadingPending } = useQuery({
    queryKey: ['pendingOrders'],
    queryFn: fetchPendingOrders,
    enabled: shouldFetchPending,
  })

  const { data: metrics = [], isLoading: loadingMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: fetchMetrics,
  })

  const isAdmin = user?.role?.name === 'ADMIN'

  const { data: ordersPerMonth = [], isLoading: loadingOrdersPerMonth } = useQuery({
    queryKey: ['ordersPerMonth'],
    queryFn: fetchOrdersPerMonth,
    enabled: isAdmin, // solo ADMIN
  })

  const { data: visitsPerMonth = [], isLoading: loadingVisitsPerMonth } = useQuery({
    queryKey: ['visitsPerMonth'],
    queryFn: fetchVisitsPerMonth,
    enabled: isAdmin, // solo ADMIN
  })

  const isInitialLoading = loadingAssignments || loadingPending || loadingMetrics || loadingOrdersPerMonth || loadingVisitsPerMonth

  const cardMetric = [
    {
      title: "Órdenes Completadas",
      icon: <ClipboardList className="h-6 w-6 text-primary" />,
      value: new Set(metrics.flatMap(u => u.completedOrderIds)).size,
      description: "En tendencia positiva",
    },
    {
      title: "Visitas",
      icon: <CalendarDays className="h-6 w-6 text-primary" />,
      value: metrics.reduce((acc, u) => acc + u.totalVisits, 0),
      description: "Creciendo constantemente",
    },
    {
      title: "Usuarios Activos",
      icon: <Users className="h-6 w-6 text-primary" />,
      value: metrics.length,
      description: "Con actividad reciente",
    },
    {
      title: "Horas Trabajadas",
      icon: <Timer className="h-6 w-6 text-primary" />,
      value: metrics.reduce((acc, u) => acc + u.totalTime, 0),
      description: "Conteo acumulado",
    },
  ]

  const userAssignmentSummary = assignments.reduce((acc, a) => {
    const key = a.user.dni
    if (!acc[key]) {
      acc[key] = {
        user: a.user,
        orders: new Set(),
        statuses: new Set(),
        clients: new Set(),
      }
    }
    acc[key].orders.add(a.order.id)
    acc[key].clients.add(a.order.client?.name ?? "(sin cliente)")
    acc[key].statuses.add(a.status)
    return acc
  }, {})

  const mapOrders = (orders) => {
    return orders.map(order => {
      const responsable = order.workers.find(w => w.isResponsible)?.user
      const tecnicos = order.workers
        .filter(w => !w.isResponsible)
        .map(w => `${w.user.firstName?.split(" ")[0]} ${w.user.lastName?.split(" ")[0]}`)
        .join(", ")

      return {
        id: order.id,
        cliente: order.client?.name ?? "(Sin nombre)",
        responsable: `${responsable?.firstName?.split(" ")[0] ?? "-"} ${responsable?.lastName?.split(" ")[0] ?? "-"}`,
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
        {["ADMIN", "SUPERVISOR"].includes(user?.role?.name) ? (
          <Card title={`Asignaciones técnicas - ${assignments.length}`}>
            <TechnicianAssignments assignments={assignments} />
          </Card>
        ) : (
          <Card title={`Órdenes pendientes - ${pendingOrders.length}`}>
            <OrderTimeline orders={pendingOrders} />
          </Card>
        )}

        <Card title={`Órdenes - ${filteredOrders.length}`}>
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
        {user?.role?.name !== 'TECHNICIAN' && (
          <Card title={`Órdenes pendientes - ${pendingOrders.length}`}>
            <OrderTimeline orders={pendingOrders} />
          </Card>
        )}

        <Card title="Métricas">
          <TechnicianMetrics metrics={metrics} />
        </Card>
      </DashboardGrid>

      {isAdmin && (
        <>
          <DashboardGrid>
            <Card title={<div className="flex items-center gap-2"><ClipboardList className="w-5 h-5" /> Órdenes por Mes - {ordersPerMonth?.year}</div>} className="rounded-2xl shadow-md">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={ordersPerMonth?.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="var(--color-text)" />
                  <YAxis stroke="var(--color-text)" />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--color-background-light)', borderColor: 'var(--color-border-light)', color: 'var(--color-text-light)' }}
                    itemStyle={{ color: 'var(--color-text-light)' }}
                  />
                  <Bar dataKey="Órdenes" fill="var(--color-primary)" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <p className="text-xs text-right text-gray-500 dark:text-text-dark mt-2">
                Total este año: {ordersPerMonth?.data?.reduce((sum, item) => sum + item.Órdenes, 0)}
              </p>
            </Card>

            <Card title={<div className="flex items-center gap-2"><CalendarDays className="w-5 h-5" /> Visitas por Mes - {visitsPerMonth?.year}</div>} className="rounded-2xl shadow-md">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={visitsPerMonth?.data}>
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
                Total este año: {visitsPerMonth?.data?.reduce((sum, item) => sum + item.Visitas, 0)}
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
