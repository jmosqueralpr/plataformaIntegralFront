import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import config from '../../../src/config';




export function UserCard ( {userName = "uNXDefecto", name = "nXDefecto", children}) { /* EN LA APP RAIZ, PASAMOS LOS DATOS EN FORMA DE PROPS */
    const { authUser, setAuthUser, isAuthenticated, setIsAutenticated, login, logout  } = useContext(AuthContext);
    const navigate = useNavigate();

    const state = useState(false); /* Inicio el hook useState con False */
    const isFollowing = state [0]; /* Extraemos el valor actual del estado */
    const setIsFollowing = state [1]; /* Esta será la función que nos permita actualizar el estado */
    const imageSrc = `https://unavatar.io/onlyfans/amandaribas` /* Uso una constante porque no puedo usar la variable directo en src */

    const text = isAuthenticated ? 'LogOut' : 'LogIn'
    const buttonClassName =  isAuthenticated ? 'tw-followCard-button-following' : 'tw-followCard-button-notFollowing'

    const handleClick = async () => { /* Acá estoy generando la función que voy a usar cuando toco el boton */
        
        
        if (isAuthenticated == true) {
           setIsFollowing(false);
           logout();
           console.log('Quiero salir!');
           
           /* FETCH para el logout */

           const response = await fetch(`${config.baseURL}/api/logout`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include'
          });
      
          if (response.ok) {
            // Si la autenticación es exitosa, redirige al dashboard y configura el nombre de usuario en el contexto.
            navigate('/');
            setAuthUser('Invitado');
            logout();
            console.log("LogOut realizado");
            setIsAutenticated(false);
            
            
            
      
          } else {
            // Manejar errores de autenticación
            alert('Problemas para salir del Login');
          }
            /* ACA QUIERO EL FETCH  */
        } else if (isAuthenticated == false) {
            console.log('PRUEBA!');
            navigate('/');
        }
        /*setIsFollowing(!isFollowing);  Acá estoy definiendo la función del useState */
    };

    return (        
        <article className='tw-followCard'> {/* ARticle porque esto tiene una información propia */}
        <header className='tw-followCard-header'>
            <img 
                className='tw-followCard-avatar'
                src={imageSrc}
                alt="Foto" />
            <div className='tw-followCard-info'>
                <strong>{name}</strong> {/* Strong solo para enfatizar el texto del user name */}
                {children}
                <span className='tw-followCard-infoUserName'>@{userName}</span> {/* Este termina siendo mas delicado para marcar texto */}
            </div>
        </header>

        <aside> {/* Aside apra indicar que esto es secundario a la información principal, pero podría no haber estado */}
            <button className={buttonClassName} onClick={handleClick}> {/* Este onClick es como el addEventListener pero de forma declarativa*/}
                {text}
                </button>
        </aside>
    </article>

    )
}

/*  */