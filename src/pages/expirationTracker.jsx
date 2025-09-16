import React, { useState, useEffect, useContext } from 'react';
import ExpirationCard from '../components/ExpirationCard';
import '../styles/expirationTracker.css';
import '../styles/global.css';
import AuthContext from '../context/authContext';
import config from '../../src/config';
import { toast } from 'react-toastify';

const ExpirationTracker = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [results, setResults] = useState([]);
  const { authUser } = useContext(AuthContext); // Se usa para el creador por defecto
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const searchAssignedUsers = async () => {

    try {
      const response = await fetch (`${config.baseURL}/api/find-users`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Estos son los usuarios");
      setAssignedUsers(data);
    }  catch (error) {
      console.error("Error en la búsqueda:", error);
    }

  } 

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/api/expirations`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Error en la búsqueda de elementos de vencimiento:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    searchAssignedUsers();
  }, []);

  const isNewItem = selectedItem?.id === null || selectedItem?._id === null || !selectedItem?._id;

  const createItem = async () => {
    if (!selectedItem.title) {
      toast.alert("Por favor, complete el título.");
      return;
    }

    // Asegurarse de que assignedTo sea un array y tenga al menos el usuario actual si está vacío
    let finalAssignedTo = selectedItem.assignedTo || [];
    if (finalAssignedTo.length === 0 && authUser) {
        finalAssignedTo = authUser; // Asumiendo que authUser tiene username. Ajustar si es necesario.
    }

    console.log("Prueba para el post");
    console.log(selectedItem.assignedTo);
    console.log("username");
    console.log(authUser);
    try {
      const response = await fetch(`${config.baseURL}/api/expiration`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedItem.title,
          description: selectedItem.description, // Asegurar que no sea null
          expirationDate: selectedItem.expirationDate,
          expirationTime: selectedItem.expirationTime,
          notified: false,
          notify30DaysBefore: selectedItem.notify30DaysBefore,
          notify90DaysBefore: selectedItem.notify90DaysBefore,
          assignedTo: finalAssignedTo, // Usar finalAssignedTo 
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error al crear el elemento: ${response.statusText}`);
      }
      const newItem = await response.json();
      setResults((prevResults) => [...prevResults, newItem]);
      closeModal();
    } catch (error) {
      console.error("Error al crear el elemento:", error);
      toast.error(`Error al crear el elemento: ${error.message}`);
    }
  };

  const updateItem = async () => {
    if (!selectedItem || (!selectedItem._id && !selectedItem.id)) {
      console.error("No hay un elemento válido para actualizar.");
      return;
    }
    if (!selectedItem.title || !selectedItem.expirationDate) {
      toast.alert("Por favor, complete el título y la fecha de vencimiento.");
      return;
    }

    const isConfirmed = window.confirm("LA INFORMACIÓN DEL ELEMENTO CAMBIARÁ PERMANENTEMENTE, ¿ESTÁ SEGURO QUE QUIERE ACTUALIZARLA?");
    if (!isConfirmed) return;

    const itemId = selectedItem._id || selectedItem.id;

    // Asegurarse de que assignedTo sea un array y tenga al menos el usuario actual si está vacío
    let finalAssignedTo = selectedItem.assignedTo || [];
    if (finalAssignedTo.length === 0 && authUser) {
        finalAssignedTo = [authUser.username];
    }

    try {
      const response = await fetch(`${config.baseURL}/api/expiration/${itemId}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedItem.title,
          description: selectedItem.description || '',
          expirationDate: selectedItem.expirationDate,
          expirationTime: selectedItem.expirationTime || '',
          notified: false,
          notify30DaysBefore: selectedItem.notify30DaysBefore || false,
          notify90DaysBefore: selectedItem.notify90DaysBefore || false,
          assignedTo: finalAssignedTo,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al actualizar el elemento:", errorData.message);
        toast.error(`Error al actualizar: ${errorData.message || response.statusText}`);
        return;
      }
      const updatedItemData = await response.json();
      setResults(prevResults =>
        prevResults.map(item => ((item._id || item.id) === itemId ? updatedItemData : item))
      );
      closeModal();
    } catch (error) {
      console.error("Error al actualizar el elemento:", error);
      toast.error(`Error al actualizar el elemento: ${error.message}`);
    }
  };

  const deleteItem = async (itemId) => {
    const isConfirmed = window.confirm("EL ELEMENTO SE BORRARÁ PERMANENTEMENTE ¿ESTÁS SEGURO QUE DESEAS ELIMINARLO?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/expiration/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error al eliminar el elemento:", errorData.message);
        toast.error(`Error al eliminar: ${errorData.message || response.statusText}`);
        return;
      }
      setResults((prevResults) => prevResults.filter(item => (item._id || item.id) !== itemId));
      closeModal();
    } catch (error) {
      console.error("Error al conectar con el servidor para eliminar:", error);
      toast.error(`Error al eliminar el elemento: ${error.message}`);
    }
  };

  const handleUpdateCreate = async () => {
    if (isNewItem) {
      await createItem();
    } else {
      await updateItem();
    }
  };

  const openModal = (item) => {
    if (!item || item.id === null || !item._id) { // Nuevo ítem
      setSelectedItem({
        id: null,
        title: '',
        description: '',
        expirationDate: '',
        expirationTime: '',
        notify30DaysBefore: false,
        notify90DaysBefore: false,
        assignedTo: authUser && authUser.username ? [authUser.username] : [], // Asignar al usuario actual por defecto si está logueado
      });
    } else { // Ítem existente
      setSelectedItem({
        ...item,
        expirationDate: item.expirationDate ? new Date(item.expirationDate).toISOString().split('T')[0] : '',
        expirationTime: item.expirationTime || '',
        notify30DaysBefore: item.notify30DaysBefore || false,
        notify90DaysBefore: item.notify90DaysBefore || false,
        assignedTo: Array.isArray(item.assignedTo) ? item.assignedTo : (item.assignedTo ? [item.assignedTo] : []),
      });
    }
  };

  const closeModal = () => {
    setSelectedItem(null);
  };

  return (
    <div className="expiration-tracker-container">
      <div className="expiration-header">
        <h1 className="expiration-title-header">REGISTRO DE VENCIMIENTOS</h1>
        <button
          onClick={() => openModal({ id: null })} // Simplificado, openModal se encarga del objeto por defecto
          className="new-item-btn"
        >
          Nuevo Vencimiento
        </button>
      </div>

      {loading && <p>Cargando elementos...</p>}
      
      <div className="items-grid">
        <div className="expiration-tracker-main">
          {[...results]
            .sort((a, b) => {
              const dateA = a.expirationDate ? new Date(a.expirationDate) : null;
              const dateB = b.expirationDate ? new Date(b.expirationDate) : null;
              // Considerar también expirationTime si las fechas son iguales
              if (dateA && dateB) {
                if (dateA.getTime() === dateB.getTime()) {
                    // Comparar por hora si las fechas son iguales
                    const timeA = a.expirationTime || "00:00";
                    const timeB = b.expirationTime || "00:00";
                    return timeA.localeCompare(timeB);
                }
                return dateA - dateB;
              }
              if (dateA) return -1;
              if (dateB) return 1;
              return 0;
            })
            .map((item) => (
              <ExpirationCard key={item._id || item.id} item={item} onClick={() => openModal(item)} />
            ))}
        </div>
      </div>

      {selectedItem && (
       <div
          className="modal-overlay"
          onMouseDown={(e) => {
            // Solo cierra si se clickeó directamente el overlay (fuera del modal)
            if (e.target.classList.contains("modal-overlay")) {
              closeModal();
            }
          }}
        >
          <div className="modal-content">
        
            <button className="modal-close" onClick={closeModal}>×</button>

            <input
              type='text'
              className="modal-title modal-text-box"
              placeholder='Título del vencimiento *'
              value={selectedItem.title || ''}
              onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
            />

            <textarea
              className="modal-text-box"
              placeholder="Descripción (opcional)"
              maxLength="1200"
              value={selectedItem.description || ''}
              onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
            ></textarea>

            <label className="modal-text">
              <span>Vencimiento</span>
              <div className="date-time-container">
                <input
                  type="date"
                  className="modal-date-time-input"
                  value={selectedItem.expirationDate || ''}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, expirationDate: e.target.value })
                  }
                />
              </div>
            
              <div className="date-time-container">
                <input
                  type="time"
                  className="modal-date-time-input"
                  value={selectedItem.expirationTime || ''}
                  onChange={(e) =>
                    setSelectedItem({ ...selectedItem, expirationTime: e.target.value })
                  }
                />
              </div>
            </label>
            
            <label className="modal-text">
              <span>Notificar 30 días antes</span>
              <input
                type="checkbox"
                checked={selectedItem.notify30DaysBefore || false}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, notify30DaysBefore: e.target.checked })
                }
              />
            </label>

            <label className="modal-text">
              <span>Notificar 90 días antes</span>
              <input
                type="checkbox"
                checked={selectedItem.notify90DaysBefore || false}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, notify90DaysBefore: e.target.checked })
                }
              />
            </label>

            <div className="modal-text columns"> {/* Contenedor para la sección de asignados */}
              <div className='modal-text rows' style={{alignItems: 'flex-start'}}> {/* Para alinear el título con la lista */}
                <span>Asignado a:</span>
                <ul>
                  {selectedItem.assignedTo?.map((user) => (
                    <li className="margin-top modal-text rows" key={user} style={{ justifyContent: 'flex-start' }}>
                      <span>{user}</span>
                      <button className='modal-close-alternative'
                        onClick={() => {
                          const updatedAssigned = selectedItem.assignedTo.filter((u) => u !== user);
                          setSelectedItem({ ...selectedItem, assignedTo: updatedAssigned });
                        }}
                      >
                        ❌
                      </button>
                    </li>
                  ))}
                   {(!selectedItem.assignedTo || selectedItem.assignedTo.length === 0) && (
                     <li className="margin-top modal-text-small"> (Se asignará a usted por defecto si no selecciona a nadie)</li>
                   )}
                </ul>
              </div>

              <input
                type="text"
                placeholder="Buscar y agregar usuario"
                className="modal-text-box"
                list="assigned-users-list"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.target.value.trim()) {
                    const newUser = e.target.value.trim();
                    if (assignedUsers.includes(newUser)) {
                      if (!selectedItem.assignedTo?.includes(newUser)) {
                        setSelectedItem({
                          ...selectedItem,
                          assignedTo: [...(selectedItem.assignedTo || []), newUser],
                        });
                      }
                    } else {
                      toast.alert("El usuario no existe en la lista de usuarios disponibles.");
                    }
                    e.target.value = ""; 
                    e.preventDefault(); // Prevenir submit si está en un form
                  }
                }}
              />
              <datalist id="assigned-users-list">
                {assignedUsers.map((user) => (
                  <option key={user} value={user} />
                ))}
              </datalist>
            </div>

            <button className="modal-btn" onClick={handleUpdateCreate}>
              {isNewItem ? "Crear Vencimiento" : "Actualizar Vencimiento"}
            </button>
            {!isNewItem && (selectedItem?._id || selectedItem?.id) && (
              <button
                className="modal-btn modal-btn-delete"
                onClick={() => deleteItem(selectedItem._id || selectedItem.id)}
              >
                Eliminar Vencimiento
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirationTracker;

/* import React, { useState, useEffect, useContext } from 'react';
import ExpirationCard from '../components/ExpirationCard';
import '../styles/expirationTracker.css';
import '../styles/global.css';
import AuthContext from '../context/authContext';
import config from '../../src/config';

const ExpirationTracker = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [items, setItems] = useState([]);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const { authUser } = useContext(AuthContext);

  const fetchExpirations = async () => {
    try {
      const response = await fetch(`${config.baseURL}/api/expirations`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      setItems(data);
    } catch (error) {
      console.error("Error al obtener los vencimientos:", error);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch(`${config.baseURL}/api/find-users`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      setAssignedUsers(data);
    } catch (err) {
      console.error("Error al cargar usuarios:", err);
    }
  };

  useEffect(() => {
    fetchExpirations();
    fetchUsers();
  }, []);

  const createExpiration = async () => {
    if (!selectedItem.title || !selectedItem.expirationDate) {
      alert("Título y fecha de vencimiento son obligatorios.");
      return;
    }
    try {
      const res = await fetch(`${config.baseURL}/api/expiration`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedItem),
      });
      const newItem = await res.json();
      setItems(prev => [...prev, newItem]);
      closeModal();
    } catch (err) {
      console.error("Error al crear vencimiento:", err);
    }
  };

  const updateExpiration = async () => {
    if (!selectedItem._id) return;
    try {
      const res = await fetch(`${config.baseURL}/api/expiration/${selectedItem._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedItem),
      });
      const updated = await res.json();
      setItems(prev => prev.map(item => item._id === updated._id ? updated : item));
      closeModal();
    } catch (err) {
      console.error("Error al actualizar vencimiento:", err);
    }
  };

  const deleteExpiration = async (id) => {
    if (!window.confirm("¿Estás seguro de que querés eliminar este vencimiento?")) return;
    try {
      await fetch(`${config.baseURL}/api/expiration/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      setItems(prev => prev.filter(item => item._id !== id));
      closeModal();
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const openModal = (item) => setSelectedItem(item);
  const closeModal = () => setSelectedItem(null);

  const handleSubmit = async () => {
    selectedItem._id ? await updateExpiration() : await createExpiration();
  };

  return (
    <div className="task-manager-container">
      <div className="task-header">
        <h1 className="task-title">SEGUIMIENTO DE VENCIMIENTOS</h1>
        <button onClick={() => openModal({
          title: '',
          description: '',
          expirationDate: '',
          notify30DaysBefore: false,
          notify90DaysBefore: false,
          assignedTo: [],
        })} className="new-task-btn">
          Nuevo Vencimiento
        </button>
      </div>

      <div className="task-manager-main">
        {[...items]
          .sort((a, b) => new Date(a.expirationDate) - new Date(b.expirationDate))
          .map(item => (
            <ExpirationCard key={item._id} item={item} onClick={() => openModal(item)} />
        ))}
      </div>

      {selectedItem && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>×</button>

            <input
              type="text"
              placeholder="Título"
              className="modal-title modal-text-box"
              value={selectedItem.title}
              onChange={(e) => setSelectedItem({ ...selectedItem, title: e.target.value })}
            />

            <textarea
              placeholder="Descripción"
              className="modal-text-box"
              value={selectedItem.description}
              onChange={(e) => setSelectedItem({ ...selectedItem, description: e.target.value })}
            />

            <label className="modal-text">
              Fecha de Vencimiento
              <input
                type="date"
                value={selectedItem.expirationDate}
                onChange={(e) => setSelectedItem({ ...selectedItem, expirationDate: e.target.value })}
              />
            </label>

            <label className="modal-text">
              Avisar 30 días antes
              <input
                type="checkbox"
                checked={selectedItem.notify30DaysBefore}
                onChange={(e) => setSelectedItem({ ...selectedItem, notify30DaysBefore: e.target.checked })}
              />
            </label>

            <label className="modal-text">
              Avisar 90 días antes
              <input
                type="checkbox"
                checked={selectedItem.notify90DaysBefore}
                onChange={(e) => setSelectedItem({ ...selectedItem, notify90DaysBefore: e.target.checked })}
              />
            </label>

            <label className="modal-text">
              Asignar a:
              <select
                multiple
                value={selectedItem.assignedTo}
                onChange={(e) =>
                  setSelectedItem({ ...selectedItem, assignedTo: [...e.target.selectedOptions].map(opt => opt.value) })
                }>
                {assignedUsers.map((user) => (
                  <option key={user._id} value={user._id}>{user.username}</option>
                ))}
              </select>
            </label>

            <div className="modal-actions">
              <button onClick={handleSubmit} className="save-btn">Guardar</button>
              {selectedItem._id && (
                <button onClick={() => deleteExpiration(selectedItem._id)} className="delete-btn">Eliminar</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExpirationTracker;
 */