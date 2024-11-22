import { FaHome, FaHouseUser, FaUsers, FaChild, FaTasks, FaCalendarCheck, FaCubes, FaSearch } from 'react-icons/fa';

const Icon = ({ name, size = 24, color = '', active = false }) => {
  const style = `p-1 ${color} rounded-md ${active ? 'bg-primary dark:bg-primary-dark dark:backdrop-brightness-0 text-background-light dark:text-background-dark' : 'bg-background-light dark:bg-shadow-dark text-primary dark:text-primary-dark z-5'}`
  // Mapeamos los iconos a sus componentes correspondientes
  const icons = {
    home: <FaHouseUser size={size} className={style} />,
    user: <FaUsers size={size} className={style} />,
    client: <FaChild size={size} className={style} />,
    order: <FaTasks size={size} className={style} />,
    visit: <FaCalendarCheck size={size} className={style} />,
    service: <FaCubes size={size} className={style} />,
    search: <FaSearch size={size} className={style} />,
  };

  return icons[name] || <FaHome className={`${color} text-${size}`} />;
};

export default Icon;
