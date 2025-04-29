import PasswordRecoveryLink from "../atoms/PasswordRecoveryLink"
import LoginForm from "../molecules/LoginForm"

const AuthSection = () => {
  return (
    <div className="rounded-lg shadow-lg p-8 max-w-sm w-full m-auto">
      <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-text-dark mb-6">Iniciar sesión</h2>
      <LoginForm />
      <PasswordRecoveryLink />
    </div>
  )
}

export default AuthSection
