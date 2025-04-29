import OrderDetail from "@/components/organisms/OrderDetail"

const OrderView = async ({ params }) => {
  const { id } = await params // Obtener el `id` de los parámetros de la URL

  return <OrderDetail orderId={id} />
}

export default OrderView
