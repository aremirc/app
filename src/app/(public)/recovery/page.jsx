"use client"

import { useState } from "react"
import { handleToast } from "@/lib/toast"
import { sendRecoveryEmail } from "./action"
import Button from "@/components/atoms/Button"

const RecoveryPage = () => {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) {
      handleToast("Por favor ingresa tu correo", "error")
      return
    }

    setLoading(true)
    try {
      const res = await sendRecoveryEmail(email)
      handleToast(res.message, "success")
    } catch (err) {
      handleToast(err.message || "Error al enviar el correo", "error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-background-light dark:bg-background-dark px-4">
      <div className="max-w-md w-full bg-white dark:bg-shadow-dark/5 p-8 rounded-xl shadow-md border border-border-light dark:border-border-dark">
        <h1 className="text-2xl font-semibold mb-6 text-center text-text-light dark:text-text-dark">
          Recuperar Contraseña
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-light dark:text-text-dark">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border border-border-light dark:border-border-dark rounded-md focus:outline-none bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary dark:bg-primary-dark text-text-light dark:hover:text-text-dark py-2 px-4 rounded hover:bg-primary-dark transition"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>

        <div className="flex justify-end pt-4">
          <Button
            className="bg-primary hover:bg-primary/75 text-text-light px-6 py-2 rounded-xl shadow shadow-shadow-light dark:shadow-shadow-dark transition duration-200 ease-in-out"
            onClick={() => window.history.back()}
          >
            Volver
          </Button>
        </div>
      </div>
    </div>
  )
}

export default RecoveryPage
