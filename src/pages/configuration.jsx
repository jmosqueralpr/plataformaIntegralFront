import React, { useState, useEffect, useContext } from 'react';
import AuthContext from '../context/authContext';
import '../styles/configuration.css';
import config from '../../src/config';
import { toast } from 'react-toastify';

// Datos de ejemplo simulados del servidor
const sampleUserData = [
  {
    dashboard: { access: true, order: 1 },
    settings: { access: false, order: 2 },
    profile: { access: true, order: 3 },
    taskManager: { access: false, order: 4 },
    bitWarden: { access: true, order: 5 },
    comprasHidrovia: { access: false, order: 6 },
    comprasEmepa: { access: false, order: 7 },
    comprasDYB: { access: true, order: 8 },
    gpsUnitsConverter: { access: true, order: 9 },
    guiaLinternista: { access: true, order: 10 },
    downloadGestionar: { access: true, order: 11 },
    _id: '67a23cad8e40067eec9d99e1',
    user: {
      _id: '678158e8effa3d11d25f5265',
      username: 'prueba',
      email: 'prueba@gmail.com',
      password: '$2a$10$QViAjvRNsQoKVsyFDEHyj.Kz0OalWbuEozVxGdjkxgAakKuvhqRiK',
      createdAt: '2025-01-10T17:29:12.083Z',
      updatedAt: '2025-01-10T17:29:12.083Z',
      __v: 0,
      role: 'admin',
    },
    createdAt: '2025-02-04T16:13:33.581Z',
    updatedAt: '2025-02-04T16:13:33.581Z',
    __v: 0,
  },
];

