import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom';
import '../styles/searchSolutions.css';
import config from '../../src/config';
import { toast } from 'react-toastify';

const SearchSolutions = () => {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('all');
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null); // Estado para manejar el resultado seleccionado
  const navigate = useNavigate();

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      const response = await fetch(`${config.baseURL}/api/search?query=${encodeURIComponent(query)}&field=${field}`, {
        method: "GET",
        credentials: "include", // Permite enviar cookies
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        toast.error(`Error ${response.status}: ${response.statusText}`);
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.length == 0 ) { alert("NO HAY RESULTADOS EN LA BASE DE DATOS"); }
      setResults(data);
    } catch (error) {
      toast.error("Error en la busqueda");
      console.error("Error en la búsqueda:", error);
    }
  };

  // Función para manejar la selección de un resultado
  const handleSelectResult = (item) => {
    if (selectedResult && selectedResult._id === item._id) {
      setSelectedResult(null); // Si ya está seleccionado, lo deseleccionamos
    } else {
      setSelectedResult(item); // Si no, lo seleccionamos
    }
  };

  const handleCloseSolution = () => { 
    setSelectedResult(null);
  }

  // Función para manejar la actualización de un resultado
  const handleUpdateSolution = async () => {
    const updatedSolution = {
      title: selectedResult.title,
      content: selectedResult.content,
      document_ref: selectedResult.document_ref,
      category: selectedResult.category,
      status: selectedResult.status,
      notes: selectedResult.notes,
    };

    console.log("La solucion:");
    console.log(selectedResult?.previousVersions?.[0]);

    const isConfirmed = window.confirm("¿ESTAS SEGURO QUE QUIERES ACTUALIZAR LA SOLUCIÓN TÉCNICA?, LOS DATOS QUE TIENES GUARDADOS SE PERDERAN");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/solutions/${selectedResult._id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSolution),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedResult(data.solution); // Actualizamos la solución en el estado

      alert('Solución actualizada correctamente');
    } catch (error) {
      console.error('Error actualizando la solución:', error);
      toast.error('Hubo un error al actualizar la solución');
    }
  };

  // Función para manejar el intercambio de contenido con la versión anterior
  const handleSwapWithPreviousVersion = async () => {
    if (!selectedResult.previousVersions || selectedResult.previousVersions.length === 0) {
      alert('No hay versiones anteriores disponibles para intercambiar.');
      return;
    }

    const previousVersion = selectedResult?.previousVersions?.[0]; // Suponemos que intercambiamos con la primera versión anterior

    const isConfirmed = window.confirm("¿ESTAS SEGURO QUE QUIERES ACTUALIZAR LA SOLUCIÓN TÉCNICA?, EL CONTENIDO SE VA A CAMBIAR CON LA VERSION ANTERIOR.");
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSolution),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setSelectedResult(data.solution); // Actualizamos la solución con el contenido intercambiado

      alert('Contenido intercambiado con la versión anterior');
    } catch (error) {
      console.error('Error intercambiando el contenido:', error);
      toast.error('Hubo un error al intercambiar el contenido');
    }
  };
 
  return (
    <div className="search-container">
      <div className="search-header">
        <h2 className='search-title'>BUSCADOR DE SOLUCIONES TÉCNICAS</h2>
        <button
          onClick={() => navigate('/searchSolutionsNew')} // Cambiar la ruta a la página de nueva solución
          className="new-solution-btn"
        >
          Nueva Solución
        </button>
      </div>
      
      
      <form onSubmit={handleSearch}>
        <div className="form-group">
          <label htmlFor="query">Término de Búsqueda</label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="field">Buscar en:</label>
          <select id="field" value={field} onChange={(e) => setField(e.target.value)}>
            <option value="all">Todos los campos</option>
            <option value="title">Título</option>
            <option value="content">Contenido</option>
            <option value="document_ref">Documento de Referencia</option>
            <option value="notes">Notas</option>
          </select>
        </div>

        <button type="submit">Buscar</button>
      </form>

      {/* Mostramos los resultados debajo del formulario */}
      {results.length > 0 && (
        <div className="results">
          <h3>Resultados de Búsqueda</h3>
          <ul>
            {results.map((item) => (
              <li key={item._id}>
                <div onClick={() => handleSelectResult(item)} style={{ cursor: 'pointer' }}>
                  {item.title}
                </div>
                {/* Si el resultado está seleccionado, mostramos los campos editables */}
                {selectedResult && selectedResult._id === item._id && (
                  <div className="result-details">
                    <div>
                      <label>Título:</label>
                      <input
                        type="text"
                        value={selectedResult.title}
                        onChange={(e) => setSelectedResult({ ...selectedResult, title: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Contenido:</label>
                      <textarea
                        value={selectedResult.content}
                        onChange={(e) => setSelectedResult({ ...selectedResult, content: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Documento de Referencia:</label>
                      <input
                        type="text"
                        value={selectedResult.document_ref}
                        onChange={(e) => setSelectedResult({ ...selectedResult, document_ref: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Notas:</label>
                      <textarea
                        value={selectedResult.notes}
                        onChange={(e) => setSelectedResult({ ...selectedResult, notes: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Categoría:</label>
                      <input
                        type="text"
                        value={selectedResult.category}
                        onChange={(e) => setSelectedResult({ ...selectedResult, category: e.target.value })}
                      />
                    </div>
                    <div>
                      <label>Estado:</label>
                      <select
                        value={selectedResult.status}
                        onChange={(e) => setSelectedResult({ ...selectedResult, status: e.target.value })}
                      >
                        <option value="activa">Activa</option>
                        <option value="en revisión">En Revisión</option>
                        <option value="obsoleta">Obsoleta</option>
                      </select>
                    </div>
                    <div className='buttonContent'>
                      <button className='buttonResult redButton' onClick={handleCloseSolution}>Cerrar Solución</button>
                      <div className='space'></div>
                      <button className='buttonResult' onClick={handleUpdateSolution}>Actualizar Solución</button>
                      <div className='space'></div>
                      <button className='buttonResult' onClick={handleSwapWithPreviousVersion}>Intercambiar con versión anterior</button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {results.length === 0 && query && (
        <p>{/* No se encontraron resultados para */} "{query}".</p>
      )}
    </div>
  );
};

export default SearchSolutions;
