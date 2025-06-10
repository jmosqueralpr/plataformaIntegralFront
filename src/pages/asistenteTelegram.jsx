import React from 'react';
import '../styles/externalPage.css';
import telegramQr from '../img/telegramQr.jpg';

const AsistenteTelegram = () => {
  return (
    <div className="external-page-container">
      <main className="external-page-main">
        {/* Globo para el título */}
        <div className="external-page-box title-box">
          <h2 className="box-title">Asistente Telegram</h2>
        </div>

        {/* Globo para el enlace */}
        <div className="external-page-box link-box">
          <a
            href="http://t.me/PlataformaDyb_bot"
            className="box-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Enlace al asistente de télegram
          </a>
        </div>

        {/* Qr de acceso a telegram */}
        <div className="external-page-box link-box">
          <img className="imgQr" src={telegramQr} alt="Telegram QR" />
        </div>

        {/* Globo para la descripción */}
        <div className="external-page-box description-box">
          <p className="box-text">
            El asistente de télegram nos permite hacer un uso inicial de la página, consultando y creando contenido.
            <br /><br />
            PARA PODER UTILIZAR EL ASISTENTE DEBEMOS HACER LA CONFIGURACION INICIAL DEL CHAT ADMINISTRANDO EL USUARIO Y CONTRASEÑA CORRESPONDIENTE.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AsistenteTelegram;