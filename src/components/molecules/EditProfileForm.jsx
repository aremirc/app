import React, { useState, useEffect } from 'react'

const EditProfileForm = ({ user }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

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
    const newErrors = {}

    // Expresión regular más flexible
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    // const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/

    if (!username && !email && !password) {
      newErrors.form = 'Debes modificar al menos un campo.'
    }

    if (email && !emailRegex.test(email)) {
      newErrors.email = 'Correo electrónico no válido.'
    }

    if (password && password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSuccessMessage('')

    // Realiza la petición al API para actualizar el perfil
    try {
      const response = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // En caso de éxito
        setSuccessMessage('Perfil actualizado correctamente')
        setErrors({})
      } else {
        setErrors({ form: result.error || 'Error al actualizar el perfil' })
      }
    } catch (error) {
      setErrors({ form: 'Error en la comunicación con el servidor' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(errors).length > 0 && (
        <div className="mb-4 rounded-md bg-red-100 p-2 text-sm text-danger-light dark:text-danger-dark border border-red-300">
          Por favor corrige los errores antes de continuar.
        </div>
      )}

      {errors.form && (
        <div className="mb-4 rounded-md bg-red-100 p-2 text-sm text-danger-light dark:text-danger-dark border border-red-300">
          {errors.form}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 rounded-md bg-green-100 p-2 text-sm text-green-700 border border-green-300">
          {successMessage}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-sm font-medium text-text-light dark:text-text-dark" htmlFor="username">
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
        <label className="block text-sm font-medium text-text-light dark:text-text-dark" htmlFor="email">
          Correo Electrónico
        </label>
        {errors.email && <p className="text-danger-light dark:text-danger-dark text-sm">{errors.email}</p>}
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
        <label className="block text-sm font-medium text-text-light dark:text-text-dark" htmlFor="password">
          Contraseña Nueva
        </label>
        {errors.password && <p className="text-danger-light dark:text-danger-dark text-sm">{errors.password}</p>}
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
        <button
          type="submit"
          className="bg-blue-500 text-white py-2 px-4 rounded-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Actualizando...' : 'Actualizar Perfil'}
        </button>
      </div>
    </form>
  )
}

export default EditProfileForm
