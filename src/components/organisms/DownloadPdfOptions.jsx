'use client'

import { useState } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { Download, FileText, Image as ImageIcon, Loader2, AlertCircle, } from 'lucide-react'
import Button from '@/components/atoms/Button'

const DownloadPdfOptions = ({ elementId = 'printable-order', filename = 'reporte.pdf', orderId }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const getElement = () => {
    const el = document.getElementById(elementId)
    if (!el) {
      setError('Contenido no disponible')
    } else {
      setError(null)
    }
    return el
  }

  const handleCaptureAsImage = async () => {
    const element = getElement()
    if (!element) return

    setLoading(true)
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
      })

      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgProps = pdf.getImageProperties(imgData)
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`orden_${orderId ?? 'reporte'}.pdf`)
    } catch (err) {
      console.error(err)
      setError('Error al generar el PDF como imagen')
    } finally {
      setLoading(false)
    }
  }

  const handleAccessiblePdf = async () => {
    const element = getElement()
    if (!element) return

    setLoading(true)
    try {
      const pdf = new jsPDF('p', 'mm', 'a4')
      await pdf.html(element, {
        callback: () => {
          pdf.save(`orden_${orderId ?? 'reporte'}.pdf`)
        },
        margin: [10, 10, 10, 10],
        x: 10,
        y: 10,
        html2canvas: { scale: 0.6 },
        autoPaging: 'text',
        width: 180,
        windowWidth: element.scrollWidth,
      })
    } catch (err) {
      console.error(err)
      setError('Error al generar PDF accesible')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 flex-wrap mt-4">
      <Button
        onClick={handleCaptureAsImage}
        disabled={loading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <ImageIcon className="w-4 h-4" />
        Captura visual
      </Button>

      <Button
        onClick={handleAccessiblePdf}
        disabled={loading}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4" />
        PDF accesible
      </Button>

      {error && (
        <div className="flex items-center gap-2 text-red-600 mt-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-500 mt-2">
          <Loader2 className="animate-spin w-4 h-4" />
          Generando PDF...
        </div>
      )}
    </div>
  )
}

export default DownloadPdfOptions
