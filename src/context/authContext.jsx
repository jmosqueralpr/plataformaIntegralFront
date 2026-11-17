//Llamo las herramientas necesarias para crear un contexto.
import React, { createContext, useState, useEffect } from 'react';

//Creo el contexto para pasar datos sin necesidad de props.
const AuthContext = createContext();

//Proveo el contexto
export const AuthProvider = ({ children }) => {
  //Provee el nombre del usuario conectado.
  const [authUser, setAuthUser] = useState('invitado');
  //Provee una flag por si el usuario esta conectado o no.
  const [isAuthenticated, setIsAutenticated] = useState(false);
  const [userAvatar, setUserAvatar] = useState('');

  useEffect(() => {
    const savedAvatar = localStorage.getItem('dyb-user-avatar') || '';
    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    }
  }, []);

  const login = () => setIsAutenticated(true);
  const logout = () => {
    setIsAutenticated(false);
    setUserAvatar('');
    localStorage.removeItem('dyb-user-avatar');
  };

  return (
    //Este es el componente que provee los valores a los componentes hijos.
    <AuthContext.Provider value={{ authUser, setAuthUser, isAuthenticated, login, logout, userAvatar, setUserAvatar }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;




