import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import AuthContext from '../context/authContext';
import '../styles/sidebar.css';

const sidebarLinks = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/DashboardBaseAIS', label: 'Base AIS' },
  { to: '/taskManager', label: 'Tareas' },
  { to: '/expirationTracker', label: 'Vencimientos' },
  { to: '/searchSolutions', label: 'Soluciones' },
  { to: '/configuration', label: 'Configuración' },
];

const Sidebar = () => {
  const { authUser, userAvatar } = useContext(AuthContext);

  const avatarSrc = userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent((authUser || 'Usuario').toString())}&background=2563eb&color=fff&bold=true&length=2`;

  return (
    <aside className="sidebar">
      <div className="sidebar-profile">
        <img src={avatarSrc} alt="Avatar del usuario" className="sidebar-avatar" />
        <div className="sidebar-user-meta">
          <span className="sidebar-user-label">Usuario</span>
          <strong>{authUser || 'Invitado'}</strong>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Navegación principal">
        {sidebarLinks.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;
