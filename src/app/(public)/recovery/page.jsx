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
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-semibold mb-6 text-center">Recuperar Contraseña</h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              className="mt-1 block w-full px-3 py-2 border rounded-md focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white py-2 px-4 rounded hover:bg-primary-dark transition"
            disabled={loading}
          >
            {loading ? "Enviando..." : "Enviar enlace"}
          </button>
        </form>
      </div>
      <div className="flex justify-end pt-4">
        <Button className="bg-primary hover:bg-primary/75 text-white px-6 py-2 rounded-xl transition duration-200 ease-in-out" onClick={() => window.history.back()}>Volver</Button>
      </div>
    </div>
  )
}

export default RecoveryPage
