import Link from 'next/link'

const PasswordRecoveryLink = () => {
  return (
    <div className="mt-4 text-center">
      <Link
        href="/recovery"
        className="text-primary hover:underline cursor-pointer"
      >
        ¿Olvidaste tu contraseña?
      </Link>
    </div>
  )
}

export default PasswordRecoveryLink
