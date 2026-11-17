import React, { useContext, useEffect } from 'react';
import '../../styles/dashboard.css';
import { DashboardCard } from '../../components/dashboardCard';
import Cookies from 'js-cookie';
import AuthContext from '../../context/authContext';
import config  from '../../config';


const herramientasAIS = () => {
  const { authUser, setAuthUser, isAuthenticated, login, logout  } = useContext(AuthContext); /* Llamo a las variables del contexto. */

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
        <DashboardCard className='main-container' title={'Verificador de Message 8'} link={'VerificadorMGE8'} text = {'Analiza archivos TXT, identifica los MMSI que transmiten mensajes AIS tipo 8 y muestra datos reales decodificados de una trama de ejemplo.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Conversor de uni GPS - En construcción'} link={'Configuration'} text = {'Conversor de unidades para varios GPS para varios sistemas de AIS utilizados en DYB. EN CONSTRUCCIÓN'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Bases AIS'} link={'DashboardBaseAIS'} text = {'Bases AIS de la Antartida'} ></DashboardCard>
      </main>
    </div>
  );
};

export default herramientasAIS;
