import Link from "next/link";

const Custom404 = () => {
  return (
    <div className="animate-fade-in min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-lg text-center">

        <div className="mb-6">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500"
          >
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
            <line x1="8" y1="8" x2="16" y2="16" stroke="currentColor" strokeWidth="2" />
            <line x1="16" y1="8" x2="8" y2="16" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          404 - Página no encontrada
        </h2>
        <p className="text-lg text-gray-600 dark:text-gray-300 mb-6">
          Lo siento, la página que estás buscando no existe o ha sido movida.
        </p>

        {/* Enlace para volver al inicio */}
        <Link href="/">
          <span className="inline-flex items-center bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition duration-300 cursor-pointer mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-2">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9l9-7 9 7M4 10v10h16V10" />
            </svg>
            Volver al inicio
          </span>
        </Link>

        {/* Logo o Nombre de la Marca */}
        <div className="mb-6">
          <img src="/logo.svg" alt="Logo" className="mx-auto h-40" />
        </div>

        {/* Enlace de contacto */}
        <p className="text-md text-gray-600 dark:text-gray-300 mb-6">
          Si necesitas ayuda, no dudes en <Link href="/contact"><span className="text-indigo-600 hover:underline">contactarnos</span></Link>.
        </p>
      </div>
    </div>
  );
};

export default Custom404;
