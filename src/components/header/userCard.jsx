import { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../../context/authContext';
import config from '../../../src/config';

const AVATAR_STORAGE_KEY = 'dyb-user-avatar';




export function UserCard({ userName = 'uNXDefecto', name = 'nXDefecto', children }) {
  const { authUser, setAuthUser, isAuthenticated, setIsAutenticated, logout, userAvatar } = useContext(AuthContext);
  const navigate = useNavigate();

  const state = useState(false);
  const isFollowing = state[0];
  const setIsFollowing = state[1];
  const [avatarSrc, setAvatarSrc] = useState('');

  useEffect(() => {
    const savedAvatar = userAvatar || localStorage.getItem(AVATAR_STORAGE_KEY) || '';

    if (savedAvatar) {
      setAvatarSrc(savedAvatar);
      return;
    }

    const baseName = (name || authUser || 'Usuario').toString().trim() || 'Usuario';
    const generatedAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(baseName)}&background=2563eb&color=fff&bold=true&length=2`;
    setAvatarSrc(generatedAvatar);
  }, [authUser, name, userAvatar]);

  const text = isAuthenticated ? 'LogOut' : 'LogIn';
  const buttonClassName = isAuthenticated ? 'tw-followCard-button-following' : 'tw-followCard-button-notFollowing';

  const handleClick = async () => {
    if (isAuthenticated === true) {
      setIsFollowing(false);
      logout();

      const response = await fetch(`${config.baseURL}/api/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });

      if (response.ok) {
        navigate('/');
        setAuthUser('Invitado');
        logout();
        setIsAutenticated(false);
      } else {
        alert('Problemas para salir del Login');
      }
    } else if (isAuthenticated === false) {
      navigate('/');
    }
  };

  return (
    <article className='tw-followCard'>
      <header className='tw-followCard-header'>
        <img
          className='tw-followCard-avatar'
          src={avatarSrc}
          alt="Foto de perfil"
          onError={() => {
            const fallbackName = (name || authUser || 'Usuario').toString().trim() || 'Usuario';
            const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(fallbackName)}&background=2563eb&color=fff&bold=true&length=2`;
            setAvatarSrc(fallbackAvatar);
          }}
        />
        <div className='tw-followCard-info'>
          <strong>{name}</strong>
          {children}
          <span className='tw-followCard-infoUserName'>@{userName}</span>
        </div>
      </header>

      <aside>
        <button className={buttonClassName} onClick={handleClick}>
          {text}
        </button>
      </aside>
    </article>
  );
}
