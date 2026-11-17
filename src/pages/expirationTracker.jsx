import React, { useState, useEffect, useContext } from 'react';
import ExpirationCard from '../components/ExpirationCard';
import '../styles/expirationTracker.css';
import '../styles/global.css';
import AuthContext from '../context/authContext';
import config from '../../src/config';
import { toast } from 'react-toastify';

const emptyForm = (currentUser) => ({
  title: '',
  description: '',
  expirationDate: '',
  expirationTime: '',
  notify30DaysBefore: false,
  notify90DaysBefore: false,
  assignedTo: currentUser ? [currentUser] : [],
});

const normalizeAssignedUsers = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()];
  }

  return [];
};

const normalizeUserList = (data = []) =>
  data
    .map((user) => {
      if (typeof user === 'string') return user;
      return user?.username || user?.name || user?._id || null;
    })
    .filter(Boolean);

const ExpirationTracker = () => {
  const { authUser } = useContext(AuthContext);
  const currentUser = typeof authUser === 'string' ? authUser : authUser?.username || 'Usuario';

  const [items, setItems] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(true);

  const fetchExpirations = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/api/expirations`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setItems(data || []);
    } catch (error) {
      console.error('Error al obtener vencimientos:', error);
      toast.error('No se pudieron cargar los vencimientos.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${config.baseURL}/api/find-users`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAssignedUsers(normalizeUserList(data));
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    }
  };

  useEffect(() => {
    fetchExpirations();
    fetchUsers();
  }, []);

  const getStatus = (item) => {
    if (!item.expirationDate) return 'sin-fecha';

    const target = new Date(`${item.expirationDate}T${item.expirationTime || '00:00'}`);
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (target < now) return 'vencida';
    if (diffDays <= 30) return 'proxima';
    return 'activa';
  };

  const summary = {
    total: items.length,
    proximas: items.filter((item) => getStatus(item) === 'proxima').length,
    vencidas: items.filter((item) => getStatus(item) === 'vencida').length,
    activas: items.filter((item) => getStatus(item) === 'activa').length,
  };

  const filteredItems = [...items]
    .filter((item) => {
      const hayTermino = !searchTerm || `${item.title || ''} ${item.description || ''}`.toLowerCase().includes(searchTerm.toLowerCase());
      const hayEstado = statusFilter === 'todos' || getStatus(item) === statusFilter;
      return hayTermino && hayEstado;
    })
    .sort((a, b) => {
      const dateA = a.expirationDate ? new Date(`${a.expirationDate}T${a.expirationTime || '00:00'}`) : new Date(8640000000000000);
      const dateB = b.expirationDate ? new Date(`${b.expirationDate}T${b.expirationTime || '00:00'}`) : new Date(8640000000000000);
      return dateA - dateB;
    });

  const openModal = (item = null) => {
    if (!item) {
      setSelectedItem({ ...emptyForm(currentUser), _id: null });
      return;
    }

    setSelectedItem({
      ...item,
      assignedTo: normalizeAssignedUsers(item.assignedTo),
    });
  };

  const closeModal = () => setSelectedItem(null);

  const submitExpiration = async () => {
    if (!selectedItem?.title?.trim()) {
      toast.error('Ingresá un título para el vencimiento.');
      return;
    }

    if (!selectedItem.expirationDate) {
      toast.error('La fecha de vencimiento es obligatoria.');
      return;
    }

    const payload = {
      title: selectedItem.title.trim(),
      description: selectedItem.description || '',
      expirationDate: selectedItem.expirationDate,
      expirationTime: selectedItem.expirationTime || '',
      notified: false,
      notify30DaysBefore: Boolean(selectedItem.notify30DaysBefore),
      notify90DaysBefore: Boolean(selectedItem.notify90DaysBefore),
      assignedTo: normalizeAssignedUsers(selectedItem.assignedTo).length
        ? normalizeAssignedUsers(selectedItem.assignedTo)
        : [currentUser],
    };

    try {
      if (selectedItem._id) {
        const response = await fetch(`${config.baseURL}/api/expiration/${selectedItem._id}`, {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudo actualizar.');
        }

        const updatedItem = await response.json();
        setItems((prev) => prev.map((item) => (item._id === updatedItem._id ? updatedItem : item)));
        toast.success('Vencimiento actualizado correctamente.');
      } else {
        const response = await fetch(`${config.baseURL}/api/expiration`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudo crear.');
        }

        const createdItem = await response.json();
        setItems((prev) => [createdItem, ...prev]);
        toast.success('Vencimiento creado correctamente.');
      }

      closeModal();
    } catch (error) {
      console.error('Error al guardar vencimiento:', error);
      toast.error(error.message || 'No se pudo guardar el vencimiento.');
    }
  };

  const deleteExpiration = async (id) => {
    if (!window.confirm('¿Seguro que querés eliminar este vencimiento?')) return;

    try {
      const response = await fetch(`${config.baseURL}/api/expiration/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'No se pudo eliminar.');
      }

      setItems((prev) => prev.filter((item) => item._id !== id));
      closeModal();
      toast.info('Vencimiento eliminado.');
    } catch (error) {
      console.error('Error al eliminar vencimiento:', error);
      toast.error(error.message || 'No se pudo eliminar el vencimiento.');
    }
  };

  const toggleAssignedUser = (username) => {
    if (!selectedItem) return;

    const current = normalizeAssignedUsers(selectedItem.assignedTo);
    const exists = current.includes(username);

    setSelectedItem({
      ...selectedItem,
      assignedTo: exists ? current.filter((user) => user !== username) : [...current, username],
    });
  };

  const selectedAssignedUsers = selectedItem ? normalizeAssignedUsers(selectedItem.assignedTo) : [];
  const filteredAssignableUsers = (assignedUsers || [])
    .filter((user) => user.toLowerCase().includes((userSearchTerm || '').toLowerCase()))
    .filter((user) => !selectedAssignedUsers.includes(user))
    .slice(0, 8);

  return (
    <div className="expiration-tracker-container">
      <div className="expiration-header">
        <div>
          <p className="eyebrow">Seguimiento</p>
          <h1 className="expiration-title-header">Vencimientos</h1>
        </div>

        <button className="new-item-btn" onClick={() => openModal()}>
          + Nuevo vencimiento
        </button>
      </div>

      <div className="expiration-summary">
        <div className="summary-card primary">
          <span>Total</span>
          <strong>{summary.total}</strong>
        </div>
        <div className="summary-card warning">
          <span>Próximos</span>
          <strong>{summary.proximas}</strong>
        </div>
        <div className="summary-card danger">
          <span>Vencidas</span>
          <strong>{summary.vencidas}</strong>
        </div>
        <div className="summary-card success">
          <span>Activas</span>
          <strong>{summary.activas}</strong>
        </div>
      </div>

      <div className="expiration-toolbar">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar vencimiento o descripción"
          className="expiration-search"
        />

        <select className="expiration-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="todos">Todos</option>
          <option value="activa">Activas</option>
          <option value="proxima">Próximas</option>
          <option value="vencida">Vencidas</option>
        </select>
      </div>

      {loading ? (
        <div className="expiration-loading">Cargando vencimientos...</div>
      ) : filteredItems.length === 0 ? (
        <div className="empty-state">
          <h3>No hay vencimientos para mostrar</h3>
          <p>Creá tu primer registro para empezar a controlar licencias, servicios o alertas importantes.</p>
        </div>
      ) : (
        <div className="expiration-tracker-main">
          {filteredItems.map((item) => (
            <ExpirationCard key={item._id} item={item} onClick={() => openModal(item)} />
          ))}
        </div>
      )}

      {selectedItem && (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && closeModal()}>
          <div className="expiration-modal-content">
            <button className="modal-close" onClick={closeModal}>×</button>

            <div className="modal-topbar">
              <span className="modal-tag">{selectedItem._id ? 'Editar vencimiento' : 'Nuevo vencimiento'}</span>
            </div>

            <label className="field">
              <span>Título</span>
              <input
                type="text"
                value={selectedItem.title || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
                placeholder="Ej: Licencia Adobe Creative Cloud"
              />
            </label>

            <label className="field">
              <span>Descripción</span>
              <textarea
                value={selectedItem.description || ''}
                onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
                placeholder="Información útil, responsable, detalle extra..."
              />
            </label>

            <div className="field-row two-columns">
              <label className="field">
                <span>Fecha</span>
                <input
                  type="date"
                  value={selectedItem.expirationDate || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, expirationDate: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Hora</span>
                <input
                  type="time"
                  value={selectedItem.expirationTime || ''}
                  onChange={(e) => setSelectedItem({ ...selectedItem, expirationTime: e.target.value })}
                />
              </label>
            </div>

            <div className="toggle-grid">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={Boolean(selectedItem.notify30DaysBefore)}
                  onChange={(e) => setSelectedItem({ ...selectedItem, notify30DaysBefore: e.target.checked })}
                />
                <span>Notificar 30 días antes</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={Boolean(selectedItem.notify90DaysBefore)}
                  onChange={(e) => setSelectedItem({ ...selectedItem, notify90DaysBefore: e.target.checked })}
                />
                <span>Notificar 90 días antes</span>
              </label>
            </div>

            <div className="field">
              <span>Asignado a</span>

              <div className="selected-chip-list">
                {selectedAssignedUsers.length > 0 ? (
                  selectedAssignedUsers.map((user) => (
                    <button key={user} type="button" className="chip active" onClick={() => toggleAssignedUser(user)}>
                      {user} ×
                    </button>
                  ))
                ) : (
                  <span className="muted-text">Sin usuarios asignados</span>
                )}
              </div>

              <input
                type="text"
                value={userSearchTerm}
                onChange={(e) => setUserSearchTerm(e.target.value)}
                placeholder="Buscar usuario para agregar"
                className="user-search-input"
              />

              <div className="user-picker">
                {filteredAssignableUsers.length > 0 ? (
                  filteredAssignableUsers.map((user) => (
                    <button key={user} type="button" className="user-picker-item" onClick={() => toggleAssignedUser(user)}>
                      {user}
                    </button>
                  ))
                ) : (
                  <span className="muted-text">
                    {userSearchTerm ? 'No se encontraron usuarios' : 'Escribí para buscar usuarios'}
                  </span>
                )}
              </div>
            </div>

            <div className="modal-actions">
              <button className="secondary-btn" onClick={closeModal}>Cancelar</button>
              {selectedItem._id && (
                <button className="danger-btn" onClick={() => deleteExpiration(selectedItem._id)}>
                  Eliminar
                </button>
              )}
              <button className="primary-btn" onClick={submitExpiration}>
                {selectedItem._id ? 'Guardar cambios' : 'Crear vencimiento'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirationTracker;
