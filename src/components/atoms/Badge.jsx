const Badge = ({ count }) => {
  return count > 0 ? (
    <span
      className="bg-red-500 text-white rounded-full text-xs font-medium w-4 h-4 flex items-center justify-center absolute bottom-0 right-0 animate-pulse duration-1000 ease-in-out"
      aria-label={`Notificaciones: ${count}`}
    >
      {count}
    </span>
  ) : null
}

export default Badge