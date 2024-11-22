import { useAuth } from "@/context/AuthContext"
import { useState } from "react"
import SignInButton from "../atoms/SignInButton"
import FormGroup from "./FormGroup"
import Input from "../atoms/Input"

const LoginForm = () => {
  const { loading, error, login } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = (e) => {
    e.preventDefault()

    const user = {
      usernameOrEmail: email,
      password: password,
    };

    login(user)
  }

  return (
    <form onSubmit={onSubmit}>
      <FormGroup label={'Correo Electrónico'} htmlFor={'email'}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} id="email" type="email" placeholder="tuemail@ejemplo.com" />
      </FormGroup>

      <FormGroup label={'Contraseña'} htmlFor={'password'}>
        <Input value={password} onChange={(e) => setPassword(e.target.value)} id="password" type="password" placeholder="******" />
        {/* <p className="text-danger-light dark:text-danger-dark mt-3">Por favor, introduce una contraseña válida.</p> */}
        {error && <div className="text-danger-light dark:text-danger-dark text-xs italic mt-3">{error}</div>}
      </FormGroup>

      <div className="flex items-center justify-between">
        <SignInButton loading={loading} />
      </div>
    </form>
  )
}

export default LoginForm