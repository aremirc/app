import { useState } from 'react'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import Card from '../molecules/Card'
import Button from '../atoms/Button'
import OrderCard from '../molecules/OrderCard'

const ITEMS_PER_PAGE = 6

const OrderList = ({ orders = [], clientID, onEdit, emptyMessage = "No hay órdenes registradas." }) => {
  const { user } = useAuth()
  const [page, setPage] = useState(0)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const totalPages = Math.max(1, Math.ceil(orders.length / ITEMS_PER_PAGE))
  const currentOrders = orders.slice(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE)

  const handleEdit = (id) => {
    const orderToEdit = orders.find((order) => order.id === id)
    if (!orderToEdit) return

    // Si se pasó onEdit como prop, lo ejecutamos
    if (typeof onEdit === "function") {
      onEdit(orderToEdit)
    }

    // Luego abrimos el modal para editar
    setSelectedOrder(orderToEdit)
    setIsModalOpen(true)
  }

  const handleCancel = () => {
    setSelectedOrder(null)
    setIsModalOpen(false)
  }

  return (
    <Card title="Órdenes" className="flex flex-col col-span-1 p-6 rounded-2xl">
      {user?.role?.name === 'ADMIN' && (
        <Button
          size="sm"
          variant="outline"
          className="absolute top-4 right-4 border border-border-light dark:border-border-dark text-primary dark:text-primary-dark hover:bg-primary-light"
          onClick={() => setIsModalOpen(true)}
        >
          +
        </Button>
      )}

      {isModalOpen && (
        <OrderCard
          order={selectedOrder}
          clientID={clientID}
          handleCancel={handleCancel}
        />
      )}

      <div className="flex-1 space-y-4 mt-1">
        {orders.length === 0 ? (
          <div className="text-center text-sm text-gray-500 dark:text-text-dark py-8">
            {emptyMessage}
          </div>
        ) : (
          <div className='h-full flex flex-col justify-between'>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {currentOrders.map((order, i) => (
                <div
                  key={order.id}
                  className="relative h-fit text-center border border-border-light dark:border-border-dark p-4 rounded-lg shadow-xs bg-background-muted dark:bg-background-muted-dark"
                >
                  <p className="font-medium text-primary dark:text-primary-dark">
                    <Link href={`/orders/${order.id}`}>
                      N° {String(order.id).padStart(3, '0')}
                    </Link>
                  </p>

                  <p className="text-sm text-gray-700 dark:text-gray-300">{order.status}</p>

                  {user?.role?.name === 'ADMIN' && (
                    <button size="icon" variant="ghost" onClick={() => handleEdit(order.id)} className='absolute top-2 right-2 p-1 rounded-md hover:bg-primary-dark/35 cursor-pointer'>
                      <Pencil className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )
              )}
            </div>

            {/* Paginación */}
            <div className="flex justify-between items-center pt-2">
              <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Anterior</Button>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                <span className='hidden sm:inline'>Página </span>{page + 1} de {totalPages}
              </span>
              <Button disabled={page >= totalPages - 1} onClick={() => setPage(page + 1)}>Siguiente</Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

export default OrderList
