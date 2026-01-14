import { useState, useEffect } from 'react';



const CampaignSummary = ({ campaigns, onSave, onAdd, newYear, setNewYear }) => {
  if (!campaigns.length) return null;

  // ordenar campañas por año desc
  const sortedCampaigns = [...campaigns].sort((a, b) => b.anio - a.anio);

  // campaña activa
  const [campaign, setCampaign] = useState(sortedCampaigns[0]);

  useEffect(() => {
    setCampaign(sortedCampaigns[0]);
  }, [campaigns]);

  const handleChange = (field, value) => {
    setCampaign({ ...campaign, [field]: value });
  };

  const handleSave = () => {
    if (onSave) onSave(campaign);
  };


  return (
    <div className="base-info-card">
      <div className="base-info-header">
        <h3>Campaña {campaign.anio}</h3>
      </div>

      <div className="base-info-grid">
        <div className="field full">
          <label>Elementos entregados al inicio de campaña</label>
          <textarea
            rows={2}
            value={campaign.elementos_entregados || ''}
            onChange={e => handleChange('elementos_entregados', e.target.value)}
          />
        </div>

        <div className="field full">
          <label>Tareas realizadas de la campaña anterior</label>
          <textarea
            rows={2}
            value={campaign.tareas_a_realizar || ''}
            onChange={e => handleChange('tareas_a_realizar', e.target.value)}
          />
        </div>

        <div className="field full">
          <label>Próxima campaña – Elementos solicitados</label>
          <textarea
            rows={2}
            value={campaign.elementos_proxima_campania || ''}
            onChange={e =>
              handleChange('elementos_proxima_campania', e.target.value)
            }
          />
        </div>

        <div className="field full">
          <label>Próxima campaña – Tareas a realizar</label>
          <textarea
            rows={2}
            value={campaign.tareas_proxima_campania || ''}
            onChange={e =>
              handleChange('tareas_proxima_campania', e.target.value)
            }
          />
        </div>
      </div>

      <div className="base-info-actions">
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

          <button
            className="ais-btn-primary"
            onClick={onAdd}
          >
            + Agegar campaña
          </button>
        </div>

        <div className="actions-right">
          <button className="ais-btn-primary" onClick={handleSave}>
            Guardar cambios
          </button>
        </div>
      </div>


      {/* SELECCIÓN DE AÑO */}
<div className="campaign-years">
  <div className="campaign-years-title">
    Seleccionar año de campaña
  </div>

  <div className="years-bar">
    {sortedCampaigns.map(c => (
      <button
        key={c._id}
        className={`year-btn-small ${
          campaign._id === c._id ? 'active' : ''
        }`}
        onClick={() => setCampaign(c)}
      >
        {c.anio}
      </button>
    ))}
  </div>
</div>

    </div>
  );
};

export default CampaignSummary;
