import { useContext, useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useNavigate } from 'react-router-dom';
import '../../styles/aisLive.css';
import config from '../../config';
import AuthContext from '../../context/authContext';

const EMPTY_SNAPSHOT = {
  status: 'disconnected',
  sourceAddress: '190.210.40.127:3069',
  targets: [],
  messages: [],
  totalMessages: 0,
};

const statusLabels = {
  connected: 'Conectado',
  connecting: 'Conectando',
  reconnecting: 'Reconectando',
  error: 'Sin conexión',
  disconnected: 'Desconectado',
};

const fi31Fields = [
  ['latitude', 'Lat', '°'],
  ['longitude', 'Lon', '°'],
  ['averageWindSpeed', 'Viento prom.', ' kn'],
  ['windGust', 'Ráfaga', ' kn'],
  ['windDirection', 'Dir. viento', '°'],
  ['gustDirection', 'Dir. ráfaga', '°'],
  ['airTemperature', 'Temp. aire', ' °C'],
  ['relativeHumidity', 'Humedad', '%'],
  ['dewPoint', 'Rocío', ' °C'],
  ['airPressure', 'Presión', ' hPa'],
  ['visibility', 'Visibilidad', ' km'],
  ['waterLevel', 'Nivel agua', ' m'],
  ['surfaceCurrentSpeed', 'Corriente', ' kn'],
  ['surfaceCurrentDirection', 'Dir. corriente', '°'],
  ['significantWaveHeight', 'Altura ola', ' m'],
  ['wavePeriod', 'Período ola', ' s'],
  ['waveDirection', 'Dir. ola', '°'],
  ['swellHeight', 'Altura swell', ' m'],
  ['swellPeriod', 'Período swell', ' s'],
  ['swellDirection', 'Dir. swell', '°'],
  ['waterTemperature', 'Temp. agua', ' °C'],
  ['salinity', 'Salinidad', ''],
];

const modeLabels = {
  'tcp-client': 'Cliente TCP',
  'tcp-server': 'Servidor TCP',
  'udp-server': 'Servidor UDP',
};

