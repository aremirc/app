const FormGroup = ({ label, htmlFor, children }) => {
  return (
    <div className="mb-4 text-text-light dark:text-text-dark relative">
      <label className="block text-sm font-bold mb-2" htmlFor={htmlFor}>{label}</label>
      {children}
    </div>
  )
}

export default FormGroup