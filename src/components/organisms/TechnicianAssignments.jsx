import { Package, User, Calendar, Info, ShieldCheck } from 'lucide-react'
import SimpleAccordion from '../molecules/SimpleAccordion'

const TechnicianAssignments = ({ assignments }) => {
  if (assignments.length === 0) {
    return (
      <p className="text-sm text-gray-500 dark:text-text-dark">
        No hay asignaciones registradas.
      </p>
    )
  }

  const groupedAssignments = Object.entries(
    assignments.reduce((acc, a) => {
      const key = a.order.id
      if (!acc[key]) acc[key] = { order: a.order, items: [] }
      acc[key].items.push(a)
      return acc
    }, {})
  )

  const accordionItems = groupedAssignments.map(([orderId, group]) => {
    const { order, items } = group

    return {
      title: (
        <div className="w-full flex flex-col gap-1 text-left">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary dark:text-primary-dark truncate">
            <Package className="h-4 w-4" />
            <span className="truncate">Orden N° {String(order.id).padStart(3, '0')}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light dark:text-text-dark truncate">
            <User className="h-4 w-4" />
            <span className="truncate">{order.client.name}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-light dark:text-text-dark truncate">
            <Calendar className="h-4 w-4" />
            <span>
              {order.scheduledDate
                ? new Date(order.scheduledDate).toLocaleDateString()
                : 'No programada'}
            </span>
          </div>
        </div>
      ),
      content: (
        <ul className="space-y-4 mt-2">
          {items.map((a) => (
            <li
              key={`${a.order.id}-${a.user.dni}`}
              className="text-sm border-l border-primary pl-3 relative"
            >
              <div className="flex items-center gap-2 truncate">
                <img
                  src={a.user.avatar || '/default-avatar.webp'}
                  className="h-5 w-5 object-cover rounded-full"
                  alt={`${a.user.firstName} ${a.user.lastName}`}
                  onError={(e) => {
                    e.target.src = '/default-avatar.webp'
                  }}
                />
                <span className="font-medium truncate">
                  {a.user.firstName?.split(" ")[0]} {a.user.lastName?.split(" ")[0]}
                </span>
                {a.isResponsible && (
                  <ShieldCheck
                    className="absolute bottom-3 left-3 w-4 h-4 text-green-600"
                    title="Responsable asignado"
                  />
                )}
                <span className="text-xs text-text-light dark:text-text-dark font-mono truncate">
                  ({a.user.dni})
                </span>
              </div>

              <div className="ml-5 mt-1 space-y-1 text-xs text-text-light dark:text-text-dark">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>
                    Asignado:{' '}
                    {a.createdAt
                      ? new Date(a.createdAt).toLocaleDateString()
                      : '–'}
                  </span>
                </div>

                <div className="flex items-center gap-2 italic">
                  <Info className="h-4 w-4" />
                  <span>Estado: {a.status}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ),
    }
  })

  return <SimpleAccordion items={accordionItems} />
}

export default TechnicianAssignments