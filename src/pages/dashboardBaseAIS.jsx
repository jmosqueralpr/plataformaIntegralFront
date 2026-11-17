import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';
import config from '../config';
import { toast } from 'react-toastify';

import '../styles/dashboardBaseAIS.css';

const DashboardBaseAIS = () => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBaseId, setEditingBaseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const [newBase, setNewBase] = useState({
    nombre_base: '',
    tipo_base: 'Temporal',
    descripcion_base: '',
    nombre_comunicante: '',
    tel_comunicante: '',
    descripcion_ais_rx: '',
    descripcion_ais_tx: '',
  });

  const { authUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchBases = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/api/bases`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error();

      const data = await response.json();
      setBases(data);
    } catch {
      toast.error('No se pudieron cargar las bases AIS');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBases();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('modal-open', showModal);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [showModal]);

  /* ======================
     CREAR NUEVA BASE
  ======================= */

  const resetBaseForm = () => {
    setNewBase({
      nombre_base: '',
      tipo_base: 'Temporal',
      descripcion_base: '',
      nombre_comunicante: '',
      tel_comunicante: '',
      descripcion_ais_rx: '',
      descripcion_ais_tx: '',
    });
    setEditingBaseId(null);
  };

  const openCreateBaseModal = () => {
    resetBaseForm();
    setShowModal(true);
  };

  const openEditBaseModal = (base) => {
    setEditingBaseId(base._id);
    setNewBase({
      nombre_base: base.nombre_base || '',
      tipo_base: base.tipo_base || 'Temporal',
      descripcion_base: base.descripcion_base || '',
      nombre_comunicante: base.nombre_comunicante || '',
      tel_comunicante: base.tel_comunicante || '',
      descripcion_ais_rx: base.descripcion_ais_rx || '',
      descripcion_ais_tx: base.descripcion_ais_tx || '',
    });
    setShowModal(true);
  };

  const saveBase = async () => {
    if (!newBase.nombre_base || !newBase.tipo_base) {
      toast.error('Nombre y tipo de base son obligatorios');
      return;
    }

    const confirmMessage = editingBaseId
      ? `¿Confirmás la actualización de la base "${newBase.nombre_base}"?`
      : `¿Confirmás la creación de la base "${newBase.nombre_base}"?`;

    const confirm = window.confirm(confirmMessage);
    if (!confirm) return;

    try {
      const url = editingBaseId
        ? `${config.baseURL}/api/base/${editingBaseId}`
        : `${config.baseURL}/api/base`;

      const method = editingBaseId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBase),
      });

      if (!response.ok) throw new Error();

      const updatedBase = await response.json();
      toast.success(editingBaseId ? 'Base actualizada correctamente' : 'Base creada correctamente');
      setShowModal(false);
      resetBaseForm();

      if (editingBaseId) {
        setBases((prev) =>
          prev.map((base) => (base._id === editingBaseId ? updatedBase : base))
        );
      } else {
        fetchBases();
      }
    } catch {
      toast.error(editingBaseId ? 'Error al actualizar la base' : 'Error al crear la base');
    }
  };

  const deleteBase = async (baseToDelete) => {
    if (!baseToDelete?._id) return;

    const confirmed = window.confirm(
      `¿Seguro que querés eliminar la base "${baseToDelete.nombre_base}"?`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/base/${baseToDelete._id}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) throw new Error();

      setBases((prev) => prev.filter((base) => base._id !== baseToDelete._id));
      toast.success('Base eliminada correctamente');
    } catch {
      toast.error('No se pudo eliminar la base');
    }
  };

  const filteredBases = bases.filter((base) => {
    const hayCoincidenciaTexto =
      !searchTerm ||
      `${base.nombre_base || ''} ${base.descripcion_base || ''} ${base.nombre_comunicante || ''}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

    const hayCoincidenciaTipo =
      typeFilter === 'all' ||
      (base.tipo_base || 'Temporal').toLowerCase() === typeFilter;

    return hayCoincidenciaTexto && hayCoincidenciaTipo;
  });

  const totalBases = bases.length;
  const totalPermanentes = bases.filter(
    (base) => base.tipo_base?.toLowerCase() === 'permanente'
  ).length;
  const totalTemporales = bases.filter(
    (base) => base.tipo_base?.toLowerCase() !== 'permanente'
  ).length;

  return (
    <div className="ais-dashboard-container">
      <div className="ais-dashboard-header">
        <div>
          <p className="ais-dashboard-kicker">Gestión operativa</p>
          <h1 className="ais-dashboard-title">Bases AIS</h1>
        </div>

        <button
          className="ais-btn-primary"
          onClick={openCreateBaseModal}
        >
          + Nueva Base
        </button>
      </div>

      <div className="ais-dashboard-summary">
        <div className="ais-summary-card">
          <span className="ais-summary-label">Total</span>
          <strong>{totalBases}</strong>
          <small>bases registradas</small>
        </div>
        <div className="ais-summary-card permanent">
          <span className="ais-summary-label">Permanentes</span>
          <strong>{totalPermanentes}</strong>
          <small>operativas fijas</small>
        </div>
        <div className="ais-summary-card temporary">
          <span className="ais-summary-label">Temporales</span>
          <strong>{totalTemporales}</strong>
          <small>de uso puntual</small>
        </div>
      </div>

      <div className="ais-dashboard-toolbar">
        <input
          className="ais-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Buscar base, comunicante o descripción..."
        />

        <select
          className="ais-filter-select"
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
        >
          <option value="all">Todas</option>
          <option value="permanente">Permanentes</option>
          <option value="temporal">Temporales</option>
        </select>
      </div>

      {loading ? (
        <div className="ais-loading-state">Cargando bases...</div>
      ) : (
        <div className="ais-base-grid">
          {filteredBases.length === 0 ? (
            <div className="ais-empty-state">
              <h3>No se encontraron bases</h3>
              <p>Probá cambiar el texto o el filtro para volver a ver resultados.</p>
            </div>
          ) : (
            filteredBases.map((base) => (
              <div
                key={base._id}
                className="ais-base-card"
                onClick={() => navigate(`/BaseAIS/${base._id}`)}
              >
                <div className="ais-base-header">
                  <span
                    className={`ais-base-type ${
                      base.tipo_base?.toLowerCase() === 'permanente'
                        ? 'permanente'
                        : 'temporal'
                    }`}
                  >
                    {base.tipo_base?.toUpperCase() || 'TEMPORAL'}
                  </span>

                  <span className="ais-base-status">
                    {base.tipo_base?.toLowerCase() === 'permanente' ? 'Activa' : 'Ciclo'}
                  </span>

                  <div className="ais-card-actions">
                    <button
                      className="ais-edit-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        openEditBaseModal(base);
                      }}
                      aria-label={`Editar ${base.nombre_base}`}
                      title="Editar base"
                    >
                      Editar
                    </button>

                    <button
                      className="ais-delete-btn"
                      onClick={(event) => {
                        event.stopPropagation();
                        deleteBase(base);
                      }}
                      aria-label={`Eliminar ${base.nombre_base}`}
                      title="Eliminar base"
                    >
                      ×
                    </button>
                  </div>
                </div>

                <h3 className="ais-base-name">{base.nombre_base}</h3>

                <p className="ais-base-description">
                  {base.descripcion_base || 'Sin descripción cargada.'}
                </p>

                <div className="ais-base-meta">
                  <div>
                    <span className="ais-meta-label">Comunicante</span>
                    <strong>
                      {base.nombre_comunicante || 'No asignado'}
                    </strong>
                  </div>
                  <div>
                    <span className="ais-meta-label">Tel.</span>
                    <strong>{base.tel_comunicante || '-'}</strong>
                  </div>
                </div>

                <div className="ais-base-footer">
                  <span>Ver detalle</span>
                  <span className="ais-base-arrow">→</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ======================
           MODAL NUEVA BASE
      ======================= */}
      {showModal && (
        <div
          className="modalOverlay"
          onMouseDown={(e) => {
            if (e.target.classList.contains('modalOverlay')) {
              setShowModal(false);
            }
          }}
        >
          <div className="modalContent">
            <button
              className="modalClose"
              onClick={() => setShowModal(false)}
            >
              ×
            </button>

            <h2 className="modal-title">{editingBaseId ? 'Editar Base AIS' : 'Nueva Base AIS'}</h2>

            <div className="modal-field-block">
              <label htmlFor="baseNombre">Nombre de la base</label>
              <input
                id="baseNombre"
                className="modal-text-box"
                placeholder="Ej: Bricolaje - Base principal"
                value={newBase.nombre_base}
                onChange={(e) =>
                  setNewBase({ ...newBase, nombre_base: e.target.value })
                }
              />
            </div>

            <div className="modal-field-block">
              <label htmlFor="baseTipo">Tipo de base</label>
              <select
                id="baseTipo"
                className="modal-text-box"
                value={newBase.tipo_base}
                onChange={(e) =>
                  setNewBase({ ...newBase, tipo_base: e.target.value })
                }
              >
                <option value="Temporal">Temporal</option>
                <option value="Permanente">Permanente</option>
              </select>
            </div>

            <div className="modal-field-block">
              <label htmlFor="baseDescripcion">Descripción</label>
              <textarea
                id="baseDescripcion"
                className="modal-text-box"
                placeholder="Descripción general de la base"
                value={newBase.descripcion_base}
                onChange={(e) =>
                  setNewBase({ ...newBase, descripcion_base: e.target.value })
                }
              />
            </div>

            <div className="modal-field-row">
              <div className="modal-field-block">
                <label htmlFor="baseComunicante">Comunicante</label>
                <input
                  id="baseComunicante"
                  className="modal-text-box"
                  placeholder="Nombre del comunicante"
                  value={newBase.nombre_comunicante}
                  onChange={(e) =>
                    setNewBase({ ...newBase, nombre_comunicante: e.target.value })
                  }
                />
              </div>

              <div className="modal-field-block">
                <label htmlFor="baseTelefono">Teléfono</label>
                <input
                  id="baseTelefono"
                  className="modal-text-box"
                  placeholder="Teléfono"
                  value={newBase.tel_comunicante}
                  onChange={(e) =>
                    setNewBase({ ...newBase, tel_comunicante: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="modal-field-block">
              <label htmlFor="baseRx">Descripción AIS RX</label>
              <textarea
                id="baseRx"
                className="modal-text-box"
                placeholder="Detalle del flujo de recepción"
                value={newBase.descripcion_ais_rx}
                onChange={(e) =>
                  setNewBase({ ...newBase, descripcion_ais_rx: e.target.value })
                }
              />
            </div>

            <div className="modal-field-block">
              <label htmlFor="baseTx">Descripción AIS TX</label>
              <textarea
                id="baseTx"
                className="modal-text-box"
                placeholder="Detalle del flujo de transmisión"
                value={newBase.descripcion_ais_tx}
                onChange={(e) =>
                  setNewBase({ ...newBase, descripcion_ais_tx: e.target.value })
                }
              />
            </div>

            <button className="ais-btn-primary" onClick={saveBase}>
              {editingBaseId ? 'Guardar cambios' : 'Crear Base'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBaseAIS;
