import { useContext, useEffect } from 'react';
import '../../styles/dashboard.css';
import { DashboardCard } from '../../components/dashboardCard';
import AuthContext from '../../context/authContext';


const HerramientasAIS = () => {
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <p className="dashboard-kicker">Herramientas</p>
          <h1 className="dashboard-title">Herramientas AIS</h1>
        </div>

        <div className="header-right">
          <span>{authUser}</span>
        </div>
      </header>
      <main>
        <DashboardCard
          title="Verificador de Message 8"
          link="verificadorMGE8"
          text="Analiza archivos TXT, identifica los MMSI que transmiten mensajes AIS tipo 8 y muestra datos reales decodificados de una trama de ejemplo."
        />
        <DashboardCard
          title="Conversor de coordenadas GPS"
          link="gpsConverter"
          text="Convierte coordenadas GPS entre formatos MTU AIS-C, Kanaton, grados decimales, DDM, DMS y NMEA."
        />
        <DashboardCard
          title="Información de Bases AIS"
          link="DashboardBaseAIS"
          text="Consultá y administrá la información de las bases AIS de la Antártida."
        />
      </main>
    </div>
  );
};

export default HerramientasAIS;
