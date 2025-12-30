import React, { useState } from 'react';
import '../../styles/externalPage.css';
import '../../styles/verificadorMGE8.css';
import config from '../../config';

const VerificadorMGE8 = () => {
  const [resultados, setResultados] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    console.log('Archivo Seleccionado:', file);

    setLoading(true);
    setError(null);
    setResultados({});

    try {
      // 1️⃣ Leer archivo
      const text = await file.text();

      // 2️⃣ Filtrar mensajes AIS tipo 8
      const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.startsWith('!AIVDM') && l.includes(',8'))
        .slice(0, 30); // 👈 primeros 30 mensajes 8

      if (lines.length === 0) {
        throw new Error('No se encontraron mensajes AIS 8 en el archivo');
      }

      console.log('Líneas enviadas al backend:', lines);

      // 3️⃣ Enviar al backend
      const response = await fetch(`${config.baseURL}/api/decode-mge8`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ lines })
      });

      if (!response.ok) {
        throw new Error(`Error backend: ${response.status}`);
      }

      const data = await response.json();
      console.log('Respuesta backend:', data);

      setResultados(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="external-page-container">
      <main className="external-page-main">

        {/* TÍTULO */}
        <div className="external-page-box title-box">
          <h2 className="box-title">Verificador MGE8 - En construcción </h2>
        </div>

        {/* Globo para la descripción */}
        <div className="external-page-box description-box">
          <p className="box-text">
            Cargar un archivo que contenga tramas nmea para que el sistema verifique la existencia de mensaje meteorológico (mge8) y devuelva el resultado de algunos mensajes aleatorios.
          </p>
        </div>

        {/* UPLOAD */}
        <div className="external-page-box upload-box">
          <input
            type="file"
            accept=".txt,.log,.nmea"
            onChange={handleFileUpload}
          />
        </div>

        {/* ESTADOS */}
        {loading && (
          <div className="external-page-box description-box">
            <p className="box-text">Procesando archivo…</p>
          </div>
        )}

        {error && (
          <div className="external-page-box description-box">
            <p className="box-text">❌ {error}</p>
          </div>
        )}

        {/* RESULTADOS */}
        {Object.keys(resultados).map((mmsi) => (
          <div key={mmsi} className="external-page-box result-box">
            <h3 className="mmsi-title">MMSI {mmsi}</h3>

            {resultados[mmsi].map((msg, index) => (
              <div key={index} className="mge8-message">
                <p><strong>Dirección de viento:</strong> {msg.windDirection}</p>
                <p><strong>Velocidad de viento:</strong> {msg.windSpeed}</p>
                <p>
                  <strong>Posición:</strong>{' '}
                  {msg.longitude} {msg.latitude}
                </p>
              </div>
            ))}
          </div>
        ))}

      </main>
    </div>
  );
};

export default VerificadorMGE8;



/* import React from 'react';
import '../../styles/externalPage.css';

const VerificadorMGE8 = () => {
  return (
    <div className="external-page-container">
      <main className="external-page-main">
      
        <div className="external-page-box title-box">
          <h2 className="box-title">Verificador MGE8</h2>
        </div>

      
        <div className="external-page-box link-box">
          <a
            href="http://gbacompras-emepa.com.ar/emepa/index.php"
            className="box-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acceso a sistema de compras Emepa
          </a>
        </div>

       
        <div className="external-page-box description-box">
          <p className="box-text">
            El Sistema de Compras Emepa es una plataforma web desarrollada para gestionar de manera integral el proceso de compras de la empresa DYB. Diseñado para uso interno, el sistema permite a los empleados autorizados administrar proveedores, generar solicitudes de compra, aprobar pedidos, realizar seguimiento de facturas y mantener un registro detallado de todas las transacciones. La plataforma está optimizada para mejorar la eficiencia operativa, reducir errores manuales y garantizar el cumplimiento de las políticas internas de la empresa.
          </p>
        </div>
      </main>
    </div>
  );
};

export default VerificadorMGE8; */