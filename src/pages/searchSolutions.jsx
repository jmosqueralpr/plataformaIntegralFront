import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/searchSolutions.css';
import config from '../../src/config';
import { toast } from 'react-toastify';

const SearchSolutions = () => {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const navigate = useNavigate();

  const categories = useMemo(
    () => [...new Set(results.map((item) => item.category).filter(Boolean))],
    [results]
  );

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.info('Ingresá un término para buscar una solución.');
      return;
    }

    try {
      const response = await fetch(`${config.baseURL}/api/search?query=${encodeURIComponent(query)}&field=${field}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setResults(data || []);
      setSelectedResult(null);

      if (!data || data.length === 0) {
        toast.info('No hay resultados para esa búsqueda.');
      }
    } catch (error) {
      console.error('Error en la búsqueda:', error);
      toast.error('No se pudo realizar la búsqueda.');
    }
  };

  const filteredResults = results.filter((item) => {
    if (categoryFilter === 'all') return true;
    return item.category === categoryFilter;
  });

  const handleSelectResult = (item) => {
    setSelectedResult((prev) => (prev && prev._id === item._id ? null : item));
  };

  const handleUpdateSolution = async () => {
    if (!selectedResult?._id) return;

    const updatedSolution = {
      title: selectedResult.title,
      content: selectedResult.content,
      document_ref: selectedResult.document_ref,
      category: selectedResult.category,
      status: selectedResult.status,
      notes: selectedResult.notes,
    };

    const isConfirmed = window.confirm('¿Seguro que querés actualizar esta solución técnica?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/solutions/${selectedResult._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSolution),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al actualizar la solución');
      }

      const data = await response.json();
      setSelectedResult(data.solution);
      setResults((prev) => prev.map((item) => (item._id === data.solution._id ? data.solution : item)));
      toast.success('Solución actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando la solución:', error);
      toast.error(error.message || 'Hubo un error al actualizar la solución');
    }
  };

  const handleSwapWithPreviousVersion = async () => {
    if (!selectedResult?.previousVersions || selectedResult.previousVersions.length === 0) {
      toast.info('No hay versiones anteriores disponibles.');
      return;
    }

    const previousVersion = selectedResult.previousVersions[0];
    const isConfirmed = window.confirm('¿Querés restaurar la versión anterior de esta solución?');
    if (!isConfirmed) return;

    const updatedSolution = {
      title: previousVersion.title,
      content: previousVersion.content,
      document_ref: previousVersion.document_ref,
      category: previousVersion.category,
      status: previousVersion.status,
      notes: previousVersion.notes,
    };

    try {
      const response = await fetch(`${config.baseURL}/api/solutions/${selectedResult._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedSolution),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al restaurar la versión');
      }

      const data = await response.json();
      setSelectedResult(data.solution);
      setResults((prev) => prev.map((item) => (item._id === data.solution._id ? data.solution : item)));
      toast.success('Se restauró la versión anterior correctamente.');
    } catch (error) {
      console.error('Error intercambiando el contenido:', error);
      toast.error(error.message || 'Hubo un error al restaurar la versión.');
    }
  };

  const handleDeleteSolution = async () => {
    if (!selectedResult?._id) return;

    const isConfirmed = window.confirm('⚠️ Esta solución se borrará permanentemente. ¿Continuás?');
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/solutions/${selectedResult._id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Error al eliminar la solución');
      }

      const updatedResults = results.filter((r) => r._id !== selectedResult._id);
      setResults(updatedResults);
      setSelectedResult(null);
      toast.success('Solución eliminada correctamente');
    } catch (error) {
      console.error('Error al eliminar la solución:', error);
      toast.error(error.message || 'Hubo un error al eliminar la solución');
    }
  };

  return (
    <div className="solutions-page">
      <header className="solutions-header">
        <div>
          <p className="eyebrow">Base de conocimiento</p>
          <h1 className="expiration-title-header">Soluciones técnicas</h1>
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => navigate('/searchSolutionsNew')}>
          + Nueva solución
        </button>
      </header>

      <section className="solutions-summary">
        <div className="summary-card primary">
          <span>Totales</span>
          <strong>{results.length}</strong>
        </div>
        <div className="summary-card success">
          <span>Activas</span>
          <strong>{results.filter((item) => item.status === 'activa').length}</strong>
        </div>
        <div className="summary-card warning">
          <span>En revisión</span>
          <strong>{results.filter((item) => item.status === 'en revisión').length}</strong>
        </div>
        <div className="summary-card danger">
          <span>Obsoletas</span>
          <strong>{results.filter((item) => item.status === 'obsoleta').length}</strong>
        </div>
      </section>

      <section className="search-panel">
        <div className="search-panel-header">
          <div>
            <span className="search-panel-label">Búsqueda rápida</span>
            <h3>Encontrá soluciones por texto, contenido o categoría</h3>
          </div>
          <span className="search-panel-status">{filteredResults.length} resultados</span>
        </div>

        <form onSubmit={handleSearch} className="solutions-search-form">
          <div className="search-field search-input-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar soluciones, error, comando, procedimiento..."
              className="solutions-search-input"
            />
          </div>

          <div className="search-field">
            <select value={field} onChange={(e) => setField(e.target.value)} className="solutions-filter">
              <option value="all">Todos los campos</option>
              <option value="title">Título</option>
              <option value="content">Contenido</option>
              <option value="document_ref">Documento</option>
              <option value="notes">Notas</option>
            </select>
          </div>

          <div className="search-field">
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="solutions-filter">
              <option value="all">Todas las categorías</option>
              {categories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <button type="submit" className="search-button">Buscar</button>
        </form>
      </section>

      <section className="solutions-layout">
        <aside className="solutions-list-panel">
          {filteredResults.length === 0 ? (
            <div className="empty-state">
              <h3>No hay soluciones para mostrar</h3>
              <p>Usá la búsqueda para encontrar instructivos, pasos o soluciones rápidas.</p>
            </div>
          ) : (
            filteredResults.map((item) => (
              <article
                key={item._id}
                className={`solution-card ${selectedResult?._id === item._id ? 'selected' : ''}`}
                onClick={() => handleSelectResult(item)}
              >
                <div className="solution-card-header">
                  <span className={`status-badge ${item.status}`}>{item.status}</span>
                  <span className="solution-category">{item.category || 'General'}</span>
                </div>

                <h3>{item.title}</h3>
                <p>{item.content ? item.content.slice(0, 120) : 'Sin contenido cargado'}...</p>

                {item.document_ref && <small>Ref: {item.document_ref}</small>}
              </article>
            ))
          )}
        </aside>

        <main className="solution-detail-panel">
          {selectedResult ? (
            <>
              <div className="detail-header">
                <div>
                  <span className={`status-badge ${selectedResult.status}`}>{selectedResult.status}</span>
                  <h2>{selectedResult.title}</h2>
                </div>
                <span className="detail-category">{selectedResult.category || 'General'}</span>
              </div>

              <div className="detail-grid">
                <label className="field">
                  <span>Título</span>
                  <input
                    type="text"
                    value={selectedResult.title || ''}
                    onChange={(e) => setSelectedResult({ ...selectedResult, title: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Categoría</span>
                  <input
                    type="text"
                    value={selectedResult.category || ''}
                    onChange={(e) => setSelectedResult({ ...selectedResult, category: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Documento de referencia</span>
                  <input
                    type="text"
                    value={selectedResult.document_ref || ''}
                    onChange={(e) => setSelectedResult({ ...selectedResult, document_ref: e.target.value })}
                  />
                </label>

                <label className="field">
                  <span>Estado</span>
                  <select
                    value={selectedResult.status || 'activa'}
                    onChange={(e) => setSelectedResult({ ...selectedResult, status: e.target.value })}
                  >
                    <option value="activa">Activa</option>
                    <option value="en revisión">En revisión</option>
                    <option value="obsoleta">Obsoleta</option>
                  </select>
                </label>
              </div>

              <label className="field">
                <span>Contenido</span>
                <textarea
                  value={selectedResult.content || ''}
                  onChange={(e) => setSelectedResult({ ...selectedResult, content: e.target.value })}
                />
              </label>

              <label className="field">
                <span>Notas</span>
                <textarea
                  value={selectedResult.notes || ''}
                  onChange={(e) => setSelectedResult({ ...selectedResult, notes: e.target.value })}
                />
              </label>

              <div className="detail-actions">
                <button className="secondary-btn" onClick={() => setSelectedResult(null)}>Cerrar</button>
                <button className="danger-btn" onClick={handleDeleteSolution}>Eliminar</button>
                <button className="primary-btn" onClick={handleUpdateSolution}>Guardar cambios</button>
                {selectedResult.previousVersions?.length > 0 && (
                  <button className="ghost-btn" onClick={handleSwapWithPreviousVersion}>Restaurar versión anterior</button>
                )}
              </div>
            </>
          ) : (
            <div className="detail-empty">
              <h3>Seleccioná una solución</h3>
              <p>Elegí un instructivo para ver su contenido, notas, referencias y edición.</p>
            </div>
          )}
        </main>
      </section>
    </div>
  );
};

export default SearchSolutions;
