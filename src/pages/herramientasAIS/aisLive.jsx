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
  const [customHost, setCustomHost] = useState('');
  const [customPort, setCustomPort] = useState('');

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

  const handleConnectionToggle = async () => {
    if (connectionAction) return;
    const action = connectionActive ? 'disconnect' : 'connect';
    setConnectionAction(action);
    try {
      const resolvedHost = customHost || '190.210.40.127';
      const resolvedPort = customPort || '3069';
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
              <input
                type="text"
                placeholder="IP (opcional)"
                value={customHost}
                onChange={(e) => setCustomHost(e.target.value)}
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
                placeholder="Puerto (opcional)"
                value={customPort}
                onChange={(e) => setCustomPort(e.target.value)}
                style={{
                  padding: '6px 9px',
                  fontSize: '0.76rem',
                  border: '1px solid rgba(148, 163, 184, 0.18)',
                  borderRadius: '8px',
                  background: 'rgba(10, 17, 24, 0.42)',
                  color: '#e8edf5',
                  minWidth: '70px',
                }}
              />
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
