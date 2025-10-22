import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/searchSolutionsNew.css';
import config from '../../src/config';
import { toast } from 'react-toastify';

const SearchSolutionsNew = () => {
  const navigate = useNavigate();
  const [newSolution, setNewSolution] = useState({
    title: '',
    content: '',
    document_ref: '',
    status: 'activa',
    notes: '',
    category: ''
  });

  const handleChange = (e) => {
    setNewSolution({ ...newSolution, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const isConfirmed = window.confirm("¿Seguro que quieres crear esta solución técnica?");
    if (!isConfirmed) return;

    try {
      const response = await fetch(`${config.baseURL}/api/solutions`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newSolution)
      });

      if (!response.ok) {
        const error = await response.json();
        toast.error(`Error al eliminar la solución (json): ${error.message || response.statusText}`);
        console.error("Error al eliminar la solución (json):", error);
        return;
        /* throw new Error(`Error ${response.status}: ${response.statusText}`); */
      }

      toast.success("Solución creada correctamente");
      navigate('/searchSolutions');
    } catch (error) {
      console.error("Error al crear la solución:", error);
      toast.error("Hubo un error al crear la solución");
    }
  };

  const handleCancel = () => {
    navigate('/searchSolutions');
  };

  return (
    <div className="new-solution-container">
      <h2 className="search-title">Nueva solución técnica</h2>
      <div className="new-solution-form">
        <label>Título:</label>
        <input type="text" name="title" value={newSolution.title} onChange={handleChange} required />

        <label>Contenido:</label>
        <textarea name="content" value={newSolution.content} onChange={handleChange} required />

        <label>Documento de Referencia:</label>
        <input type="text" name="document_ref" value={newSolution.document_ref} onChange={handleChange} />

        <label>Notas:</label>
        <textarea name="notes" value={newSolution.notes} onChange={handleChange} />

        <label>Categoría:</label>
        <input type="text" name="category" value={newSolution.category} onChange={handleChange} />

        <label>Estado:</label>
        <select name="status" value={newSolution.status} onChange={handleChange}>
          <option value="activa">Activa</option>
          <option value="en revisión">En Revisión</option>
          <option value="obsoleta">Obsoleta</option>
        </select>

        <div className="button-container">
          <button className="cancel-btn" onClick={handleCancel}>Cerrar</button>
          <button className="create-btn" onClick={handleSubmit}>Crear solución</button>
        </div>
      </div>
    </div>
  );
};

export default SearchSolutionsNew;
