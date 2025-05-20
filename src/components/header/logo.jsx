
/* El logo del header */

// components/Logo.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Importa el hook useNavigate
import DYBLogo from '../../img/DYBLogo.webp';
import DYBLogoSmall from '../../img/DYBLogoSmall.webp'

const Logo = () => {
    const navigate = useNavigate(); // Obtiene la función de navegación
    const [logo, setLogo] = useState(DYBLogo);


    useEffect(()=>{
        const handleResize = () => {
            setLogo(window.innerWidth <= 600 ? DYBLogoSmall : DYBLogo );
        }
    

    handleResize(); // Llamar al inicio para establecer el logo correcto
    window.addEventListener("resize", handleResize);

})

    // Función para manejar el clic en el logo
    const handleLogoClick = () => {
        navigate('/Dashboard'); // Navega a la ruta '/'
    };

    return (
        <div className="logoContainer" onClick={handleLogoClick} style={{ cursor: 'pointer' }}>
            <img className="logo" src={logo} alt="Logo" />
        </div>
    );
};

export default Logo;
