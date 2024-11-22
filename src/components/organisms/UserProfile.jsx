import { useState } from 'react';
import axios from 'axios';
import AuthenticatedSection from './AuthenticatedSection';

const UserProfile = () => {
  const [data, setData] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('/api/data', { data });
      console.log(response.data.message);
    } catch (error) {
      console.error('Error al guardar los datos:', error.response || error.message);
    }
  };

  return (
    <AuthenticatedSection />
    // <form onSubmit={handleSubmit}>
    //   <input 
    //     type="text" 
    //     value={data} 
    //     onChange={(e) => setData(e.target.value)} 
    //     placeholder="Ingresa tus datos" 
    //   />
    //   <button type="submit">Enviar</button>
    // </form>
  );
};

export default UserProfile;