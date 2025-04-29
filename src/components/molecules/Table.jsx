import Button from "../atoms/Button"
import Link from "next/link"
import Icon from "../atoms/Icon"
import { usePathname } from "next/navigation"

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
      <tbody>
        {data.map((item) => (
          <tr
            key={item.id || item.dni}
            className="block xl:table-row border-b xl:border-b-0 last:border-b-0 xl:border-t pb-2 xl:pb-0 mt-3 xl:mt-0"
          >
            {headers.map((header) => (
              <td
                key={header.key}
                className={`px-3 py-2 block xl:table-cell ${header.key === "id" ? "hidden" : ""}`}
              >
                <span className="font-semibold text-xs text-text table-cell xl:hidden">
                  {header.label}:
                </span>
                {['id', 'dni'].includes(header.key) ? (
                  <Link href={`${pathname}/${item.id || item.dni}`} className="text-primary dark:text-primary-dark hover:underline">
                    {item[header.key]}
                  </Link>
                ) : (['createdAt', 'date'].includes(header.key) ? (
                  new Date(item[header.key]).toLocaleDateString()
                ) : (
                  item[header.key]
                )
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
                  <Button
                    onClick={() => onDelete(item.id || item.dni)}
                    className="w-auto flex items-center gap-2 px-2 bg-danger-light dark:bg-danger-dark/75 hover:bg-danger-dark dark:hover:bg-danger-dark"
                  >
                    <Icon name="delete" color="fill-text-light dark:fill-text-dark bg-transparent dark:bg-transparent" />
                    <span className="hidden xl:flex">Eliminar</span>
                  </Button>
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
