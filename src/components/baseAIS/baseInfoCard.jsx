const BaseInfoCard = ({ base, setBase }) => {
  if (!base) return null;

  const handleChange = (field, value) => {
    setBase({ ...base, [field]: value });
  };

  return (
    <div className="base-info-card">
      <div className="base-info-header">
        <h3>Información de la Base</h3>
      </div>

      <div className="base-info-grid">
        <div className="field">
          <label>Nombre</label>
          <input
            value={base.nombre_base || ''}
            onChange={e => handleChange('nombre_base', e.target.value)}
          />
        </div>

        <div className="field">
          <label>Tipo</label>
          <input
            value={base.tipo_base || ''}
            onChange={e => handleChange('tipo_base', e.target.value)}
          />
        </div>

        <div className="field full">
          <label>Descripción</label>
          <textarea
            rows={2}
            value={base.descripcion_base || ''}
            onChange={e => handleChange('descripcion_base', e.target.value)}
          />
        </div>

        <div className="field">
          <label>Comunicante</label>
          <input
            value={base.nombre_comunicante || ''}
            onChange={e => handleChange('nombre_comunicante', e.target.value)}
          />
        </div>

        <div className="field">
          <label>Teléfono</label>
          <input
            value={base.tel_comunicante || ''}
            onChange={e => handleChange('tel_comunicante', e.target.value)}
          />
        </div>

        <div className="field full">
          <label>AIS RX</label>
          <textarea
            rows={2}
            value={base.descripcion_ais_rx || ''}
            onChange={e => handleChange('descripcion_ais_rx', e.target.value)}
          />
        </div>

        <div className="field full">
          <label>AIS TX</label>
          <textarea
            rows={2}
            value={base.descripcion_ais_tx || ''}
            onChange={e => handleChange('descripcion_ais_tx', e.target.value)}
          />
        </div>
      </div>

      <div className="base-info-actions">
        <button className="ais-btn-primary">
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default BaseInfoCard;
