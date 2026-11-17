import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../config';
import '../styles/configuration.css';

const emptyForm = {
  username: '',
  email: '',
  password: '',
  role: 'user',
  phone: '',
};

const normalizeRole = (role = 'user') => {
  const value = String(role || 'user').trim();
  if (!value) return 'user';

  const sanitized = value.toLowerCase().replace(/[_\s]+/g, '');
  const map = {
    superadmin: 'superAdmin',
    admin: 'admin',
    manager: 'manager',
    coordinator: 'coordinator',
    technician: 'technician',
    user: 'user',
    guest: 'guest',
  };

  return map[sanitized] || 'user';
};

const formatRole = (role) => {
  const normalized = normalizeRole(role);

  const labels = {
    superAdmin: 'Super admin',
    admin: 'Administrador',
    manager: 'Manager',
    coordinator: 'Coordinador',
    technician: 'Técnico',
    user: 'Usuario',
    guest: 'Invitado',
  };

  return labels[normalized] || 'Usuario';
};

const isAdminRole = (role) => {
  const normalized = normalizeRole(role);
  return normalized === 'admin' || normalized === 'superAdmin';
};

const UserManagement = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeletingId, setIsDeletingId] = useState(null);

  const fetchCurrentUser = async () => {
    const response = await fetch(`${config.baseURL}/api/profile`, {
      method: 'GET',
      credentials: 'include',
    });

    const profile = await response.json();
    if (!response.ok) {
      throw new Error(profile.message || 'No se pudo cargar el perfil.');
    }

    setCurrentUser(profile);
    return profile;
  };

  const loadUsers = async () => {
    const response = await fetch(`${config.baseURL}/api/admin/users`, {
      method: 'GET',
      credentials: 'include',
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'No se pudieron cargar los usuarios.');
    }

    setUsers(data || []);
  };

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const profile = await fetchCurrentUser();

        if (!isAdminRole(profile.role)) {
          return;
        }

        await loadUsers();
      } catch (error) {
        toast.error(error.message || 'Error al cargar la administración de usuarios.');
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, [navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.username.trim() || !form.email.trim()) {
      toast.error('Completá nombre de usuario y email.');
      return;
    }

    if (!editingId && !form.password.trim()) {
      toast.error('La contraseña es obligatoria para crear un usuario.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        username: form.username.trim(),
        email: form.email.trim(),
        role: normalizeRole(form.role),
        phone: form.phone.trim(),
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      const url = editingId
        ? `${config.baseURL}/api/admin/users/${editingId}`
        : `${config.baseURL}/api/admin/users`;

      const response = await fetch(url, {
        method: editingId ? 'PUT' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo guardar el usuario.');
      }

      toast.success(editingId ? 'Usuario actualizado correctamente.' : 'Usuario creado correctamente.');
      resetForm();
      await loadUsers();
    } catch (error) {
      toast.error(error.message || 'No se pudo guardar el usuario.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setForm({
      username: user.username,
      email: user.email,
      password: '',
      role: normalizeRole(user.role),
      phone: user.phone || '',
    });
  };

  const handleDelete = async (userId, username) => {
    const confirmed = window.confirm(`¿Seguro que querés eliminar a ${username}?`);
    if (!confirmed) return;

    setIsDeletingId(userId);

    try {
      const response = await fetch(`${config.baseURL}/api/admin/users/${userId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo eliminar el usuario.');
      }

      toast.success('Usuario eliminado correctamente.');
      await loadUsers();
      if (editingId === userId) {
        resetForm();
      }
    } catch (error) {
      toast.error(error.message || 'No se pudo eliminar el usuario.');
    } finally {
      setIsDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="configuration-container">
        <div className="config-card empty-state-card">
          <h3>Cargando administración...</h3>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="configuration-container">
        <div className="config-card empty-state-card">
          <h3>Necesitás iniciar sesión.</h3>
        </div>
      </div>
    );
  }

  if (!isAdminRole(currentUser.role)) {
    return (
      <div className="configuration-container">
        <header className="config-header config-header-locked">
          <div>
            <p className="config-kicker">Acceso</p>
            <h1 className="config-page-title">Administración de usuarios</h1>
          </div>
        </header>
        <main className="configuration-main locked-state">
          <div className="config-card empty-state-card">
            <h3>Acceso restringido</h3>
            <p>Solo un usuario administrador puede crear, editar o eliminar usuarios del sistema.</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="configuration-container">
      <header className="config-header">
        <div>
          <p className="config-kicker">Administración</p>
          <h1 className="config-page-title">Usuarios del sistema</h1>
        </div>

        <button type="button" className="save-button secondary" onClick={() => navigate('/configuration')}>
          Volver a perfil
        </button>
      </header>

      <main className="configuration-main">
        <section className="config-card">
          <div className="config-card-header">
            <div>
              <p className="config-section-label">Gestión</p>
              <h3>{editingId ? 'Editar usuario' : 'Crear usuario'}</h3>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="user-form">
            <div className="form-group">
              <label htmlFor="user-username">Usuario</label>
              <input id="user-username" name="username" value={form.username} onChange={handleChange} placeholder="Nombre de usuario" />

              <label htmlFor="user-email">Email</label>
              <input id="user-email" type="email" name="email" value={form.email} onChange={handleChange} placeholder="usuario@ejemplo.com" />

              <label htmlFor="user-password">Contraseña</label>
              <input id="user-password" type="password" name="password" value={form.password} onChange={handleChange} placeholder={editingId ? 'Dejar vacío para conservar la actual' : 'Mínimo 6 caracteres'} />

              <label htmlFor="user-phone">Teléfono</label>
              <input id="user-phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+54 11 1234 5678" />

              <label htmlFor="user-role">Rol</label>
              <select id="user-role" name="role" value={form.role} onChange={handleChange} className="admin-select">
                <option value="admin">Administrador</option>
                <option value="superAdmin">Super admin</option>
                <option value="manager">Manager</option>
                <option value="coordinator">Coordinador</option>
                <option value="technician">Técnico</option>
                <option value="user">Usuario</option>
                <option value="guest">Invitado</option>
              </select>
            </div>

            <div className="admin-action-row">
              <button type="submit" className="save-button" disabled={isSubmitting}>
                {isSubmitting ? 'Guardando...' : editingId ? 'Guardar cambios' : 'Crear usuario'}
              </button>

              {editingId && (
                <button type="button" className="save-button secondary" onClick={resetForm}>
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="config-card">
          <div className="config-card-header">
            <div>
              <p className="config-section-label">Listado</p>
              <h3>Usuarios registrados</h3>
            </div>
          </div>

          <div className="user-list">
            {users.length === 0 ? (
              <div className="empty-state-card no-border">
                <h3>No hay usuarios cargados.</h3>
              </div>
            ) : (
              users.map((user) => (
                <div key={user.id} className="user-list-item">
                  <div className="user-main-info">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                    <span>{user.phone || 'Sin teléfono'}</span>
                  </div>

                  <div className="user-meta">
                    <span className="role-pill">{formatRole(user.role)}</span>
                  </div>

                  <div className="admin-action-row compact-actions">
                    <button type="button" className="save-button secondary" onClick={() => handleEdit(user)}>
                      Editar
                    </button>
                    <button type="button" className="delete-button" onClick={() => handleDelete(user.id, user.username)} disabled={isDeletingId === user.id}>
                      {isDeletingId === user.id ? 'Eliminando...' : 'Eliminar'}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default UserManagement;
