import React from 'react';
import '../styles/externalPage.css';

const ComprasDyb = () => {
  return (
    <div className="external-page-container">
      <main className="external-page-main">
        {/* Globo para el título */}
        <div className="external-page-box title-box">
          <h2 className="box-title">Sistema de compras DYB</h2>
        </div>

        {/* Globo para el enlace */}
        <div className="external-page-box link-box">
          <a
            href="http://compras-dyb.com.ar/index.php"
            className="box-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            Acceso a sistema de compras DYB
          </a>
        </div>

        {/* Globo para la descripción */}
        <div className="external-page-box description-box">
          <p className="box-text">
            El Sistema de Compras DYB es una plataforma web desarrollada para gestionar de manera integral el proceso de compras de la empresa DYB. Diseñado para uso interno, el sistema permite a los empleados autorizados administrar proveedores, generar solicitudes de compra, aprobar pedidos, realizar seguimiento de facturas y mantener un registro detallado de todas las transacciones. La plataforma está optimizada para mejorar la eficiencia operativa, reducir errores manuales y garantizar el cumplimiento de las políticas internas de la empresa.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ComprasDyb;