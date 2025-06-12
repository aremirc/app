import { FaHome, FaHouseUser, FaUser, FaTools, FaBoxOpen, FaClipboardList, FaUsers, FaChild, FaTasks, FaCalendarCheck, FaCubes, FaSearch, FaEdit, FaTrash, FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from 'react-icons/fa'

const Icon = ({ name, size = 24, color = '', active = false }) => {
  const style = `p-1 ${color} rounded-md ${active ? 'bg-primary dark:bg-primary-dark hover:bg-primary-dark dark:backdrop-brightness-0 text-background-light dark:text-background-dark' : 'bg-background-light dark:bg-shadow-dark text-primary dark:text-primary-dark hover:text-primary-dark z-5'}`
  // Mapeamos los iconos a sus componentes correspondientes
  const icons = {
    home: <FaHouseUser size={size} className={style} />,
    profile: <FaUser size={size} className={style} />,
    tool: <FaTools size={size} className={style} />,
    evidence: <FaBoxOpen size={size} className={style} />,
    conformity: <FaClipboardList size={size} className={style} />,
    user: <FaUsers size={size} className={style} />,
    client: <FaChild size={size} className={style} />,
    order: <FaTasks size={size} className={style} />,
    visit: <FaCalendarCheck size={size} className={style} />,
    service: <FaCubes size={size} className={style} />,
    search: <FaSearch size={size} className={style} />,
    edit: <FaEdit size={size} className={style} />,
    delete: <FaTrash size={size} className={style} />,
    facebook: <FaFacebook size={size} className={style} />,
    twitter: <FaTwitter size={size} className={style} />,
    linkedin: <FaLinkedin size={size} className={style} />,
    instagram: <FaInstagram size={size} className={style} />
  }

  return icons[name] || <FaHome className={`${color} text-${size}`} />
}

export default Icon
