import React, { useState, useEffect } from 'react'

const EditProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  useEffect(() => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '', // La contraseña no se autocompleta
    })
  }, [user])

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    const { username, email, password } = formData
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/
    if (!username && !email && !password) {
      alert('Debes modificar al menos un campo.')
      return false
    }

    if (email && !emailRegex.test(email)) {
      alert('Correo electrónico no válido.')
      return false
    }

    if (password && password.length < 8) {
      alert('La contraseña debe tener al menos 8 caracteres.')
      return false
    }

    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    // Realiza la petición al API para actualizar el perfil
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const result = await response.json()
      if (response.ok) {
        alert('Perfil actualizado correctamente')
      } else {
        alert(result.error || 'Error al actualizar el perfil')
      }
    } catch (error) {
      alert('Error en la comunicación con el servidor')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="username">
          Nombre de Usuario
        </label>
        <input
          type="text"
          id="username"
          name="username"
          value={formData.username}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          placeholder="Nuevo nombre de usuario"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="email">
          Correo Electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          placeholder="Nuevo correo electrónico"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700" htmlFor="password">
          Contraseña Nueva
        </label>
        <input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          className="w-full mt-1 p-2 border border-gray-300 rounded-lg"
          placeholder="Nueva contraseña (mín. 8 caracteres)"
        />
      </div>

      <div className="flex justify-center">
        <button type="submit" className="bg-blue-500 text-white py-2 px-4 rounded-lg">
          Actualizar Perfil
        </button>
      </div>
    </form>
  )
}

export default EditProfileForm
