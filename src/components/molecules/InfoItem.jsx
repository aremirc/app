const InfoItem = ({ label, value }) => {
  return (
    <div>
      <p className="text-sm font-medium text-gray-600 dark:text-gray-300">{label}:</p>
      <p className="text-md text-gray-800 dark:text-gray-100">{value}</p>
    </div>
  )
}

export default InfoItem