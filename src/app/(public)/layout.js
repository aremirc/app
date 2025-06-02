"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import Header from "@/components/molecules/Header"
import Footer from "@/components/molecules/Footer"
import LoadingSpinner from "@/components/atoms/LoadingSpinner"
import { useAuth } from "@/context/AuthContext"

const publicRoutes = ["/", "/login", "/recovery", "/reset-password"]

export default function PublicLayout({ children }) {
    const { loading, isAuthenticated } = useAuth()
    const router = useRouter()
    const pathname = usePathname()

    const isPublic = publicRoutes.some((route) => pathname.startsWith(route))

    useEffect(() => {
        // Si el usuario ya está logueado y está en una ruta pública, redirige al dashboard
        if (!loading && isAuthenticated && isPublic) {
            router.replace("/dashboard")
        }
    }, [loading, isAuthenticated, isPublic, router])

    if (loading) {
        return <LoadingSpinner />
    }

    return (
        <div className="flex flex-col justify-between min-h-screen-dvh bg-background-light dark:bg-background-dark">
            <Header />
            <main className="flex-1 flex flex-col">{children}</main>
            <Footer />
        </div>
    )
}
