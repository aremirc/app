import { handleToast } from "@/lib/toast";

const PasswordRecoveryLink = () => {
  const recovery = (e) => {
    e.preventDefault();  // Evitar la acción predeterminada del enlace
  }

  return (
    <div className="mt-4 text-center">
      <a className="text-primary hover:underline" onClick={recovery} href="#">¿Olvidaste tu contraseña?</a>
    </div>
  )
}

export default PasswordRecoveryLink