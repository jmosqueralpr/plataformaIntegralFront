import React, { useContext, useEffect } from 'react';
import '../styles/dashboard.css';
import { DashboardCard } from '../components/dashboardCard';
import Cookies from 'js-cookie';
import AuthContext from '../context/authContext';
import config  from '../../src/config';


const Dashboard = () => {
  const { authUser, setAuthUser, isAuthenticated, login, logout  } = useContext(AuthContext); /* Llamo a las variables del contexto. */

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);


  

  return (
    <div className="dashboard-container">
      <header>
        
        <div className="header-right">
          <span>Bienvenido al Dashboard, {authUser}. </span>
        </div>
      </header>
      <main>
        <DashboardCard className='main-container' title={'Asistente de Telegram'} link={'AsistenteTelegram'} text = {'Acceso al asistente de Telegram.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Configuración de usuario'} link={'Configuration'} text = {'Configurar los parámetros generales del usuario.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Centro de soluciones'} link={'searchSolutions'} text = {'Herramienta para que puedas ver y crear soluciones rápidas a tus problemas diarios.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Herramientas AIS'} link={'HerramientasAIS'} text = {'Herramientas varias para sistemas AIS.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Enlaces y Accesos'} link={'DashEnlaces'} text = {'Enlaces y accesos a los diferentes sistemas de DYB.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Task Manager'} link={'TaskManager'} text = {'Herramienta para que puedas administrar tus tareas diarias.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Registro de Vencimientos'} link={'ExpirationTracker'} text = {'Herramienta para que puedas gestionar tus vencimientos y configurar avisos pro Telegram.'} ></DashboardCard>
        
      </main>
    </div>
  );
};

export default Dashboard;
