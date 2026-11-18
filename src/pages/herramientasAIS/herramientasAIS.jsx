import { useContext, useEffect } from 'react';
import { DashboardCard } from '../../components/dashboardCard';
import AuthContext from '../../context/authContext';
import { FiSearch, FiMonitor, FiCompass, FiDatabase } from 'react-icons/fi';
import '../../styles/herramientasAIS.css';


const HerramientasAIS = () => {
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);
  

  return (
    <div className="ais-tools-container">
      <header className="ais-tools-header">
        <div className="ais-tools-header-left">
          <p className="ais-tools-kicker">Herramientas</p>
          <h1 className="ais-tools-title">Herramientas AIS</h1>
        </div>

        <div className="ais-tools-user-badge">{authUser}</div>
      </header>

      <main className="ais-tools-grid">
        <DashboardCard
          Icon={FiSearch}
          title="Verificador de Message 8"
          link="verificadorMGE8"
          text="Analiza archivos TXT, identifica los MMSI que transmiten mensajes AIS tipo 8 y muestra datos reales decodificados de una trama de ejemplo."
        />
        <DashboardCard
          Icon={FiMonitor}
          title="Monitor AIS en vivo"
          link="aisLive"
          text="Visualiza barcos, ATON y mensajes AIS 6, 8 y 21 recibidos desde una fuente NMEA 0183."
        />
        <DashboardCard
          Icon={FiCompass}
          title="Conversor de coordenadas GPS"
          link="gpsConverter"
          text="Convierte coordenadas GPS entre formatos MTU AIS-C, Kanaton, grados decimales, DDM, DMS y NMEA."
        />
        <DashboardCard
          Icon={FiDatabase}
          title="Información de Bases AIS"
          link="DashboardBaseAIS"
          text="Consultá y administrá la información de las bases AIS de la Antártida."
        />
      </main>
    </div>
  );
};

export default HerramientasAIS;
