import React from "react";
import { useNavigate } from "react-router-dom"; // Importa el hook useNavigate
import config from '../../../src/config.js';


const Prueba = () => {
    const navigate = useNavigate(); // Obtiene la función de navegación

    const handleLogoClick = async () => {

        console.log("Boton de prueba");

        // Realizar la solicitud GET al endpoint /api/search con los parámetros query y field
        try {
            const query = "pokemon";  // Valor del query
            const field = "all";      // Valor del field

            const response = await fetch(`${config.baseURL}/api/search?query=${query}&field=${field}`, {
                method: 'GET',
                credentials: 'include' // Incluye las cookies si es necesario para autenticación
            });

            // Verificar si la respuesta es exitosa (códigos de estado HTTP 200-299)
            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            // Parsear la respuesta como JSON
            const data = await response.json();

            // Imprimir los datos en la consola
            console.log('Respuesta del servidor:', data);
        } catch (error) {
            // Manejar errores (problemas de red, servidor no disponible, etc.)
            console.error('Ocurrió un error al realizar la búsqueda:', error.message);
        }
    };

    return (
        <div className="logoContainer" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <button>Prueba</button>
        </div>
    );
};

export default Prueba;

/* PARA mandar un mensaje de telegram */

/* <button onClick={handleSendMessage}>Enviar mensaje por Telegram</button>

const handleSendMessage = async () => {
  try {
    const res = await fetch('/api/send-telegram-message', {
      method: 'GET',
      credentials: 'include', // si usás cookies para auth
    });
    const data = await res.json();
    alert(data.message);
  } catch (err) {
    console.error(err);
    alert('Error al enviar mensaje');
  }
};
 */