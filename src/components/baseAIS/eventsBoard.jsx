const EventsBoard = ({ events }) => {
  const pendientes = events.filter(e => !e.fecha_resolucion);
  const resueltos = events.filter(e => e.fecha_resolucion);

  const renderEvent = (e) => (
    <div key={e._id} className="event-card">
      <strong>{e.titulo_evento}</strong>
      <p>{e.descripcion_evento}</p>
      <small>{new Date(e.fecha_evento).toLocaleDateString()}</small>
    </div>
  );

  return (
    <div className="events-grid">
      <div>
        <h3>Pendientes</h3>
        {pendientes.map(renderEvent)}
      </div>
      <div>
        <h3>Resueltos</h3>
        {resueltos.map(renderEvent)}
      </div>
    </div>
  );
};

export default EventsBoard;
