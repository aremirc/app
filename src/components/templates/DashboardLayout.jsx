"use client"

import { useAuth } from "@/context/AuthContext"
import Header from "../molecules/Header"
import Sidebar from "../organisms/Sidebar"
import Footer from "../molecules/Footer"
import AuthTemplate from "./AuthTemplate"
import { useRouter } from "next/navigation"
import LoadingSpinner from "../atoms/LoadingSpinner"
import { useEffect } from "react"
import { Toaster } from "sonner";

const DashboardLayout = ({ children }) => {
  const { user, loading, error } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if ((!user && !loading) || error) {
      router.push('/'); // Cambiar la ruta después de que se complete el renderizado
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    user ? (
      <div className="flex flex-col min-h-screen">
        <Header />
        <div className="flex-1 grid sm:grid-cols-[250px_1fr] grid-cols-1 sm:gap-4 bg-border-light dark:bg-background-dark">
          <Sidebar />
          <main className="flex flex-col">
            {children}
            <Toaster />
          </main>
        </div>
        <Footer />
      </div>
    ) :
      < AuthTemplate />
  )
}

export default DashboardLayout