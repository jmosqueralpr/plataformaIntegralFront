
import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiActivity, FiCheckSquare, FiCompass, FiLink, FiLock, FiShield } from 'react-icons/fi';
import AuthContext from '../context/authContext';
import '../styles/global.css';
import '../styles/login.css';
import config from '../../src/config';
import { toast } from 'react-toastify';


const Login = () => {
  const { setAuthUser, login } = useContext(AuthContext);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loadingMode, setLoadingMode] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setLoadingMode('login');

    try {
      const response = await fetch(`${config.baseURL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        toast.error('Usuario o contraseña incorrectos');
        return;
      }

      const data = await response.json();
      setAuthUser(data.username);
      login();
      navigate('/dashboard');
    } catch {
      toast.error('No se pudo conectar con el servicio de inicio de sesión.');
    } finally {
      setLoadingMode('');
    }
  };

  const handleGuestLogin = async (event) => {
    event.preventDefault();
    setLoadingMode('guest');

    try {
      const response = await fetch(`${config.baseURL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username: 'invitado', password: 'invitado' }),
      });

      if (!response.ok) {
        toast.error('No está habilitado el acceso de invitado.');
        return;
      }

      const data = await response.json();
      setAuthUser(data.username);
      login();
      navigate('/dashboard');
    } catch {
      toast.error('No se pudo conectar con el servicio de inicio de sesión.');
    } finally {
      setLoadingMode('');
    }
  };

  return (
    <div className="login-page">
      <div className="login-layout">
        <section className="login-intro" aria-labelledby="login-welcome-title">
          <div className="login-eyebrow">
            <span className="login-eyebrow-dot" aria-hidden="true" />
            Plataforma de trabajo DYB
          </div>
          <h1 id="login-welcome-title">
            Tus herramientas de trabajo,
            <span> en un solo lugar.</span>
          </h1>
          <p className="login-intro-copy">
            Un espacio para centralizar recursos operativos, consultar información y
            organizar el trabajo diario del equipo.
          </p>

          <div className="login-tools" aria-label="Herramientas disponibles">
            <article className="login-tool-card">
              <span className="login-tool-icon"><FiActivity aria-hidden="true" /></span>
              <div>
                <h2>Herramientas AIS</h2>
                <p>Base AIS, verificador Message 8 y conversor GPS.</p>
              </div>
            </article>
            <article className="login-tool-card">
              <span className="login-tool-icon"><FiCheckSquare aria-hidden="true" /></span>
              <div>
                <h2>Organización diaria</h2>
                <p>Tareas, vencimientos y búsqueda de soluciones.</p>
              </div>
            </article>
            <article className="login-tool-card">
              <span className="login-tool-icon"><FiLink aria-hidden="true" /></span>
              <div>
                <h2>Accesos y comunicación</h2>
                <p>Enlaces de trabajo y herramientas relacionadas con Telegram.</p>
              </div>
            </article>
          </div>

          <p className="login-access-note">
            <FiShield aria-hidden="true" />
            Las herramientas disponibles pueden variar según tu cuenta y permisos.
          </p>
        </section>

        <section className="login-card" aria-labelledby="login-title">
          <div className="login-card-mark" aria-hidden="true">
            <FiCompass />
          </div>
          <span className="login-card-kicker">Bienvenido/a</span>
          <h2 id="login-title">Iniciar sesión</h2>
          <p className="login-card-description">Ingresá con tu cuenta para continuar.</p>

          <form className="login-form" onSubmit={handleLogin}>
            <div className="login-form-group">
              <label htmlFor="username">Usuario</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                autoCapitalize="none"
                spellCheck="false"
                required
                disabled={Boolean(loadingMode)}
              />
            </div>
            <div className="login-form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
                disabled={Boolean(loadingMode)}
              />
            </div>
            <button className="login-submit-button" type="submit" disabled={Boolean(loadingMode)}>
              {loadingMode === 'login' ? 'Ingresando…' : 'Iniciar sesión'}
            </button>
          </form>

          <div className="login-divider"><span>o</span></div>
          <button
            className="login-guest-button"
            type="button"
            onClick={handleGuestLogin}
            disabled={Boolean(loadingMode)}
          >
            {loadingMode === 'guest' ? 'Ingresando como invitado…' : 'Ingresar como invitado'}
          </button>
          <p className="login-card-note">
            <FiLock aria-hidden="true" />
            Algunas funciones requieren una cuenta habilitada.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Login;
