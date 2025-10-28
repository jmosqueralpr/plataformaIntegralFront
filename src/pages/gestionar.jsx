import React from 'react';
import '../styles/externalPage.css';

const Gestionar = () => {
  return (
    <div className="external-page-container">
      <main className="external-page-main">
        {/* Globo para el título */}
        <div className="external-page-box title-box">
          <h2 className="box-title">Descarga de Gestionar</h2>
        </div>

        {/* Globo para el enlace */}
        <div className="external-page-box link-box">
          <a
            href="http://downloadgestionar.gba-hidrovia.com/"
            className="box-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Descarga de gestionar
          </a>
        </div>
        <div className="external-page-box link-box">
          <a
            href="https://nextcloud.apertura.net.ar/index.php/s/WNyBdD5GFc6KeA5"
            className="box-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Descarga de gestionar instalable
          </a>
        </div>

        {/* Globo para la descripción */}
        <div className="external-page-box description-box">
          <p className="box-text">
          Descargar Gestionar en PC, copiar el archivo descargado al escritorio y ejecutarlo. Es posible que se requiera actualizar la última version de java.
          </p>
        </div>
      </main>
    </div>
  );
};

export default Gestionar;