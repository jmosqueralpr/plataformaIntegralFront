import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const formatCampaignYearLabel = (year) => {
  const shortYear = String(year).slice(-2);
  const nextYear = Number(shortYear) + 1;
  return `${shortYear}/${String(nextYear).padStart(2, '0')}`;
};

const normalizeAEnviar = (val) => {
  if (!val) return [];
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    const trimmed = val.trim();
    if (!trimmed) return [];
    return trimmed.split(/[\n;]+/).map(line => {
      const clean = line.trim();
      if (!clean) return null;
      return { nombre: clean, cantidad: 1, preparado: false };
    }).filter(Boolean);
  }
  return [];
};

const CampaignSummary = ({ campaigns, onSave, onAdd, newYear, setNewYear }) => {
  const sortedCampaigns = [...(campaigns || [])].sort((a, b) => b.anio - a.anio);
  const [campaign, setCampaign] = useState(() => sortedCampaigns[0] || null);
  const [aEnviarItems, setAEnviarItems] = useState([]);
  const [newItemNombre, setNewItemNombre] = useState('');
  const [newItemCantidad, setNewItemCantidad] = useState(1);

  useEffect(() => {
    setCampaign(sortedCampaigns[0] || null);
  }, [sortedCampaigns]);

  useEffect(() => {
    setAEnviarItems(normalizeAEnviar(campaign?.a_enviar));
  }, [campaign]);

  // Si hay campañas pero campaign es null (estado inicial), no renderizar aún
  if (campaigns?.length && !campaign) {
    return <div className="base-info-card campaign-card">Cargando campaña...</div>;
  }

  const addCampaignButtonLabel = newYear
    ? `+ Agregar campaña ${formatCampaignYearLabel(Number(newYear))}`
    : '+ Agregar campaña';

  if (!campaigns?.length) {
    return (
      <div className="base-info-card campaign-card campaign-empty">
        <div className="campaign-header-row">
          <div className="campaign-title-wrap">
            <span className="campaign-eyebrow">Resumen anual</span>
            <h3>Sin campañas creadas</h3>
          </div>
        </div>

        <div className="campaign-empty-content">
          <p>Esta base no tiene campañas registradas todavía.</p>
          <div className="campaign-empty-actions">
            <input
              type="number"
              placeholder="Año"
              value={newYear}
              min={2010}
              max={new Date().getFullYear() + 1}
              step={1}
              onChange={(e) => setNewYear(e.target.value)}
            />
            <button className="ais-btn-primary campaign-add-button" onClick={onAdd}>
              {addCampaignButtonLabel}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getValue = (field, fallback = '') => {
    const value = campaign?.[field];
    if (value === undefined || value === null) return fallback;
    return value;
  };

  const handleChange = (field, value) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const handleAEnviarChange = (index, field, value) => {
    setAEnviarItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const removeAEnviarItem = (index) => {
    setAEnviarItems(prev => prev.filter((_, i) => i !== index));
  };

  const addAEnviarItem = (e) => {
    if (e) e.preventDefault();
    const nombre = newItemNombre.trim();
    if (!nombre) return;
    setAEnviarItems(prev => [...prev, { nombre, cantidad: Number(newItemCantidad) || 1, preparado: false }]);
    setNewItemNombre('');
    setNewItemCantidad(1);
  };

  const handleNewItemKeyDown = (e) => {
    if (e.key === 'Enter') {
      addAEnviarItem(e);
    }
  };

  const buildPayload = () => {
    const payload = {
      ...campaign,
      necesidades_campania: campaign.necesidades_campania ?? campaign.tareas_a_realizar ?? '',
      a_enviar: aEnviarItems,
      tareas_ejecutadas: campaign.tareas_ejecutadas ?? '',
      tareas_pendientes: campaign.tareas_pendientes ?? campaign.tareas_proxima_campania ?? '',
      enviado: Boolean(campaign.enviado),
      tareas_a_realizar: campaign.necesidades_campania ?? campaign.tareas_a_realizar ?? '',
      elementos_entregados: aEnviarItems,
      tareas_proxima_campania: campaign.tareas_pendientes ?? campaign.tareas_proxima_campania ?? '',
    };

    return payload;
  };

  const handleSave = () => {
    if (onSave) onSave(buildPayload());
  };

  const confirmToggleEnviado = (nextValue) => {
    toast(
      ({ closeToast }) => (
        <div>
          <p style={{ marginBottom: 8 }}>
            {nextValue
              ? '¿Seguro que querés marcar esta campaña como enviada?'
              : '¿Seguro que querés desmarcar esta campaña como enviada?'}
          </p>

          <div style={{ display: 'flex', gap: 8 }}>
            <button
              className="ais-btn-small green"
              onClick={() => {
                closeToast();
                handleChange('enviado', nextValue);
              }}
            >
              {nextValue ? 'Marcar como enviado' : 'Desmarcar'}
            </button>

            <button className="ais-btn-small" onClick={closeToast}>
              Cancelar
            </button>
          </div>
        </div>
      ),
      { autoClose: false }
    );
  };

  return (
    <div className="base-info-card campaign-card">
      <div className="campaign-header-row">
        <div className="campaign-title-wrap">
          <span className="campaign-eyebrow">Resumen anual</span>
          <h3>Campaña {formatCampaignYearLabel(campaign.anio)}</h3>
        </div>

        <span className={`campaign-status-pill ${campaign.enviado ? 'sent' : 'pending'}`}>
          {campaign.enviado ? 'Enviado' : 'Envío pendiente'}
        </span>
      </div>

      <div className="campaign-panels-grid">
        <div className="campaign-panel-column">
          <div className="campaign-panel">
            <label>Necesidades de campaña</label>
            <textarea
              rows={3}
              value={getValue('necesidades_campania', getValue('tareas_a_realizar'))}
              onChange={(e) => handleChange('necesidades_campania', e.target.value)}
            />
          </div>

          <div className="campaign-panel">
            <label>Tareas ejecutadas</label>
            <textarea
              rows={3}
              value={getValue('tareas_ejecutadas')}
              onChange={(e) => handleChange('tareas_ejecutadas', e.target.value)}
            />
          </div>
        </div>

        <div className="campaign-panel-column">
          <div className="campaign-panel">
            <div className="campaign-panel-header">
              <label>A enviar en {formatCampaignYearLabel(campaign.anio + 1)}</label>
              <div className="campaign-send-toggle">
                <input
                  type="checkbox"
                  checked={Boolean(campaign.enviado)}
                  onChange={() => confirmToggleEnviado(!campaign.enviado)}
                />
                <span>Enviado</span>
              </div>
            </div>
            <div className="a-enviar-list">
              {aEnviarItems.length === 0 && (
                <div className="a-enviar-empty">No hay ítems para enviar</div>
              )}
              {aEnviarItems.map((item, index) => (
                <div key={index} className="a-enviar-item">
                  <input
                    type="checkbox"
                    className="a-enviar-preparado"
                    checked={item.preparado}
                    onChange={(e) => handleAEnviarChange(index, 'preparado', e.target.checked)}
                  />
                  <input
                    type="text"
                    className="a-enviar-nombre"
                    value={item.nombre}
                    onChange={(e) => handleAEnviarChange(index, 'nombre', e.target.value)}
                    onKeyDown={handleNewItemKeyDown}
                  />
                  <input
                    type="number"
                    className="a-enviar-cantidad"
                    min="1"
                    value={item.cantidad}
                    onChange={(e) => handleAEnviarChange(index, 'cantidad', Number(e.target.value) || 1)}
                    onKeyDown={handleNewItemKeyDown}
                  />
                  <button
                    type="button"
                    className="a-enviar-remove"
                    onClick={() => removeAEnviarItem(index)}
                    aria-label="Eliminar ítem"
                  >
                    ×
                  </button>
                </div>
              ))}
              <div className="a-enviar-add-row">
                <input
                  type="text"
                  className="a-enviar-add-nombre"
                  placeholder="Nombre del ítem"
                  value={newItemNombre}
                  onChange={(e) => setNewItemNombre(e.target.value)}
                  onKeyDown={handleNewItemKeyDown}
                />
                <input
                  type="number"
                  className="a-enviar-add-cantidad"
                  min="1"
                  placeholder="Cant."
                  value={newItemCantidad}
                  onChange={(e) => setNewItemCantidad(Number(e.target.value) || 1)}
                  onKeyDown={handleNewItemKeyDown}
                />
                <button type="button" className="ais-btn-small green a-enviar-add-btn" onClick={addAEnviarItem}>
                  + Agregar
                </button>
              </div>
            </div>
          </div>

          <div className="campaign-panel">
            <label>Tareas pendientes</label>
            <textarea
              rows={3}
              value={getValue('tareas_pendientes', getValue('tareas_proxima_campania'))}
              onChange={(e) => handleChange('tareas_pendientes', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="base-info-actions campaign-actions">
        <div className="actions-left">
          <input
            type="number"
            placeholder="Año"
            value={newYear}
            min={2010}
            max={new Date().getFullYear() + 1}
            step={1}
            onChange={(e) => setNewYear(e.target.value)}
          />

          <button className="ais-btn-primary campaign-add-button" onClick={onAdd}>
            {addCampaignButtonLabel}
          </button>
        </div>

        <div className="actions-right">
          <button className="ais-btn-primary" onClick={handleSave}>
            Guardar cambios
          </button>
        </div>
      </div>

      <div className="campaign-years">
        <div className="campaign-years-title">Seleccionar año de campaña</div>

        <div className="years-bar">
          {sortedCampaigns.map((c) => (
            <button
              key={c._id}
              className={`year-btn-small ${campaign._id === c._id ? 'active' : ''}`}
              onClick={() => setCampaign(c)}
            >
              {formatCampaignYearLabel(c.anio)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CampaignSummary;
