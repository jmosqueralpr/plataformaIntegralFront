import React, { useContext } from "react";
import Logo from "./logo";
import Prueba from "./prueba";
import UserInfo from "./userInfo";
import AuthContext from '../../context/authContext'; /* Para usar el contexto creado */
import { UserCard } from "./userCard";
import "../../styles/header.css";
import "../../styles/userCard.css";

const Header = ({ userName }) => {
    const { authUser, setAuthUser } = useContext(AuthContext); /* Llamo a las variables del contexto. */
    return (
        <header className="header">
            <Logo></Logo>
            <Prueba></Prueba>
            <UserCard isFollowing={true} userName= {authUser} name={authUser}/>
        </header>
    )
}

export default Header;