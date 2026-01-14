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

  /* ======================
     CREAR NUEVA BASE
  ======================= */

  const createBase = async () => {
    if (!newBase.nombre_base || !newBase.tipo_base) {
      toast.error('Nombre y tipo de base son obligatorios');
      return;
    }

    const confirm = window.confirm(
      `¿Confirmás la creación de la base "${newBase.nombre_base}"?`
    );
    if (!confirm) return;

    try {
      const response = await fetch(`${config.baseURL}/api/base`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBase),
      });

      if (!response.ok) throw new Error();

      toast.success('Base creada correctamente');
      setShowModal(false);
      setNewBase({
        nombre_base: '',
        tipo_base: 'Temporal',
        descripcion_base: '',
        nombre_comunicante: '',
        tel_comunicante: '',
        descripcion_ais_rx: '',
        descripcion_ais_tx: '',
      });
      fetchBases();
    } catch {
      toast.error('Error al crear la base');
    }
  };

  return (
    <div className="ais-dashboard-container">
      {/* Header */}
      <div className="ais-dashboard-header">
        <h1 className="ais-dashboard-title">BASES AIS</h1>

        <button
          className="ais-btn-primary"
          onClick={() => setShowModal(true)}
        >
          Nueva Base
        </button>
      </div>

      {/* Listado */}
      {loading ? (
        <p>Cargando bases...</p>
      ) : (
        <div className="ais-base-grid">
          {bases.map((base) => (
            <div
              key={base._id}
              className="ais-base-card"
              onClick={() => navigate(`/BaseAIS/${base._id}`)}
            >
              <h3 className="ais-base-name">{base.nombre_base}</h3>
              <span
                className={`ais-base-type ${
                  base.tipo_base.toLowerCase() === 'permanente'
                    ? 'permanente'
                    : 'temporal'
                }`}
              >
                {base.tipo_base.toUpperCase()}
              </span>
            </div>
          ))}
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

            <h2 className="modal-title">Nueva Base AIS</h2>

            <input
              className="modal-text-box"
              placeholder="Nombre de la base"
              value={newBase.nombre_base}
              onChange={(e) =>
                setNewBase({ ...newBase, nombre_base: e.target.value })
              }
            />

            <select
              className="modal-text-box"
              value={newBase.tipo_base}
              onChange={(e) =>
                setNewBase({ ...newBase, tipo_base: e.target.value })
              }
            >
              <option value="Temporal">Temporal</option>
              <option value="Permanente">Permanente</option>
            </select>

            <textarea
              className="modal-text-box"
              placeholder="Descripción de la base"
              value={newBase.descripcion_base}
              onChange={(e) =>
                setNewBase({ ...newBase, descripcion_base: e.target.value })
              }
            />

            <input
              className="modal-text-box"
              placeholder="Nombre del comunicante"
              value={newBase.nombre_comunicante}
              onChange={(e) =>
                setNewBase({ ...newBase, nombre_comunicante: e.target.value })
              }
            />

            <input
              className="modal-text-box"
              placeholder="Teléfono del comunicante"
              value={newBase.tel_comunicante}
              onChange={(e) =>
                setNewBase({ ...newBase, tel_comunicante: e.target.value })
              }
            />

            <textarea
              className="modal-text-box"
              placeholder="Descripción AIS RX"
              value={newBase.descripcion_ais_rx}
              onChange={(e) =>
                setNewBase({ ...newBase, descripcion_ais_rx: e.target.value })
              }
            />

            <textarea
              className="modal-text-box"
              placeholder="Descripción AIS TX"
              value={newBase.descripcion_ais_tx}
              onChange={(e) =>
                setNewBase({ ...newBase, descripcion_ais_tx: e.target.value })
              }
            />

            <button className="ais-btn-primary" onClick={createBase}>
              Crear Base
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBaseAIS;
