import UserDetail from "@/components/organisms/UserDetail"

const UserView = async ({ params }) => {
  const { id } = await params // Obtener el `id` de los parámetros de la URL

  return <UserDetail userId={id} />
}

export default UserView
