import React from 'react';
import '../styles/externalPage.css';

const GestorDeContraseñas = () => {
  return (
    <div className="external-page-container">
      <main className="external-page-main">
        {/* Globo para el título */}
        <div className="external-page-box title-box">
          <h2 className="box-title">Gestor de contraseñas (Bitwarden)</h2>
        </div>

        {/* Globo para el enlace */}
        <div className="external-page-box link-box">
          <a
            href="https://bitwarden.com/"
            className="box-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acceso al Gestor de Contraseñas (Bitwarden)
          </a>
        </div>

        {/* Globo para la descripción */}
        <div className="external-page-box description-box">
          <p className="box-text">
          Bitwarden es un administrador de contraseñas fácil de usar que guarda y protege tus contraseñas con cifrado seguro, disponible en tu celular, computadora o navegador. Te ayuda a crear contraseñas fuertes, autocompletar formularios y compartir accesos de forma segura, con un plan gratuito y opciones económicas para más funciones, ideal para mantener tus datos a salvo sin complicaciones.
          </p>
        </div>
      </main>
    </div>
  );
};

export default GestorDeContraseñas;