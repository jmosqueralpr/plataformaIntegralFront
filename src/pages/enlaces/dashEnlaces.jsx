import React, { useContext } from 'react';
import '../../styles/dashboard.css';
import { DashboardCard } from '../../components/dashboardCard';
import Cookies from 'js-cookie';
import AuthContext from '../../context/authContext';
import config  from '../../config';


const dashEnlaces = () => {
  const { authUser, setAuthUser, isAuthenticated, login, logout  } = useContext(AuthContext); /* Llamo a las variables del contexto. */


  

  return (
    <div className="dashboard-container">
      <header>
        
        <div className="header-right">
          <span>Accesos y Enlaces, {authUser}. </span>
        </div>
      </header>
      <main>
        <DashboardCard className='main-container' title={'Backups en Dropbox - Enlaces'} link={'DropboxBackup'} text = {'Enlace para realizar backups de embarcaciones en Dropbox.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Descarga de gestionar'} link={'Gestionar'} text = {'Enlace para que puedas descargar el soft Gestionar.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Sis de compras DYB'} link={'ComprasDyb'} text = {'Acceso al sistema de compras DYB.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Sis de compras Emepa'} link={'ComprasEmepa'} text = {'Acceso al sistema de compras Emepa.'} ></DashboardCard>
        <DashboardCard className='main-container' title={'Gestor de contraseñas'} link={'GestorDeContraseñas'} text = {'Para que guardes y administres tus contraseñas de forma segura.'} ></DashboardCard>
      </main>
    </div>
  );
};

export default dashEnlaces;
