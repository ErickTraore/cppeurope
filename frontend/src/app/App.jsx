// File: lespremices/frontend/src/app/App.jsx

import React, { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import '../styles/main.scss';
import HamburgerIcon from '../components/hamburgerIcon/HamburgerIcon';
import PageContent from '../components/pageContent/PageContent';
import logo from '../assets/logoppaci514_150x151.png';
import panneau150 from '../assets/original/banniere-150x21.png'
import panneau200 from '../assets/original/banniere-200x28.png';
import panneau320 from '../assets/original/banniere-320x44.png';
import panneau375 from '../assets/original/banniere-375x52.png';
import panneau425 from '../assets/original/banniere-425x59.png';
import panneau768 from '../assets/original/banniere-768x107.png';
import panneau1024 from '../assets/original/banniere-1024x142.png';
import panneau1536 from '../assets/original/banniere-1440x200.png';
import Footer from '../components/footer/Footer';
import './App.css';
import SessionManager from '../components/session/sessionManager.jsx';
import SessionTimer from '../components/sessionTimer/SessionTimer.jsx';
import { jwtDecode } from 'jwt-decode';

// ✅ Fonction de déconnexion
export const handleLogout = (dispatch) => {
  localStorage.removeItem("accessToken");
  dispatch({ type: "LOGOUT" });
  window.location.hash = 'auth';
  window.location.reload();
};

function App() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const [isOpen, setIsOpen] = useState(false);
  const [activePage, setActivePage] = useState('auth');
  const [panneau, setPanneau] = useState(panneau1536); // valeur par défaut

  const dispatch = useDispatch();
  const token = localStorage.getItem("accessToken");
  
  // ✅ Memoïser le décodage du token pour éviter de recréer l'objet à chaque render
  const decodedUser = useMemo(() => {
    return token ? jwtDecode(token) : null;
  }, [token]);
  
  const isAdmin = decodedUser?.isAdmin === true;

  // ✅ Fonction centralisée
  const updatePanneau = () => {
    const width = window.innerWidth;
    if (width <= 150) {
      setPanneau(panneau150);
    } else if (width <= 200) {
      setPanneau(panneau200);
    } else if (width <= 320) {
      setPanneau(panneau320);
    } else if (width <= 375) {
      setPanneau(panneau375);
    } else if (width <= 425) {
      setPanneau(panneau425);
    } else if (width <= 768) {
      setPanneau(panneau768);
    } else if (width <= 1024) {
      setPanneau(panneau1024);
    } else {
      setPanneau(panneau1536);
    }
  };

  // ✅ Initialisation + resize
  useEffect(() => {
    updatePanneau();
    window.addEventListener('resize', updatePanneau);

    const hash = window.location.hash.slice(1);
    if (hash) setActivePage(hash);

    if (token) {
      dispatch({ type: "LOGIN_SUCCESS", payload: token });
    }

    return () => {
      window.removeEventListener('resize', updatePanneau);
    };
  }, [dispatch, token]);

  const toggleMenu = () => setIsOpen(!isOpen);

  const navigateTo = (page) => {
    setActivePage(page);
    setIsOpen(false);
    window.location.hash = page;
  };

  // ✅ Memoïser menuItems pour éviter de recréer le tableau à chaque render
  const menuItems = useMemo(() => [
    { key: 'home', label: 'Home' },
    ...(isAdmin ? [{ key: 'presse', label: 'Admin-presse' }] : []),
    { key: 'zoompage', label: 'Zoompage' },
    { key: 'contact', label: 'Contact' },
    { key: 'profilepage', label: 'ProfilePage' },
  ], [isAdmin]);

  return (
    <div className={`App ${isAuthenticated ? 'authenticated' : 'not-authenticated'}`}>
      {isAuthenticated && <SessionManager />}
      <header className="App__header">
        <div className="App__header__logo">
          <img src={logo} alt="logo" className="App__header__logo__img" />
        </div>

        <div className="App__header__panneau">
          <p className="App__header__panneau__text-1">
            Parti des Peuples Africains
          </p>
          <p className="App__header__panneau__text-2">
            Conseil Politique Permanent Europe
          </p>
        </div>

        <div className="App__header__actions">
          {isAuthenticated && <SessionTimer onLogout={() => handleLogout(dispatch)} />}
          
          <div className="App__header__actions__hamburger">
            {isAuthenticated && (
              <HamburgerIcon isOpen={isOpen} toggleMenu={toggleMenu} />
            )}
          </div>
        </div>
      </header>

      {isAuthenticated && (
        <nav className={`menu ${isOpen ? 'open' : ''}`}>
          <ul>
            {menuItems.map(({ key, label }) => (
              <li
                key={key}
                className={activePage === key ? 'active' : ''}
                onClick={() => navigateTo(key)}
              >
                {label}
              </li>
            ))}
          </ul>
        </nav>
      )}

      {isAuthenticated && (
        <ul className="horizontal-menu">
          {menuItems.map(({ key, label }) => (
            <li key={key} className={activePage === key ? 'active' : ''}>
              <a href={`#${key}`} onClick={() => navigateTo(key)}>{label}</a>
            </li>
          ))}
        </ul>
      )}

      <PageContent activePage={activePage} isAuthenticated={isAuthenticated} />
      <Footer />
    </div>
  );
}

export default App;
