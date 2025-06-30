'use client'

import { useState, useEffect } from 'react'
import { handleToast } from '@/lib/toast'
import api from '@/lib/axios'
import Card from '../molecules/Card'
import Input from '../atoms/Input'
import LoadingOverlay from '../atoms/LoadingOverlay'

const EditProfileForm = ({ user, onCancel, onSuccess }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    country: '',
    avatar: '',
  })

  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      country: user.country || '',
      avatar: user.avatar || '',
    })
  }, [user])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

    if (
      !formData.username &&
      !formData.firstName &&
      !formData.lastName &&
      !formData.phone &&
      !formData.country &&
      !formData.password
    ) {
      newErrors.form = 'Debes modificar al menos un campo.'
    }

    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Correo electrónico no válido.'
    }

    if (formData.password && formData.password.length < 8) {
      newErrors.password = 'La contraseña debe tener al menos 8 caracteres.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const { data } = await api.patch('/api/profile', formData)
      setErrors({})
      handleToast(data.message, 'success', 'Los cambios fueron guardados exitosamente.', '', '✅')

      if (typeof onSuccess === 'function') {
        onSuccess(data.user)
      }

      onCancel()
    } catch (error) {
      const message = error.response?.data?.error || 'Error en la comunicación con el servidor'
      setErrors({ form: message })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card title="Editar Perfil" className="p-6">
      {isSubmitting && <LoadingOverlay />}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        {/* Feedback */}
        {errors.form && (
          <div className="mb-4 rounded-md bg-red-100 p-2 text-sm text-red-700 border border-red-300">
            {errors.form}
          </div>
        )}

        <div className="grid lg:grid-cols-2 gap-4">
          {/* Avatar */}
          <div className="flex flex-col items-center gap-2 col-span-full sm:col-span-2">
            <label className="font-medium text-text-light dark:text-text-dark mb-1">Foto de Perfil</label>
            <div className="relative w-24 h-24">
              <img
                src={formData.avatar || '/default-avatar.webp'}
                alt="Avatar"
                className="w-24 h-24 object-cover rounded-full border border-border-light shadow-sm"
                onError={(e) => (e.target.src = '/default-avatar.webp')}
              />
              <label className="absolute bottom-0 right-0 w-6 h-6 bg-primary text-white text-xs rounded-full flex items-center justify-center cursor-pointer shadow-md hover:scale-105 transition" title="Cambiar">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onloadend = () => {
                        setFormData((prev) => ({ ...prev, avatar: reader.result }))
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Campos */}
          <div>
            <label htmlFor="firstName" className="block font-medium mb-1">Nombre</label>
            <Input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="rounded-md"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block font-medium mb-1">Apellido</label>
            <Input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="rounded-md"
            />
          </div>

          <div>
            <label htmlFor="email" className="block font-medium mb-1">Correo Electrónico</label>
            <Input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              disabled
              className="w-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-md px-3 py-2 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="phone" className="block font-medium mb-1">Teléfono</label>
            <Input
              id="phone"
              type="tel"
              name="phone"
              pattern="\d*"
              inputMode="numeric"
              value={formData.phone}
              onChange={(e) => {
                const onlyNums = e.target.value.replace(/\D/g, '') // Remueve todo lo que no sea número
                if (onlyNums.length <= 9) {
                  setFormData(prev => ({ ...prev, phone: onlyNums }))
                }
              }}
              className="rounded-md"
            />
          </div>

          <div>
            <label htmlFor="country" className="block font-medium mb-1">País</label>
            <Input
              id="country"
              type="text"
              name="country"
              value={formData.country}
              onChange={handleChange}
              className="rounded-md"
            />
          </div>

          <div>
            <label htmlFor="password" className="block font-medium mb-1">Nueva Contraseña</label>
            <Input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="rounded-md"
              placeholder="Dejar en blanco si no deseas cambiarla"
              required={false}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
            title="Cancelar cambios"
          >
            Cancelar
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-md bg-primary text-text-light hover:bg-primary/90 transition"
            title="Actualizar perfil"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Actualizando...' : 'Guardar Cambios'}
          </button>
        </div>
      </form>
    </Card>
  )
}

export default EditProfileForm
