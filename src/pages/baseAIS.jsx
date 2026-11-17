import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/baseAIS.css';
import BaseInfoCard from '../components/baseAIS/baseInfoCard';
import CampaignSummary from '../components/baseAIS/campaignSummary';
import AuthContext from '../context/authContext';
import config from '../config';
import { toast } from 'react-toastify';

const formatEventDate = (value) => {
  if (!value) return 'Sin fecha';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Sin fecha';

  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

const BaseAIS = () => {
  const [base, setBase] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [newYear, setNewYear] = useState('');
  const [pageError, setPageError] = useState(null);
  const [eventModalOpen, setEventModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState(null);
  const [eventForm, setEventForm] = useState({
    base_id: '',
    fecha_evento: '',
    fecha_resolucion: '',
    titulo_evento: '',
    descripcion_evento: '',
    resolucion_evento: '',
  });

  const { baseId } = useParams();
  const { authUser } = useContext(AuthContext);

  useEffect(() => {
    document.body.classList.toggle('modal-open', eventModalOpen);

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [eventModalOpen]);

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

  const toInputDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return date.toISOString().slice(0, 10);
  };

  const resetEventForm = () => {
    setEventForm({
      base_id: baseId || '',
      fecha_evento: '',
      fecha_resolucion: '',
      titulo_evento: '',
      descripcion_evento: '',
      resolucion_evento: '',
    });
    setEditingEventId(null);
  };

  const openCreateEventModal = () => {
    resetEventForm();
    setEventModalOpen(true);
  };

  const openEditEventModal = (event) => {
    setEditingEventId(event._id);
    setEventForm({
      base_id: event.base_id || baseId,
      fecha_evento: toInputDate(event.fecha_evento),
      fecha_resolucion: toInputDate(event.fecha_resolucion),
      titulo_evento: event.titulo_evento || '',
      descripcion_evento: event.descripcion_evento || '',
      resolucion_evento: event.resolucion_evento || '',
    });
    setEventModalOpen(true);
  };

  const handleEventFormChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const getErrorDetails = async (response, fallbackMessage) => {
    const errorText = await response.text();
    let message = fallbackMessage;

    if (response.status === 403) {
      message = 'No tenés permisos para realizar esta acción';
    } else if (response.status === 401) {
      message = 'Tu sesión venció. Iniciá sesión nuevamente';
    } else if (errorText) {
      try {
        const parsed = JSON.parse(errorText);
        if (parsed?.message) message = parsed.message;
        else message = errorText;
      } catch {
        message = errorText;
      }
    }

    return {
      status: response.status,
      message,
    };
  };

  const createOrUpdateEvent = async () => {
    if (!baseId) {
      toast.error('No se pudo identificar la base');
      return;
    }

    if (!eventForm.titulo_evento.trim()) {
      toast.warning('El título del evento es obligatorio');
      return;
    }

    if (!eventForm.fecha_evento) {
      toast.warning('La fecha del evento es obligatoria');
      return;
    }

    const payload = {
      ...eventForm,
      base_id: baseId,
      titulo_evento: eventForm.titulo_evento.trim(),
      descripcion_evento: eventForm.descripcion_evento?.trim() || '',
      resolucion_evento: eventForm.resolucion_evento?.trim() || '',
      fecha_evento: new Date(`${eventForm.fecha_evento}T00:00:00`).toISOString(),
      fecha_resolucion: eventForm.fecha_resolucion
        ? new Date(`${eventForm.fecha_resolucion}T00:00:00`).toISOString()
        : undefined,
    };

    try {
      const url = editingEventId
        ? `${config.baseURL}/api/evento/${editingEventId}`
        : `${config.baseURL}/api/evento`;

      const method = editingEventId ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await getErrorDetails(response, 'No se pudo guardar el evento');
        setPageError(error);
        throw new Error(error.message);
      }

      const message = editingEventId
        ? 'Evento actualizado correctamente'
        : 'Evento creado correctamente';

      toast.success(message);
      setEventModalOpen(false);
      resetEventForm();
      fetchEvents();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo guardar el evento');
    }
  };

  const deleteEvent = async (eventId) => {
    const confirmed = window.confirm('¿Seguro que querés eliminar este evento?');
    if (!confirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/evento/${eventId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const error = await getErrorDetails(response, 'No se pudo eliminar el evento');
        setPageError(error);
        throw new Error(error.message);
      }

      setEvents((prev) => prev.filter((event) => event._id !== eventId));
      toast.success('Evento eliminado');
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'No se pudo eliminar el evento');
    }
  };

  const fetchEvents = async () => {
    if (!baseId) return;

    try {
      const response = await fetch(`${config.baseURL}/api/eventos/${baseId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const error = await getErrorDetails(response, 'No se pudo cargar el historial de eventos');
        setPageError(error);
        throw new Error(error.message);
      }

      const data = await response.json();
      const sorted = [...data].sort(
        (a, b) => new Date(b.fecha_evento) - new Date(a.fecha_evento)
      );
      setEvents(sorted);
    } catch (error) {
      console.error(error);
      toast.error('No se pudo cargar el historial de eventos');
    }
  };

   /* CARGAR DATOS INICIALES DE BASE Y CAMPAÑAS */
  useEffect(() => {
    if (!baseId) return;

    /* Cargar la base */
    const fetchBase = async () => {
      try {
        const response = await fetch(`${config.baseURL}/api/base/${baseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await getErrorDetails(response, 'No se pudo cargar la base AIS');
          setPageError(error);
          throw new Error(error.message);
        }

        const data = await response.json();
        setBase(data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la base AIS');
      }
    };

    fetchBase();

    const fetchCampaigns = async () => {
      try {
        const response = await fetch(`${config.baseURL}/api/base-anual/${baseId}`, {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const error = await getErrorDetails(response, 'No se pudo cargar la base AIS');
          setPageError(error);
          throw new Error(error.message);
        }

        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la base AIS');
      }
    };

    fetchCampaigns();
    fetchEvents();

  }, [baseId]);

  /* Actualizar bases */

  const confirmSaveBase = async (updatedBase) => {
  try {
    const response = await fetch(
      `${config.baseURL}/api/base/${updatedBase._id}`,
      {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedBase)
      }
    );

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }

    const savedBase = await response.json();
    setBase(savedBase);

    toast.success('Base actualizada correctamente');
  } catch (error) {
    console.error(error);
    toast.error('No se pudieron guardar los cambios');
  }
};


  const handleSaveBase = (updatedBase) => {
  toast(
    ({ closeToast }) => (
      <div>
        <p style={{ marginBottom: 8 }}>
          ¿Querés guardar los cambios de la base?
        </p>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            className="ais-btn-small green"
            onClick={() => {
              closeToast();
              confirmSaveBase(updatedBase);
            }}
          >
            Guardar
          </button>

          <button
            className="ais-btn-small"
            onClick={closeToast}
          >
            Cancelar
          </button>
        </div>
      </div>
    ),
    { autoClose: false }
  );
};


  /* Actualizar campaña */

    const handleSaveCampaign = async (updatedCampaign) => {
      try {
        const response = await fetch(
          `${config.baseURL}/api/base-anual/${updatedCampaign._id}`,
          {
            method: 'PATCH', // o PUT, ambos funcionan según tu router
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedCampaign)
          }
        );

        if (!response.ok) {
          throw new Error(`Error ${response.status}`);
        }

        const savedCampaign = await response.json();

        // actualizar el estado local
        setCampaigns(prev =>
          prev.map(c =>
            c._id === savedCampaign._id ? savedCampaign : c
          )
        );

        toast.success(`Campaña ${savedCampaign.anio} actualizada`);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo guardar la campaña');
      }
    };

      /* Agregar campaña */

    const confirmAddCampaign = async () => {
      try {
        const response = await fetch(
          `${config.baseURL}/api/base-anual`,
          {
            method: 'POST',
            credentials: 'include',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              base_id: baseId,
              anio: Number(newYear)
            })
          }
        );

        if (!response.ok) {
          throw new Error();
        }

        const createdCampaign = await response.json();

        setCampaigns(prev => [...prev, createdCampaign]);
        setNewYear('');

        toast.success('Campaña creada');
      } catch (error) {
        console.error(error);
        toast.error('No se pudo crear la campaña');
      }
    };

    const handleAddCampaign = async () => {
      const year = Number(newYear);
      const currentYear = new Date().getFullYear();
      const maxYear = currentYear + 1;

      if (!newYear) {
        toast.warning('Ingresá un año');
        return;
      }

      if (!Number.isInteger(year)) {
        toast.error('El año debe ser un número entero');
        return;
      }

      if (year < 2010 || year > maxYear) {
        toast.error(
          `El año debe estar entre 2010 y ${maxYear}`
        );
        return;
      }

      // 🚫 evitar duplicados en frontend (opcional pero recomendable)
      const exists = campaigns.some(c => c.anio === year);
      if (exists) {
        toast.warning(`La campaña ${year} ya existe`);
        return;
      }

      toast(
        ({ closeToast }) => (
          <div>
            <p style={{ marginBottom: 8 }}>
              ¿Querés crear la campaña <b>{year}</b>?
            </p>
            <p style={{ fontSize: 12, opacity: 0.8 }}>
              ⚠️ Solo un administrador podrá eliminarla.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              <button
                className="ais-btn-small green"
                onClick={() => {
                  closeToast();
                  confirmAddCampaign();
                }}
              >
                Crear
              </button>
              <button
                className="ais-btn-small"
                onClick={closeToast}
              >
                Cancelar
              </button>
            </div>
          </div>
        ),
        { autoClose: false }
      );
    };


  return (
    <div className="base-container">
      {pageError && (
        <div className="page-error-banner" role="alert">
          <strong>Error {pageError.status ? `(${pageError.status})` : ''}:</strong>
          <span>{pageError.message}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="base-header">
        <h2 className="search-title">
          BASE AIS – {base ? base.nombre_base : 'Cargando...'}
        </h2>

        <div className="header-buttons">
          <button className="ais-btn-small green" onClick={openCreateEventModal}>
            Nuevo Evento
          </button>
        </div>
      </div>

      {/* INFO BASE */}
      {base && (
        <BaseInfoCard
          base={base}
          setBase={setBase}
          onSave={handleSaveBase}
        />
      )}

      {/* RESUMEN ÚLTIMA CAMPAÑA */}
      {campaigns.length > 0 && (
          <CampaignSummary
            campaigns={campaigns}
            onSave={handleSaveCampaign}
            onAdd={handleAddCampaign}
            newYear={newYear}
            setNewYear={setNewYear}
          />
        )}


      {/* HISTORIAL DE EVENTOS */}
      <div className="events-panel">
        <div className="base-info-header">
          <h3>Historial de eventos</h3>
        </div>

        {events.length === 0 ? (
          <div className="events-empty">
            <p>No hay eventos registrados para esta base todavía.</p>
          </div>
        ) : (
          <div className="events-list">
            {events.map((event) => (
              <article key={event._id} className="event-item">
                <div className="event-topline">
                  <span className="event-date">
                    {formatEventDate(event.fecha_evento)}
                  </span>
                  <span
                    className={`event-status ${
                      event.fecha_resolucion ? 'resolved' : 'open'
                    }`}
                  >
                    {event.fecha_resolucion ? 'Resuelto' : 'En seguimiento'}
                  </span>
                </div>

                <h4>{event.titulo_evento || 'Evento sin título'}</h4>

                {event.descripcion_evento && (
                  <p className="event-description">{event.descripcion_evento}</p>
                )}

                {event.resolucion_evento && (
                  <div className="event-resolution">
                    <strong>Resolución:</strong>
                    <p>{event.resolucion_evento}</p>
                  </div>
                )}

                {event.fecha_resolucion && (
                  <div className="event-resolution-date">
                    <strong>Fecha de resolución:</strong>{' '}
                    {formatEventDate(event.fecha_resolucion)}
                  </div>
                )}

                <div className="event-actions">
                  <button
                    className="event-action-btn edit"
                    onClick={() => openEditEventModal(event)}
                  >
                    Editar
                  </button>
                  <button
                    className="event-action-btn delete"
                    onClick={() => deleteEvent(event._id)}
                  >
                    Borrar
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>

      {eventModalOpen && (
        <div
          className="modalOverlay"
          onMouseDown={(e) => {
            if (e.target.classList.contains('modalOverlay')) {
              setEventModalOpen(false);
              resetEventForm();
            }
          }}
        >
          <div className="modalContent event-modal">
            <button
              className="modalClose"
              onClick={() => {
                setEventModalOpen(false);
                resetEventForm();
              }}
            >
              ×
            </button>

            <h2 className="modal-title">
              {editingEventId ? 'Editar evento' : 'Nuevo evento'}
            </h2>

            <div className="event-form-grid">
              <input
                className="modal-text-box"
                type="date"
                value={eventForm.fecha_evento}
                onChange={(e) => handleEventFormChange('fecha_evento', e.target.value)}
                placeholder="Fecha del evento"
              />

              <input
                className="modal-text-box"
                type="date"
                value={eventForm.fecha_resolucion}
                onChange={(e) => handleEventFormChange('fecha_resolucion', e.target.value)}
                placeholder="Fecha de resolución"
              />

              <input
                className="modal-text-box full-width"
                type="text"
                value={eventForm.titulo_evento}
                onChange={(e) => handleEventFormChange('titulo_evento', e.target.value)}
                placeholder="Título del evento"
              />

              <textarea
                className="modal-text-box full-width"
                rows={4}
                value={eventForm.descripcion_evento}
                onChange={(e) => handleEventFormChange('descripcion_evento', e.target.value)}
                placeholder="Descripción del evento"
              />

              <textarea
                className="modal-text-box full-width"
                rows={4}
                value={eventForm.resolucion_evento}
                onChange={(e) => handleEventFormChange('resolucion_evento', e.target.value)}
                placeholder="Resolución / seguimiento"
              />
            </div>

            <button className="ais-btn-primary event-submit-btn" onClick={createOrUpdateEvent}>
              {editingEventId ? 'Guardar cambios' : 'Crear evento'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BaseAIS;


/* 

Estructura de la pagina:

src/
 ├─ pages/
 │   └─ BaseAIS.jsx
 ├─ components/
 │   ├─ BaseInfoCard.jsx
 │   ├─ CampaignSummary.jsx
 │   ├─ CampaignYearsBar.jsx
 │   ├─ EventsBoard.jsx
 │   └─ modals/
 │       ├─ CampaignModal.jsx
 │       └─ EventModal.jsx
 └─ styles/
     └─ baseAIS.css

*/