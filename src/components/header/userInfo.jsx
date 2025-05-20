/* Info del usuario */

import React from "react";

const UserInfo = ({ userName }) => (
    <div className="userInfo">
        <span> Bienvenido ({ userName })</span>
    </div>
);

export default UserInfo;