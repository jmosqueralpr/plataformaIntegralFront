import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/authContext';
import '../styles/usersAdmin.css';
import config from '../../src/config';
import { toast } from 'react-toastify';

const usersAdmin = () => {

    const { isAuthenticated } = useContext(AuthContext);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [ newUser, setNewUser ] = useState(false);
    const [ selectedUser, setSelectedUser ] = useState(false);


    /* Crear usuario */
    const createNewUser = async () => {

        if (!newUser.user || !newUser.password) {
              toast.alert("Por favor, complete todos los campos obligatorios.");
              return;
        }

        

    }




    /* Si no está autenticado vuelvo a la pagina */

    if (!isAuthenticated) { 
        return (
        <div className="configuration-container">

            <header>
                <div className="header-left">
                    <img src="/path/to/company-logo.png" alt="Empresa" className="company-logo" />
                </div>
                <div className="header-right">
                    <span>Por favor, inicia sesión para acceder a la configuración.</span>
                </div>
            </header>



            <main> </main>

        </div>
        );
    }

    /* Página principal */

    return (
         <div className='global-container'>
            <header className='global-header'>
                <div className="global-header-left">
                    <h2>Administrador de usuarios</h2>
                    {/*  <img src="/path/to/company-logo.png" alt="Empresa" className="company-logo" /> */}
                    </div>
                <div className="global-header-right">
                    <span></span>
                </div>
            </header>

            <main className="global-main">

             <div className='global-buttonContainer'>

                <button
                    className="btn"
                    onClick={() => setShowCreateModal(true)}
                    aria-label="Crear usuario"
                    >
                    <strong>Crear usuario</strong>
                </button>

                <button
                    className="btn"
                    onClick={() => setShowSearchModal(true)}
                    aria-label="Buscar usuario"
                    >
                    <strong>Buscar usuario</strong>
                </button>
                
            </div>

            </main>

            {/* CREATE MODAL */}
            {showCreateModal && (
                <div 
                    className="modal-overlay" 
                    /* Si hago click en donde hay una clase que dice modal-overlay, cierro el modal */
                    onMouseDown={(e)=>{
                        if (e.target.classList.contains("modal-overlay")) {
                            setShowCreateModal(false);
                        }
                    }}>
                    {/* Para que no se cierre cuando presiono en el modal */}
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <header>
                    <h3>Crear usuario</h3>
                    </header>
                    <div className="modal-body">
                    <p>Formulario de creación (pendiente de implementar).</p>
                    </div>
                    <footer>
                    <button onClick={() => setShowCreateModal(false)}>Cerrar</button>
                    </footer>
                </div>
                </div>
            )}

            {/* SEARCH MODAL */}
            {showSearchModal && (
                <div 
                    className="modal-overlay" 
                    /* Si hago click en donde hay una clase que dice modal-overlay, cierro el modal */
                    onMouseDown={(e)=>{
                        if (e.target.classList.contains("modal-overlay")) {
                            setShowSearchModal(false);
                        }
                    }}>
                <div className="modal" onClick={(e) => e.stopPropagation()}>
                    <header>
                    <h3>Buscar usuario</h3>
                    </header>
                    <div className="modal-body">
                    <p>Buscador (pendiente de implementar).</p>
                    </div>
                    <footer>
                    <button onClick={() => setShowSearchModal(false)}>Cerrar</button>
                    </footer>
                </div>
                </div>
            )}

        </div>


    );



};

export default usersAdmin;