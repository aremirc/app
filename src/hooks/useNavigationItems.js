import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import api from "@/lib/axios"

const fetchNavigation = async () => {
  const { data } = await api.get("/api/navigation")
  return data
}

const useNavigationItems = () => {
  const { user } = useAuth()

  const { data: itemNav = [], isLoading, error, refetch } = useQuery({
    queryKey: ["navigation", user?.role?.name],
    queryFn: fetchNavigation,
    enabled: !!user?.role?.name,            // solo consulta si hay rol
    staleTime: 1000 * 60 * 60,              // 1 hora
    cacheTime: 1000 * 60 * 60 * 24,         // 24 horas
    refetchOnWindowFocus: false             // no refetch al volver a la pestaña
  })

  return {
    itemNav,
    isLoading,
    error,
    refetch
  }
}

export default useNavigationItems
