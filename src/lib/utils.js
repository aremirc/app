export function isBirthday(birthDate) {
  if (!birthDate) return false

  const [year, month, day] = birthDate.split("T")[0].split("-").map(Number)
  const today = new Date()

  return today.getDate() === day && today.getMonth() === month - 1
}
