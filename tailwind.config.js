/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    screens: {
      'xs': '480px',
      'sm': '640px',
      'md': '768px',
      'lg': '1024px',
      'xl': '1280px',
      '2xl': '1536px',
    },
    extend: {
      height: {
        'screen-dvh': '100dvh',
      },
      minHeight: {
        'screen-dvh': '100dvh',
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        shimmer: 'shimmer 1.5s infinite',
      },
      colors: {
        // Colores derivados del color base #4FD1C5 (Verde agua)
        primary: {
          light: '#A1E9E0', // Verde agua más claro
          DEFAULT: '#4FD1C5', // Verde agua base
          dark: '#38A89C', // Verde más oscuro para modo oscuro
        },

        // Colores de fondo
        background: {
          light: '#FFFFFF', // Fondo claro
          dark: '#121212', // Fondo oscuro para el modo oscuro
          muted: '#F9FAFB', // claro
          'muted-dark': '#1F1F1F', // oscuro
        },

        // Colores de texto
        text: {
          light: '#333333', // Texto oscuro para el modo claro
          dark: '#E0E0E0', // Texto claro para el modo oscuro
        },

        // Colores de botones y enlaces (acento)
        accent: {
          light: '#4FD1C5', // Verde agua base para botones en modo claro
          dark: '#38A89C', // Verde más oscuro para botones en modo oscuro
        },

        // Colores de bordes
        border: {
          light: '#E2E8F0', // Gris claro para bordes en modo claro
          dark: '#444444', // Gris oscuro para bordes en modo oscuro
        },

        // Sombras
        shadow: {
          light: 'rgba(0, 0, 0, 0.1)', // Sombra ligera en modo claro
          dark: 'rgba(255, 255, 255, 0.2)', // Sombra más suave en modo oscuro
        },

        // Colores secundarios (para botones adicionales, íconos, etc.)
        secondary: {
          light: '#FBBF24', // Amarillo dorado (para llamar la atención)
          dark: '#F59E0B', // Amarillo oscuro para modo oscuro
        },

        // Colores de alerta o mensajes de error
        danger: {
          light: '#F87171', // Rojo claro para errores
          dark: '#EF4444', // Rojo más fuerte en modo oscuro
        },

        // Colores de éxito o notificaciones positivas
        success: {
          light: '#34D399', // Verde más suave para éxito
          dark: '#10B981', // Verde más oscuro para éxito en modo oscuro
        },
      },
    },
  },
  plugins: [],
};


// /** @type {import('tailwindcss').Config} */
// module.exports = {
//   content: [
//     "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
//     "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
//   ],
//   darkMode: "class", // Usar .dark en el <html> o <body>
//   theme: {
//     screens: {
//       xs: "480px",
//       sm: "640px",
//       md: "768px",
//       lg: "1024px",
//       xl: "1280px",
//       "2xl": "1536px",
//     },
//     extend: {
//       colors: {
//         primary: "#4FD1C5",
//         "primary-light": "#A1E9E0",
//         "primary-dark": "#38A89C",

//         background: "#FFFFFF",
//         "background-dark": "#121212",

//         text: "#333333",
//         "text-dark": "#E0E0E0",

//         accent: "#4FD1C5",
//         "accent-dark": "#38A89C",

//         border: "#E2E8F0",
//         "border-dark": "#444444",

//         shadow: "rgba(0, 0, 0, 0.1)",
//         "shadow-dark": "rgba(255, 255, 255, 0.2)",

//         secondary: "#FBBF24",
//         "secondary-dark": "#F59E0B",

//         danger: "#F87171",
//         "danger-dark": "#EF4444",

//         success: "#34D399",
//         "success-dark": "#10B981",
//       },
//     },
//   },
//   plugins: [],
// };
