import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import SignInButton from "../atoms/SignInButton"
import FormGroup from "./FormGroup"
import Input from "../atoms/Input"
import PasswordInput from "../atoms/PasswordInput"

const LoginForm = () => {
  const { loading, error, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [attempts, setAttempts] = useState(0)

  const isEmpty = email.trim() === "" || password.trim() === ""
  const isDisabled = loading || isEmpty

  const onSubmit = (e) => {
    e.preventDefault()

    const user = {
      usernameOrEmail: email,
      password: password,
      attempts: attempts
    }

    login(user)
  }

  const handleButtonClick = () => {
    if (isDisabled) setAttempts((prev) => prev + 1)
  }

  return (
    <form onSubmit={onSubmit}>
      <FormGroup label={"Correo Electrónico"} htmlFor={"email"}>
        <Input
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          id="email"
          type="email"
          placeholder="tuemail@ejemplo.com"
        />
      </FormGroup>

      <FormGroup label={"Contraseña"} htmlFor={"password"}>
        <PasswordInput
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          id="password"
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
