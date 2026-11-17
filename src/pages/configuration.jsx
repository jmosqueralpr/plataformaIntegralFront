import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';
import '../styles/configuration.css';
import config from '../../src/config';
import { toast } from 'react-toastify';

// Datos de ejemplo simulados del servidor
const sampleUserData = [
  {
    dashboard: { access: true, order: 1 },
    settings: { access: false, order: 2 },
    profile: { access: true, order: 3 },
    taskManager: { access: false, order: 4 },
    bitWarden: { access: true, order: 5 },
    comprasHidrovia: { access: false, order: 6 },
    comprasEmepa: { access: false, order: 7 },
    comprasDYB: { access: true, order: 8 },
    gpsUnitsConverter: { access: true, order: 9 },
    guiaLinternista: { access: true, order: 10 },
    downloadGestionar: { access: true, order: 11 },
    _id: '67a23cad8e40067eec9d99e1',
    user: {
      _id: '678158e8effa3d11d25f5265',
      username: 'prueba',
      email: 'prueba@gmail.com',
      password: '$2a$10$QViAjvRNsQoKVsyFDEHyj.Kz0OalWbuEozVxGdjkxgAakKuvhqRiK',
      createdAt: '2025-01-10T17:29:12.083Z',
      updatedAt: '2025-01-10T17:29:12.083Z',
      __v: 0,
      role: 'admin',
    },
    createdAt: '2025-02-04T16:13:33.581Z',
    updatedAt: '2025-02-04T16:13:33.581Z',
    __v: 0,
  },
];

const STORAGE_KEY = 'dyb-user-preferences';

const CONFIG_STORAGE_AVATAR_KEY = 'dyb-user-avatar';

