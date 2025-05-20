import React from 'react';
import '../styles/expirationTracker.css';

const ExpirationCard = ({ item, onClick }) => {
  // Combina fecha y hora en un solo Date
  const isExpired = (() => {
    if (!item.expirationDate || !item.expirationTime) return false;

    const [year, month, day] = item.expirationDate.split('-').map(Number);
    const [hour, minute] = item.expirationTime.split(':').map(Number);

    const expirationDateTime = new Date(year, month - 1, day, hour, minute);
    return expirationDateTime < new Date();
  })();

  return (
    <div className="expiration-box" onClick={onClick}>
      <h2 className="expiration-title">{item.title}</h2>

      <div className="expiration-meta">
        <p className="expiration-meta-item">
          <strong>Vence:</strong>{' '}
          {item.expirationDate ? (
            isExpired ? (
              <span className="expired-badge">Vencida</span>
            ) : (
              <>
                {new Date(item.expirationDate).toLocaleDateString()}
                {item.expirationTime && ` ${item.expirationTime}`}
              </>
            )
          ) : (
            'Sin fecha'
          )}
        </p>

        <p className="expiration-meta-item">
          <strong>Asignados:</strong>{' '}
          {Array.isArray(item.assignedTo) ? item.assignedTo.join(', ') : item.assignedTo || 'No asignado'}
        </p>
      </div>
    </div>
  );
};

export default ExpirationCard;



/* import React from 'react';
import '../styles/taskManager.css'; // Reutiliza los estilos existentes

const ExpirationCard = ({ item, onClick }) => {
  return (
    <div className="task-box" onClick={onClick}>
      <h2 className="task-title">{item.title}</h2>
      <p className="task-text">{item.description}</p>

      <div className="task-meta">
        <p className="task-meta-item">
          <strong>Expira:</strong> {item.expirationDate ? new Date(item.expirationDate).toLocaleDateString() : 'Sin fecha'}
        </p>
        
        <p className="task-meta-item">
          <strong>Interesados:</strong> {
            Array.isArray(item.responsible)
              ? item.responsible.join(', ')
              : item.responsible || 'No asignado'
          }
        </p>
       
      </div>
    </div>
  );
};

export default ExpirationCard;
 */