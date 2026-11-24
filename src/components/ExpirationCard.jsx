import '../styles/expirationTracker.css';

const ExpirationCard = ({ item, onClick }) => {
  const isExpired = (() => {
    if (!item.expirationDate) return false;

    const [year, month, day] = item.expirationDate.split('-').map(Number);
    const [hour, minute] = (item.expirationTime || '10:00').split(':').map(Number);

    const expirationDateTime = new Date(year, month - 1, day, hour, minute);
    return expirationDateTime < new Date();
  })();

  const expirationDate = item.expirationDate
    ? (() => {
        const [year, month, day] = item.expirationDate.split('-').map(Number);
        return new Date(year, month - 1, day);
      })()
    : null;

  const reminders = item.reminders || { onExpiration: true, tenDaysBefore: true, customDaysBefore: null };
  const reminderParts = [];
  if (reminders.tenDaysBefore) reminderParts.push('10d');
  if (reminders.customDaysBefore) reminderParts.push(`${reminders.customDaysBefore}d`);
  const reminderBadge = reminderParts.length ? reminderParts.join(' • ') : (reminders.onExpiration ? 'venc' : '');

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
                {expirationDate.toLocaleDateString()}
                {' '}{item.expirationTime || '10:00'}
              </>
            )
          ) : (
            'Sin fecha'
          )}
        </p>

        {reminderBadge && (
          <p className="expiration-meta-item reminder-badge">
            <strong>Alertas:</strong> {reminderBadge}
          </p>
        )}

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