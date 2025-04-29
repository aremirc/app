const SignInButton = ({ loading, isDisabled }) => {
  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`bg-accent-light dark:bg-primary-dark hover:bg-primary text-background-dark hover:text-background-light dark:hover:text-text-dark font-bold py-2 px-4 rounded transition ${
        isDisabled ? 'opacity-75 cursor-not-allowed' : ''
      }`}
    >
      {loading ? 'Cargando...' : 'Iniciar sesión'}
    </button>
  )
}

export default SignInButton