const Configuration = () => {
  const navigate = useNavigate();
  const { isAuthenticated, authUser, setUserAvatar } = useContext(AuthContext);
  const [newEmail, setNewEmail] = useState('');
  const [currentProfile, setCurrentProfile] = useState(null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rNewPassword, setRNewPassword] = useState('');
  const [isSavingEmail, setIsSavingEmail] = useState(false);
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [preferences, setPreferences] = useState({
    emailAlerts: true,
    taskReminders: true,
    dashboardTips: false,
  });

  const displayName = authUser && authUser !== 'invitado' ? authUser : (currentProfile?.username || 'Usuario');
  const profileRole = currentProfile?.role || 'user';
  const roleLabel = profileRole.toLowerCase().includes('admin') ? 'Administrador' : 'Usuario';
  const isAdminUser = profileRole.toLowerCase().includes('admin');
  const initials = displayName
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'U';

  useEffect(() => {
    const fallbackEmail = sampleUserData[0]?.user?.email || '';
    setNewEmail(fallbackEmail);

    const savedAvatar = localStorage.getItem(CONFIG_STORAGE_AVATAR_KEY) || '';
    if (savedAvatar) {
      setAvatarPreview(savedAvatar);
    }

    const savedPreferences = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    setPreferences((prev) => ({
      ...prev,
      ...savedPreferences,
    }));

    if (!isAuthenticated) return;

    const fetchProfile = async () => {
      try {
        const response = await fetch(`${config.baseURL}/api/profile`, {
          method: 'GET',
          credentials: 'include',
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo cargar el perfil.');

        setCurrentProfile(data);
        if (data.email) {
          setNewEmail(data.email);
        }
        if (data.avatar) {
          localStorage.setItem(CONFIG_STORAGE_AVATAR_KEY, data.avatar);
          setAvatarPreview(data.avatar);
        }
      } catch (error) {
        toast.error(error.message || 'No se pudo cargar el perfil.');
      }
    };

    fetchProfile();
  }, [isAuthenticated]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  const togglePreference = (key) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Seleccioná un archivo de imagen válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      const result = String(reader.result || '');

      try {
        const response = await fetch(`${config.baseURL}/api/profile/avatar`, {
          method: 'PUT',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ avatar: result }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.message || 'No se pudo guardar la foto.');

        localStorage.setItem(CONFIG_STORAGE_AVATAR_KEY, result);
        setAvatarPreview(result);
        setUserAvatar(result);
        toast.success('Foto de perfil actualizada.');
      } catch (error) {
        toast.error(error.message || 'No se pudo guardar la foto.');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = async () => {
    try {
      const response = await fetch(`${config.baseURL}/api/profile/avatar`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: '' }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo quitar la foto.');

      localStorage.removeItem(CONFIG_STORAGE_AVATAR_KEY);
      setAvatarPreview('');
      setUserAvatar('');
      toast.info('Se eliminó la foto de perfil.');
    } catch (error) {
      toast.error(error.message || 'No se pudo quitar la foto.');
    }
  };

  const handleChangeEmail = async (e) => {
    e.preventDefault();
    const trimmedEmail = newEmail.trim();

    if (!trimmedEmail || !/\S+@\S+\.\S+/.test(trimmedEmail)) {
      toast.error('Ingresá un email válido antes de guardar.');
      return;
    }

    setIsSavingEmail(true);

    try {
      const response = await fetch(`${config.baseURL}/api/change-email`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: trimmedEmail }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo cambiar el email.');

      toast.success('El correo electrónico se actualizó correctamente.');
    } catch (error) {
      toast.error(error.message || 'No se pudo cambiar el email.');
    } finally {
      setIsSavingEmail(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();

    if (!oldPassword || !newPassword || !rNewPassword) {
      toast.error('Completá la contraseña actual, la nueva y la confirmación.');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== rNewPassword) {
      toast.error('Las contraseñas nuevas no coinciden.');
      return;
    }

    setIsSavingPassword(true);

    try {
      const response = await fetch(`${config.baseURL}/api/change-password`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'No se pudo cambiar la contraseña.');

      toast.success('La contraseña se actualizó correctamente.');
      setOldPassword('');
      setNewPassword('');
      setRNewPassword('');
    } catch (error) {
      toast.error(error.message || 'No se pudo cambiar la contraseña.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="configuration-container">
        <header className="config-header config-header-locked">
          <div>
            <p className="config-kicker">Acceso</p>
            <h1 className="config-page-title">Configuración de la cuenta</h1>
          </div>
        </header>
        <main className="configuration-main locked-state">
          <div className="config-card empty-state-card">
            <h3>Iniciá sesión para continuar</h3>
            <p>Necesitás una sesión activa para ver y modificar los datos de tu cuenta.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="configuration-container">
      <header className="config-header">
        <div>
          <p className="config-kicker">Cuenta</p>
          <h1 className="config-page-title">Configuración de la cuenta</h1>
        </div>

        <div className="config-header-actions">
          {isAdminUser && (
            <button type="button" className="save-button secondary" onClick={() => navigate('/userManagement')}>
              Administración de usuarios
            </button>
          )}
          <div className="config-user-badge">
            <span className="config-user-dot" aria-hidden="true" />
            <span>{displayName}</span>
          </div>
        </div>
      </header>

      <main className="configuration-main">
        <section className="config-card config-profile-summary">
          <div className="config-profile-hero">
            <div className="config-avatar" aria-label="Avatar del usuario">
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar del usuario" className="config-avatar-image" />
              ) : (
                initials
              )}
            </div>
            <div className="config-profile-copy">
              <p className="config-section-label">Perfil</p>
              <h2>{displayName}</h2>
              <div className="config-role-row">
                <span className="role-pill">{roleLabel}</span>
                <span className="status-pill">Sesión activa</span>
              </div>
              <div className="avatar-actions">
                <label className="avatar-upload-button">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} />
                  Cambiar foto
                </label>
                {avatarPreview && (
                  <button type="button" className="avatar-remove-button" onClick={handleRemoveAvatar}>
                    Quitar foto
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="config-summary-grid">
            <div className="summary-stat">
              <span className="summary-label">Correo</span>
              <strong>{newEmail || 'No cargado'}</strong>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Acceso</span>
              <strong>{roleLabel}</strong>
            </div>
            <div className="summary-stat">
              <span className="summary-label">Estado</span>
              <strong>Online</strong>
            </div>
          </div>
        </section>

        <section className="config-card">
          <div className="config-card-header">
            <div>
              <p className="config-section-label">Perfil</p>
              <h3>Datos personales</h3>
            </div>
          </div>

          <form onSubmit={handleChangeEmail} className="user-form">
            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>

            <button type="submit" className="save-button" disabled={isSavingEmail}>
              {isSavingEmail ? 'Guardando...' : 'Guardar email'}
            </button>
          </form>
        </section>

        <section className="config-card">
          <div className="config-card-header">
            <div>
              <p className="config-section-label">Seguridad</p>
              <h3>Cambiar contraseña</h3>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="user-form">
            <div className="form-group">
              <label htmlFor="oldPassword">Contraseña actual</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                placeholder="••••••••"
              />

              <label htmlFor="newPassword">Nueva contraseña</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
              />

              <label htmlFor="rNewPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="rNewPassword"
                name="rNewPassword"
                value={rNewPassword}
                onChange={(e) => setRNewPassword(e.target.value)}
                placeholder="Repetir contraseña"
              />
            </div>

            <button type="submit" className="save-button secondary" disabled={isSavingPassword}>
              {isSavingPassword ? 'Actualizando...' : 'Actualizar contraseña'}
            </button>
          </form>
        </section>

        <section className="config-card">
          <div className="config-card-header">
            <div>
              <p className="config-section-label">Preferencias</p>
              <h3>Notificaciones</h3>
            </div>
          </div>

          <div className="preferences-list">
            <button
              type="button"
              className={`pref-toggle ${preferences.emailAlerts ? 'active' : ''}`}
              onClick={() => togglePreference('emailAlerts')}
            >
              <span>Alertas por email</span>
              <span className="toggle-indicator" aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`pref-toggle ${preferences.taskReminders ? 'active' : ''}`}
              onClick={() => togglePreference('taskReminders')}
            >
              <span>Recordatorios de tareas</span>
              <span className="toggle-indicator" aria-hidden="true" />
            </button>

            <button
              type="button"
              className={`pref-toggle ${preferences.dashboardTips ? 'active' : ''}`}
              onClick={() => togglePreference('dashboardTips')}
            >
              <span>Tips del panel</span>
              <span className="toggle-indicator" aria-hidden="true" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
};

export default Configuration;