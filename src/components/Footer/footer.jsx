import React from "react";

import { useAuth } from "../../context/authContext";

const Footer = () => {

    const [authUser, setAuthUser] = useAuth("invitado");

    return (
        <footer className="footer">
             
        </footer>
    )
}

export default Footer;