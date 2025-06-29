"use client"

import React from "react"

const PdfOrderReport = ({ order }) => {
  return (
    <div id="printable-order" className="text-[12px] leading-snug text-black bg-white p-6 max-w-[800px] mx-auto font-sans">
      <h1 className="text-xl font-bold text-center mb-3">REPORTE DE SERVICIO TÉCNICO</h1>

      <div className="border border-black p-3 mb-4">
        <p className="font-semibold text-sm mb-1">EMPRESA / RESPONSABLE</p>
        <p>ISOLINA GUTIERREZ ABARCA — RUC: 10404822646</p>
        <p><strong>Servicio:</strong> Venta de computadoras, insumos, cableado estructurado, conexiones inalámbricas, sistemas eléctricos, pararrayos y telefonía IP.</p>
      </div>

      <table className="w-full text-sm mb-4 border-collapse">
        <tbody>
          <tr>
            <td className="border px-2 py-1 w-1/2"><strong>CLIENTE:</strong> {order.client?.name}</td>
            <td className="border px-2 py-1 w-1/2"><strong>Teléfono:</strong> {order.client?.phone}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1" colSpan={2}><strong>Dirección:</strong> {order.client?.address}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1"><strong>N° Orden:</strong> {String(order.id).padStart(3, '0')}</td>
            <td className="border px-2 py-1"><strong>Fecha de Creación:</strong> {new Date(order.createdAt).toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1"><strong>Programada:</strong> {new Date(order.scheduledDate).toLocaleDateString()}</td>
            <td className="border px-2 py-1"><strong>Finalización:</strong> {new Date(order.endDate || '').toLocaleDateString()}</td>
          </tr>
          <tr>
            <td className="border px-2 py-1" colSpan={2}><strong>Descripción del Servicio:</strong> {order.description}</td>
          </tr>
        </tbody>
      </table>

      <h2 className="text-sm font-semibold mb-1">TÉCNICOS RESPONSABLES</h2>
      <ul className="mb-4 list-disc list-inside text-sm">
        {order.workers?.map((w, i) => (
          <li key={i}>
            {w.user.firstName} {w.user.lastName} — {w.user.email} {w.isResponsible ? '(Responsable)' : ''}
          </li>
        ))}
      </ul>

      <div className="mb-4 text-sm">
        <h2 className="font-semibold mb-1">OBSERVACIONES / RECOMENDACIONES</h2>
        <p>{order.conformity?.feedback || "—"}</p>
      </div>

      <div className="mb-4 text-sm">
        <h2 className="font-semibold mb-1">DIAGNÓSTICO / SERVICIO REALIZADO</h2>
        <p>{order.conformity?.description || order.description}</p>
      </div>

      {order.conformity?.accepted !== undefined && (
        <div className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">ESTADO DE CONFORMIDAD</h2>
          <p>
            {order.conformity.accepted
              ? "✔ El cliente ACEPTÓ el servicio"
              : "✖ El cliente RECHAZÓ el servicio"}
          </p>
          {order.conformity.rejectionReason && (
            <p><strong>Motivo del rechazo:</strong> {order.conformity.rejectionReason}</p>
          )}
        </div>
      )}

      {order.conformity?.signature && (
        <div className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">FIRMA DEL CLIENTE</h2>
          <img src={order.conformity.signature} alt="Firma" className="w-48 border mt-2" />
        </div>
      )}

      {order.locations?.length > 0 && (
        <div className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">UBICACIONES REGISTRADAS</h2>
          <ul className="list-disc list-inside">
            {order.locations.map((loc, idx) => (
              <li key={idx}>
                Lat: {loc.latitude}, Lng: {loc.longitude}
                {loc.label && ` — ${loc.label}`}
              </li>
            ))}
          </ul>
        </div>
      )}

      {order.visits?.length > 0 && (
        <div className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">VISITAS</h2>
          {order.visits.map((v, i) => (
            <div key={i} className="mb-2">
              <p><strong>Fecha:</strong> {new Date(v.date).toLocaleDateString()}</p>
              <p><strong>Descripción:</strong> {v.description}</p>
              <p><strong>Evaluación:</strong> {v.evaluation || 'No evaluado'}</p>
            </div>
          ))}
        </div>
      )}

      {order.conformity?.files?.length > 0 && (
        <div className="mb-4 text-sm">
          <h2 className="font-semibold mb-1">ARCHIVOS ADJUNTOS</h2>
          <ul className="list-disc list-inside">
            {order.conformity.files.map((file, idx) => (
              <li key={idx}>
                <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
                  {file.name || `Archivo ${idx + 1}`}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="text-xs mt-6 border-t pt-2 text-center">
        <p>La garantía cubre revisiones y reparaciones solo si el daño no fue causado por mal uso, mala instalación, transporte, agentes externos, etc.</p>
        <p>Ver condiciones completas en el contrato de servicio.</p>
      </div>
    </div>
  )
}

export default PdfOrderReport
