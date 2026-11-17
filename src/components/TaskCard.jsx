import React from 'react';
import '../styles/taskManager.css';

const TaskCard = ({ task, onClick, onQuickStatusChange }) => {
  const getDueDateState = (value) => {
    if (!value) return 'Sin fecha';

    const today = new Date();
    const dueDate = new Date(`${value}T00:00:00`);
    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencida';
    if (diffDays === 0) return 'Vence hoy';
    if (diffDays <= 3) return 'Próxima';
    return 'Programada';
  };

  const getIsOverdue = (value) => {
    if (!value) return false;

    const today = new Date();
    const dueDate = new Date(`${value}T00:00:00`);
    return dueDate < today && task.status !== 'Completada';
  };

  const statusClass = `status-badge status-${(task.status || 'no-iniciada').toLowerCase().replace(/\s+/g, '-')}`;
  const dueLabel = getDueDateState(task.notifyAssignedDate);
  const overdue = getIsOverdue(task.notifyAssignedDate);

  return (
    <div className={`task-box ${overdue ? 'task-box-overdue' : ''}`} onClick={onClick}>
      <div className="task-card-header">
        <span className={`importance-badge importance-${(task.importance || 'media').toLowerCase()}`}>
          {task.importance || 'Media'}
        </span>
        <span className={statusClass}>{task.status || 'No iniciada'}</span>
      </div>

      <h2 className="task-title">{task.title}</h2>
      <p className="task-text">{task.description}</p>

      <div className="task-meta">
        <p className="task-meta-item">
          <strong>Vence:</strong>
          <span>{task.notifyAssignedDate ? new Date(task.notifyAssignedDate).toLocaleDateString() : 'Sin fecha'}</span>
        </p>
        <p className="task-meta-item">
          <strong>Estado:</strong>
          <span className={`task-date-state task-date-${dueLabel.toLowerCase().replace(/\s+/g, '-')}`}>
            {dueLabel}
          </span>
        </p>
        <p className="task-meta-item">
          <strong>Asignado a:</strong>
          <span>{Array.isArray(task.assignedTo) ? task.assignedTo.join(', ') : task.assignedTo || 'No asignado'}</span>
        </p>
      </div>

      <div className="task-card-actions">
        <button
          type="button"
          className="task-card-action task-card-action-primary"
          onClick={(e) => {
            e.stopPropagation();
            onQuickStatusChange?.('Completada');
          }}
        >
          Marcar listo
        </button>
        <button
          type="button"
          className="task-card-action"
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
        >
          Editar
        </button>
      </div>
    </div>
  );
};

export default TaskCard;