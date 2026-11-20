import { useEffect, useRef } from 'react';

const BaseInfoCard = ({ base, setBase, onSave }) => {
  const descripcionBaseRef = useRef(null);
  const descripcionAisRxRef = useRef(null);
  const descripcionAisTxRef = useRef(null);

  const handleChange = (field, value) => {
    setBase({ ...base, [field]: value });
  };

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
    resizeTextarea(descripcionBaseRef);
    resizeTextarea(descripcionAisRxRef);
    resizeTextarea(descripcionAisTxRef);
  }, [base]);

  if (!base) return null;

  const status = base.activa || base.estado || 'Activa';

  return (
    <div className="base-info-card base-details-card">
      <div className="base-details-header">
        <div>
          <span className="base-details-eyebrow">Información general</span>
          <h3>{base.nombre_base || 'Base AIS'}</h3>
        </div>

        <span className="base-status-badge">{status}</span>
      </div>

      <div className="base-details-section">
        <div className="section-title">Datos principales</div>

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
              ref={descripcionBaseRef}
              rows={2}
              value={base.descripcion_base || ''}
              onChange={e => { handleChange('descripcion_base', e.target.value); autoResize(e); }}
            />
          </div>
        </div>
      </div>

      <div className="base-details-section">
        <div className="section-title">Contacto</div>

        <div className="base-info-grid">
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
        </div>
      </div>

      <div className="base-details-section">
        <div className="section-title">Sistema AIS</div>

        <div className="base-info-grid">
          <div className="field full">
            <label>AIS RX</label>
            <textarea
              ref={descripcionAisRxRef}
              rows={2}
              value={base.descripcion_ais_rx || ''}
              onChange={e => { handleChange('descripcion_ais_rx', e.target.value); autoResize(e); }}
            />
          </div>

          <div className="field full">
            <label>AIS TX</label>
            <textarea
              ref={descripcionAisTxRef}
              rows={2}
              value={base.descripcion_ais_tx || ''}
              onChange={e => { handleChange('descripcion_ais_tx', e.target.value); autoResize(e); }}
            />
          </div>
        </div>
      </div>

      <div className="base-info-actions">
        <button
          className="ais-btn-primary"
          onClick={() => onSave(base)}
        >
          Guardar cambios
        </button>
      </div>
    </div>
  );
};

export default BaseInfoCard;
