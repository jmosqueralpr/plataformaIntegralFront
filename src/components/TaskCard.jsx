import React from 'react';
import '../styles/taskManager.css'; // Importamos los estilos (puedes moverlos a un archivo específico si prefieres)

const TaskCard = ({ task, onClick }) => {
  return (
    <div className="task-box" onClick={onClick}>
      <h2 className="task-title">{task.title}</h2>
      <p className="task-text">{task.description}</p>

      <div className="task-meta">
        <p className='task-meta-item'><strong>Vence:</strong> {task.notifyAssignedDate ? new Date(task.notifyAssignedDate).toLocaleDateString() : 'Sin fecha'}</p>
        <p className='task-meta-item'><strong>Estado:</strong> {task.status || 'Pendiente'}</p>
        <p className='task-meta-item'><strong>Asignado a:</strong> {
          Array.isArray(task.assignedTo)
            ? task.assignedTo.join(', ')
            : task.assignedTo || 'No asignado'
        }</p>
        <p className='task-meta-item'><strong>Importancia:</strong> <div className={`importance-badge importance-${task.importance?.toLowerCase()}`}>
          {task.importance}
        </div></p>
      </div>

    </div>

    

  );
};

export default TaskCard;