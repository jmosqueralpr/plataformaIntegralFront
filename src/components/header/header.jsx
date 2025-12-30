import React, { useContext } from "react";
import Logo from "./logo";
import Prueba from "./prueba";
import UserInfo from "./userInfo";
import AuthContext from '../../context/authContext'; /* Para usar el contexto creado */
import { UserCard } from "./userCard";
import { useLocation, useNavigate } from "react-router-dom";
import "../../styles/header.css";
import "../../styles/userCard.css";


const Header = ({ userName }) => {
  const { authUser } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  console.log("Estoy en el header:", location.pathname);

  const hideBackButton =
    location.pathname === "/" || location.pathname === "/Dashboard";

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <header className="header">
        <div className="header-left">
            <Logo />

            {!hideBackButton && (
            <button
                className="back-button"
                onClick={handleBack}
                aria-label="Volver atrás"
                title="Volver"
                >
                Volver
                </button>

            )}
        </div>

        <UserCard isFollowing={true} userName={authUser} name={authUser} />
        </header>

  );
};


/* const Header = ({ userName }) => {
    const { authUser, setAuthUser } = useContext(AuthContext); 
    return (
        <header className="header">
            <Logo></Logo>
             <Prueba></Prueba> 
            <UserCard isFollowing={true} userName= {authUser} name={authUser}/>
        </header>
    )
}
    */

export default Header; 