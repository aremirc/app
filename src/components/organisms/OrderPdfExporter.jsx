'use client'

import { FileText } from 'lucide-react'
import Button from '@/components/atoms/Button'
import jsPDF from 'jspdf'

// 🔁 Función para convertir SVG string a PNG base64
const convertSvgToPng = async (svgText) => {
  const svgBlob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" })
  const url = URL.createObjectURL(svgBlob)

  const img = new Image()
  img.src = url

  await new Promise(resolve => (img.onload = resolve))

  const canvas = document.createElement("canvas")
  canvas.width = img.width
  canvas.height = img.height
  const ctx = canvas.getContext("2d")
  ctx.drawImage(img, 0, 0)

  return canvas.toDataURL("image/png")
}

const OrderPdfExporter = ({ order, className = '' }) => {
  const handlePrintWithLogo = async () => {
    const doc = new jsPDF('p', 'mm', 'a4')

    const logo = new Image()
    logo.src = '/logo.svg' // Requiere que tengas el logo en public/logo.png

    // ✅ Cargar el contenido SVG como texto
    const response = await fetch('/logo.svg')
    const svgText = await response.text()

    // ✅ Convertir SVG a PNG base64
    const pngDataUrl = await convertSvgToPng(svgText)

    logo.onload = () => {
      doc.addImage(pngDataUrl, 'PNG', 10, 10, 30, 20)

      doc.setFontSize(16)
      doc.text('REPORTE DE SERVICIO TÉCNICO', 105, 20, { align: 'center' })

      doc.setFontSize(10)
      doc.line(10, 32, 200, 32)

      doc.text(`Cliente: ${order.client?.name ?? '-'}`, 10, 40)
      doc.text(`Teléfono: ${order.client?.phone ?? '-'}`, 10, 45)
      doc.text(`Dirección: ${order.client?.address ?? '-'}`, 10, 50)

      doc.text(`N° Orden: ${String(order.id).padStart(3, '0')}`, 150, 40)
      doc.text(`Fecha creación: ${new Date(order.createdAt).toLocaleDateString()}`, 150, 45)
      doc.text(`Estado: ${order.status}`, 150, 50)

      doc.setFont(undefined, 'bold')
      doc.text('Descripción del servicio:', 10, 60)
      doc.setFont(undefined, 'normal')
      doc.text(doc.splitTextToSize(order.description ?? '-', 180), 10, 65)

      doc.setFont(undefined, 'bold')
      doc.text('Técnicos asignados:', 10, 90)
      doc.setFont(undefined, 'normal')
      order.workers?.forEach((w, i) => {
        doc.text(`• ${w.user.firstName} ${w.user.lastName}${w.isResponsible ? ' (Responsable)' : ''}`, 10, 95 + i * 5)
      })

      if (order.conformity?.feedback) {
        doc.setFont(undefined, 'bold')
        doc.text('Observaciones del cliente:', 10, 115)
        doc.setFont(undefined, 'normal')
        doc.text(doc.splitTextToSize(order.conformity.feedback, 180), 10, 120)
      }

      if (order.conformity?.description) {
        doc.setFont(undefined, 'bold')
        doc.text('Diagnóstico / Trabajo realizado:', 10, 140)
        doc.setFont(undefined, 'normal')
        doc.text(doc.splitTextToSize(order.conformity.description, 180), 10, 145)
      }

      if (order.conformity?.accepted !== undefined) {
        doc.setFont(undefined, 'bold')
        doc.text('Estado de Conformidad:', 10, 165)
        doc.setFont(undefined, 'normal')
        doc.text(
          order.conformity.accepted ? '✔ Servicio ACEPTADO' : '✖ Servicio RECHAZADO',
          10,
          170
        )
      }

      if (order.conformity?.signature) {
        doc.setFont(undefined, 'bold')
        doc.text('Firma del Cliente:', 10, 185)
        doc.addImage(order.conformity.signature, 'PNG', 10, 190, 50, 25)
      }

      doc.save(`orden_${order.id}_reporte.pdf`)
    }
  }

  return (
    <div className={className}>
      <Button
        onClick={handlePrintWithLogo}
        variant="outline"
        size="sm"
        className="flex items-center gap-2 bg-border-light/30"
        title="Descargar PDF"
      >
        <FileText className="w-4 h-4" />
      </Button>
    </div>
  )
}

export default OrderPdfExporter
