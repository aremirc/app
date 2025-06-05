import { useState } from 'react'
import Input from '../atoms/Input'
import Select from '../atoms/Select'
import Button from '../atoms/Button'
import ColorInput from '../atoms/ColorInput'

const colorOptions = [
  { name: 'Teal', value: 'bg-teal-400 hover:bg-teal-500 dark:bg-teal-300 dark:hover:bg-teal-400' },
  { name: 'Blue', value: 'bg-blue-500 hover:bg-blue-600 dark:bg-blue-400 dark:hover:bg-blue-500' },
  { name: 'Green', value: 'bg-green-500 hover:bg-green-600 dark:bg-green-400 dark:hover:bg-green-500' },
  { name: 'Purple', value: 'bg-purple-500 hover:bg-purple-600 dark:bg-purple-400 dark:hover:bg-purple-500' },
  { name: 'Red', value: 'bg-red-500 hover:bg-red-600 dark:bg-red-400 dark:hover:bg-red-500' },
  { name: 'Yellow', value: 'bg-yellow-400 hover:bg-yellow-500 dark:bg-yellow-300 dark:hover:bg-yellow-400' },
]

const CardForm = ({ onAdd }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    href: '',
    bgColor: colorOptions[0].value,
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = () => {
    if (formData.title && formData.href) {
      onAdd(formData)
      setFormData({
        title: '',
        description: '',
        href: '',
        bgColor: colorOptions[0].value,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
        <Input name="title" value={formData.title} onChange={handleChange} placeholder="Título" />
        <Input name="description" value={formData.description} onChange={handleChange} placeholder="Descripción" />
        <Input name="href" value={formData.href} onChange={handleChange} placeholder="Enlace (https://ejemplo.com)" />
        <Select name="bgColor" value={formData.bgColor} onChange={handleChange} options={colorOptions} />
        {/* <ColorInput
          name="bgColor"
          value={formData.bgColor}
          onChange={handleChange}
        /> */}
      </div>
      <Button onClick={handleSubmit}>Agregar tarjeta</Button>
    </div>
  )
}

export default CardForm
