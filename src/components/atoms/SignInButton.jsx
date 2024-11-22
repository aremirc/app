const SignInButton = ({ loading }) => {
  return (
    <button className="bg-accent-light dark:bg-primary-dark hover:bg-primary text-background-dark hover:text-background-light dark:hover:text-text-dark font-bold py-2 px-4 rounded transition" type="submit">
      {loading ? 'Cargando...' : 'Iniciar sesión'}
    </button>)
}

export default SignInButton