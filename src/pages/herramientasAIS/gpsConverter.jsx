import { useState } from 'react';
import { FiAlertCircle, FiArrowRight, FiCompass, FiMapPin, FiRefreshCw } from 'react-icons/fi';
import '../../styles/gpsConverter.css';
import { convertCoordinates, createOpenStreetMapEmbedUrl } from './coordinateConverter';

const GPSConverter = () => {
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleConvert = (event) => {
    event.preventDefault();
    setError('');

    try {
      setResult(convertCoordinates(latitude, longitude));
    } catch (conversionError) {
      setResult(null);
      setError(conversionError.message);
    }
  };

  const handleClear = () => {
    setLatitude('');
    setLongitude('');
    setResult(null);
    setError('');
  };

  return (
    <div className="gps-converter-page">
      <main className="gps-converter-main">
        <header className="gps-converter-hero">
          <span className="gps-converter-kicker">Herramientas AIS</span>
          <h1>Conversor de coordenadas GPS</h1>
          <p>
            Ingresá una latitud y longitud en el formato que tengas y obtené las coordenadas
            listas para cargar en los equipos MTU AIS-C y Kanaton, además de otros formatos
            geográficos habituales.
          </p>
        </header>

        <section className="gps-converter-card" aria-labelledby="gps-input-title">
          <div className="gps-converter-section-heading">
            <span className="gps-converter-icon"><FiMapPin aria-hidden="true" /></span>
            <div>
              <h2 id="gps-input-title">Coordenadas de origen</h2>
              <p>Ingresá latitud y longitud por separado.</p>
            </div>
          </div>

          <form className="gps-converter-form" onSubmit={handleConvert}>
            <div className="gps-coordinate-inputs">
              <label className="gps-coordinate-field" htmlFor="gps-latitude">
                <span>Latitud</span>
                <input
                  id="gps-latitude"
                  type="text"
                  inputMode="text"
                  value={latitude}
                  onChange={(event) => {
                    setLatitude(event.target.value);
                    setResult(null);
                    setError('');
                  }}
                  placeholder={'34° 37\' 49.740" S'}
                  autoComplete="off"
                  required
                />
                <small>Ej.: -34.6304833 · 34° 37.829 S · 34° 37&apos; 49.740&quot; S</small>
              </label>

              <label className="gps-coordinate-field" htmlFor="gps-longitude">
                <span>Longitud</span>
                <input
                  id="gps-longitude"
                  type="text"
                  inputMode="text"
                  value={longitude}
                  onChange={(event) => {
                    setLongitude(event.target.value);
                    setResult(null);
                    setError('');
                  }}
                  placeholder={'58° 21\' 4.680" W'}
                  autoComplete="off"
                  required
                />
                <small>Ej.: -58.3513000 · 58° 21.078 W · 58° 21&apos; 4.680&quot; W</small>
              </label>
            </div>

            <p className="gps-format-hint">
              Acepta grados decimales (DD), grados y minutos (DDM), grados/minutos/segundos
              (DMS), valores separados por dos puntos, coma decimal y cardinales N, S, E, W u O
              (Oeste).
              Si no indicás signo ni cardinal, se asume norte para latitud y este para longitud.
              Cambia la notación, no el datum; no convierte coordenadas UTM o MGRS.
            </p>

            {error && (
              <div className="gps-converter-error" role="alert">
                <FiAlertCircle aria-hidden="true" />
                <span>{error}</span>
              </div>
            )}

            <div className="gps-converter-actions">
              <button className="gps-convert-button" type="submit">
                <FiArrowRight aria-hidden="true" />
                Convertir coordenadas
              </button>
              <button className="gps-clear-button" type="button" onClick={handleClear}>
                <FiRefreshCw aria-hidden="true" />
                Limpiar
              </button>
            </div>
          </form>
        </section>

        {result ? (
          <section className="gps-converter-results" aria-live="polite" aria-labelledby="gps-results-title">
            <div className="gps-results-heading">
              <div>
                <span className="gps-converter-kicker">Resultado</span>
                <h2 id="gps-results-title">Coordenadas convertidas</h2>
              </div>
              <span className="gps-results-reference">
                <FiCompass aria-hidden="true" />
                Formato latitud / longitud · sin cambio de datum
              </span>
            </div>

            <div className="gps-device-formats">
              {result.formats.slice(0, 2).map((format) => (
                <article className={`gps-format-card gps-format-card-${format.id}`} key={format.id}>
                  <div className="gps-format-card-heading">
                    <div>
                      <span className="gps-format-tag">Formato de equipo</span>
                      <h3>{format.label}</h3>
                    </div>
                    <FiMapPin aria-hidden="true" />
                  </div>
                  <p>{format.description}</p>
                  <dl className="gps-format-values">
                    <div>
                      <dt>Latitud</dt>
                      <dd>{format.latitude}</dd>
                    </div>
                    <div>
                      <dt>Longitud</dt>
                      <dd>{format.longitude}</dd>
                    </div>
                  </dl>
                </article>
              ))}
            </div>

            <section className="gps-map-card" aria-labelledby="gps-map-title">
              <div className="gps-map-heading">
              <div>
                <span className="gps-format-tag">Ubicación</span>
                <h3 id="gps-map-title">Vista en el mapa</h3>
              </div>
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noopener noreferrer"
              >
                © OpenStreetMap
              </a>
              </div>
              <div className="gps-map-frame">
              <iframe
                title="Mapa de la ubicación ingresada"
                src={createOpenStreetMapEmbedUrl(result.latitude, result.longitude)}
                loading="lazy"
                referrerPolicy="no-referrer"
              />
              </div>
              <p className="gps-map-disclosure">
              El mapa se carga desde OpenStreetMap; el proveedor recibe estas coordenadas
              para mostrar la ubicación.
              </p>
            </section>

            <section className="gps-other-formats" aria-labelledby="gps-other-formats-title">
              <div className="gps-other-formats-heading">
                <div>
                  <h3 id="gps-other-formats-title">Otros formatos</h3>
                  <p>La misma ubicación expresada en notaciones de uso frecuente.</p>
                </div>
              </div>
              <div className="gps-other-formats-grid">
                {result.formats.slice(2).map((format) => (
                  <article className="gps-other-format-card" key={format.id}>
                    <h4>{format.label}</h4>
                    <p>{format.description}</p>
                    <dl className="gps-format-values">
                      <div>
                        <dt>Latitud</dt>
                        <dd>{format.latitude}</dd>
                      </div>
                      <div>
                        <dt>Longitud</dt>
                        <dd>{format.longitude}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          </section>
        ) : (
          <div className="gps-converter-empty">
            <FiCompass aria-hidden="true" />
            <span>Ingresá las coordenadas y seleccioná “Convertir” para ver los formatos de salida.</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default GPSConverter;