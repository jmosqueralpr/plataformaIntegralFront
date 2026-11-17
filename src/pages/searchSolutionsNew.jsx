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
      <div className="new-solution-header">
        <div>
          <p className="eyebrow">Base de conocimiento</p>
          <h2 className="search-title">Nueva solución técnica</h2>
        </div>
        <button type="button" className="close-btn" onClick={handleCancel}>Volver</button>
      </div>

      <div className="new-solution-form">
        <div className="form-grid">
          <label className="field-block full-width">
            <span>Título</span>
            <input type="text" name="title" value={newSolution.title} onChange={handleChange} required placeholder="Ej: Error al iniciar sesión en CRM" />
          </label>

          <label className="field-block">
            <span>Categoría</span>
            <input type="text" name="category" value={newSolution.category} onChange={handleChange} placeholder="Ej: Seguridad, Acceso, Configuración" />
          </label>

          <label className="field-block">
            <span>Estado</span>
            <select name="status" value={newSolution.status} onChange={handleChange}>
              <option value="activa">Activa</option>
              <option value="en revisión">En Revisión</option>
              <option value="obsoleta">Obsoleta</option>
            </select>
          </label>

          <label className="field-block full-width">
            <span>Documento de referencia</span>
            <input type="text" name="document_ref" value={newSolution.document_ref} onChange={handleChange} placeholder="URL, ticket, documento interno o referencia" />
          </label>

          <label className="field-block full-width">
            <span>Contenido</span>
            <textarea name="content" value={newSolution.content} onChange={handleChange} required placeholder="Escribí la solución, pasos, error, comando o procedimiento claro..." />
          </label>

          <label className="field-block full-width">
            <span>Notas</span>
            <textarea name="notes" value={newSolution.notes} onChange={handleChange} placeholder="Indicá observaciones, excepciones, aclaraciones o información adicional." />
          </label>
        </div>

        <div className="button-container">
          <button type="button" className="cancel-btn" onClick={handleCancel}>Cerrar</button>
          <button type="button" className="create-btn" onClick={handleSubmit}>Crear solución</button>
        </div>
      </div>
    </div>
  );
};

export default SearchSolutionsNew;
