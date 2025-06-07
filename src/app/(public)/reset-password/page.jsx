"use client"

import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { handleToast } from "@/lib/toast"
import api from "@/lib/axios"
import Button from "@/components/atoms/Button"

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      handleToast("Token inválido o ausente", "error")
      return
    }

    const pwdRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
    if (!pwdRegex.test(newPassword)) {
      handleToast("La contraseña debe tener al menos 8 caracteres, con letras y números", "error")
      return
    }

    setLoading(true)
    try {
      const res = await api.patch("/api/recovery", {
        token,
        newPassword,
      })

      handleToast(res.data.message, "success")
      router.push("/login")
    } catch (err) {
      const message = err.response?.data?.error || "Error al actualizar la contraseña"
      handleToast(message, "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="w-full max-w-md bg-white dark:bg-shadow-dark/5 p-8 rounded-xl shadow-md border border-border-light dark:border-border-dark">
        <h1 className="text-2xl font-semibold text-center text-text-light dark:text-text-dark mb-6">
          Restablecer Contraseña
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-light dark:text-text-dark">
              Nueva contraseña
            </label>
            <input
              id="password"
              type="password"
              className="mt-1 block w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md focus:outline-none bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary dark:bg-primary-dark text-text-light dark:hover:text-text-dark py-2 px-4 rounded hover:bg-primary-dark transition"
          >
            {loading ? "Actualizando..." : "Actualizar contraseña"}
          </button>
        </form>

        <div className="flex justify-end pt-4">
          <Button
            className="bg-primary hover:bg-primary/75 text-text-light px-6 py-2 rounded-xl shadow shadow-shadow-light dark:shadow-shadow-dark transition duration-200 ease-in-out"
            onClick={() => router.back()}
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
}

export default ResetPasswordPage