import { parseCookies } from 'nookies';  // Para leer cookies en Next.js

export const getUserRole = (context) => {
  // Supongamos que el rol se guarda en una cookie llamada 'userRole'
  const cookies = parseCookies(context);
  return cookies.userRole || 'guest'; // Si no hay rol, se asigna 'guest'
};
