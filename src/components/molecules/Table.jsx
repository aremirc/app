import Button from "../atoms/Button"
import Link from "next/link"
import Icon from "../atoms/Icon"
import { usePathname } from "next/navigation"
import { ClipboardList } from 'lucide-react'

const statusProgress = {
  PENDING: {
    percent: 10,
    color: 'bg-yellow-400',
    label: 'Pendiente',
  },
  AWAITING_APPROVAL: {
    percent: 25,
    color: 'bg-purple-400',
    label: 'Esperando aprobación',
  },
  IN_PROGRESS: {
    percent: 50,
    color: 'bg-blue-500',
    label: 'En progreso',
  },
  ON_HOLD: {
    percent: 60,
    color: 'bg-orange-400',
    label: 'En espera',
  },
  COMPLETED: {
    percent: 100,
    color: 'bg-green-500',
    label: 'Completado',
  },
  CANCELLED: {
    percent: 100,
    color: 'bg-gray-400',
    label: 'Cancelado',
  },
  FAILED: {
    percent: 100,
    color: 'bg-red-500',
    label: 'Fallido',
  },
  DELETED: {
    percent: 100,
    color: 'bg-black',
    label: 'Eliminado',
  },
}

const highlightMatch = (text, term) => {
  if (!term || typeof text !== 'string') return text

  const regex = new RegExp(`(${term})`, 'gi')
  const parts = text.split(regex)

  return parts.map((part, index) =>
    regex.test(part) ? (
      <span key={index} className="bg-yellow-200 dark:bg-yellow-500 text-black dark:text-white">{part}</span>
    ) : (
      part
    )
  )
}

const Table = ({ headers, data, onEdit = () => { }, onDelete = () => { }, showActions = true, searchTerm = '' }) => {
  const pathname = usePathname()

  if (!data || data.length === 0) {
    return (
      <p className="text-center text-text-light dark:text-text-dark py-6">
        No hay datos para mostrar.
      </p>
    )
  }

  return (
    <table className="w-full max-w-full table-auto">
      <thead className="hidden xl:table-header-group">
        <tr>
          {headers.map((header) => (
            <th key={header.key} className="text-start text-xs text-text px-3 py-2">
              {header.label}
            </th>
          ))}
          {showActions && (
            <th className="text-start text-xs text-text px-3 py-2">Acciones</th>
          )}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 dark:divide-gray-500">
        {data.map((item) => (
          <tr
            key={item.id || item.dni}
            className="block xl:table-row hover:bg-gray-50 dark:hover:bg-background-dark/25 border-b border-gray-200 dark:border-gray-500 xl:border-b-0 last:border-b-0 xl:border-t pb-2 xl:pb-0 mt-3 xl:mt-0 relative"
          >
            {headers.map((header) => (
              <td
                key={header.key}
                title={String(item[header.key] || '')}
                className={`px-3 py-2 block xl:table-cell ${['description'].includes(header.key) ? 'max-w-96 truncate' : ''}`}
              >
                {header.key === 'hide' ? (
                  <Link
                    href={`/orders/${item.id}`}
                    className="absolute xl:static top-2 right-2 text-gray-400 hover:text-primary"
                    title="Ver orden"
                  >
                    <ClipboardList className="w-5 h-5" />
                  </Link>
                ) : (
                  <>
                    <span className="font-semibold text-xs text-text table-cell xl:hidden">
                      {header.label}:
                    </span>

                    {['id', 'dni'].includes(header.key) ? (
                      <Link
                        href={`${pathname}/${item.id || item.dni}`}
                        className="text-primary dark:text-primary-dark hover:underline"
                      >
                        {String(item[header.key]).padStart(3, '0')}
                      </Link>
                    ) : (/^(status|estado)$/).test(header.key) && /(orders|dashboard)/.test(pathname) ? (
                      (() => {
                        const currentStatus = item.status || item.estado
                        const statusInfo = statusProgress[currentStatus] || {
                          percent: 0,
                          color: 'bg-gray-200',
                          label: 'Desconocido',
                        }

                        return (
                          <div className="w-full flex flex-col gap-1 min-w-[140px]">
                            <span className="text-xs text-gray-700 dark:text-gray-300">{statusInfo.label}</span>
                            <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-sm">
                              <div
                                className={`h-full ${statusInfo.color} rounded-sm`}
                                style={{ width: `${statusInfo.percent}%` }}
                              />
                            </div>
                          </div>
                        )
                      })()
                    ) : header.key === 'status' || header.key === 'isActive' || header.key === 'isReviewed' ? (
                      <div className="inline-flex items-center justify-center">
                        {(header.key === 'status' && item[header.key] === 'ACTIVE') ||
                          (header.key !== 'status' && item[header.key]) ? (
                          <div className="bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✔</div>
                        ) : (
                          <div className="bg-gray-300 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">✘</div>
                        )}
                      </div>
                    ) : ['createdAt', 'date'].includes(header.key) ? (
                      new Date(item[header.key]).toLocaleDateString()
                    ) : (
                      highlightMatch(String(item[header.key] || ''), searchTerm)
                    )}
                  </>
                )}
              </td>
            ))}

            {showActions && (
              <td className="px-3 py-2 block xl:table-cell">
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => onEdit(item.id || item.dni)}
                    className="w-auto flex items-center gap-2 px-2 bg-secondary-light dark:bg-secondary-dark/75 hover:bg-secondary-dark dark:hover:bg-secondary-dark"
                  >
                    <Icon name="edit" color="fill-text-light dark:fill-text-dark bg-transparent dark:bg-transparent" />
                    <span className="hidden xl:flex">Editar</span>
                  </Button>

                  {item?.roleName !== 'ADMIN' && (
                    <Button
                      onClick={() => onDelete(item.id || item.dni)}
                      className="w-auto flex items-center gap-2 px-2 bg-danger-light dark:bg-danger-dark/75 hover:bg-danger-dark dark:hover:bg-danger-dark"
                    >
                      <Icon name="delete" color="fill-text-light dark:fill-text-dark bg-transparent dark:bg-transparent" />
                      <span className="hidden xl:flex">Eliminar</span>
                    </Button>
                  )}
                </div>
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default Table
