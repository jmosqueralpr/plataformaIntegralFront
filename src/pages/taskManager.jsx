import React, { useState, useEffect, useContext } from 'react';
import TaskCard from '../components/TaskCard'; // Importamos el componente
import '../styles/taskManager.css';
import '../styles/global.css';
import AuthContext from '../context/authContext'; 
import config from '../../src/config';
import { toast } from 'react-toastify';




const TaskManager = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [results, setResults] = useState([]);
  const { authUser } = useContext(AuthContext);
  const [assignedUsers, setAsignedUsers] = useState([]);

  const searchAsignedUsers = async () => {

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
      setAsignedUsers(data);
    }  catch (error) {
      toast.error("Error en la búsqueda:", error);
      console.error("Error en la búsqueda:", error);
    }

  } 
  

  /* Buscar Task relacionadas con el usuario */

  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    console.log(`Solicitud de tareas a: ${config.baseURL}/api/tasks`);
    try {
      const response = await fetch(`${config.baseURL}/api/tasks`, {
        method: "GET",
        credentials: "include",
        headers: {"content-Type": "application/json"},
      });
      if (!response.ok) {
        toast.error("No pudo cargar las tareas");
        console.log("No pudo cargar las tareas");
        console.log(`Error, response.status: ${response.status}`);
        console.log(`Error, response.statusText ${response.statusText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      console.log(`Las tareas deberian haberse cargado`);
      console.log(data);
      setResults(data);
    } catch (error) {
      toast.error("Error en la búsqueda:", error);
      console.log(`Entre al catch ${error}`);
      console.error("Error en la búsqueda:", error);
    } finally {
      setLoading(false);
    }
  };


  /* Para poder cargar los resultados iniciales */
  useEffect(() => {
    console.log("Ingreso a useEffect inicial");
    const fetchData = async () => {
      await handleSearch();
    };
    fetchData();
    searchAsignedUsers();
  }, []);


  /* Nueva tarea */
  const isNewTask = selectedTask?.id === null;
 
  
  const createTask = async () => {
    // Validar que los campos principales están completos
    if (!selectedTask.title || !selectedTask.description) {
      toast.alert("Por favor, complete todos los campos obligatorios.");
      return;
    }

    /* selectedTask.notifyAssignedTime */

    try {
      // Aquí se envía la solicitud POST al backend
      const response = await fetch(`${config.baseURL}/api/task`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          creator: selectedTask.creator, // Si ya lo tienes definido, sino usar el id del usuario autenticado
          assignedTo: selectedTask.assignedTo,
          sendWhatsAppOwner: selectedTask.sendWhatsAppOwner,
          sendWhatsAppAssignedTo: selectedTask.sendWhatsAppAssignedTo,
          notifyAssignedDate: selectedTask.notifyAssignedDate,
          notifyAssignedTime: selectedTask.notifyAssignedTime,
          status: selectedTask.status,
          importance: selectedTask.importance,
        }),
      });

      if (!response.ok) {
        toast.error(`Error al crear la tarea: ${response.statusText}`);
        throw new Error(`Error al crear la tarea: ${response.statusText}`);
      } else {
        toast.success("Tarea creada correctamente");
      }

      // Recibir la tarea creada (esto depende de la estructura de tu backend)
      const newTask = await response.json();
      console.log("Tarea creada con éxito:", newTask);

      // Actualizar el estado con la nueva tarea
      setResults((prevResults) => [...prevResults, newTask]);

      // Cerrar el modal
      closeModal();

    } catch (error) {
      toast.error("Error al crear la tarea:", error);
      console.error("Error al crear la tarea:", error);
    }
  };

  /* Actualizar tarea */

  const updateTask = async () => {
    console.log("Prueba Date");
    console.log(selectedTask.notifyAssignedDate);
    console.log("Prueba hora");
    console.log(selectedTask.notifyAssignedTime);
    if (!selectedTask || !selectedTask._id) {
      toast.error("No hay una tarea válida para actualizar.");
      console.error("No hay una tarea válida para actualizar.");
      return;
    }

    const isConfirmed = window.confirm("LA INFORMACIÓN DE LA TAREA CAMBIARÁ PERMANENTEMENTE, ¿ESTA SEGURO QUE QUIERE ACTUALIZARLA?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/task/${selectedTask._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          creator: selectedTask.creator,
          assignedTo: selectedTask.assignedTo,
          sendWhatsAppOwner: selectedTask.sendWhatsAppOwner,
          sendWhatsAppAssignedTo: selectedTask.sendWhatsAppAssignedTo,
          notifyAssignedDate: selectedTask.notifyAssignedDate,
          notifyAssignedTime: selectedTask.notifyAssignedTime,
          status: selectedTask.status,
          importance: selectedTask.importance,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error("Error al actualizar la tarea:", error.message);
        console.error("Error al actualizar la tarea:", error.message);
        return;
      }

      const updatedTask = await response.json();
      console.log("Tarea actualizada con éxito:", updatedTask);

      /* Actualizar listado de tareas */
      /* closeModal(); */
      /* handleSearch(); */

    } catch (error) {
      toast.error("Error al actualizar la tarea:", error);
      console.error("Error al actualizar la tarea:", error);
    }
  };


  /* Eliminar tarea */

  const deleteTask = async (taskId) => {

    const isConfirmed = window.confirm("LA TAREA SE BORRARÁ PERMANENTEMENTE ¿ESTAS SEGURO QUE DESEAS ELIMINARLA?");
      if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/task/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error("Error al elimian la tarea:", error.message);
        console.error("Error al elimian la tarea:", error.message);
        return;
      }
      console.log("Tarea eliminada correctamente");
      /* Recargar las tareas */
      closeModal();
      handleSearch();
    } catch (error) {
      toast.error("Error al conectar con el servidor", error);
      console.error("Error al conectar con el servidor", error);
    }
  };

  /*  */

  const handleUpdateCreate = async () => {
    if (isNewTask) {
      await createTask();

    } else {
      await updateTask();
      toast.success("Tarea actualizada correctamente");
    }

    /* closeModal(); */

    handleSearch();

  };


  const openModal = (task) => {
    setSelectedTask(task);
  };

  const closeModal = () => {
    setSelectedTask(null);
  };

  const importanciaValor = {
    Urgente: 4,
    Alta: 3,
    Media: 2,
    Baja: 1,
  };
  

  return (
    <div className="task-manager-container">
      <div className="task-header">
        <h1 className="task-title">GESTOR DE TAREAS</h1>
        <button
          onClick={() => openModal({ /* Valores iniciales del modal */
            id: null,
            title: '',
            description: '',
            creator: '', // Podés setear el usuario autenticado
            assignedTo: [],
            sendWhatsAppOwner: false,
            sendWhatsAppAssignedTo: false,
            notifyAssignedTime: '10:00',
            notifyAssignedDate: new Date().toISOString().split('T')[0],
            status: 'No iniciada',
            importance: 'Media'
          })}
          className="new-task-btn"
        >
          Nueva Tarea
        </button>

      </div>


      
      <main className="columns">
        <h3>Tareas propias</h3>
          <div className="task-manager-main">
          {[...results]
            .sort((a, b) => {
              const importanciaValor = { Urgente: 4, Alta: 3, Media: 2, Baja: 1 };
              return importanciaValor[b.importance] - importanciaValor[a.importance];
            })
            .filter((task) => task.creator == authUser)
            .map((task) => (
              <TaskCard key={task.id} task={task} onClick={() => openModal(task)} />
            ))}
            </div>
          <h3>Tareas asignadas</h3>
          <div className="task-manager-main">
          {[...results]
            .sort((a, b) => {
              const importanciaValor = { Urgente: 4, Alta: 3, Media: 2, Baja: 1 };
              return importanciaValor[b.importance] - importanciaValor[a.importance];
            })
            .filter((task) => task.creator !== authUser)
            .map((task) => (            
              <TaskCard key={task.id} task={task} onClick={() => openModal(task)} />
            ))}
            </div>
      </main>


      {/* Modal para mostrar detalles de la tarea */}
      {selectedTask && (
      /*         <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> */
          <div
              className="modalOverlay"
              onMouseDown={(e) => {
                // Solo cierra si se clickeó directamente el overlay (fuera del modal)
                if (e.target.classList.contains("modalOverlay")) {
                  closeModal();
                }
              }}
            >
              <div className="modalContent">

            <button className="modalClose" onClick={closeModal}>×</button>

      {/* Título */}
      <input
        type='text'
        className="modal-title modal-text-box"
        placeholder='Agregar título'
        value={selectedTask.title}
        onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
      />

      {/* Descripción */}
      <textarea
        className="modal-text-box"
        placeholder="Agregar Descripción"
        maxLength="1200"
        value={selectedTask.description}
        onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
      ></textarea>

      {/* WhatsApp Owner */}
      <label className="modal-text">
        <span>Notificación al creador</span>
        <input
          type="checkbox"
          checked={selectedTask.sendWhatsAppOwner}
          onChange={(e) =>
            setSelectedTask({ ...selectedTask, sendWhatsAppOwner: e.target.checked })
          }
        />
      </label>

      {/* WhatsApp AssignedTo */}
      <label className="modal-text">
        <span>Notificación a asignados</span>
        <input
          type="checkbox"
          checked={selectedTask.sendWhatsAppAssignedTo}
          onChange={(e) =>
            setSelectedTask({ ...selectedTask, sendWhatsAppAssignedTo: e.target.checked })
          }
        />
      </label>

      {/* Fecha y hora de notificación para asignados */}
      <label className="modal-text">
        <span>Notificar asignados el</span>
        <div className="date-time-container">
          <input
            type="date"
            className="modal-date-time-input"
            value={selectedTask.notifyAssignedDate || ''}
            onChange={(e) =>
              setSelectedTask({ ...selectedTask, notifyAssignedDate: e.target.value })
            }
          />
          <input
            type="time"
            className="modal-date-time-input"
            value={selectedTask.notifyAssignedTime || ''}
            onChange={(e) =>
              setSelectedTask({ ...selectedTask, notifyAssignedTime: e.target.value })
            }
          />
        </div>
      </label>



      {/* Estado */}
      <label className="modal-text">
      <span>Estado</span>
      <select
        className="modal-text-box modal-text-select state-select"
        value={selectedTask.status}
        onChange={(e) =>
          setSelectedTask({ ...selectedTask, status: e.target.value })
        }
      >
        <option value="No iniciada">No iniciada</option>
        <option value="En curso">En curso</option>
        <option value="Completada">Completada</option>
        <option value="En espera">En espera</option>
      </select>
      </label>

      {/* Importancia */}
      <label className="modal-text">
        <span>Importancia</span>
        <select
          className={`modal-text-box modal-text-select importance-${selectedTask.importance?.toLowerCase()}`}
          value={selectedTask.importance}
          onChange={(e) =>
            setSelectedTask({ ...selectedTask, importance: e.target.value })
          }
        >
          <option value="Urgente">Urgente</option>
          <option value="Alta">Alta</option>
          <option value="Media">Media</option>
          <option value="Baja">Baja</option>
        </select>
      </label>

      {/* Creador */}
      <label className='modal-text display-none'>
        <span>Creador</span>
        <span>{selectedTask.creator}</span>
      </label>
      

      {/* Asignados */}

      <div className="modal-text columns">
        <div className='modal-text rows'>
          <span>Asignado a</span>
          <ul>
            
            {selectedTask.assignedTo?.map((user) => (
              <li className="margin-top modal-text rows" key={user}>
                <span>{user}{" "}</span>
                <button className='modal-close-alternative'
                  onClick={() => {
                    const updated = selectedTask.assignedTo.filter((u) => u !== user);
                    setSelectedTask({ ...selectedTask, assignedTo: updated });
                  }}
                >
                  ❌
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Input para agregar nuevo usuario asignado */}
        <input
          type="text"
          placeholder="Asignar usuario"
          className="modal-text-box"
          list="assigned-users-list"  // <- vinculamos el datalist
          onKeyDown={(e) => {
            if (e.key === "Enter" && e.target.value.trim()) {
              const newUser = e.target.value.trim();
              if (assignedUsers.includes(newUser)) {  // <- validamos que exista
                if (!selectedTask.assignedTo.includes(newUser)) {
                  setSelectedTask({
                    ...selectedTask,
                    assignedTo: [...selectedTask.assignedTo, newUser],
                  });
                }
              }
              e.target.value = "";  // limpiamos el input igual
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
        {isNewTask ? "Crear Tarea" : "Actualizar Tarea"}
      </button>
      {selectedTask?._id && (
        <button
          className="modal-btn modal-btn-delete"
          onClick={() => deleteTask(selectedTask._id)}
        >
          Eliminar Tarea
        </button>
      )}

      </div>
      </div>
    )}
    </div>
  );
};

export default TaskManager;