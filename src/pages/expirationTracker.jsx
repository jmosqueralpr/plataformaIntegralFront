import { useState, useEffect, useContext } from 'react';
import ExpirationCard from '../components/ExpirationCard';
import '../styles/expirationTracker.css';
import AuthContext from '../context/authContext';
import config from '../../src/config';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';
import { FiFile } from 'react-icons/fi';

const emptyForm = (currentUser) => ({
  title: '',
  description: '',
  expirationDate: '',
  expirationTime: '10:00',
  reminders: {
    onExpiration: true,
    tenDaysBefore: true,
    customDaysBefore: null
  },
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
  const [originalItem, setOriginalItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [loading, setLoading] = useState(true);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [exportType, setExportType] = useState('todos');
  const [exportDateFrom, setExportDateFrom] = useState('');
  const [exportDateTo, setExportDateTo] = useState('');

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

    const target = new Date(`${item.expirationDate}T${item.expirationTime || '10:00'}`);
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
      const dateA = a.expirationDate ? new Date(`${a.expirationDate}T${a.expirationTime || '10:00'}`) : new Date(8640000000000000);
      const dateB = b.expirationDate ? new Date(`${b.expirationDate}T${b.expirationTime || '10:00'}`) : new Date(8640000000000000);
      return dateA - dateB;
    });

  const openModal = (item = null) => {
    if (!item) {
      const newItem = { ...emptyForm(currentUser), _id: null };
      setSelectedItem(newItem);
      setOriginalItem(newItem);
      return;
    }

    const normalizedItem = {
      ...item,
      assignedTo: normalizeAssignedUsers(item.assignedTo),
    };
    setSelectedItem(normalizedItem);
    setOriginalItem(normalizedItem);
  };

  const hasUnsavedChanges = () => {
    if (!selectedItem || !originalItem) return false;

    const fields = [
      'title',
      'description',
      'expirationDate',
      'expirationTime',
      'reminders',
      'assignedTo',
    ];

    return fields.some((field) => {
      const a = selectedItem[field];
      const b = originalItem[field];

      if (Array.isArray(a) && Array.isArray(b)) {
        return JSON.stringify(a.sort()) !== JSON.stringify(b.sort());
      }

      if (field === 'reminders' && typeof a === 'object' && typeof b === 'object') {
        return JSON.stringify(a) !== JSON.stringify(b);
      }

      return a !== b;
    });
  };

  const handleCloseModal = () => {
    if (hasUnsavedChanges()) {
      setShowUnsavedDialog(true);
      return;
    }
    setSelectedItem(null);
    setOriginalItem(null);
  };

  const handleSaveAndExit = async () => {
    try {
      await submitExpiration();
      // Cerrar ambos estados explícitamente después de guardar exitosamente
      setShowUnsavedDialog(false);
      setSelectedItem(null);
      setOriginalItem(null);
    } catch {
      // submitExpiration ya muestra el toast de error.
      // Mantener ambos abiertos para que el usuario pueda reintentar.
    }
  };

  const submitExpiration = async () => {
    if (!selectedItem?.title?.trim()) {
      toast.error('Ingresá un título para el vencimiento.');
      return;
    }

    if (!selectedItem.expirationDate) {
      toast.error('La fecha de vencimiento es obligatoria.');
      return;
    }

    const reminders = selectedItem.reminders || { onExpiration: true, tenDaysBefore: true, customDaysBefore: null };

    const payload = {
      title: selectedItem.title.trim(),
      description: selectedItem.description || '',
      expirationDate: selectedItem.expirationDate,
      expirationTime: selectedItem.expirationTime || '10:00',
      reminders: {
        onExpiration: reminders.onExpiration ?? true,
        tenDaysBefore: reminders.tenDaysBefore ?? true,
        customDaysBefore: reminders.customDaysBefore ?? null
      },
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

      setOriginalItem(null);
      handleCloseModal();
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
      handleCloseModal();
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

  const isVencido = (item) => {
    if (!item.expirationDate) return false;
    const target = new Date(`${item.expirationDate}T${item.expirationTime || '10:00'}`);
    return target < new Date();
  };

  const formatDateForExcel = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const getExportTitle = () => {
    const formatDate = (d) => d.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    if (exportType === 'vencidos') return 'Vencimientos vencidos';
    if (exportType === 'rango' && exportDateFrom && exportDateTo) {
      return `Vencimientos entre ${formatDate(new Date(exportDateFrom))} - ${formatDate(new Date(exportDateTo))}`;
    }
    return 'Vencimientos';
  };

  const generateExcelExport = () => {
    let itemsToExport = [...items].filter((item) => item.expirationDate);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (exportType === "vencidos") {
      itemsToExport = itemsToExport.filter((item) => {
        const expDate = new Date(`${item.expirationDate}T${item.expirationTime || "10:00"}`);
        expDate.setHours(0, 0, 0, 0);
        return expDate < today;
      });
    } else if (exportType === "rango" && exportDateFrom && exportDateTo) {
      const from = new Date(exportDateFrom);
      from.setHours(0, 0, 0, 0);
      const to = new Date(exportDateTo);
      to.setHours(23, 59, 59, 999);
      itemsToExport = itemsToExport.filter((item) => {
        const expDate = new Date(`${item.expirationDate}T${item.expirationTime || "10:00"}`);
        return expDate >= from && expDate <= to;
      });
    }

    itemsToExport.sort((a, b) => {
      const aVencido = isVencido(a);
      const bVencido = isVencido(b);
      if (aVencido && !bVencido) return -1;
      if (!aVencido && bVencido) return 1;
      const dateA = a.expirationDate ? new Date(`${a.expirationDate}T${a.expirationTime || "10:00"}`) : new Date(0);
      const dateB = b.expirationDate ? new Date(`${b.expirationDate}T${b.expirationTime || "10:00"}`) : new Date(0);
      return dateA - dateB;
    });

const getRowColor = (item) => {
      if (!item.expirationDate) return "#FFFFFF";
      const expDate = new Date(`${item.expirationDate}T${item.expirationTime || "10:00"}`);
      expDate.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) return "#FFC7CE"; // Vencido - rojo
      if (diffDays <= 10) return "#FFEB9C"; // Próximo a vencer (10 días) - amarillo
      return "#C6EFCE"; // Más de 10 días - verde
    };

    const title = getExportTitle();
    const aoa = [
      [title, "", ""],
      ["Fecha de vencimiento", "T�tulo", "Descripci�n"],
    ];

    itemsToExport.forEach((item) => {
      aoa.push([
        formatDateForExcel(item.expirationDate),
        item.title || "",
        item.description || "",
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(aoa);

ws["!cols"] = [
      { wpx: 20 },
      { wpx: 35 },
      { wpx: 45 },
    ];

    ws["!merges"] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
    ];

    const titleCell = ws["A1"];
    if (titleCell) {
      titleCell.s = {
        font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
        alignment: { horizontal: "center", vertical: "center" },
        fill: { patternType: "solid", fgColor: { rgb: "F3F4F6" } },
      };
    }

    const headerStyle = {
      font: { bold: true, sz: 11, color: { rgb: "374151" } },
      fill: { patternType: "solid", fgColor: { rgb: "E5E7EB" } },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "9CA3AF" } },
        bottom: { style: "thin", color: { rgb: "9CA3AF" } },
        left: { style: "thin", color: { rgb: "9CA3AF" } },
        right: { style: "thin", color: { rgb: "9CA3AF" } },
      },
    };

    ["A2", "B2", "C2"].forEach((cell) => {
      if (ws[cell]) ws[cell].s = headerStyle;
    });

    itemsToExport.forEach((item, index) => {
      const rowIndex = index + 3;
      const color = getRowColor(item).replace("#", "");
      const rowStyle = {
        fill: { patternType: "solid", fgColor: { rgb: color } },
        border: {
          top: { style: "thin", color: { rgb: "E5E7EB" } },
          bottom: { style: "thin", color: { rgb: "E5E7EB" } },
          left: { style: "thin", color: { rgb: "E5E7EB" } },
          right: { style: "thin", color: { rgb: "E5E7EB" } },
        },
      };
      ["A", "B", "C"].forEach((col) => {
        const cellRef = `${col}${rowIndex}`;
        if (ws[cellRef]) ws[cellRef].s = rowStyle;
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));

    XLSX.writeFile(wb, "vencimientos.xlsx");
    setShowExportDialog(false);
    toast.success("Excel de vencimientos generado correctamente.");
  };


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

        <button className="new-item-btn" onClick={() => { setExportType('todos'); setExportDateFrom(''); setExportDateTo(''); setShowExportDialog(true); }} style={{ marginLeft: 12 }}>
          <FiFile size={16} /> Exportar a Excel
        </button>
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
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && handleCloseModal()}>
          <div className="expiration-modal-content">
            <button type="button" className="modal-close" onClick={handleCloseModal} aria-label="Cerrar">×</button>

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

            {selectedItem._id && selectedItem.updatedAt && (
              <label className="field field-readonly">
                <span>Última modificación</span>
                <input
                  type="text"
                  value={new Date(selectedItem.updatedAt).toLocaleString('es-AR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                  readOnly
                  disabled
                />
              </label>
            )}

            <div className="toggle-grid">
              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={Boolean(selectedItem.reminders?.tenDaysBefore)}
                  onChange={(e) => setSelectedItem({ 
                    ...selectedItem, 
                    reminders: { ...selectedItem.reminders, tenDaysBefore: e.target.checked }
                  })}
                />
                <span>Notificar 10 días antes (default)</span>
              </label>

              <label className="toggle-row">
                <input
                  type="checkbox"
                  checked={Boolean(selectedItem.reminders?.customDaysBefore)}
                  onChange={(e) => setSelectedItem({ 
                    ...selectedItem, 
                    reminders: { ...selectedItem.reminders, customDaysBefore: e.target.checked ? 15 : null }
                  })}
                />
                <span>Notificar también</span>
              </label>

              {selectedItem.reminders?.customDaysBefore && (
                <label className="field" style={{gridColumn: '1 / -1'}}>
                  <span>Días personalizado</span>
                  <input
                    type="number"
                    min="1"
                    max="365"
                    value={selectedItem.reminders.customDaysBefore}
                    onChange={(e) => setSelectedItem({ 
                      ...selectedItem, 
                      reminders: { ...selectedItem.reminders, customDaysBefore: parseInt(e.target.value) || null }
                    })}
                    placeholder="Ej: 15"
                    style={{width: '80px'}}
                  />
                </label>
              )}
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
              <button className="secondary-btn" onClick={handleCloseModal}>Cancelar</button>
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

      {/* Diálogo de cambios sin guardar */}
      {showUnsavedDialog && (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setShowUnsavedDialog(false)}>
          <div className="expiration-modal-content unsaved-dialog">
            <div className="modal-topbar">
              <span className="modal-tag">Cambios sin guardar</span>
            </div>
            <p className="unsaved-message">
              Hacé cambios que aún no se guardaron. ¿Querés guardarlos antes de salir?
            </p>
            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => { setShowUnsavedDialog(false); }}>Seguir editando</button>
              <button className="secondary-btn" onClick={() => { setShowUnsavedDialog(false); setSelectedItem(null); setOriginalItem(null); }}>Descartar y salir</button>
              <button className="primary-btn" onClick={handleSaveAndExit}>Guardar y salir</button>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de exportación a Excel */}
      {showExportDialog && (
        <div className="modal-overlay" onMouseDown={(event) => event.target === event.currentTarget && setShowExportDialog(false)}>
          <div className="expiration-modal-content export-dialog">
            <div className="modal-topbar">
              <span className="modal-tag">Exportar a Excel</span>
            </div>
            <p className="export-message">
              ¿Qué vencimientos querés exportar?
            </p>
            <div className="export-options">
              <button
                className={`export-option ${exportType === 'todos' ? 'active' : ''}`}
                onClick={() => { setExportType('todos'); setExportDateFrom(''); setExportDateTo(''); }}
              >
                Todos los vencimientos
              </button>
              <button
                className={`export-option ${exportType === 'vencidos' ? 'active' : ''}`}
                onClick={() => { setExportType('vencidos'); setExportDateFrom(''); setExportDateTo(''); }}
              >
                Solo vencidos
              </button>
              <button
                className={`export-option ${exportType === 'rango' ? 'active' : ''}`}
                onClick={() => { setExportType('rango'); }}
              >
                Rango de fechas
              </button>
            </div>

            {exportType === 'rango' && (
              <div className="export-date-range">
                <label className="field">
                  <span>Desde</span>
                  <input type="date" value={exportDateFrom} onChange={(e) => setExportDateFrom(e.target.value)} />
                </label>
                <label className="field">
                  <span>Hasta</span>
                  <input type="date" value={exportDateTo} onChange={(e) => setExportDateTo(e.target.value)} />
                </label>
              </div>
            )}

            <div className="modal-actions">
              <button className="secondary-btn" onClick={() => setShowExportDialog(false)}>Cancelar</button>
              <button className="primary-btn" onClick={generateExcelExport}>Exportar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirationTracker;

/*
====================================================================
EXPIRATION MANAGER - DOCUMENTACIÓN TÉCNICA Y VERSIONADO
====================================================================

--------------------------------------------------------------------
📋 CHECKLIST OBLIGATORIO AL TRABAJAR EN EXPIRATION TRACKER
--------------------------------------------------------------------
CADA VEZ que modifiques este módulo, verificá:

[ ] 1. Backend compila sin errores (npm run dev en Back/)
[ ] 2. Frontend compila sin errores (npm run dev en Front/)
[ ] 3. Migración de BD considerada si cambia modelo (scripts/migrate-*.js)
[ ] 4. Variables .env actualizadas en Back/.env (SMTP, MONGO, etc.)
[ ] 5. Tests manuales: crear/editar/borrar vencimiento en Front
[ ] 6. Test Telegram: /crear_vencimiento → flujo completo → confirmación
[ ] 7. Test Job: revisar logs "⏰ Verificando vencimientos..." cada hora
[ ] 8. Test Email: revisar consola "[EMAIL MOCK] →" o envío real
[ ] 9. Test /mis_alertas en Telegram: toggles funcionan
[ ] 10. Actualizar ESTE comentario con versión y cambios

--------------------------------------------------------------------
📦 HISTORIAL DE VERSIONES
--------------------------------------------------------------------
v2.0.0 (2026-11-24) - REFACTOR COMPLETO "Smart Defaults + 1 Custom"
--------------------------------------------------------------------
IMPLEMENTADO EN ESTA SESIÓN:

BACKEND:
✅ Modelo Expiration simplificado (expiration.model.js)
   - reminders: { onExpiration:Boolean, tenDaysBefore:Boolean, customDaysBefore:Number }
   - sentReminders[]: log unificado { type, sentAt, channel, recipients }
   - Eliminados 7 flags duplicados (notifyX + notifiedX)

✅ Schema Zod actualizado (expiration.schema.js)

✅ Controller + Routes (expiration.controller.js / expiration.routes.js)
   - CRUD adaptado a nueva estructura reminders
   - NUEVO: GET/PUT /api/users/me/notification-preferences

✅ User model: notificationPreferences { telegram:Boolean, email:Boolean }

✅ Servicio Email NUEVO (services/email/email.service.js)
   - Nodemailer con SMTP (Gmail/Brevo/Outlook/etc)
   - MOCK automático si SMTP_PASS=PENDIENTE_APP_PASSWORD
   - Plantilla HTML responsive + texto plano

✅ Job unificado (services/telegram/jobs/expirationsReminder.jobs.js)
   - checkReminders(task, now): evalúa 3 casos (vencido, 10d, custom)
   - Envía Telegram + Email en paralelo según preferencias usuario
   - Actualiza sentReminders atomically

✅ Telegram Bot (services/telegram/telegram.js)
   - Flujo CREAR ULTRA-SIMPLE: **3 pasos**
     Título → Desc(opc, `-`) → Fecha (AAAAMMDD) → **✅ Auto-creado**
     - Asigna automáticamente al usuario que lo crea
     - Sin hora (auto 10:00)
     - Sin config recordatorios (default: 10d + al vencer)
     - Sin confirmación (crea directo)
     - Formato fecha: 8 dígitos (ej: 20251231)
   - NUEVO comando /mis_alertas: lista con toggles Telegram/Email por tarea
   - NUEVO /ver_vencimientos: paginado con filtros inline [Vencidos][Próximos][Activos][Todos]
   - Callback exp_alerts_<id> + exp_toggle_tg/email_<id>
   - Eliminados: callbacks exp_remind_*, confirm_expiration_create, cancel_expiration_create, step assignees

✅ Script migración (scripts/migrate-expirations.js)
   - Transforma notify7/30/90 + notified* → reminders + sentReminders
   - Idempotente, con backup recomendado

✅ Config .env (Back/.env) - Placeholders listos

FRONTEND:
✅ Modal simplificado (expirationTracker.jsx)
   - 1 toggle "☑️ 10 días antes (default)" 
   - 1 checkbox "Notificar también" → muestra input "Días personalizado (1-365)"
   - Validación payload adapta reminders object

✅ ExpirationCard (ExpirationCard.jsx)
   - Badge "Alertas: 10d • 15d" / "10d" / "venc"

--------------------------------------------------------------------
⏭️ PRÓXIMOS PASOS (PENDIENTES PARA PRÓXIMA SESIÓN)
--------------------------------------------------------------------
1. EJECUTAR MIGRACIÓN BD:
   cd Back && node scripts/migrate-expirations.js
   (Hacer backup mongodump antes)

2. CONFIGURAR EMAIL REAL:
   - Crear/usar Gmail: alertas.plataforma.integral@gmail.com
   - Activar 2FA → Generar App Password (16 chars)
   - Editar Back/.env: SMTP_PASS=tu_app_password_sin_espacios
   - Reiniciar backend

3. TESTING COMPLETO:
   [ ] Crear vencimiento por Front → verificar BD
   [ ] Crear vencimiento por Telegram → flujo **3 pasos**: Título → Desc(`-`) → AAAAMMDD → ✅ Auto (asigna a uno mismo)
   [ ] Verificar job logs: "⏰ Verificando..." + "✅ Recordatorio X enviado"
   [ ] Verificar email mock en consola: "[EMAIL MOCK] → user@domain | Asunto"
   [ ] Probar /mis_alertas en Telegram → toggles persisten
   [ ] Probar /ver_vencimientos → filtros funcionan
   [ ] Editar vencimiento existente → reminders se actualizan
   [ ] Borrar vencimiento → limpieza OK

4. DEPLOY:
   - Verificar variables de entorno en producción
   - Ejecutar migración en BD producción
   - Reiniciar servicios

--------------------------------------------------------------------
🔮 MEJORAS FUTURAS (BACKLOG PRIORIZADO)
--------------------------------------------------------------------
ALTA:
[ ] Recordatorios recurrentes (ej: "cada lunes hasta que se resuelva")
[ ] Escalamiento: si no "visto" en 24h → reenviar + cc manager
[ ] Digest semanal opcional (resumen vencimientos de la semana)

MEDIA:
[ ] Webhooks email (open/click/bounce) via Brevo/SendGrid
[ ] Integración Calendar (ICS attach + Google/Outlook link)
[ ] Métricas dashboard: entregabilidad, aperturas, resueltas vs vencidas
[ ] Slack/Teams webhook como canal extra
[ ] Reglas por tipo: "licencias 30d", "servicios 7d", "dominios 60d"

BAJA:
[ ] Multi-idioma plantillas (ES/EN/PT)
[ ] Adjuntar PDF/contrato en recordatorio (Multer + GridFS)
[ ] Approval flow: "¿Renovar licencia X?" → botones Sí/No → webhook externo

====================================================================
*/
