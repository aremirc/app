import VisitDetail from "@/components/organisms/VisitDetail"

const VisitView = async ({ params }) => {
  const { id } = await params // Obtener el `id` de los parámetros de la URL

  return <VisitDetail visitId={id} />
}

export default VisitView
