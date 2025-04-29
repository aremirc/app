import ServiceDetail from "@/components/organisms/ServiceDetail"

const ServiceView = async ({ params }) => {
  const { id } = await params // Obtener el `id` de los parámetros de la URL

  return <ServiceDetail serviceId={id} />
}

export default ServiceView
