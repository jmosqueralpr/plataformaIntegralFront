import { useState } from 'react';
import { FiAlertCircle, FiCheckCircle, FiDownload, FiFileText, FiUploadCloud } from 'react-icons/fi';
import '../../styles/verificadorMGE8.css';
import config from '../../config';

const MAX_FILE_SIZE = 25 * 1024 * 1024;
const numberFormat = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 5 });

const hasValue = (value) => typeof value === 'number' && Number.isFinite(value);
const formatValue = (value, unit = '') => (hasValue(value) ? `${numberFormat.format(value)}${unit ? ` ${unit}` : ''}` : '—');

const formatMessageTime = (sample) => {
  if (sample.utcDay === null || sample.utcHour === null || sample.utcMinute === null) return 'Sin hora válida';
  const hour = String(sample.utcHour).padStart(2, '0');
  const minute = String(sample.utcMinute).padStart(2, '0');
  return `Día ${sample.utcDay} · ${hour}:${minute} UTC`;
};

const VerificadorMGE8 = () => {
  const [report, setReport] = useState(null);
  const [fileName, setFileName] = useState('');
  const [sourceFile, setSourceFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloadingMmsi, setDownloadingMmsi] = useState('');
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;

    setReport(null);
    setSourceFile(null);
    setError('');

    if (!file.name.toLowerCase().endsWith('.txt')) {
      setFileName('');
      setError('Seleccioná un archivo con extensión .txt.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setFileName('');
      setError('El archivo supera el límite de 25 MB.');
      return;
    }

    setFileName(file.name);
    setSourceFile(file);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${config.baseURL}/api/decode-mge8`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'No se pudo analizar el archivo.');
      }
      if (!data.stats || !Array.isArray(data.stations)) {
        throw new Error('El resultado recibido no tiene un formato válido.');
      }

      setReport(data);
    } catch (requestError) {
      setError(requestError.message || 'No se pudo analizar el archivo.');
    } finally {
      setLoading(false);
    }
  };

  const handleMmsiDownload = async (mmsi) => {
    if (!sourceFile || downloadingMmsi) return;

    setError('');
    setDownloadingMmsi(mmsi);

    try {
      const formData = new FormData();
      formData.append('file', sourceFile);
      formData.append('mmsi', mmsi);

      const response = await fetch(`${config.baseURL}/api/export-mge8-mmsi`, {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type') || '';
        const data = contentType.includes('application/json') ? await response.json() : null;
        throw new Error(data?.message || 'No se pudieron descargar los mensajes de este MMSI.');
      }

      const blob = await response.blob();
      if (!blob.size) {
        throw new Error('El archivo generado no contiene mensajes.');
      }

      const date = new Date();
      const datePrefix = [
        String(date.getFullYear()).slice(-2),
        String(date.getMonth() + 1).padStart(2, '0'),
        String(date.getDate()).padStart(2, '0'),
      ].join('');
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `${datePrefix}mge8mmsi_${mmsi}.txt`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => window.URL.revokeObjectURL(downloadUrl), 1000);
    } catch (requestError) {
      setError(requestError.message || 'No se pudieron descargar los mensajes de este MMSI.');
    } finally {
      setDownloadingMmsi('');
    }
  };

  return (
    <div className="mge8-verifier-page">
      <main className="mge8-verifier-main">
        <header className="mge8-verifier-hero">
          <span className="mge8-verifier-kicker">Herramientas AIS</span>
          <h1>Verificador de Message 8</h1>
          <p>
            Subí un archivo TXT con tramas NMEA AIS recibidas. La herramienta valida sus
            checksums, reensambla los mensajes fragmentados y busca los Message 8 completos.
            Después agrupa los resultados por MMSI y muestra cuántos mensajes recibió cada
            equipo, una muestra con los datos que pudo decodificar y las tramas originales
            para que puedas verificarlas. El resumen también indica si encontró tramas
            inválidas o mensajes incompletos.
          </p>
        </header>

        <section className="mge8-upload-card" aria-labelledby="mge8-upload-title">
          <div className="mge8-upload-description">
            <span className="mge8-upload-icon"><FiFileText aria-hidden="true" /></span>
            <div>
              <h2 id="mge8-upload-title">Archivo de recepción AIS</h2>
              <p>Se reensamblan las tramas multipart y se verifican sus checksums.</p>
            </div>
          </div>

          <label className="mge8-file-picker">
            <FiUploadCloud aria-hidden="true" />
            <span>{loading ? 'Analizando archivo…' : fileName || 'Seleccionar archivo TXT'}</span>
            <input
              type="file"
              accept=".txt,text/plain"
              onChange={handleFileUpload}
              disabled={loading || Boolean(downloadingMmsi)}
              aria-label="Seleccionar archivo TXT con mensajes AIS"
            />
          </label>
          <p className="mge8-upload-hint">Formato permitido: .txt · Tamaño máximo: 25 MB</p>
        </section>

        {loading && (
          <div className="mge8-state-card" role="status">
            <span className="mge8-loading-indicator" aria-hidden="true" />
            <span>Procesando las tramas AIS del archivo…</span>
          </div>
        )}

        {error && (
          <div className="mge8-state-card is-error" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}

        {report && (
          <>
            <section className="mge8-summary-grid" aria-label="Resumen del análisis">
              <div className="mge8-summary-card">
                <span>Mensajes 8 completos</span>
                <strong>{report.stats.message8Count}</strong>
              </div>
              <div className="mge8-summary-card">
                <span>MMSI encontrados</span>
                <strong>{report.stats.stationCount}</strong>
              </div>
              <div className="mge8-summary-card">
                <span>Tramas inválidas</span>
                <strong>{report.stats.invalidSentenceCount}</strong>
              </div>
              <div className="mge8-summary-card">
                <span>Mensajes incompletos</span>
                <strong>{report.stats.incompleteMessageCount}</strong>
              </div>
            </section>

            {report.stations.length === 0 ? (
              <div className="mge8-state-card">
                <FiAlertCircle aria-hidden="true" />
                <span>No se encontraron mensajes tipo 8 completos en {fileName}.</span>
              </div>
            ) : (
              <section className="mge8-results-card" aria-labelledby="mge8-results-title" aria-live="polite">
                <div className="mge8-results-header">
                  <div>
                    <span className="mge8-verifier-kicker">Resultado de verificación</span>
                    <h2 id="mge8-results-title">MMSI que transmitieron Message 8</h2>
                  </div>
                  <span className="mge8-file-name">{fileName}</span>
                </div>

                <p className="mge8-results-note">
                  Cada fila muestra una trama recibida y decodificada. Los campos sin valor
                  disponible se dejan vacíos; no se generan datos de ejemplo.
                </p>

                <div className="mge8-table-scroll">
                  <table className="mge8-results-table">
                    <thead>
                      <tr>
                        <th scope="col">MMSI</th>
                        <th scope="col">Mensajes 8</th>
                        <th scope="col">Formato</th>
                        <th scope="col">Posición</th>
                        <th scope="col">Viento</th>
                        <th scope="col">Ambiente</th>
                        <th scope="col">Trama real de ejemplo</th>
                        <th scope="col">Descarga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {report.stations.map((station) => {
                        const { sample } = station;
                        const lineLabel = sample.sourceLines.length === 1
                          ? `línea ${sample.sourceLines[0]}`
                          : `líneas ${sample.sourceLines[0]}–${sample.sourceLines[sample.sourceLines.length - 1]}`;

                        return (
                          <tr key={station.mmsi}>
                            <th scope="row">
                              <strong className="mge8-mmsi">{station.mmsi}</strong>
                            </th>
                            <td>
                              <strong>{station.messageCount}</strong>
                              <small>{station.decodedMessageCount} decodificados</small>
                            </td>
                            <td>
                              <span className={`mge8-decode-status ${sample.decoded ? 'is-valid' : 'is-unknown'}`}>
                                {sample.decoded ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
                                DAC {formatValue(sample.dac)} / FI {formatValue(sample.fi)}
                              </span>
                              <small>{sample.decoded ? 'Datos interpretados' : 'Trama recibida'}</small>
                            </td>
                            <td>
                              <span>Lat {formatValue(sample.latitude, '°')}</span>
                              <span>Lon {formatValue(sample.longitude, '°')}</span>
                              <small>{formatMessageTime(sample)}</small>
                            </td>
                            <td>
                              <span>Promedio {formatValue(sample.averageWindSpeed, 'kn')}</span>
                              <span>Ráfaga {formatValue(sample.windGust, 'kn')}</span>
                              <small>
                                Dirección {formatValue(sample.windDirection, '°')}
                                {hasValue(sample.gustDirection) ? ` · ráfaga ${formatValue(sample.gustDirection, '°')}` : ''}
                              </small>
                            </td>
                            <td>
                              <span>Temperatura {formatValue(sample.airTemperature, '°C')}</span>
                              <span>Humedad {formatValue(sample.relativeHumidity, '%')}</span>
                              <small>Presión {formatValue(sample.airPressure, 'hPa')}</small>
                            </td>
                            <td>
                              <details className="mge8-raw-details">
                                <summary>Ver trama · {lineLabel}</summary>
                                <pre>{sample.rawSentences.join('\n')}</pre>
                              </details>
                            </td>
                            <td>
                              <button
                                type="button"
                                className="mge8-download-button"
                                onClick={() => handleMmsiDownload(station.mmsi)}
                                disabled={!sourceFile || Boolean(downloadingMmsi)}
                                aria-label={`Descargar mensajes de ${station.mmsi}`}
                              >
                                <FiDownload aria-hidden="true" />
                                {downloadingMmsi === station.mmsi ? 'Preparando…' : 'Descargar TXT'}
                              </button>
                              <small>Todos los Message 8 de este MMSI</small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default VerificadorMGE8;