const Configuration = () => {
  const { isAuthenticated } = useContext(AuthContext); // Solo usamos isAuthenticated
  const [pagesConfig, setPagesConfig] = useState({});
  const [userDetails, setUserDetails] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [newEmail, setNewEmail] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [rNewPassword, setRNewPassword] = useState('');
 

  // Simular la carga de datos del servidor
  useEffect(() => {
    // Simulamos la obtención de datos del servidor
    const userData = sampleUserData[0];
    setPagesConfig({
      dashboard: userData.dashboard,
      settings: userData.settings,
      profile: userData.profile,
      taskManager: userData.taskManager,
      bitWarden: userData.bitWarden,
      comprasHidrovia: userData.comprasHidrovia,
      comprasEmepa: userData.comprasEmepa,
      comprasDYB: userData.comprasDYB,
      gpsUnitsConverter: userData.gpsUnitsConverter,
      guiaLinternista: userData.guiaLinternista,
      downloadGestionar: userData.downloadGestionar,
    });
    setUserDetails({
      email: userData.user.email,
      password: '', // No mostramos la contraseña por seguridad
    });
  }, []);

  // Manejar cambios en el acceso
  const handleAccessChange = (page) => {
    setPagesConfig((prevConfig) => ({
      ...prevConfig,
      [page]: { ...prevConfig[page], access: !prevConfig[page].access },
    }));
  };

  // Manejar cambios en el orden
  const handleOrderChange = (page, newOrder) => {
    const newOrderNum = parseInt(newOrder, 10);
    if (isNaN(newOrderNum) || newOrderNum < 1 || newOrderNum > Object.keys(pagesConfig).length) {
      return; // Validación de rango
    }

    // Crear una copia del estado actual
    const updatedConfig = { ...pagesConfig };
    const currentOrder = updatedConfig[page].order;

    // Reconfigurar los órdenes
    Object.keys(updatedConfig).forEach((p) => {
      if (p !== page) {
        if (currentOrder < newOrderNum && updatedConfig[p].order > currentOrder && updatedConfig[p].order <= newOrderNum) {
          updatedConfig[p].order -= 1;
        } else if (currentOrder > newOrderNum && updatedConfig[p].order < currentOrder && updatedConfig[p].order >= newOrderNum) {
          updatedConfig[p].order += 1;
        }
      }
    });
    updatedConfig[page].order = newOrderNum;

    setPagesConfig(updatedConfig);
  };

  // Manejar cambios en los detalles del usuario
  const handleUserDetailsChange = (e) => {
    const { name, value } = e.target;
    setUserDetails((prevDetails) => ({
      ...prevDetails,
      [name]: value,
    }));
  };

  // Simular el envío de datos al servidor
  const handleChangeEmail = async (e) => {
    e.preventDefault();

    const response = await fetch(`${config.baseURL}/api/change-email`, {
        method: "PUT",
        credentials: "include", // Importante para enviar la cookie con el token
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newEmail: newEmail }) // Enviar el nuevo email
    });

    const data = await response.json();

    if (response.status === 200) {
        toast.success("El correo electrónico se cambió exitosamente.");
        setNewEmail(""); 
    } else {
        toast.error("Error al cambiar el correo electrónico: " + data.message);
    }
};


  // CAMBIO DE PASSWORD

  const handleChangePassword = async (e) => {
    e.preventDefault();

      if (newPassword === rNewPassword) {    
        const response = await fetch(`${config.baseURL}/api/change-password`, {
            method: "PUT",
            credentials: "include", // Importante para enviar la cookie con el token
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ oldPassword, newPassword })
        });
        const data = await response.json();

        if (response.status === 200) {
              alert("La contraseña cambió exitosamente.");
              setOldPassword("");  // Limpiar input
              setNewPassword("");  // Limpiar input
              setRNewPassword(""); // Limpiar input

              // Aquí puedes hacer logout o refrescar la página.
          } else {
              toast.error("Error al cambiar la contraseña: " + data.message);
          }
        //return data;
      } else {
    alert("El nuevo password no coincide");
  }
};


  // Si el usuario no está autenticado, mostrar mensaje de acceso denegado
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
        <main>
          <p>No tienes acceso a esta página.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="configuration-container">
      <header>
        <div className="header-left">
        <h2>Configuración del Usuario</h2>
         {/*  <img src="/path/to/company-logo.png" alt="Empresa" className="company-logo" /> */}
        </div>
        <div className="header-right">
          <span></span>
        </div>
      </header>
      <main className="configuration-main">
        
        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}

        {/* Configuración de páginas */}
        {/*
        <section className="pages-config">
          <h3>Configuración de Páginas</h3>
          <div className="pages-list">
            <form onSubmit={handleChangeEmail} className="user-form">
              {Object.entries(pagesConfig)
                .sort(([, a], [, b]) => a.order - b.order)
                .map(([page, config]) => (
                  <div key={page} className="page-item">
                    <label>
                      <input
                        type="checkbox"
                        checked={config.access}
                        onChange={() => handleAccessChange(page)}
                      />
                      {page}
                    </label>
                    <input
                      type="number"
                      value={config.order}
                      onChange={(e) => handleOrderChange(page, e.target.value)}
                      min="1"
                      max={Object.keys(pagesConfig).length}
                      className="order-input"
                    />
                  </div>
                ))}
                <button type="submit" className="save-button">
                  Establecer cambio
                </button>
              </form>

          </div>
          
        </section>
        */}
        {/* Configuración del usuario */}
        <section className="user-config">
          <h3>Datos del Usuario</h3>
          <form onSubmit={handleChangeEmail} className="user-form">
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                name="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="save-button">
                Cambiar Email
              </button>
          </form>

          <form onSubmit={handleChangePassword} className="user-form">
            <div className="form-group">
              <label htmlFor="password">Contraseña Actual</label>
              <input
                type="password"
                id="oldPassword"
                name="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
              <label htmlFor="password">Nueva Contraseña</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <label htmlFor="password">Repetir Nueva Contraseña</label>
              <input
                type="password"
                id="rNewPassword"
                name="rNewPassword"
                value={rNewPassword}
                onChange={(e) => setRNewPassword(e.target.value)}
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-button">
                Cambiar contraseña
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
};

export default Configuration;