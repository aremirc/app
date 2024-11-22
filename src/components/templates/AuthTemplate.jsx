"use client"

import AuthSection from "../organisms/AuthSection"
import Header from "../molecules/Header";
import Footer from "../molecules/Footer";
import { useAuth } from "@/context/AuthContext";
import AuthenticatedSection from "../organisms/AuthenticatedSection";

const AuthTemplate = () => {
  const { user } = useAuth()

  return (
    <div className="flex flex-col justify-between min-h-screen bg-gradient-to-r bg-background-light dark:bg-background-dark">
      <Header />
      {
        user ?
          <AuthenticatedSection />
          : <AuthSection />
      }
      <Footer />
    </div>
  )
}

export default AuthTemplate