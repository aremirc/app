import { useEffect } from "react"

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onCancel()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [onCancel])

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded bg-gray-200 hover:bg-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm rounded bg-red-500 hover:bg-red-600 text-white"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ConfirmDialog
