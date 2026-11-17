import { useContext, useEffect, useState } from 'react';
import { FiArrowUpRight, FiCheck, FiCopy, FiMessageCircle, FiSearch, FiShield, FiZap } from 'react-icons/fi';
import telegramQr from '../img/telegramQr.jpg';
import AuthContext from '../context/authContext';
import config from '../../src/config';
import '../styles/telegramAssistant.css';

const TELEGRAM_BOT_URL = 'https://t.me/PlataformaDyb_bot';

const AsistenteTelegram = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const [hasAuthenticatedSession, setHasAuthenticatedSession] = useState(isAuthenticated);
  const [linkCode, setLinkCode] = useState('');
  const [linkCodeError, setLinkCodeError] = useState('');
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [isCodeCopied, setIsCodeCopied] = useState(false);

  useEffect(() => {
    let active = true;
    if (isAuthenticated) {
      setHasAuthenticatedSession(true);
      return () => {
        active = false;
      };
    }

    setHasAuthenticatedSession(false);
    fetch(`${config.baseURL}/api/profile`, { credentials: 'include' })
      .then((response) => {
        if (active && response.ok) setHasAuthenticatedSession(true);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const generateLinkCode = async () => {
    setIsGeneratingCode(true);
    setLinkCodeError('');
    setLinkCode('');
    setIsCodeCopied(false);

    try {
      const response = await fetch(`${config.baseURL}/api/telegram/link-code`, {
        method: 'POST',
        credentials: 'include',
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'No se pudo generar el código.');
      }

      setLinkCode(data.code);
    } catch (error) {
      setLinkCodeError(error.message || 'No se pudo generar el código.');
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const copyLinkCode = async () => {
    try {
      await navigator.clipboard.writeText(linkCode);
      setIsCodeCopied(true);
      setLinkCodeError('');
    } catch {
      setLinkCodeError('No se pudo copiar. Seleccioná el código y copialo manualmente.');
    }
  };

  return (
    <div className="telegram-page">
      <main className="telegram-layout">
        <section className="telegram-hero" aria-labelledby="telegram-title">
          <div className="telegram-hero-copy">
            <span className="telegram-eyebrow">
              <span className="telegram-status-dot" />
              Integración disponible
            </span>
            <h1 id="telegram-title">Tu asistente de trabajo, también en Telegram.</h1>
            <p>
              Consultá tus tareas, registrá vencimientos y encontrá soluciones técnicas desde una conversación.
            </p>
            <div className="telegram-hero-actions">
              <a className="telegram-open-button" href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
                <FiMessageCircle aria-hidden="true" />
                Abrir el asistente
                <FiArrowUpRight className="telegram-open-arrow" aria-hidden="true" />
              </a>
              <span className="telegram-bot-handle">@PlataformaDyb_bot</span>
            </div>
          </div>
          <div className="telegram-hero-mark" aria-hidden="true">
            <FiMessageCircle />
            <span className="telegram-hero-spark">✦</span>
          </div>
        </section>

        <div className="telegram-setup-grid">
          <section className="telegram-card telegram-link-card" aria-labelledby="telegram-link-title">
            <div className="telegram-card-heading">
              <span className="telegram-card-icon"><FiShield aria-hidden="true" /></span>
              <div>
                <span className="telegram-card-kicker">Vinculación segura</span>
                <h2 id="telegram-link-title">Conectá tu cuenta</h2>
              </div>
            </div>

            <p className="telegram-card-description">
              Generá un código temporal desde tu sesión iniciada. No compartas el código: cualquiera que lo tenga puede vincular su chat a tu cuenta.
            </p>

            {hasAuthenticatedSession ? (
              <div className="telegram-code-flow">
                <button
                  type="button"
                  className="telegram-primary-button"
                  onClick={generateLinkCode}
                  disabled={isGeneratingCode}
                >
                  {isGeneratingCode ? 'Generando código…' : 'Generar código de vinculación'}
                </button>

                {linkCode && (
                  <div className="telegram-code-panel" aria-live="polite">
                    <div className="telegram-code-meta">
                      <span className="telegram-code-label">Tu código</span>
                      <span className="telegram-expiry">Vence en 10 minutos</span>
                    </div>
                    <div className="telegram-code-row">
                      <code>{linkCode}</code>
                      <button
                        type="button"
                        className="telegram-copy-button"
                        onClick={copyLinkCode}
                        aria-label="Copiar código de vinculación"
                        title="Copiar código"
                      >
                        {isCodeCopied ? <FiCheck aria-hidden="true" /> : <FiCopy aria-hidden="true" />}
                      </button>
                    </div>
                    {isCodeCopied && <span className="telegram-copy-confirmation">Código copiado</span>}
                    <p className="telegram-code-instruction">
                      Abrí el bot y enviá <code>/vincular</code>, luego pegá este código.
                    </p>
                  </div>
                )}
                {linkCodeError && <p className="telegram-error" role="alert">{linkCodeError}</p>}
              </div>
            ) : (
              <div className="telegram-auth-notice" role="status">
                <FiShield aria-hidden="true" />
                <span>Iniciá sesión en la plataforma para generar tu código de vinculación.</span>
              </div>
            )}

            <p className="telegram-security-note">
              <FiShield aria-hidden="true" />
              <span>El bot nunca te pedirá la contraseña de tu cuenta.</span>
            </p>
          </section>

          <aside className="telegram-card telegram-qr-card" aria-labelledby="telegram-qr-title">
            <div className="telegram-qr-heading">
              <span className="telegram-card-kicker">Acceso rápido</span>
              <h2 id="telegram-qr-title">Escaneá para abrir Telegram</h2>
              <p>Usá la cámara de tu teléfono para ir directamente al asistente.</p>
            </div>
            <a className="telegram-qr-link" href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
              <img src={telegramQr} alt="Código QR para abrir el asistente de Telegram" />
            </a>
            <a className="telegram-text-link" href={TELEGRAM_BOT_URL} target="_blank" rel="noopener noreferrer">
              Abrir @PlataformaDyb_bot <FiArrowUpRight aria-hidden="true" />
            </a>
          </aside>
        </div>

        <section className="telegram-steps-card" aria-labelledby="telegram-steps-title">
          <div className="telegram-steps-heading">
            <span className="telegram-card-kicker">En pocos pasos</span>
            <h2 id="telegram-steps-title">Empezá a usarlo</h2>
          </div>
          <ol className="telegram-steps">
            <li>
              <span className="telegram-step-number">01</span>
              <div><h3>Generá tu código</h3><p>Crealo desde esta página con tu sesión iniciada.</p></div>
            </li>
            <li>
              <span className="telegram-step-number">02</span>
              <div><h3>Iniciá el bot</h3><p>Abrí Telegram y escribí <code>/vincular</code>.</p></div>
            </li>
            <li>
              <span className="telegram-step-number">03</span>
              <div><h3>Vinculá el chat</h3><p>Enviá el código antes de que venza y listo.</p></div>
            </li>
          </ol>
        </section>

        <section className="telegram-capabilities" aria-label="Funciones del asistente">
          <div className="telegram-capability">
            <FiZap aria-hidden="true" />
            <div><h3>Acciones rápidas</h3><p>Creá y consultá tareas o vencimientos.</p></div>
          </div>
          <div className="telegram-capability">
            <FiSearch aria-hidden="true" />
            <div><h3>Soluciones a mano</h3><p>Buscá respuestas técnicas desde el chat.</p></div>
          </div>
          <div className="telegram-capability">
            <FiShield aria-hidden="true" />
            <div><h3>Tu cuenta protegida</h3><p>Vinculación temporal, sin compartir contraseñas.</p></div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AsistenteTelegram;
