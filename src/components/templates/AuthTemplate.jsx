"use client"

import AuthSection from "../organisms/AuthSection";
import { useAuth } from "@/context/AuthContext";
import AuthenticatedSection from "../organisms/AuthenticatedSection";

const AuthTemplate = () => {
  const { user } = useAuth()

  return (user ?
    <AuthenticatedSection />
    : <AuthSection />)
}

export default AuthTemplate