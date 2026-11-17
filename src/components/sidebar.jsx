import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/authContext';
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