const formatDate = (value) => {
  if (!value) return '—';
  return new Intl.DateTimeFormat('es-AR', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
};

const buildTooltip = (target) => {
  const tooltip = document.createElement('span');
  const label = target.kind === 'aton' ? 'ATON' : 'Barco';
  tooltip.textContent = `${label} · ${target.name || target.mmsi}`;
  return tooltip;
};

const AisLive = () => {
  const mapElementRef = useRef(null);
  const mapStateRef = useRef(null);
  const [snapshot, setSnapshot] = useState(EMPTY_SNAPSHOT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionAction, setConnectionAction] = useState('');
  const [showOnlyType8, setShowOnlyType8] = useState(false);
  const [mmsiFilter, setMmsiFilter] = useState('');
  const [paused, setPaused] = useState(false);
  const pausedMessagesRef = useRef([]);
  const [sources, setSources] = useState([]);
  const [sourcesLoading, setSourcesLoading] = useState(false);
  const [showAddSource, setShowAddSource] = useState(false);
  const [newSource, setNewSource] = useState({
    name: '',
    mode: 'tcp-client',
    host: '190.210.40.127',
    port: '3069',
  });

  const { isAuthenticated, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  // Si el usuario se desloguea, desconectar el AIS y redirigir al login
  useEffect(() => {
    if (!isAuthenticated) {
      const handleDisconnect = async () => {
        try {
          await fetch(`${config.baseURL}/api/ais/disconnect`, {
            method: 'POST',
            credentials: 'include',
          });
        } catch (err) {
          console.error('Error al desconectar AIS al desloguear:', err);
        }
        logout();
        navigate('/');
      };
      handleDisconnect();
    }
  }, [isAuthenticated, logout, navigate]);

  // Mapa Leaflet
  useEffect(() => {
    const map = L.map(mapElementRef.current, { preferCanvas: true }).setView([-34.6, -58.38], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap',
    }).addTo(map);
    const markers = L.layerGroup().addTo(map);
    mapStateRef.current = { map, markers };

    return () => {
      map.remove();
      mapStateRef.current = null;
    };
  }, []);

  // Renderizar marcadores en el mapa
  useEffect(() => {
    const mapState = mapStateRef.current;
    if (!mapState) return;

    mapState.markers.clearLayers();
    snapshot.targets.forEach((target) => {
      if (!Number.isFinite(target.latitude) || !Number.isFinite(target.longitude)) return;
      const isAton = target.kind === 'aton';
      L.circleMarker([target.latitude, target.longitude], {
        radius: isAton ? 8 : 6,
        color: isAton ? '#fbbf24' : '#7dd3fc',
        weight: 2,
        fillColor: isAton ? '#f59e0b' : '#2563eb',
        fillOpacity: 0.9,
      })
        .bindTooltip(buildTooltip(target))
        .addTo(mapState.markers);
    });
  }, [snapshot.targets]);

  // Cargar snapshot agregado (compatibilidad con frontend actual)
  useEffect(() => {
    let active = true;
    let requestPending = false;

    const refresh = async () => {
      if (requestPending) return;
      requestPending = true;
      try {
        const response = await fetch(`${config.baseURL}/api/ais/live`, {
          credentials: 'include',
        });
        const body = await response.json();
        if (!response.ok) {
          throw new Error(body.message || 'No se pudo consultar la recepción AIS.');
        }
        if (!active) return;
        setSnapshot(body);
        setError('');
        setLoading(false);
      } catch (requestError) {
        if (!active) return;
        setError(requestError.message || 'No se pudo consultar la recepción AIS.');
        setLoading(false);
      } finally {
        requestPending = false;
      }
    };

    refresh();
    const intervalId = window.setInterval(refresh, 3000);
    return () => {
      active = false;
      window.clearInterval(intervalId);
    };
  }, []);

  // Cargar lista de fuentes AIS
  useEffect(() => {
    const fetchSources = async () => {
      setSourcesLoading(true);
      try {
        const response = await fetch(`${config.baseURL}/api/ais/sources`, {
          credentials: 'include',
        });
        if (!response.ok) throw new Error('No se pudieron cargar las fuentes AIS');
        const data = await response.json();
        setSources(data || []);
      } catch (err) {
        console.error('Error cargando fuentes AIS:', err);
        setSources([]);
      } finally {
        setSourcesLoading(false);
      }
    };
    fetchSources();
  }, []);

  const connectionActive = ['connected', 'connecting', 'reconnecting', 'error'].includes(snapshot.status);

  const centerMap = () => {
    const mapState = mapStateRef.current;
    const validTargets = snapshot.targets.filter((target) => (
      Number.isFinite(target.latitude) && Number.isFinite(target.longitude)
    ));
    if (!mapState || validTargets.length === 0) return;
    const bounds = L.latLngBounds(validTargets.map((target) => [target.latitude, target.longitude]));
    mapState.map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
  };

  // Conectar/desconectar una fuente específica
  const handleSourceConnectionToggle = async (source) => {
    if (connectionAction) return;
    const action = source.status === 'connected' || source.status === 'connecting' || source.status === 'reconnecting' || source.status === 'error' ? 'disconnect' : 'connect';
    setConnectionAction(action);
    try {
      const response = await fetch(`${config.baseURL}/api/ais/sources/${source.sourceId}/${action}`, {
        method: 'POST',
        credentials: 'include',
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || `No se pudo ${action} la fuente AIS.`);
      }
      setSnapshot(body);
      setError('');
      // Refrescar lista de fuentes para mostrar el nuevo estado
      const sourcesResp = await fetch(`${config.baseURL}/api/ais/sources`, {
        credentials: 'include',
      });
      if (sourcesResp.ok) {
        const sourcesData = await sourcesResp.json();
        setSources(sourcesData || []);
      }
    } catch (requestError) {
      setError(requestError.message || `No se pudo ${action} la fuente AIS.`);
    } finally {
      setConnectionAction('');
    }
  };

  // Conectar/desconectar fuente principal (legacy, para compatibilidad)
  const handleConnectionToggle = async () => {
    if (connectionAction) return;
    const action = connectionActive ? 'disconnect' : 'connect';
    setConnectionAction(action);
    try {
      const resolvedHost = '190.210.40.127';
      const resolvedPort = '3069';
      const response = await fetch(`${config.baseURL}/api/ais/${action}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: action === 'connect' ? JSON.stringify({ host: resolvedHost, port: resolvedPort }) : undefined,
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'No se pudo cambiar el estado de la conexión AIS.');
      }
      setSnapshot(body);
      setError('');
    } catch (requestError) {
      setError(requestError.message || 'No se pudo cambiar el estado de la conexión AIS.');
    } finally {
      setConnectionAction('');
    }
  };

  // Agregar nueva fuente AIS
  const handleAddSource = async (e) => {
    e.preventDefault();
    if (connectionAction) return;
    setConnectionAction('adding');
    try {
      const response = await fetch(`${config.baseURL}/api/ais/sources`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newSource.name || `Fuente AIS ${newSource.host}:${newSource.port}`,
          mode: newSource.mode,
          host: newSource.host,
          port: newSource.port,
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body.message || 'No se pudo crear la fuente AIS.');
      }
      setShowAddSource(false);
      setNewSource({ name: '', mode: 'tcp-client', host: '190.210.40.127', port: '3069' });
      setConnectionAction('');
      // Refrescar lista
      const sourcesResp = await fetch(`${config.baseURL}/api/ais/sources`, {
        credentials: 'include',
      });
      if (sourcesResp.ok) {
        const sourcesData = await sourcesResp.json();
        setSources(sourcesData || []);
      }
    } catch (requestError) {
      setError(requestError.message || 'No se pudo crear la fuente AIS.');
      setConnectionAction('');
    }
  };

  // Eliminar una fuente AIS
  const handleDeleteSource = async (sourceId) => {
    if (connectionAction) return;
    if (!window.confirm('¿Seguro que querés eliminar esta fuente AIS?')) return;
    setConnectionAction('deleting');
    try {
      const response = await fetch(`${config.baseURL}/api/ais/sources/${sourceId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.message || 'No se pudo eliminar la fuente AIS.');
      }
      setConnectionAction('');
      const sourcesResp = await fetch(`${config.baseURL}/api/ais/sources`, {
        credentials: 'include',
      });
      if (sourcesResp.ok) {
        const sourcesData = await sourcesResp.json();
        setSources(sourcesData || []);
      }
    } catch (requestError) {
      setError(requestError.message || 'No se pudo eliminar la fuente AIS.');
      setConnectionAction('');
    }
  };

  const messageCounts = snapshot.messages.reduce((counts, message) => {
    counts[message.type] = (counts[message.type] || 0) + 1;
    return counts;
  }, {});

  const liveFilteredMessages = snapshot.messages
    .filter((message) => (!showOnlyType8 || message.type === 8))
    .filter((message) => (!mmsiFilter || String(message.mmsi || '').includes(mmsiFilter)))
    .slice(0, 100);

  if (!paused) {
    pausedMessagesRef.current = liveFilteredMessages;
  }

  const filteredMessages = paused ? pausedMessagesRef.current : liveFilteredMessages;

  return (
    <div className="ais-live-page">
      <main className="ais-live-main">
        <header className="ais-live-header">
          <div>
            <span className="ais-live-kicker">Herramientas AIS</span>
            <h1>Monitor AIS en vivo</h1>
            <p>Tramas NMEA 0183 · barcos, ATON y mensajes tipo 6, 8 y 21.</p>
          </div>
          <div className="ais-live-header-actions">
            <div className={`ais-live-status is-${snapshot.status}`} role="status">
              <span className="ais-live-status-dot" />
              {statusLabels[snapshot.status] || 'Estado desconocido'}
            </div>
            <div className="ais-live-connection-controls">
              <button
                type="button"
                className="ais-live-connect-button"
                onClick={handleConnectionToggle}
                disabled={Boolean(connectionAction)}
              >
                {connectionAction
                  ? (connectionAction === 'connect' ? 'Conectando…' : 'Desconectando…')
                  : (connectionActive ? 'Desconectar entrada TCP' : 'Conectar entrada TCP')}
              </button>
              <button
                type="button"
                className="ais-live-connect-button"
                onClick={() => setShowAddSource(true)}
                disabled={Boolean(connectionAction)}
                style={{ marginLeft: 'var(--space-2)', background: 'var(--color-success)' }}
              >
                + Agregar fuente
              </button>
            </div>
          </div>
        </header>

        {snapshot.status === 'connected' && snapshot.sourceAddress && (
          <div className="ais-live-notice" role="status">
            Fuente TCP:{' '}
            <code>{snapshot.sourceAddress}</code>
            · Conversor serial a 38400 baudios · Solo recepción.
          </div>
        )}

        {error && (
          <div className="ais-live-notice is-error" role="alert">
            {error}
          </div>
        )}

        {snapshot.error && (
          <div className="ais-live-notice is-error" role="alert">
            {snapshot.error}
          </div>
        )}

        {/* Gestión de fuentes AIS */}
        <section className="ais-live-sources">
          <div className="ais-live-section-header">
            <div>
              <h2>Fuentes AIS configuradas</h2>
              <p>Gestioná múltiples estaciones receptoras simultáneamente.</p>
            </div>
            {showAddSource && (
              <form onSubmit={handleAddSource} className="ais-add-source-form" style={{ display: 'flex', gap: 'var(--space-2)', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Nombre"
                  value={newSource.name}
                  onChange={(e) => setNewSource({ ...newSource, name: e.target.value })}
                  style={{
                    padding: '6px 9px',
                    fontSize: '0.76rem',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '8px',
                    background: 'rgba(10, 17, 24, 0.42)',
                    color: '#e8edf5',
                    minWidth: '140px',
                  }}
                />
                <select
                  value={newSource.mode}
                  onChange={(e) => setNewSource({ ...newSource, mode: e.target.value })}
                  style={{
                    padding: '6px 9px',
                    fontSize: '0.76rem',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '8px',
                    background: 'rgba(10, 17, 24, 0.42)',
                    color: '#e8edf5',
                    minWidth: '130px',
                  }}
                >
                  <option value="tcp-client">Cliente TCP</option>
                  <option value="tcp-server">Servidor TCP</option>
                  <option value="udp-server">Servidor UDP</option>
                </select>
                <input
                  type="text"
                  placeholder="Host"
                  value={newSource.host}
                  onChange={(e) => setNewSource({ ...newSource, host: e.target.value })}
                  style={{
                    padding: '6px 9px',
                    fontSize: '0.76rem',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '8px',
                    background: 'rgba(10, 17, 24, 0.42)',
                    color: '#e8edf5',
                    minWidth: '120px',
                  }}
                />
                <input
                  type="text"
                  placeholder="Puerto"
                  value={newSource.port}
                  onChange={(e) => setNewSource({ ...newSource, port: e.target.value })}
                  style={{
                    padding: '6px 9px',
                    fontSize: '0.76rem',
                    border: '1px solid rgba(148, 163, 184, 0.18)',
                    borderRadius: '8px',
                    background: 'rgba(10, 17, 24, 0.42)',
                    color: '#e8edf5',
                    minWidth: '80px',
                  }}
                />
                <button
                  type="submit"
                  className="ais-live-connect-button"
                  disabled={Boolean(connectionAction)}
                  style={{ marginLeft: 'var(--space-2)', background: 'var(--color-brand-500)' }}
                >
                  {connectionAction === 'adding' ? 'Agregando…' : 'Agregar'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddSource(false)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.76rem',
                    border: '1px solid rgba(148, 163, 184, 0.3)',
                    borderRadius: '8px',
                    background: 'transparent',
                    color: '#e8edf5',
                    cursor: 'pointer',
                    marginLeft: 'var(--space-2)',
                  }}
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>

          {sourcesLoading && (
            <p className="ais-live-empty">Cargando fuentes AIS…</p>
          )}

          {!sourcesLoading && sources.length === 0 && (
            <p className="ais-live-empty">No hay fuentes AIS configuradas. Agregá tu primera estación receptora.</p>
          )}

          {!sourcesLoading && sources.length > 0 && (
            <div className="ais-sources-list">
              {sources.map((source) => {
                const isConnecting = source.status === 'connecting' || source.status === 'reconnecting';
                const canConnect = source.status === 'disconnected' || source.status === 'error';
                return (
                  <div key={source.sourceId} className="ais-source-card">
                    <div className="ais-source-header">
                      <div className="ais-source-info">
                        <span className="ais-source-name">{source.name}</span>
                        <span className={`ais-source-mode ais-source-mode-${source.mode}`}>{modeLabels[source.mode] || source.mode}</span>
                        <span className={`ais-source-status is-${source.status}`}>
                          <span className="ais-source-status-dot" />
                          {statusLabels[source.status] || 'Estado desconocido'}
                        </span>
                        <span className="ais-source-address">{source.host}:{source.port}</span>
                      </div>
                      <div className="ais-source-actions">
                        <button
                          type="button"
                          onClick={() => handleSourceConnectionToggle(source)}
                          disabled={Boolean(connectionAction) || connectionAction === 'adding' || connectionAction === 'deleting'}
                          className="ais-source-btn"
                          style={{
                            background: canConnect ? 'var(--color-success)' : 'var(--color-danger)',
                            color: 'white',
                          }}
                        >
                          {isConnecting
                            ? (source.status === 'reconnecting' ? 'Reconectando…' : 'Conectando…')
                            : canConnect
                              ? 'Conectar'
                              : 'Desconectar'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteSource(source.sourceId)}
                          disabled={Boolean(connectionAction) || connectionAction === 'adding' || connectionAction === 'deleting'}
                          className="ais-source-btn"
                          style={{ background: 'transparent', color: 'var(--color-text-muted)', border: '1px solid var(--color-border-default)' }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                    <div className="ais-source-meta">
                      <span><strong>Objetivos:</strong> {source.targetCount || 0}</span>
                      <span><strong>Mensajes:</strong> {source.messageCount || 0}</span>
                      {source.lastReceivedAt && <span><strong>Último dato:</strong> {formatDate(source.lastReceivedAt)}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="ais-live-stats" aria-label="Estado de la recepción AIS">
          <article><span>Barcos</span><strong>{snapshot.targets.filter((target) => target.kind === 'vessel').length}</strong></article>
          <article><span>ATON</span><strong>{snapshot.targets.filter((target) => target.kind === 'aton').length}</strong></article>
          <article><span>Msg. 6 / 8 / 21</span><strong>{snapshot.totalMessages}</strong></article>
          <article><span>Último dato</span><strong>{formatDate(snapshot.lastReceivedAt)}</strong></article>
        </section>

        <section className="ais-live-map-card" aria-label="Mapa de barcos y ayudas a la navegación">
          <div className="ais-live-section-header">
            <div>
              <h2>Tráfico y ayudas a la navegación</h2>
              <p>
                <span className="ais-map-legend-dot is-ship" /> Barcos
                <span className="ais-map-legend-dot is-aton" /> ATON
              </p>
            </div>
            <button type="button" onClick={centerMap} disabled={!snapshot.targets.length}>
              Centrar objetivos
            </button>
          </div>
          <div className="ais-live-map" ref={mapElementRef} />
        </section>

        <section className="ais-live-messages" aria-labelledby="ais-live-messages-title">
          <div className="ais-live-section-header">
            <div>
              <h2 id="ais-live-messages-title">Mensajes recibidos</h2>
              <p>
                En memoria: tipo 6 ({messageCounts[6] || 0}), tipo 8 ({messageCounts[8] || 0}),
                {' '}tipo 21 ({messageCounts[21] || 0}). FI 1/31 se muestra decodificado cuando está presente.
              </p>
            </div>
            <div className="ais-live-message-filters">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.76rem', color: '#aab8c7', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showOnlyType8}
                  onChange={(e) => setShowOnlyType8(e.target.checked)}
                  style={{ accentColor: '#7dd3fc' }}
                />
                Solo mensajes tipo 8
              </label>
              <input
                type="text"
                placeholder="Filtrar por MMSI"
                value={mmsiFilter}
                onChange={(e) => setMmsiFilter(e.target.value)}
                style={{
                  padding: '6px 9px',
                  fontSize: '0.76rem',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '8px',
                  background: 'rgba(10, 17, 24, 0.42)',
                  color: '#e8edf5',
                  minWidth: '150px',
                }}
              />
              <button
                type="button"
                onClick={() => setPaused(!paused)}
                style={{
                  padding: '6px 12px',
                  fontSize: '0.76rem',
                  border: '1px solid rgba(96, 165, 250, 0.3)',
                  borderRadius: '8px',
                  background: paused ? 'rgba(34, 197, 94, 0.2)' : 'rgba(37, 99, 235, 0.2)',
                  color: '#eaf5ff',
                  font: 'inherit',
                  fontWeight: 700,
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                {paused ? 'Reanudar mensajes' : 'Pausar mensajes'}
              </button>
            </div>
          </div>
          {loading && <p className="ais-live-empty">Conectando con el servidor…</p>}
          {!loading && snapshot.messages.length === 0 && (
            <p className="ais-live-empty">Todavía no se recibieron mensajes 6, 8 o 21.</p>
          )}
          {filteredMessages.length > 0 && (
            <div className="ais-live-message-list">
              {filteredMessages.map((message) => {
                const targetName = snapshot.targets.find((t) => t.mmsi === message.mmsi)?.name;
                return (
                  <details className="ais-live-message" key={message.id}>
                    <summary>
                      <span className="ais-live-message-type">Tipo {message.type}</span>
                      <span>MMSI {message.mmsi || '—'}</span>
                      <span>Nombre {targetName || message.name || '—'}</span>
                      {message.dac !== null && message.dac !== undefined && (
                        <span>DAC {message.dac} / FI {message.fi}</span>
                      )}
                      <time>{formatDate(message.receivedAt)}</time>
                    </summary>
                    {message.type === 6 && <p>Destino MMSI {message.destinationMmsi}</p>}
                    {message.fi31 && (
                      <div className="ais-live-fi31" aria-label="Datos meteorológicos e hidrológicos FI 31">
                        <strong>FI 31</strong>
                        {fi31Fields.map(([key, label, unit]) => (
                          Number.isFinite(message.fi31[key]) && (
                            <span key={key}>{label}: {message.fi31[key]}{unit}</span>
                          )
                        ))}
                      </div>
                    )}
                    <pre>{message.rawSentences.join('\n')}</pre>
                  </details>
                );
              })}
            </div>
          )}
          {snapshot.messages.length > 0 && filteredMessages.length === 0 && (
            <p className="ais-live-empty">No hay mensajes que coincidan con los filtros aplicados.</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default AisLive;
