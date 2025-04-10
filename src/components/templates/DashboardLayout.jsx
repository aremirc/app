"use client"

import Header from "../molecules/Header"
import Sidebar from "../organisms/Sidebar"
import Footer from "../molecules/Footer"
import LoadingSpinner from "../atoms/LoadingSpinner"
import { Toaster } from "sonner";
import { useAuth } from "@/context/AuthContext"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

const DashboardLayout = ({ children }) => {
  const { user, loading } = useAuth()

  return (
    <>
      <Toaster />
      {loading ? (
        <LoadingSpinner />
      ) : (
        user ? (
          <QueryClientProvider client={queryClient}>
            <div className="flex flex-col min-h-screen">
              <Header />
              <div className="flex-1 grid sm:grid-cols-[250px_1fr] grid-cols-1 sm:gap-4 bg-border-light dark:bg-background-dark">
                <Sidebar />
                <main className="flex flex-col">
                  {children}
                </main>
              </div>
              <Footer />
            </div>
          </QueryClientProvider>
        ) :
          <div className="flex flex-col justify-between min-h-screen bg-gradient-to-r bg-background-light dark:bg-background-dark">
            <Header title="Login" />
            {children}
          </div>
      )}
    </>
  )
}

export default DashboardLayout