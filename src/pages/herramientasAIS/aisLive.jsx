import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import '../../styles/aisLive.css';
import config from '../../config';

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

  const centerMap = () => {
    const mapState = mapStateRef.current;
    const validTargets = snapshot.targets.filter((target) => (
      Number.isFinite(target.latitude) && Number.isFinite(target.longitude)
    ));
    if (!mapState || validTargets.length === 0) return;
    const bounds = L.latLngBounds(validTargets.map((target) => [target.latitude, target.longitude]));
    mapState.map.fitBounds(bounds, { padding: [24, 24], maxZoom: 12 });
  };

  const connectionActive = ['connected', 'connecting', 'reconnecting', 'error'].includes(snapshot.status);

  const handleConnectionToggle = async () => {
    if (connectionAction) return;
    const action = connectionActive ? 'disconnect' : 'connect';
    setConnectionAction(action);
    try {
      const response = await fetch(`${config.baseURL}/api/ais/${action}`, {
        method: 'POST',
        credentials: 'include',
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
        </header>

        <div className="ais-live-notice" role="status">
          Fuente TCP: <code>{snapshot.sourceAddress}</code> · Conversor serial a 38400 baudios · Solo recepción.
        </div>

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
          </div>
          {loading && <p className="ais-live-empty">Conectando con el servidor…</p>}
          {!loading && snapshot.messages.length === 0 && (
            <p className="ais-live-empty">Todavía no se recibieron mensajes 6, 8 o 21.</p>
          )}
          {snapshot.messages.length > 0 && (
            <div className="ais-live-message-list">
              {snapshot.messages.map((message) => (
                <details className="ais-live-message" key={message.id}>
                  <summary>
                    <span className="ais-live-message-type">Tipo {message.type}</span>
                    <span>MMSI {message.mmsi || '—'}</span>
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
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default AisLive;
