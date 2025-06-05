import Button from "../atoms/Button"
import Link from "next/link"
import Icon from "../atoms/Icon"
import { usePathname } from "next/navigation"
import { ClipboardList } from 'lucide-react'

const statusProgress = {
  PENDING: { percent: 10, color: 'bg-yellow-400' },
  IN_PROGRESS: { percent: 50, color: 'bg-blue-500' },
  ON_HOLD: { percent: 60, color: 'bg-orange-400' },
  COMPLETED: { percent: 100, color: 'bg-green-500' },
  CANCELLED: { percent: 100, color: 'bg-gray-400' },
  FAILED: { percent: 100, color: 'bg-red-500' },
}

const Table = ({ headers, data, onEdit = () => { }, onDelete = () => { }, showActions = true }) => {
  const pathname = usePathname()

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
            className="block xl:table-row hover:bg-gray-50 dark:hover:bg-background-dark/25 border-b-0 xl:border-b-0 last:border-b-0 xl:border-t pb-2 xl:pb-0 mt-3 xl:mt-0 relative"
          >
            {headers.map((header) => (
              <td key={header.key} className="px-3 py-2 block xl:table-cell">
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
                    ) : header.key === 'status' && pathname.includes('orders') ? (
                      (() => {
                        const statusInfo = statusProgress[item.status] || { percent: 0, color: 'bg-gray-200' }

                        return (
                          <div className="w-full flex items-center gap-2 min-w-[120px]">
                            <span className="hidden md:inline xl:hidden text-xs text-gray-500">{item.status}</span>
                            <div className="w-full h-2 bg-gray-200 rounded">
                              <div
                                className={`h-full ${statusInfo.color} rounded`}
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
                      item[header.key]
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
