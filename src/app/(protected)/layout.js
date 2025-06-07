"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useAuth } from "@/context/AuthContext"
import Header from "@/components/molecules/Header"
import Sidebar from "@/components/organisms/Sidebar"
import Footer from "@/components/molecules/Footer"
import LoadingSpinner from "@/components/atoms/LoadingSpinner"
import BirthdayCelebration from "@/components/atoms/BirthdayCelebration"

const queryClient = new QueryClient()

export default function ProtectedLayout({ children }) {
  const { user, loading } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      // Si el usuario no está autenticado, redirigir al login con el parámetro 'next'
      const redirectTo = encodeURIComponent(pathname)  // Codificar la URL actual para el parámetro 'next'
      // router.replace(`/login?next=${redirectTo}`)
      router.replace(`/login`)
    }
  }, [loading, user])

  const isBirthday = (birthDateStr) => {
    if (!birthDateStr) return false

    const [year, month, day] = birthDateStr.split("T")[0].split("-").map(Number)
    const today = new Date()

    return today.getDate() === day && today.getMonth() === month - 1
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!user) return null

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col min-h-screen-dvh">
        <Header />
        <div className="flex-1 grid sm:grid-cols-[250px_1fr] grid-cols-1 sm:gap-4 bg-border-light dark:bg-background-dark">
          <Sidebar />
          <main className="flex flex-col gap-4 p-4">{children}</main>
        </div>
        <Footer />
        {isBirthday(user?.birthDate) && <BirthdayCelebration />}
      </div>
    </QueryClientProvider>
  )
}
