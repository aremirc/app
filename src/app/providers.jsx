"use client"

import { AuthProvider } from "@/context/AuthContext"
import AuthWrapper from "@/components/AuthWrapper"
import { Toaster } from "sonner"

export function Providers({ children }) {
  return (
    <AuthProvider>
      <AuthWrapper>
        <Toaster />
        {children}
      </AuthWrapper>
    </AuthProvider>
  )
}