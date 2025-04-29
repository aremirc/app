import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import SignInButton from "../atoms/SignInButton"
import FormGroup from "./FormGroup"
import Input from "../atoms/Input"

const LoginForm = () => {
  const { loading, error, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [attempts, setAttempts] = useState(0) // 👈 contador de intentos

  const isEmpty = email.trim() === "" || password.trim() === ""
  const isDisabled = loading || isEmpty

  const onSubmit = (e) => {
    e.preventDefault()

    const user = {
      usernameOrEmail: email,
      password: password,
    }

    login(user)
  }

  const handleButtonClick = () => {
    if (isDisabled) setAttempts((prev) => prev + 1)
    if (isDisabled && attempts == 7 && password == '@.!') console.log('Desbloqueando...')
  }

  return (
    <form onSubmit={onSubmit}>
      <FormGroup label={"Correo Electrónico"} htmlFor={"email"}>
        <Input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          type="email"
          placeholder="tuemail@ejemplo.com"
        />
      </FormGroup>

      <FormGroup label={"Contraseña"} htmlFor={"password"}>
        <Input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
          type="password"
          placeholder="******"
        />
        {error && (
          <div className="text-danger-light dark:text-danger-dark text-xs italic mt-3">
            {error}
          </div>
        )}
      </FormGroup>

      <div
        className="flex items-center justify-between"
        onClick={handleButtonClick}
      >
        <SignInButton loading={loading} isDisabled={isDisabled} />
      </div>
    </form>
  )
}

export default LoginForm
