const OperationsManual = () => {
  return (
    <section className="prose dark:prose-invert max-w-4xl mx-auto px-4 text-sm leading-relaxed text-text-light dark:text-text-dark">
      <h2 className="text-2xl font-bold border-b border-border-light dark:border-border-dark pb-2 mb-6">
        Manual de Procedimientos
      </h2>

      <p className="mb-6">
        Este manual describe los procedimientos estándar para el uso del sistema de gestión de órdenes de servicio. Está dirigido a usuarios, técnicos, supervisores y administradores del sistema.
      </p>

      <ManualSection title="1. Registro y Gestión de Usuarios" items={[
        { label: "Crear un usuario", detail: "Ingresar los datos requeridos como DNI, nombre, correo y rol." },
        { label: "Editar usuario", detail: "Acceder al panel de administración y modificar información personal o estado." },
        { label: "Roles y permisos", detail: "Cada usuario tiene un rol asociado que define su acceso al sistema." },
      ]} />

      <ManualSection title="2. Creación y Gestión de Órdenes" items={[
        { label: "Registrar orden", detail: "Seleccionar cliente, fecha, descripción, prioridad y servicios asociados." },
        { label: "Asignar trabajadores", detail: "Seleccionar personal disponible, responsable y estado inicial." },
        { label: "Actualizar estado", detail: "La orden puede pasar por los estados definidos en el sistema (PENDING, IN_PROGRESS, COMPLETED, etc.)." },
      ]} />

      <ManualSection title="3. Visitas Técnicas" items={[
        { label: "Registrar visita", detail: "Asociar con orden, técnico, cliente y agregar observaciones." },
        { label: "Cargar evidencias", detail: "Subir fotos o videos del trabajo realizado." },
        { label: "Evaluación", detail: "El cliente puede calificar y dejar comentarios sobre la visita." },
      ]} />

      <ManualSection title="4. Gestión de Herramientas" items={[
        { label: "Asignar herramienta", detail: "Indicar a qué orden se asigna, cuándo se usó y cuándo se devolvió." },
        { label: "Estados posibles", detail: "AVAILABLE, IN_USE, MAINTENANCE, LOST, RETIRED." },
      ]} />

      <ManualSection title="5. Conformidad del Cliente" items={[
        { label: "Confirmar orden", detail: "El cliente o responsable revisa el trabajo y acepta o rechaza." },
        { label: "Feedback", detail: "Se puede agregar retroalimentación y calificación del servicio." },
      ]} />

      <ManualSection title="6. Notificaciones y Alertas" items={[
        { label: "Tipos", detail: "TASK PENDING, PROFILE UPDATE, ASSIGNMENT UPDATE, etc." },
        { label: "Canal", detail: "Visualización directa desde el panel del usuario." },
      ]} />

      <ManualSection title="7. Seguridad y Roles" items={[
        { label: "Verificación de cuenta", detail: "Usuarios nuevos requieren verificación de identidad." },
        { label: "Bloqueo", detail: "El sistema bloquea accesos tras múltiples intentos fallidos." },
      ]} />

      <ManualSection title="8. Consideraciones Técnicas" items={[
        { label: "Requisitos del sistema", detail: "Navegador moderno, conexión mínima de 5 Mbps, resolución mínima 1280x720." },
        { label: "Actualizaciones", detail: "El sistema puede recibir mejoras sin afectar datos históricos." },
      ]} />
    </section>
  )
}

// 🧩 Componente auxiliar reutilizable
const ManualSection = ({ title, items }) => (
  <div className="mb-8">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <ul className="list-disc list-inside space-y-1">
      {items.map((item, i) => (
        <li key={i}>
          <span className="font-medium">{item.label}:</span> {item.detail}
        </li>
      ))}
    </ul>
  </div>
)

export default OperationsManual
