import { useEffect, useState } from 'react';
import { FiAlertCircle, FiArrowLeft, FiCheckCircle, FiMessageSquare, FiSearch, FiSend, FiUsers } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import config from '../config';
import '../styles/telegramMessages.css';

const MAX_MESSAGE_LENGTH = 4096;

const TelegramMessages = () => {
  const [recipients, setRecipients] = useState([]);
  const [selectedUsernames, setSelectedUsernames] = useState([]);
  const [audience, setAudience] = useState('all');
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [sendError, setSendError] = useState('');
  const [sendResult, setSendResult] = useState(null);

  useEffect(() => {
    let active = true;

    const loadRecipients = async () => {
      try {
        const response = await fetch(`${config.baseURL}/api/telegram/message-recipients`, {
          credentials: 'include',
        });
        const data = await response.json();

        if (response.status === 403) {
          if (active) setAccessDenied(true);
          return;
        }
        if (!response.ok) {
          throw new Error(data.message || 'No se pudieron cargar los usuarios.');
        }
        if (!Array.isArray(data)) {
          throw new Error('La lista de usuarios recibida no es válida.');
        }

        if (active) setRecipients(data);
      } catch (error) {
        if (active) setLoadError(error.message || 'No se pudieron cargar los usuarios.');
      } finally {
        if (active) setIsLoading(false);
      }
    };

    loadRecipients();
    return () => {
      active = false;
    };
  }, []);

  const visibleRecipients = recipients.filter((recipient) =>
    recipient.username.toLowerCase().includes(search.trim().toLowerCase())
  );
  const visibleUsernames = visibleRecipients.map((recipient) => recipient.username);
  const allVisibleSelected = visibleUsernames.length > 0
    && visibleUsernames.every((username) => selectedUsernames.includes(username));

  const toggleRecipient = (username) => {
    setSelectedUsernames((previous) => (
      previous.includes(username)
        ? previous.filter((selected) => selected !== username)
        : [...previous, username]
    ));
    setSendResult(null);
  };

  const toggleVisibleRecipients = () => {
    setSelectedUsernames((previous) => {
      const next = new Set(previous);
      if (allVisibleSelected) {
        visibleUsernames.forEach((username) => next.delete(username));
      } else {
        visibleUsernames.forEach((username) => next.add(username));
      }
      return [...next];
    });
    setSendResult(null);
  };

  const handleSend = async (event) => {
    event.preventDefault();
    const cleanMessage = message.trim();
    if (!cleanMessage) {
      setSendError('Escribí el mensaje antes de enviarlo.');
      return;
    }

    const selectedCount = audience === 'all' ? recipients.length : selectedUsernames.length;
    if (selectedCount === 0) {
      setSendError('Seleccioná al menos un usuario con Telegram vinculado.');
      return;
    }

    const audienceDescription = audience === 'all'
      ? `todos los ${selectedCount} usuarios con Telegram vinculado`
      : `${selectedCount} ${selectedCount === 1 ? 'usuario seleccionado' : 'usuarios seleccionados'}`;
    if (!window.confirm(`¿Querés enviar este mensaje a ${audienceDescription}?`)) return;

    setIsSending(true);
    setSendError('');
    setSendResult(null);

    try {
      const response = await fetch(`${config.baseURL}/api/send-telegram-message`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDestiny: audience === 'all' ? 'all' : selectedUsernames,
          message: cleanMessage,
        }),
      });
      const data = await response.json();
      if (!response.ok && typeof data.sent !== 'number') {
        throw new Error(data.message || 'No se pudo enviar el mensaje.');
      }

      setSendResult(data);
      if (data.sent > 0 && data.failed === 0) {
        toast.success(data.message || 'Mensaje enviado correctamente.');
        setMessage('');
      } else if (data.sent > 0) {
        toast.warning(data.message || 'El mensaje se envió parcialmente.');
      } else {
        toast.error(data.message || 'No se pudo entregar el mensaje.');
      }
    } catch (error) {
      setSendError(error.message || 'No se pudo enviar el mensaje.');
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="telegram-admin-page">
        <main className="telegram-admin-main">
          <div className="telegram-admin-state">Cargando destinatarios…</div>
        </main>
      </div>
    );
  }

  if (accessDenied) {
    return (
      <div className="telegram-admin-page">
        <main className="telegram-admin-main">
          <div className="telegram-admin-state is-denied" role="alert">
            <FiAlertCircle aria-hidden="true" />
            <div>
              <h1>Acceso restringido</h1>
              <p>Esta herramienta está disponible solo para administradores.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="telegram-admin-page">
      <main className="telegram-admin-main">
        <Link className="telegram-admin-back" to="/dashboard">
          <FiArrowLeft aria-hidden="true" />
          Volver al panel
        </Link>

        <header className="telegram-admin-hero">
          <span className="telegram-admin-eyebrow">Herramientas de administración</span>
          <h1>Mensajes por Telegram</h1>
          <p>Redactá un aviso y elegí si enviarlo a toda la comunidad o a usuarios específicos.</p>
        </header>

        <div className="telegram-admin-grid">
          <form className="telegram-compose-card" onSubmit={handleSend}>
            <div className="telegram-admin-section-heading">
              <span className="telegram-admin-icon"><FiMessageSquare aria-hidden="true" /></span>
              <div>
                <span className="telegram-admin-eyebrow">Nuevo aviso</span>
                <h2>Redactar mensaje</h2>
              </div>
            </div>

            <fieldset className="telegram-audience-options">
              <legend>Destinatarios</legend>
              <label className={`telegram-audience-option ${audience === 'all' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="telegram-audience"
                  value="all"
                  checked={audience === 'all'}
                  onChange={() => {
                    setAudience('all');
                    setSendResult(null);
                  }}
                />
                <FiUsers aria-hidden="true" />
                <span>
                  <strong>Todos</strong>
                  <small>{recipients.length} usuarios con Telegram vinculado</small>
                </span>
              </label>
              <label className={`telegram-audience-option ${audience === 'selected' ? 'is-selected' : ''}`}>
                <input
                  type="radio"
                  name="telegram-audience"
                  value="selected"
                  checked={audience === 'selected'}
                  onChange={() => {
                    setAudience('selected');
                    setSendResult(null);
                  }}
                />
                <FiUsers aria-hidden="true" />
                <span>
                  <strong>Usuarios específicos</strong>
                  <small>{selectedUsernames.length} seleccionados</small>
                </span>
              </label>
            </fieldset>

            {audience === 'selected' && (
              <div className="telegram-recipient-picker">
                <div className="telegram-recipient-toolbar">
                  <label className="telegram-recipient-search">
                    <FiSearch aria-hidden="true" />
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Buscar usuario"
                      aria-label="Buscar usuario destinatario"
                    />
                  </label>
                  <button type="button" className="telegram-select-visible" onClick={toggleVisibleRecipients}>
                    {allVisibleSelected ? 'Quitar visibles' : 'Seleccionar visibles'}
                  </button>
                </div>

                <div className="telegram-recipient-list">
                  {visibleRecipients.length > 0 ? visibleRecipients.map((recipient) => (
                    <label className="telegram-recipient-option" key={recipient.id}>
                      <input
                        type="checkbox"
                        checked={selectedUsernames.includes(recipient.username)}
                        onChange={() => toggleRecipient(recipient.username)}
                      />
                      <span>{recipient.username}</span>
                    </label>
                  )) : (
                    <p className="telegram-recipient-empty">
                      {recipients.length ? 'No hay usuarios que coincidan con la búsqueda.' : 'No hay usuarios con Telegram vinculado.'}
                    </p>
                  )}
                </div>
              </div>
            )}

            {audience === 'all' && (
              <div className="telegram-broadcast-notice">
                <FiAlertCircle aria-hidden="true" />
                <span>El aviso se enviará a todos los usuarios que hayan vinculado Telegram.</span>
              </div>
            )}

            <label className="telegram-message-field">
              <span>Mensaje</span>
              <textarea
                value={message}
                onChange={(event) => {
                  setMessage(event.target.value);
                  setSendError('');
                  setSendResult(null);
                }}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Escribí el mensaje que recibirán por Telegram…"
                rows={7}
              />
            </label>
            <div className="telegram-message-footer">
              <span>Se enviará como texto sin formato.</span>
              <span>{message.length}/{MAX_MESSAGE_LENGTH}</span>
            </div>

            {sendError && <p className="telegram-send-error" role="alert">{sendError}</p>}

            <button
              type="submit"
              className="telegram-send-button"
              disabled={isSending || !message.trim() || !recipients.length || (audience === 'selected' && !selectedUsernames.length)}
            >
              <FiSend aria-hidden="true" />
              {isSending ? 'Enviando…' : 'Enviar mensaje'}
            </button>
          </form>

          <aside className="telegram-admin-aside">
            <section className="telegram-admin-info-card">
              <span className="telegram-admin-icon"><FiUsers aria-hidden="true" /></span>
              <h2>Destinatarios disponibles</h2>
              <strong className="telegram-recipient-total">{recipients.length}</strong>
              <p>Usuarios con su cuenta de Telegram vinculada al sistema.</p>
            </section>

            {loadError && (
              <div className="telegram-admin-state is-error" role="alert">
                <FiAlertCircle aria-hidden="true" />
                <span>{loadError}</span>
              </div>
            )}

            {sendResult && (
              <section className={`telegram-result-card ${sendResult.failed ? 'has-failures' : ''}`} role="status">
                {sendResult.sent > 0 ? <FiCheckCircle aria-hidden="true" /> : <FiAlertCircle aria-hidden="true" />}
                <div>
                  <h2>Resultado del envío</h2>
                  <p>{sendResult.sent} de {sendResult.total} mensajes enviados.</p>
                  {sendResult.failed > 0 && (
                    <>
                      <p>{sendResult.failed} {sendResult.failed === 1 ? 'destinatario no recibió' : 'destinatarios no recibieron'} el aviso.</p>
                      {sendResult.failedUsernames?.length > 0 && (
                        <ul>
                          {sendResult.failedUsernames.map((username) => <li key={username}>{username}</li>)}
                        </ul>
                      )}
                      {sendResult.failuresTruncated && <p>Se omitieron otros destinatarios de la lista.</p>}
                    </>
                  )}
                </div>
              </section>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default TelegramMessages;
