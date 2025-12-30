import React, { useContext } from 'react';
import '../../styles/dashboard.css';
import { DashboardCard } from '../../components/dashboardCard';
import Cookies from 'js-cookie';
import AuthContext from '../../context/authContext';
import config  from '../../config';


const herramientasAIS = () => {
  const { authUser, setAuthUser, isAuthenticated, login, logout  } = useContext(AuthContext); /* Llamo a las variables del contexto. */


  

  return (
    <div className="dashboard-container">
      <header>
        
        <div className="header-right">
          <span>Herramientas AIS, {authUser}. </span>
        </div>
      </header>
      <main>
        <DashboardCard className='main-container' title={'Verificación MGE 8 - En construcción'} link={'VerificadorMGE8'} text = {'Verifica la existencia del mensaje 8 en un archivo y muestra valores aleatorios (Velicidad y Dirección de viento). EN CONSTRUCCIÓN.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Conversor de uni GPS - En construcción'} link={'Configuration'} text = {'Conversor de unidades para varios GPS para varios sistemas de AIS utilizados en DYB. EN CONSTRUCCIÓN'} ></DashboardCard>
      </main>
    </div>
  );
};

export default herramientasAIS;
