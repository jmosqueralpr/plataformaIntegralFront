import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const formatCampaignYearLabel = (year) => {
  const shortYear = String(year).slice(-2);
  const nextYear = Number(shortYear) + 1;
  return `${shortYear}/${String(nextYear).padStart(2, '0')}`;
};

const CampaignSummary = ({ campaigns, onSave, onAdd, newYear, setNewYear }) => {
  if (!campaigns.length) return null;

  const sortedCampaigns = [...campaigns].sort((a, b) => b.anio - a.anio);
  const [campaign, setCampaign] = useState(sortedCampaigns[0]);

  useEffect(() => {
    setCampaign(sortedCampaigns[0]);
  }, [campaigns]);

  const getValue = (field, fallback = '') => {
    const value = campaign?.[field];
    if (value === undefined || value === null) return fallback;
    return value;
  };

  const handleChange = (field, value) => {
    setCampaign((prev) => ({ ...prev, [field]: value }));
  };

  const buildPayload = () => {
    const payload = {
      ...campaign,
      necesidades_campania: campaign.necesidades_campania ?? campaign.tareas_a_realizar ?? '',
      a_enviar: campaign.a_enviar ?? campaign.elementos_entregados ?? '',
      tareas_ejecutadas: campaign.tareas_ejecutadas ?? '',
      tareas_pendientes: campaign.tareas_pendientes ?? campaign.tareas_proxima_campania ?? '',
      enviado: Boolean(campaign.enviado),
      tareas_a_realizar: campaign.necesidades_campania ?? campaign.tareas_a_realizar ?? '',
      elementos_entregados: campaign.a_enviar ?? campaign.elementos_entregados ?? '',
      tareas_proxima_campania: campaign.tareas_pendientes ?? campaign.tareas_proxima_campania ?? '',
    };

    return payload;
  };

  const handleSave = () => {
    if (onSave) onSave(buildPayload());
  };

  const addCampaignButtonLabel = newYear
    ? `+ Agregar campaña ${formatCampaignYearLabel(Number(newYear))}`
    : '+ Agregar campaña';

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
        <div className="campaign-panel">
          <label>Necesidades de campaña</label>
          <textarea
            rows={3}
            value={getValue('necesidades_campania', getValue('tareas_a_realizar'))}
            onChange={(e) => handleChange('necesidades_campania', e.target.value)}
          />
        </div>

        <div className="campaign-panel">
          <div className="campaign-panel-header">
            <label>A enviar</label>
            <div className="campaign-send-toggle">
              <input
                type="checkbox"
                checked={Boolean(campaign.enviado)}
                onChange={() => confirmToggleEnviado(!campaign.enviado)}
              />
              <span>Enviado</span>
            </div>
          </div>
          <textarea
            rows={3}
            value={getValue('a_enviar', getValue('elementos_entregados'))}
            onChange={(e) => handleChange('a_enviar', e.target.value)}
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

        <div className="campaign-panel">
          <label>Tareas pendientes</label>
          <textarea
            rows={3}
            value={getValue('tareas_pendientes', getValue('tareas_proxima_campania'))}
            onChange={(e) => handleChange('tareas_pendientes', e.target.value)}
          />
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
