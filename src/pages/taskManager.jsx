import React, { useState, useEffect, useContext } from 'react';
import TaskCard from '../components/TaskCard';
import '../styles/taskManager.css';
import '../styles/global.css';
import AuthContext from '../context/authContext';
import config from '../../src/config';
import { toast } from 'react-toastify';

const priorityRank = {
  Urgente: 4,
  Alta: 3,
  Media: 2,
  Baja: 1,
};

const TaskManager = () => {
  const [selectedTask, setSelectedTask] = useState(null);
  const [results, setResults] = useState([]);
  const { authUser } = useContext(AuthContext);
  const [assignedUsers, setAssignedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [priorityFilter, setPriorityFilter] = useState('Todas');

  const getDefaultTask = () => ({
    id: null,
    _id: undefined,
    title: '',
    description: '',
    creator: authUser || '',
    assignedTo: [],
    sendWhatsAppOwner: false,
    sendWhatsAppAssignedTo: false,
    notifyAssignedTime: '10:00',
    notifyAssignedDate: new Date().toISOString().split('T')[0],
    status: 'No iniciada',
    importance: 'Media',
  });

  const searchAssignedUsers = async () => {
    try {
      const response = await fetch(`${config.baseURL}/api/find-users`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setAssignedUsers(data);
    } catch (error) {
      toast.error('No se pudieron cargar los usuarios asignables');
      console.error('Error en la búsqueda de usuarios:', error);
    }
  };

  const handleSearch = async () => {
    setLoading(true);

    try {
      const response = await fetch(`${config.baseURL}/api/tasks`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data || []);
    } catch (error) {
      toast.error('No se pudieron cargar las tareas');
      console.error('Error al buscar tareas:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      await handleSearch();
      await searchAssignedUsers();
    };

    fetchData();
  }, [authUser]);

  useEffect(() => {
    document.body.classList.toggle('modal-open', Boolean(selectedTask));

    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [selectedTask]);

  const getTaskDueValue = (task) => {
    if (!task?.notifyAssignedDate) return Number.MAX_SAFE_INTEGER;

    const dueDate = new Date(`${task.notifyAssignedDate}T00:00:00`);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return dueDate.getTime() - today.getTime();
  };

  const sortTasks = (taskList) =>
    [...taskList].sort((a, b) => {
      const aPriority = priorityRank[a.importance] || 0;
      const bPriority = priorityRank[b.importance] || 0;

      if (bPriority !== aPriority) {
        return bPriority - aPriority;
      }

      return getTaskDueValue(a) - getTaskDueValue(b);
    });

  const filterTasks = (taskList) => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return taskList.filter((task) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        [task.title, task.description, task.status, task.importance, ...(task.assignedTo || [])]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery);

      const matchesStatus =
        statusFilter === 'Todos' || task.status === statusFilter;

      const matchesPriority =
        priorityFilter === 'Todas' || task.importance === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });
  };

  const myTasks = sortTasks(filterTasks(
    results.filter((task) => String(task.creator) === String(authUser))
  ));

  const assignedTasks = sortTasks(filterTasks(
    results.filter((task) => String(task.creator) !== String(authUser))
  ));

  const isNewTask =
    selectedTask &&
    (selectedTask.id === null || selectedTask._id === undefined || selectedTask._id === null);

  const openModal = (task) => {
    setSelectedTask(
      task
        ? {
            ...task,
            assignedTo: Array.isArray(task.assignedTo) ? task.assignedTo : [],
          }
        : getDefaultTask()
    );
  };

  const closeModal = () => {
    setSelectedTask(null);
  };

  const addAssignedUser = () => {
    const input = document.getElementById('assigned-user-input');
    const value = input?.value?.trim();

    if (!value) return;

    if (!assignedUsers.includes(value)) {
      toast.warning('Ese usuario no está disponible para asignar');
      input.value = '';
      return;
    }

    const currentAssigned = Array.isArray(selectedTask.assignedTo) ? selectedTask.assignedTo : [];

    if (!currentAssigned.includes(value)) {
      setSelectedTask({
        ...selectedTask,
        assignedTo: [...currentAssigned, value],
      });
    }

    input.value = '';
  };

  const createTask = async () => {
    if (!selectedTask.title?.trim() || !selectedTask.description?.trim()) {
      toast.warning('Completá el título y la descripción antes de guardar.');
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/api/task`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          creator: authUser || selectedTask.creator || '',
          assignedTo: selectedTask.assignedTo || [],
          sendWhatsAppOwner: selectedTask.sendWhatsAppOwner,
          sendWhatsAppAssignedTo: selectedTask.sendWhatsAppAssignedTo,
          notifyAssignedDate: selectedTask.notifyAssignedDate,
          notifyAssignedTime: selectedTask.notifyAssignedTime,
          status: selectedTask.status,
          importance: selectedTask.importance,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const newTask = await response.json();
      setResults((prevResults) => [newTask, ...prevResults]);
      closeModal();
      toast.success('Tarea creada correctamente');
    } catch (error) {
      toast.error('No se pudo crear la tarea');
      console.error('Error al crear la tarea:', error);
    }
  };

  const updateTask = async () => {
    if (!selectedTask || !selectedTask._id) {
      toast.error('No hay una tarea válida para actualizar.');
      return;
    }

    const confirmed = window.confirm(
      'La información de la tarea cambiará permanentemente. ¿Deseás continuar?'
    );

    if (!confirmed) return;

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
          assignedTo: selectedTask.assignedTo || [],
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
        throw new Error(error.message || `Error ${response.status}`);
      }

      const updatedTask = await response.json();
      setResults((prevResults) =>
        prevResults.map((task) => (task._id === updatedTask._id ? updatedTask : task))
      );
      closeModal();
      toast.success('Tarea actualizada correctamente');
    } catch (error) {
      toast.error('No se pudo actualizar la tarea');
      console.error('Error al actualizar la tarea:', error);
    }
  };

  const deleteTask = async (taskId) => {
    const confirmed = window.confirm(
      'La tarea se eliminará permanentemente. ¿Estás seguro?'
    );

    if (!confirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/task/${taskId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `Error ${response.status}`);
      }

      setResults((prevResults) => prevResults.filter((task) => task._id !== taskId));
      closeModal();
      toast.success('Tarea eliminada');
    } catch (error) {
      toast.error('No se pudo eliminar la tarea');
      console.error('Error al eliminar la tarea:', error);
    }
  };

  const handleUpdateCreate = async () => {
    if (isNewTask) {
      await createTask();
      await handleSearch();
      return;
    }

    await updateTask();
    await handleSearch();
  };

  const handleQuickStatusChange = async (task, nextStatus) => {
    if (!task?._id) return;

    try {
      const response = await fetch(`${config.baseURL}/api/task/${task._id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...task,
          status: nextStatus,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      setResults((prevResults) =>
        prevResults.map((item) => (item._id === updatedTask._id ? updatedTask : item))
      );
      toast.success(`Estado actualizado a ${nextStatus}`);
    } catch (error) {
      toast.error('No se pudo cambiar el estado');
      console.error('Error al cambiar el estado:', error);
    }
  };

  return (
    <div className="task-manager-container">
      <header className="task-header">
        <div>
          <p className="task-kicker">Panel operativo</p>
          <h1 className="task-title">Gestor de tareas</h1>
        </div>
        <button
          type="button"
          className="new-task-btn"
          onClick={() => openModal(getDefaultTask())}
        >
          + Nueva tarea
        </button>
      </header>

      <section className="task-summary-grid">
        <div className="summary-card summary-card-primary">
          <span>Total</span>
          <strong>{results.length}</strong>
        </div>
        <div className="summary-card">
          <span>Mis tareas</span>
          <strong>{myTasks.length}</strong>
        </div>
        <div className="summary-card">
          <span>Asignadas</span>
          <strong>{assignedTasks.length}</strong>
        </div>
        <div className="summary-card">
          <span>Urgentes</span>
          <strong>{results.filter((task) => task.importance === 'Urgente').length}</strong>
        </div>
      </section>

      <div className="task-toolbar">
        <div className="task-search-wrap">
          <span className="task-search-icon">⌕</span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tareas, usuarios o estado..."
            className="task-search-input"
          />
        </div>

        <div className="task-filter-group">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="task-filter-select"
          >
            <option value="Todos">Todos los estados</option>
            <option value="No iniciada">No iniciada</option>
            <option value="En curso">En curso</option>
            <option value="Completada">Completada</option>
            <option value="En espera">En espera</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="task-filter-select"
          >
            <option value="Todas">Todas las prioridades</option>
            <option value="Urgente">Urgente</option>
            <option value="Alta">Alta</option>
            <option value="Media">Media</option>
            <option value="Baja">Baja</option>
          </select>

          <button
            type="button"
            className="task-clear-filters"
            onClick={() => {
              setSearchQuery('');
              setStatusFilter('Todos');
              setPriorityFilter('Todas');
            }}
          >
            Limpiar
          </button>
        </div>
      </div>

      <main className="task-sections">
        <section className="task-section-panel">
          <div className="task-section-header">
            <h3>Tareas propias</h3>
            <span>{myTasks.length}</span>
          </div>

          {loading ? (
            <div className="task-empty-state">Cargando tareas…</div>
          ) : myTasks.length ? (
            <div className="task-manager-main">
              {myTasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  onClick={() => openModal(task)}
                  onQuickStatusChange={(nextStatus) => handleQuickStatusChange(task, nextStatus)}
                />
              ))}
            </div>
          ) : (
            <div className="task-empty-state">No tenés tareas creadas todavía.</div>
          )}
        </section>

        <section className="task-section-panel">
          <div className="task-section-header">
            <h3>Tareas asignadas</h3>
            <span>{assignedTasks.length}</span>
          </div>

          {assignedTasks.length ? (
            <div className="task-manager-main">
              {assignedTasks.map((task) => (
                <TaskCard
                  key={task._id || task.id}
                  task={task}
                  onClick={() => openModal(task)}
                  onQuickStatusChange={(nextStatus) => handleQuickStatusChange(task, nextStatus)}
                />
              ))}
            </div>
          ) : (
            <div className="task-empty-state">No hay tareas asignadas en este momento.</div>
          )}
        </section>
      </main>

      {selectedTask && (
        <div
          className="modalOverlay"
          onMouseDown={(e) => {
            if (e.target.classList.contains('modalOverlay')) {
              closeModal();
            }
          }}
        >
          <div className="modalContent">
            <button type="button" className="modalClose" onClick={closeModal}>
              ×
            </button>

            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">
                  {isNewTask ? 'Nueva tarea' : 'Detalle de tarea'}
                </p>
                <h2 className="modal-title">
                  {isNewTask ? 'Crear tarea' : 'Editar tarea'}
                </h2>
              </div>
              <div className="task-modal-header-actions">
                <span className={`priority-pill priority-${(selectedTask.importance || 'media').toLowerCase()}`}>
                  {selectedTask.importance || 'Media'}
                </span>
                <span className={`status-pill status-${(selectedTask.status || 'no-iniciada').toLowerCase().replace(/\s+/g, '-')}`}>
                  {selectedTask.status || 'No iniciada'}
                </span>
              </div>
            </div>

            <div className="task-modal-summary">
              <div className="task-modal-summary-item">
                <span className="task-modal-summary-label">Creador</span>
                <strong>{selectedTask.creator || authUser || 'Sin creador'}</strong>
              </div>
              <div className="task-modal-summary-item">
                <span className="task-modal-summary-label">Asignados</span>
                <strong>{(selectedTask.assignedTo || []).length ? selectedTask.assignedTo.join(', ') : 'Sin asignados'}</strong>
              </div>
              <div className="task-modal-summary-item">
                <span className="task-modal-summary-label">Recordatorio</span>
                <strong>
                  {selectedTask.notifyAssignedDate
                    ? `${selectedTask.notifyAssignedDate}${selectedTask.notifyAssignedTime ? ` · ${selectedTask.notifyAssignedTime}` : ''}`
                    : 'Sin fecha'}
                </strong>
              </div>
            </div>

            <div className="modal-form-grid">
              <label className="field-wrap field-full">
                <span>Título</span>
                <input
                  type="text"
                  className="modal-text-box"
                  placeholder="Agregar título"
                  value={selectedTask.title}
                  onChange={(e) => setSelectedTask({ ...selectedTask, title: e.target.value })}
                />
              </label>

              <label className="field-wrap field-full">
                <span>Descripción</span>
                <textarea
                  className="modal-text-box modal-textarea"
                  placeholder="Agregar descripción"
                  maxLength="1200"
                  rows="6"
                  value={selectedTask.description}
                  onChange={(e) => setSelectedTask({ ...selectedTask, description: e.target.value })}
                />
              </label>

              <div className="field-row">
                <label className="field-wrap">
                  <span>Estado</span>
                  <select
                    className="modal-text-box state-select"
                    value={selectedTask.status}
                    onChange={(e) => setSelectedTask({ ...selectedTask, status: e.target.value })}
                  >
                    <option value="No iniciada">No iniciada</option>
                    <option value="En curso">En curso</option>
                    <option value="Completada">Completada</option>
                    <option value="En espera">En espera</option>
                  </select>
                </label>

                <label className="field-wrap">
                  <span>Importancia</span>
                  <select
                    className={`modal-text-box importance-${(selectedTask.importance || 'media').toLowerCase()}`}
                    value={selectedTask.importance}
                    onChange={(e) => setSelectedTask({ ...selectedTask, importance: e.target.value })}
                  >
                    <option value="Urgente">Urgente</option>
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </label>
              </div>

              <div className="toggle-row">
                <label className="toggle-field">
                  <input
                    type="checkbox"
                    checked={selectedTask.sendWhatsAppOwner}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, sendWhatsAppOwner: e.target.checked })
                    }
                  />
                  <span>Notificar al creador</span>
                </label>

                <label className="toggle-field">
                  <input
                    type="checkbox"
                    checked={selectedTask.sendWhatsAppAssignedTo}
                    onChange={(e) =>
                      setSelectedTask({ ...selectedTask, sendWhatsAppAssignedTo: e.target.checked })
                    }
                  />
                  <span>Notificar a asignados</span>
                </label>
              </div>

              <label className="field-wrap field-full">
                <span>Recordatorio</span>
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

              <div className="field-wrap field-full">
                <span>Asignado a</span>
                <div className="assigned-list">
                  {(selectedTask.assignedTo || []).map((user) => (
                    <span key={user} className="assigned-pill">
                      {user}
                      <button
                        type="button"
                        onClick={() => {
                          const updated = (selectedTask.assignedTo || []).filter((u) => u !== user);
                          setSelectedTask({ ...selectedTask, assignedTo: updated });
                        }}
                        aria-label={`Quitar a ${user}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>

                <div className="assigned-input-wrap">
                  <input
                    id="assigned-user-input"
                    type="text"
                    className="modal-text-box"
                    placeholder="Asignar usuario"
                    list="assigned-users-list"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addAssignedUser();
                      }
                    }}
                  />
                  <button type="button" className="modal-btn-secondary" onClick={addAssignedUser}>
                    Agregar
                  </button>
                </div>

                <datalist id="assigned-users-list">
                  {assignedUsers.map((user) => (
                    <option key={user} value={user} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="modal-btn-secondary" onClick={closeModal}>
                Cancelar
              </button>
              <button type="button" className="modal-btn" onClick={handleUpdateCreate}>
                {isNewTask ? 'Crear tarea' : 'Guardar cambios'}
              </button>
              {selectedTask?._id && (
                <button
                  type="button"
                  className="modal-btn modal-btn-delete"
                  onClick={() => deleteTask(selectedTask._id)}
                >
                  Eliminar tarea
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskManager;