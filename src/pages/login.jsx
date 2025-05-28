
import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/authContext'; /* Para usar el contexto creado */
import '../styles/global.css';
import '../styles/login.css';
import config from '../../src/config';


const Login = () => {
  //CARGO VARIABLES DE CONTEXTO
  const { authUser, setAuthUser, isAuthenticated, login, logout  } = useContext(AuthContext);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();

    console.log('Datos a enviar:', { username, password });
    console.log("LogiN");
    console.log(`Login a: ${config.baseURL}/api/login`);

    const response = await fetch(`${config.baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, password }),
    });

    //SI EL LOGIN ES EXITOSO
    if (response.ok) {
      
      navigate('/dashboard');
      const data = await response.json(); //Guardo datos de respuesta en data.
      setAuthUser(data.username);//Configuro la variable de contexto authUser
      login();
      //console.log("Respuesta");
      //console.log(data);

    //SI EL LOGIN NO ES EXITOSO
    } else {
      // Manejar errores de autenticación
      alert('Usuario o contraseña incorrectos');
    }
  };

  const handleGuestLogin = async (event) => {
    event.preventDefault();
    setUsername('invitadoDePrueba');
    setPassword('invitadoDePrueba');
    console.log(username);
    
    const response = await fetch(`${config.baseURL}/api/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username: 'invitado', password: 'invitado' }),
    });

    if (response.ok) {
      // Si la autenticación es exitosa, redirige al dashboard y configura el nombre de usuario en el contexto.
      navigate('/dashboard');
      const data = await response.json();
      setAuthUser(data.username);
      login(); //Funcion login del contexto, para indicar que estoy logueado.
      console.log("Respuesta")
      console.log(data);
      

    } else {
      // Manejar errores de autenticación
      alert('Falta registrar el login inicial del usuario invitado');
    }
  };

  return (
    <div className="login-container">
      <h2>Iniciar sesión</h2>
      <form onSubmit={handleLogin}>
        <div className="form-group">
          <label htmlFor="username">Usuario</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button className="blueButton" type="submit">Iniciar sesión</button>
      </form>
      <a rel="stylesheet" className="textLink greyButton externalButton" href="" onClick={handleGuestLogin}>Ingresar como invitado</a>
    </div>
  );
};

export default Login;
