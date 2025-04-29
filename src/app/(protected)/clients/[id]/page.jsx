import ClientDetail from "@/components/organisms/ClientDetail"

const ClientView = async ({ params }) => {
  const { id } = await params // Obtener el `id` de los parámetros de la URL

  return <ClientDetail clientId={id} />
}

export default ClientView
