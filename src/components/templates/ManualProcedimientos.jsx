// components/ManualProcedimientos.tsx
import React from 'react';

const ManualProcedimientos = () => {
  return (
    <section className="manual">
      <h2>Manual de Procedimientos</h2>
      <p>
        Este manual describe los procedimientos estándar para el uso del sistema de gestión de órdenes de servicio. Está dirigido a usuarios, técnicos, supervisores y administradores del sistema.
      </p>

      <h3>1. Registro y Gestión de Usuarios</h3>
      <ul>
        <li><strong>Crear un usuario:</strong> Ingresar los datos requeridos como DNI, nombre, correo y rol.</li>
        <li><strong>Editar usuario:</strong> Acceder al panel de administración y modificar información personal o estado.</li>
        <li><strong>Roles y permisos:</strong> Cada usuario tiene un rol asociado que define su acceso al sistema.</li>
      </ul>

      <h3>2. Creación y Gestión de Órdenes</h3>
      <ul>
        <li><strong>Registrar orden:</strong> Seleccionar cliente, fecha, descripción, prioridad y servicios asociados.</li>
        <li><strong>Asignar trabajadores:</strong> Seleccionar personal disponible, responsable y estado inicial.</li>
        <li><strong>Actualizar estado:</strong> La orden puede pasar por los estados definidos en el sistema (PENDING, IN_PROGRESS, COMPLETED, etc.).</li>
      </ul>

      <h3>3. Visitas Técnicas</h3>
      <ul>
        <li><strong>Registrar visita:</strong> Asociar con orden, técnico, cliente y agregar observaciones.</li>
        <li><strong>Cargar evidencias:</strong> Subir fotos o videos del trabajo realizado.</li>
        <li><strong>Evaluación:</strong> El cliente puede calificar y dejar comentarios sobre la visita.</li>
      </ul>

      <h3>4. Gestión de Herramientas</h3>
      <ul>
        <li><strong>Asignar herramienta:</strong> Indicar a qué orden se asigna, cuándo se usó y cuándo se devolvió.</li>
        <li><strong>Estados posibles:</strong> AVAILABLE, IN_USE, MAINTENANCE, LOST, RETIRED.</li>
      </ul>

      <h3>5. Conformidad del Cliente</h3>
      <ul>
        <li><strong>Confirmar orden:</strong> El cliente o responsable revisa el trabajo y acepta o rechaza.</li>
        <li><strong>Feedback:</strong> Se puede agregar retroalimentación y calificación del servicio.</li>
      </ul>

      <h3>6. Notificaciones y Alertas</h3>
      <ul>
        <li><strong>Tipos:</strong> TASK PENDING, PROFILE UPDATE, ASSIGNMENT UPDATE, etc.</li>
        <li><strong>Canal:</strong> Visualización directa desde el panel del usuario.</li>
      </ul>

      <h3>7. Seguridad y Roles</h3>
      <ul>
        <li><strong>Verificación de cuenta:</strong> Usuarios nuevos requieren verificación de identidad.</li>
        <li><strong>Bloqueo:</strong> El sistema bloquea accesos tras múltiples intentos fallidos.</li>
      </ul>

      <h3>8. Consideraciones Técnicas</h3>
      <ul>
        <li><strong>Requisitos del sistema:</strong> Navegador moderno, conexión mínima de 5 Mbps, resolución mínima 1280x720.</li>
        <li><strong>Actualizaciones:</strong> El sistema puede recibir mejoras sin afectar datos históricos.</li>
      </ul>
    </section>
  );
};

export default ManualProcedimientos;
