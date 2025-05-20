// components/RouteChangeListener.jsx
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import config from '../../src/config';

const RouteChangeListener = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {

    console.log(`Cambiaste a la ruta: ${location.pathname}`);
  
    if (location.pathname === '/' || location.pathname === '/change-password') { // Añadir '/change-password' para evitar redirigir al cambiar la contraseña
      return;
    } else {
      const fetchProfile = async () => {
        console.log("ejecucion del fetch a profile");
        try {
          const response = await fetch(`${config.baseURL}/api/Profile`, {
            method: 'GET',
            credentials: 'include', // Incluye las cookies en la solicitud
          });
          if (!response.ok) {
            navigate('/'); // Redirige si la sesión no está activa
          }
        } catch (error) {
          console.error('Error al verificar la sesión:', error);
          navigate('/'); // Redirige si hay un error de red
        }
      };
      fetchProfile();
    }

  }, [navigate, location]);

  return null; // Este componente no renderiza nada visible
};

export default RouteChangeListener;