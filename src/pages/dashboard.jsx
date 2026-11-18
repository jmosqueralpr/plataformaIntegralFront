import React, { useContext, useEffect, useState } from 'react';
import '../styles/dashboard.css';
import { DashboardCard } from '../components/dashboardCard';
import AuthContext from '../context/authContext';
import {
  FiSend,
  FiSliders,
  FiZap,
  FiRadio,
  FiLink,
  FiCheckSquare,
  FiClock,
} from 'react-icons/fi';

const dashboardTips = [
  'Tip: revisá primero el historial de eventos antes de hacer cambios importantes.',
  'Tip: configurá tus alertas para no perder tareas ni vencimientos clave.',
  'Tip: desde configuración podés activar o desactivar tus ayudas del panel.',
  'Tip: usá el dashboard para entrar rápidamente a los módulos que más usás.',
];

const Dashboard = () => {
  const { authUser } = useContext(AuthContext);
  const [tipsEnabled, setTipsEnabled] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    const readPreferences = () => {
      try {
        const savedPreferences = JSON.parse(localStorage.getItem('dyb-user-preferences') || '{}');
        setTipsEnabled(Boolean(savedPreferences.dashboardTips));
      } catch {
        setTipsEnabled(false);
      }
    };

    readPreferences();
    window.addEventListener('storage', readPreferences);

    return () => {
      window.removeEventListener('storage', readPreferences);
    };
  }, []);

  const activeTip = tipsEnabled ? dashboardTips[Math.floor((Date.now() / 1000) % dashboardTips.length)] : null;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-title">
          <p className="dashboard-kicker">Workspace</p>
          <h1 className="dashboard-title">Dashboard</h1>
        </div>

        <div className="header-right">
          <span>Bienvenido, {authUser}</span>
        </div>
      </header>

      {activeTip && (
        <div className="dashboard-tip-banner" role="status" aria-live="polite">
          <span className="dashboard-tip-icon">✦</span>
          <span>{activeTip}</span>
        </div>
      )}

      <main className="dashboard-grid">
        <DashboardCard
          icon={FiSend}
          title="Asistente de Telegram"
          link="AsistenteTelegram"
          text="Acceso al asistente de Telegram."
        />
        <DashboardCard
          icon={FiSliders}
          title="Configuración de usuario"
          link="Configuration"
          text="Configurar los parámetros generales del usuario."
        />
        <DashboardCard
          icon={FiZap}
          title="Centro de soluciones"
          link="searchSolutions"
          text="Herramienta para ver y crear soluciones rápidas a tus problemas diarios."
        />
        <DashboardCard
          icon={FiRadio}
          title="Herramientas AIS"
          link="HerramientasAIS"
          text="Herramientas varias para sistemas AIS."
        />
        <DashboardCard
          icon={FiLink}
          title="Enlaces y Accesos"
          link="DashEnlaces"
          text="Enlaces y accesos a los diferentes sistemas de DYB."
        />
        <DashboardCard
          icon={FiCheckSquare}
          title="Task Manager"
          link="TaskManager"
          text="Herramienta para administrar tus tareas diarias."
        />
        <DashboardCard
          icon={FiClock}
          title="Registro de Vencimientos"
          link="ExpirationTracker"
          text="Gestionar vencimientos y avisos por Telegram."
        />
      </main>
    </div>
  );
};

export default Dashboard;

