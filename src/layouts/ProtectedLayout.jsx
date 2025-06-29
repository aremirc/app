"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { QueryClientProvider } from "@tanstack/react-query"
import { SocketProvider } from "@/context/SocketContext"
import { useAuth } from "@/context/AuthContext"
import { isBirthday } from '@/lib/utils'
import queryClient from "@/lib/queryClient"
import Header from "@/components/molecules/Header"
import Sidebar from "@/components/organisms/Sidebar"
import Footer from "@/components/molecules/Footer"
import LoadingSpinner from "@/components/atoms/LoadingSpinner"
import BirthdayCelebration from "@/components/atoms/BirthdayCelebration"

export default function ProtectedLayout({ children }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && !user) {
      // Si el usuario no está autenticado, redirigir al login con el parámetro 'next'
      const redirectTo = encodeURIComponent(pathname)  // Codificar la URL actual para el parámetro 'next'
      // router.replace(`/login?next=${redirectTo}`)
      router.replace(`/login`)
    }
  }, [loading, user, router])

  if (loading) return <LoadingSpinner />

  if (!user?.role?.name) return null

  return (
    <SocketProvider>
      <QueryClientProvider client={queryClient}>
        <div className="flex flex-col min-h-screen-dvh">
          <Header />
          <div className="flex-1 flex grid-cols-1 sm:grid sm:grid-cols-[250px_1fr] sm:gap-4 bg-border-light dark:bg-background-dark">
            <Sidebar />
            <main className="w-full flex flex-col gap-4 p-4">{children}</main>
          </div>
          <Footer />
          {isBirthday(user?.birthDate) && <BirthdayCelebration />}
        </div>
      </QueryClientProvider>
    </SocketProvider>
  )
}
