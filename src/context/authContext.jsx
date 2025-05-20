//Llamo las herramientas necesarias para crear un contexto.
import React, { createContext, useState, useContext } from 'react'; 

//Creo el contexto para pasar datos sin necesidad de props.
const AuthContext = createContext(); 


//Proveo el contexto
export const AuthProvider = ({ children }) => {
  //Provee el nombre del usuario conectado.
  const [authUser, setAuthUser] = useState("invitado");
  //Provee una flag por si el usuario esta conectado o no.
  const [isAuthenticated, setIsAutenticated] = useState(false);

  const login = () => setIsAutenticated(true);
  const logout = () => setIsAutenticated(false);


  return (
    //Este es el componente que provee los valores a los componentes hijos.
    <AuthContext.Provider value={{ authUser, setAuthUser, isAuthenticated, login, logout }}> 
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext




