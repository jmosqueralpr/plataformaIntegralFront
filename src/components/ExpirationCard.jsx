import '../styles/expirationTracker.css';

const ExpirationCard = ({ item, onClick, compact = false }) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const isExpired = (() => {
    if (!item.expirationDate) return false;

    const [year, month, day] = item.expirationDate.split('-').map(Number);
    const [hour, minute] = (item.expirationTime || '10:00').split(':').map(Number);

    const expirationDateTime = new Date(year, month - 1, day, hour, minute);
    return expirationDateTime < now;
  })();

  const expirationDate = item.expirationDate
    ? (() => {
        const [year, month, day] = item.expirationDate.split('-').map(Number);
        return new Date(year, month - 1, day);
      })()
    : null;

  // Calcular días restantes
  const daysLeft = expirationDate
    ? Math.ceil((expirationDate - today) / (1000 * 60 * 60 * 24))
    : null;

  // Determinar color de urgencia
  const getUrgencyColor = (days) => {
    if (days === null) return 'var(--color-text-muted)';
    if (days < 0) return 'var(--color-danger)';
    if (days <= 3) return 'var(--color-danger)';
    if (days <= 7) return 'var(--color-warning)';
    if (days <= 10) return 'var(--color-info)';
    return 'var(--color-success)';
  };

  const urgencyColor = getUrgencyColor(daysLeft);

  // Texto del badge de días
  const getDaysBadgeText = (days) => {
    if (days === null) return '—';
    if (days < 0) return 'VENCIDO';
    if (days === 0) return 'HOY';
    return `${days}d`;
  };

  const daysBadgeText = getDaysBadgeText(daysLeft);

  const reminders = item.reminders || { onExpiration: true, tenDaysBefore: true, customDaysBefore: null };
  const reminderParts = [];
  if (reminders.tenDaysBefore) reminderParts.push('10d');
  if (reminders.customDaysBefore) reminderParts.push(`${reminders.customDaysBefore}d`);
  const reminderBadge = reminderParts.length ? reminderParts.join(' • ') : (reminders.onExpiration ? 'venc' : '');

  // Timeline de recordatorios
  const sentReminders = item.sentReminders || [];
  const sentTypes = new Set(sentReminders.map(r => r.type));

  const reminderSchedule = [
    { type: 'onExpiration', label: 'Al vencer', days: 0, enabled: reminders.onExpiration },
    { type: 'tenDaysBefore', label: '10 días', days: 10, enabled: reminders.tenDaysBefore },
    { type: 'custom', label: reminders.customDaysBefore ? `${reminders.customDaysBefore}d` : 'Custom', days: reminders.customDaysBefore, enabled: reminders.customDaysBefore }
  ].filter(r => r.enabled && r.days !== null);

  // Ordenar por días (más cercano primero)
  reminderSchedule.sort((a, b) => a.days - b.days);

  // Encontrar el próximo pendiente
  const nextPending = reminderSchedule.find(r => !sentTypes.has(r.type));
  const allSent = reminderSchedule.every(r => sentTypes.has(r.type));

  // Formatear fecha de vencimiento para vista compacta
  const formatExpirationDate = () => {
    if (!item.expirationDate) return 'Sin fecha';
    const [year, month, day] = item.expirationDate.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    const formattedDate = date.toLocaleDateString();
    const time = item.expirationTime || '10:00';
    return isExpired ? 'Vencida' : `${formattedDate} ${time}`;
  };

  if (compact) {
    return (
      <div 
        className="expiration-box expiration-box-compact" 
        onClick={onClick}
        style={{ '--urgency-color': urgencyColor }}
      >
        <div className="expiration-days-badge" style={{ background: urgencyColor }}>
          {daysBadgeText}
        </div>
        <div className="expiration-card-header">
          <h2 className="expiration-title">{item.title}</h2>
          {isExpired && <span className="expiration-status-badge expired-badge">Vencida</span>}
        </div>
        <div className="expiration-meta expiration-meta-compact">
          <div className="expiration-meta-item">
            <span className="expiration-meta-label">Vence:</span>
            <span className="expiration-meta-value">{formatExpirationDate()}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="expiration-box" 
      onClick={onClick}
      style={{ '--urgency-color': urgencyColor }}
    >
      {/* Badge días restantes en esquina superior derecha */}
      <div className="expiration-days-badge" style={{ background: urgencyColor }}>
        {daysBadgeText}
      </div>

      <div className="expiration-card-header">
        <h2 className="expiration-title">{item.title}</h2>
        {isExpired && <span className="expiration-status-badge expired-badge">Vencida</span>}
      </div>

      <div className="expiration-meta">
        <div className="expiration-meta-item">
          <span className="expiration-meta-label">Vence:</span>
          <span className="expiration-meta-value">
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
          </span>
        </div>

        {reminderBadge && (
          <div className="expiration-meta-item">
            <span className="expiration-meta-label">Alertas:</span>
            <span className="expiration-meta-value">
              <span className={`reminder-badge ${reminders.customDaysBefore ? 'reminder-badge-custom' : ''}`}>
                {reminderBadge}
              </span>
            </span>
          </div>
        )}

        {/* Timeline de recordatorios */}
        {reminderSchedule.length > 0 && (
          <div className="expiration-meta-item reminder-timeline">
            <span className="expiration-meta-label">Próximos:</span>
            <div className="reminder-dots">
              {reminderSchedule.map((r, idx) => {
                const isSent = sentTypes.has(r.type);
                const isNext = !allSent && nextPending && nextPending.type === r.type;
                return (
                  <span 
                    key={r.type}
                    className={`reminder-dot ${isSent ? 'sent' : ''} ${isNext ? 'next' : ''}`}
                    title={`${r.label}: ${isSent ? 'Enviado' : isNext ? 'Próximo' : 'Pendiente'}`}
                  >
                    {isSent ? '✓' : ''}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="expiration-meta-item">
          <span className="expiration-meta-label">Asignados:</span>
          <span className="expiration-meta-value">
            {Array.isArray(item.assignedTo) ? item.assignedTo.join(', ') : item.assignedTo || 'No asignado'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ExpirationCard;