"use server"

export async function sendRecoveryEmail(email) {
  if (!email) {
    throw new Error("Email es requerido")
  }

  // Simulación de envío
  console.log(`[🔐] Enviando recuperación a ${email}`)

  // Aquí iría tu lógica real (correo, supabase, etc.)
  return {
    success: true,
    message: "Se ha enviado un enlace de recuperación",
  }
}
