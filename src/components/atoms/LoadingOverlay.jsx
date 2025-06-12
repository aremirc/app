const LoadingOverlay = ({ fullscreen = false, className = '' }) => {
  return (
    <div
      className={`
        ${fullscreen ? 'fixed' : 'absolute rounded-lg'} inset-0 z-50
        flex items-center justify-center
        bg-background-light/70 dark:bg-background-dark/70
        ${className}
      `}
    >
      <div
        className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Cargando"
      />
    </div>
  )
}

export default LoadingOverlay
