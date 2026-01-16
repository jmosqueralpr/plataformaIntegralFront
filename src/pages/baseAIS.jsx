import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import '../styles/baseAIS.css';
import BaseInfoCard from '../components/baseAIS/baseInfoCard';
import CampaignSummary from '../components/baseAIS/campaignSummary';
import AuthContext from '../context/authContext';
import config from '../config';
import { toast } from 'react-toastify';

const BaseAIS = () => {
  const [base, setBase] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [events, setEvents] = useState([]);
  const [newYear, setNewYear] = useState('');

  const { baseId } = useParams();
  const { authUser } = useContext(AuthContext);

  const currentYear = new Date().getFullYear();
  const maxYear = currentYear + 1;

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
          throw new Error(`Error ${response.status}`);
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
          throw new Error(`Error ${response.status}`);
        }

        const data = await response.json();
        setCampaigns(data);
        console.log(data);
      } catch (error) {
        console.error(error);
        toast.error('No se pudo cargar la base AIS');
      }
    };

    fetchCampaigns();

    /* Cargar las campañas */

    


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
      {/* HEADER */}
      <div className="base-header">
        <h2 className="search-title">
          BASE AIS – {base ? base.nombre_base : 'Cargando...'}
        </h2>

        <div className="header-buttons">
          <button className="ais-btn-small green"> Nuevo Evento </button>
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


      {/* Próximos componentes */}
      {/* <CampaignSummary campaigns={campaigns} /> */}
      {/* <CampaignYearsBar campaigns={campaigns} /> */}
      {/* <EventsBoard events={events} /> */}
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