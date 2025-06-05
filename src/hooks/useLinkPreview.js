import { useQuery } from '@tanstack/react-query'
import api from '@/lib/axios'

export const useLinkPreview = (url) => {
  return useQuery({
    queryKey: ['link-preview', url],
    queryFn: async () => {
      const res = await api.get(`/api/link-preview?url=${encodeURIComponent(url)}`)
      return res.data
    },
    enabled: !!url,  // Solo ejecuta si `url` no es null o vacío
    staleTime: 1000 * 60 * 10, // cachea 10 min
  })
}
