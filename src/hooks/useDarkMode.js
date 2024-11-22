import { useEffect, useState } from 'react';

const useDarkMode = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // 1. Verificamos si ya existe una preferencia guardada en localStorage
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      // Si hay una preferencia almacenada, la aplicamos
      setIsDark(storedTheme === 'dark');
      if (storedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      // 2. Si no hay preferencia almacenada, verificamos la preferencia del sistema
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDark(prefersDark);
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Función para alternar el modo oscuro manualmente
  const toggleDarkMode = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    if (newIsDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark'); // Guardamos la preferencia
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light'); // Guardamos la preferencia
    }
  };

  return { isDark, toggleDarkMode };
};

export default useDarkMode;