import React, { useContext, useEffect, useState } from 'react';
import '../styles/dashboard.css';
import { DashboardCard } from '../components/dashboardCard';
import AuthContext from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import {
  FiSend,
  FiSliders,
  FiZap,
  FiRadio,
  FiLink,
  FiCheckSquare,
  FiClock,
} from 'react-icons/fi';
import config from '../../src/config';

const dashboardTips = [
  'Tip: revisá primero el historial de eventos antes de hacer cambios importantes.',
  'Tip: configurá tus alertas para no perder tareas ni vencimientos clave.',
  'Tip: desde configuración podés activar o desactivar tus ayudas del panel.',
  'Tip: usá el dashboard para entrar rápidamente a los módulos que más usás.',
];

const Dashboard = () => {
  const { authUser, expirationSummary, setExpirationSummary, dismissedExpirationNotice, setDismissedExpirationNotice } = useContext(AuthContext);
  const navigate = useNavigate();
  const [tipsEnabled, setTipsEnabled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showFloating, setShowFloating] = useState(false);
  const [urgentExpiration, setUrgentExpiration] = useState(null);
  const [isVencido, setIsVencido] = useState(false);

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

  useEffect(() => {
    const loadExpirations = async () => {
      let summary = expirationSummary;

      if (!summary) {
        try {
          const res = await fetch(`${config.baseURL}/api/expirations/resumen`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
          });
          if (res.ok) {
            const data = await res.json();
            summary = {
              vencidos: data.vencidos || [],
              proximos: data.proximos || [],
              proximoMasUrgente:
                (data.vencidos?.length ? data.vencidos[0] : data.proximos?.[0]) || null,
            };
            setExpirationSummary(summary);
          }
        } catch (error) {
          console.error('Error al cargar vencimientos:', error);
        }
      }

      const vencidos = summary?.vencidos || [];
      const proximos = summary?.proximos || [];
      const vencido = vencidos.length > 0;
      const urgent = vencido ? vencidos[0] : proximos.length > 0 ? proximos[0] : null;

      setIsVencido(vencido);
      setUrgentExpiration(urgent);
      setShowBanner(Boolean(urgent));
      // Solo mostrar el flotante si el usuario no lo ha descartado previamente
      setShowFloating(Boolean(urgent) && !dismissedExpirationNotice);
    };

    loadExpirations();
  }, [expirationSummary, setExpirationSummary]);

  // Cierre automático del aviso flotante tras 7 segundos (y se guarda el descarte)
  useEffect(() => {
    if (!showFloating) return;
    const timer = setTimeout(() => {
      setShowFloating(false);
      localStorage.setItem('dyb-dismissed-expiration-notice', 'true');
      setDismissedExpirationNotice(true);
    }, 7000);
    return () => clearTimeout(timer);
  }, [showFloating, setDismissedExpirationNotice, dismissedExpirationNotice]);

  const goToExpirations = () => {
    navigate('/expirationTracker');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

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

      {urgentExpiration && showBanner && (
        <div
          className="dashboard-tip-banner dashboard-tip-banner--expiration"
          role="status"
          aria-live="polite"
          onClick={goToExpirations}
          style={{ cursor: 'pointer' }}
        >
          <span className="dashboard-tip-icon">{isVencido ? '⚠️' : '📆'}</span>
          <span>
            {isVencido
              ? `⚠️ Vencido: ${urgentExpiration.title} (${formatDate(urgentExpiration.expirationDate)})`
              : `📆 Próximo vencimiento: ${urgentExpiration.title} (${formatDate(urgentExpiration.expirationDate)})`}
          </span>
          <span className="dashboard-tip-action" onClick={(e) => {
            e.stopPropagation();
            goToExpirations();
          }}>
            Ir a vencimientos →
          </span>
        </div>
      )}

      {!urgentExpiration && activeTip && (
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

      {/* Aviso flotante inferior derecho (una vez por sesión) */}
      {showFloating && urgentExpiration && (
        <div
          className="expiration-notice"
          onClick={goToExpirations}
          role="alert"
          aria-label="Vencimiento próximo"
          style={{ cursor: 'pointer' }}
        >
          <div className="expiration-notice-content">
            <span className="expiration-notice-icon">{isVencido ? '⚠️' : '📆'}</span>
            <div className="expiration-notice-text">
              <strong>{isVencido ? 'Vencimiento pendiente' : 'Próximo vencimiento'}</strong>
              <span>{urgentExpiration.title}</span>
              <span>{formatDate(urgentExpiration.expirationDate)}</span>
            </div>
          </div>
          <button
            className="expiration-notice-close"
            onClick={(e) => {
              e.stopPropagation();
              localStorage.setItem('dyb-dismissed-expiration-notice', 'true');
              setDismissedExpirationNotice(true);
              setShowFloating(false);
            }}
            aria-label="Cerrar aviso"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

