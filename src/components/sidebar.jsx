import { useContext, useEffect, useState } from 'react';
import { FiSend } from 'react-icons/fi';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/authContext';
import config from '../config';
import '../styles/sidebar.css';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard', icon: '▣' },
  { to: '/DashboardBaseAIS', label: 'Base AIS', icon: '◫' },
  { to: '/taskManager', label: 'Tareas', icon: '✓' },
  { to: '/expirationTracker', label: 'Vencimientos', icon: '⏰' },
  { to: '/searchSolutions', label: 'Soluciones', icon: '⌕' },
  { to: '/configuration', label: 'Configuración', icon: '⚙' },
];

const Sidebar = () => {
  const { authUser, userAvatar } = useContext(AuthContext);
  const [isAdministrator, setIsAdministrator] = useState(false);

  useEffect(() => {
    let active = true;

    const checkAdministratorRole = async () => {
      try {
        const response = await fetch(`${config.baseURL}/api/profile`, { credentials: 'include' });
        if (!response.ok) {
          if (response.status !== 401 && response.status !== 403) {
            console.error(`No se pudo verificar el rol de usuario: HTTP ${response.status}`);
          }
          return;
        }

        const profile = await response.json();
        const role = String(profile.role || '').trim().toLowerCase().replace(/[_\s]+/g, '');
        if (active) setIsAdministrator(role === 'admin' || role === 'superadmin');
      } catch (error) {
        console.error('Error al verificar el acceso administrativo:', error.message);
      }
    };

    checkAdministratorRole();
    return () => {
      active = false;
    };
  }, []);

  const avatarSrc = userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((authUser || 'Usuario').toString())}&background=2563eb&color=fff&bold=true&length=2`;
  const roleLabel = authUser && authUser !== 'invitado' ? 'Activo' : 'Invitado';

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <img src={avatarSrc} alt="Avatar del usuario" className="sidebar-avatar" />
        <div className="sidebar-user-meta">
          <span className="sidebar-user-label">Usuario</span>
          <strong>{authUser || 'Invitado'}</strong>
          <span className="sidebar-role-badge">{roleLabel}</span>
        </div>
      </div>

      {isAdministrator && (
        <NavLink
          to="/telegramMessages"
          className={({ isActive }) => `sidebar-admin-action ${isActive ? 'active' : ''}`}
        >
          <FiSend className="sidebar-admin-icon" aria-hidden="true" />
          <span>Mensajes Telegram</span>
          <span className="sidebar-admin-badge">Admin</span>
        </NavLink>
      )}

      <div className="sidebar-section-title">Panel</div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            <span className="sidebar-link-icon" aria-hidden="true">{link.icon}</span>
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
