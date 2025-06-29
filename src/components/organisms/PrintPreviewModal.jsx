'use client'

import { X, Printer, FileText } from 'lucide-react'
import { useEffect } from 'react'

const handleDownloadPdf = () => { }

const PrintPreviewModal = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    const escHandler = (e) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', escHandler)
    return () => window.removeEventListener('keydown', escHandler)
  }, [isOpen, onClose])

  const handlePrint = () => window.print()

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center overflow-auto p-6 print:p-0 print:bg-white">
        <div className="relative bg-white dark:bg-black rounded-md shadow-xl max-w-[800px] w-full print:rounded-none print:shadow-none print:max-w-full print:w-full">
          {/* Botón cerrar */}
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-gray-600 hover:text-black dark:hover:text-white print:hidden"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex justify-start gap-4 p-4 print:hidden">
            {/* Botón imprimir */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-3 py-1 border text-sm rounded-md text-text-light dark:text-text-dark border-gray-300 hover:bg-gray-100 dark:hover:text-text-light"
            >
              <Printer className="w-4 h-4" />
              Imprimir PDF
            </button>

            {/* Botón descargar */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-2 px-3 py-1 border text-sm rounded-md text-text-light dark:text-text-dark border-gray-300 hover:bg-gray-100 dark:hover:text-text-light"
              disabled
            >
              <FileText className="w-4 h-4" />
              Descargar PDF
            </button>
          </div>

          {/* Contenido imprimible */}
          <div id="printable-content" className="p-6 print:p-0">{children}</div>
        </div>
      </div>

      {/* Estilos solo para impresión */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #printable-content, #printable-content * {
            visibility: visible !important;
          }
          #printable-content {
            position: absolute !important;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
            box-shadow: none !important;
            border: none !important;
          }
        }
      `}</style>
    </>
  )
}

export default PrintPreviewModal
