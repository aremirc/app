const Footer = () => {
  return (
    <footer className="bg-gray-800 p-5">
      <div className="container mx-auto flex flex-col sm:flex-row justify-around text-center text-sm text-text-dark">
        <p className="mb-4 sm:m-0">© 2024 Made with ❤️ by <span className="text-primary">Crea</span>. Todos los derechos reservados.</p>
        <div className="flex justify-center space-x-4">
          <a href="#" className="hover:text-gray-400 transition">Política de Privacidad</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-400 transition">Términos de Servicio</a>
          <span>|</span>
          <a href="#" className="hover:text-gray-400 transition">Ayuda</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer