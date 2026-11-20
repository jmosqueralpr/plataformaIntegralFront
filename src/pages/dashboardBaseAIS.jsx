import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext';
import config from '../config';
import { toast } from 'react-toastify';
import * as XLSX from 'xlsx';

import '../styles/dashboardBaseAIS.css';

const DashboardBaseAIS = () => {
  const [bases, setBases] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBaseId, setEditingBaseId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Export modal state
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportYear, setExportYear] = useState(new Date().getFullYear());
  const [exportLoading, setExportLoading] = useState(false);
  const [availableYears, setAvailableYears] = useState([]);

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

  const descripcionBaseRef = useRef(null);
  const descripcionAisRxRef = useRef(null);
  const descripcionAisTxRef = useRef(null);

  const resizeTextarea = (ref) => {
    if (ref.current) {
      ref.current.style.height = 'auto';
      const scrollHeight = ref.current.scrollHeight;
      ref.current.style.height = `${Math.max(50, scrollHeight)}px`;
    }
  };

  const autoResize = (e) => {
    const el = e.target;
    el.style.height = 'auto';
    const scrollHeight = el.scrollHeight;
    el.style.height = `${Math.max(50, scrollHeight)}px`;
  };

  useEffect(() => {
    if (showModal) {
      resizeTextarea(descripcionBaseRef);
      resizeTextarea(descripcionAisRxRef);
      resizeTextarea(descripcionAisTxRef);
    }
  }, [showModal, newBase]);

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

  // Fetch available years from campaigns across all bases
  const fetchAvailableYears = async () => {
    try {
      const yearSet = new Set();
      for (const base of bases) {
        const response = await fetch(`${config.baseURL}/api/base-anual/${base._id}`, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
          const campaigns = await response.json();
          campaigns.forEach(c => yearSet.add(c.anio));
        }
      }
      const years = Array.from(yearSet).sort((a, b) => b - a);
      setAvailableYears(years);
      if (years.length > 0 && !years.includes(exportYear)) {
        setExportYear(years[0]);
      }
    } catch (error) {
      console.error('Error fetching available years:', error);
    }
  };

  // Fetch all campaigns for a specific year across all bases
  const fetchCampaignsByYear = async (year) => {
    const allItems = [];
    for (const base of bases) {
      const response = await fetch(`${config.baseURL}/api/base-anual/${base._id}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const campaigns = await response.json();
        const campaign = campaigns.find(c => c.anio === year);
        if (campaign && campaign.a_enviar && campaign.a_enviar.length > 0) {
          campaign.a_enviar.forEach(item => {
            allItems.push({
              base: base.nombre_base,
              elemento: item.nombre,
              cantidad: item.cantidad || 1,
            });
          });
        }
      }
    }
    return allItems;
  };

  // Generate Excel export
  const generateExcelExport = async () => {
    if (!exportYear) {
      toast.warning('Seleccioná un año');
      return;
    }

    setExportLoading(true);
    try {
      const items = await fetchCampaignsByYear(exportYear);

      if (items.length === 0) {
        toast.warning(`No hay elementos a enviar para la campaña ${String(exportYear).slice(-2)}/${String(Number(String(exportYear).slice(-2)) + 1).toString().padStart(2, '0')}`);
        setExportLoading(false);
        return;
      }

      // Format year for title (e.g., 2025 -> "25/26")
      const shortYear = String(exportYear).slice(-2);
      const nextYear = Number(shortYear) + 1;
      const campaignLabel = `${shortYear}/${String(nextYear).padStart(2, '0')}`;

      // Items are sent at end of NEXT year (campaign 25/26 -> sent end of 2026)
      const sendYear = exportYear + 1;
      const title = `Enviar en ${sendYear} (${campaignLabel})`;

      const aoa = [
        [title, "", ""],
        ["Base", "Elemento a enviar", "Cantidad"],
      ];

      items.forEach(item => {
        aoa.push([item.base, item.elemento, item.cantidad]);
      });

      const ws = XLSX.utils.aoa_to_sheet(aoa);

      ws["!cols"] = [
        { wpx: 200 },  // Base
        { wpx: 300 },  // Elemento a enviar
        { wpx: 80 },   // Cantidad
      ];

      ws["!merges"] = [
        { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },
      ];

      // Style title cell
      const titleCell = ws["A1"];
      if (titleCell) {
        titleCell.s = {
          font: { bold: true, sz: 14, color: { rgb: "1F2937" } },
          alignment: { horizontal: "center", vertical: "center" },
          fill: { patternType: "solid", fgColor: { rgb: "F3F4F6" } },
        };
      }

      // Style header row
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

      // Style data rows
      items.forEach((_, index) => {
        const rowIndex = index + 3;
        const rowStyle = {
          fill: { patternType: "solid", fgColor: { rgb: index % 2 === 0 ? "F9FAFB" : "FFFFFF" } },
          border: {
            top: { style: "thin", color: { rgb: "E5E7EB" } },
            bottom: { style: "thin", color: { rgb: "E5E7EB" } },
            left: { style: "thin", color: { rgb: "E5E7EB" } },
            right: { style: "thin", color: { rgb: "E5E7EB" } },
          },
          alignment: { vertical: "center" },
        };
        ["A", "B", "C"].forEach((col) => {
          const cellRef = `${col}${rowIndex}`;
          if (ws[cellRef]) ws[cellRef].s = rowStyle;
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, `AEnviar_${exportYear}`);

      XLSX.writeFile(wb, `elementos_a_enviar_${exportYear}.xlsx`);
      setShowExportModal(false);
      toast.success(`Excel de elementos a enviar (${campaignLabel}) generado correctamente.`);
    } catch (error) {
      console.error('Error generating Excel:', error);
      toast.error('No se pudo generar el Excel');
    } finally {
      setExportLoading(false);
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
          <p className="ais-dashboard-kicker">Herramientas AIS</p>
          <h1 className="ais-dashboard-title">Información de Bases AIS</h1>
        </div>

        <div className="ais-dashboard-actions">
          <button
            className="ais-btn-secondary"
            onClick={() => {
              fetchAvailableYears();
              setShowExportModal(true);
            }}
            disabled={exportLoading}
          >
            📊 Exportar a enviar
          </button>
          <button
            className="ais-btn-primary"
            onClick={openCreateBaseModal}
          >
            + Nueva Base
          </button>
        </div>
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
                ref={descripcionBaseRef}
                id="baseDescripcion"
                className="modal-text-box"
                placeholder="Descripción general de la base"
                value={newBase.descripcion_base}
                onChange={(e) => {
                  setNewBase({ ...newBase, descripcion_base: e.target.value });
                  autoResize(e);
                }}
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
                ref={descripcionAisRxRef}
                id="baseRx"
                className="modal-text-box"
                placeholder="Detalle del flujo de recepción"
                value={newBase.descripcion_ais_rx}
                onChange={(e) => {
                  setNewBase({ ...newBase, descripcion_ais_rx: e.target.value });
                  autoResize(e);
                }}
              />
            </div>

            <div className="modal-field-block">
              <label htmlFor="baseTx">Descripción AIS TX</label>
              <textarea
                ref={descripcionAisTxRef}
                id="baseTx"
                className="modal-text-box"
                placeholder="Detalle del flujo de transmisión"
                value={newBase.descripcion_ais_tx}
                onChange={(e) => {
                  setNewBase({ ...newBase, descripcion_ais_tx: e.target.value });
                  autoResize(e);
                }}
              />
            </div>

            <button className="ais-btn-primary" onClick={saveBase}>
              {editingBaseId ? 'Guardar cambios' : 'Crear Base'}
            </button>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal-overlay" onClick={() => setShowExportModal(false)}>
          <div className="modal-content export-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-topbar">
              <span className="modal-tag">Exportar a Excel</span>
            </div>
            <p className="export-message">
              Seleccioná la campaña para exportar los elementos a enviar
            </p>

            <div className="export-field">
              <label>Año de campaña</label>
              <select
                value={exportYear}
                onChange={(e) => setExportYear(Number(e.target.value))}
                disabled={exportLoading}
                className="export-select"
              >
                {availableYears.map(year => (
                  <option key={year} value={year}>
                    {String(year).slice(-2)}/${String(Number(String(year).slice(-2)) + 1).toString().padStart(2, '0')}
                  </option>
                ))}
                {availableYears.length === 0 && (
                  <option value="" disabled>
                    No hay campañas disponibles
                  </option>
                )}
              </select>
            </div>

            <div className="modal-actions">
              <button className="ais-btn-secondary" onClick={() => setShowExportModal(false)} disabled={exportLoading}>
                Cancelar
              </button>
              <button className="ais-btn-primary" onClick={generateExcelExport} disabled={exportLoading || availableYears.length === 0}>
                {exportLoading ? 'Generando...' : 'Exportar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardBaseAIS;
