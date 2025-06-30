const ErrorBanner = ({ message, retry }) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      className="flex flex-col items-center gap-4 bg-red-100 dark:bg-red-950 border border-red-300 dark:border-red-700 text-red-900 dark:text-red-100 p-4 rounded-xl shadow-md my-4 animate-fade-in transition-all duration-300"
    >
      <div className="flex-1">
        <p className="font-bold text-base sm:text-lg mb-1 flex flex-col items-center gap-2">
          <span aria-hidden="true" className="text-2xl">¡Ups!</span>
          <strong>Algo salió mal 😟</strong>
        </p>
        <p className="text-sm sm:text-base text-center text-red-800 dark:text-red-200 leading-relaxed">
          {message || "Ha ocurrido un error. Por favor, intenta nuevamente."}
        </p>
      </div>

      {retry && (
        <button
          onClick={retry}
          className="bg-red-200/60 dark:bg-red-700 hover:bg-red-300 dark:hover:bg-red-600 text-red-900 dark:text-white text-sm px-4 py-2 rounded-lg transition-colors duration-200 font-semibold shadow-inner select-none"
          type="button"
          aria-label="Reintentar"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
