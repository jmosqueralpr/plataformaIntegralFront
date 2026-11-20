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
  //Provee el resumen de vencimientos del usuario (vencidos y próximos).
  const [expirationSummary, setExpirationSummary] = useState(null);
  //Indica si el usuario cerró el aviso flotante de vencimientos en esta sesión de login.
  const [dismissedExpirationNotice, setDismissedExpirationNotice] = useState(false);

  useEffect(() => {
    const savedAvatar = localStorage.getItem('dyb-user-avatar') || '';
    if (savedAvatar) {
      setUserAvatar(savedAvatar);
    }

    // Lee si el usuario ya descartó el aviso de vencimiento en una sesión previa.
    const dismissed = localStorage.getItem('dyb-dismissed-expiration-notice') === 'true';
    setDismissedExpirationNotice(dismissed);
  }, []);

  const login = () => setIsAutenticated(true);
  const logout = () => {
    setIsAutenticated(false);
    setUserAvatar('');
    setExpirationSummary(null);
    setDismissedExpirationNotice(false);
    localStorage.removeItem('dyb-user-avatar');
    localStorage.removeItem('dyb-dismissed-expiration-notice');
  };

  return (
    //Este es el componente que provee los valores a los componentes hijos.
    <AuthContext.Provider value={{ authUser, setAuthUser, isAuthenticated, login, logout, userAvatar, setUserAvatar, expirationSummary, setExpirationSummary, dismissedExpirationNotice, setDismissedExpirationNotice }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;




