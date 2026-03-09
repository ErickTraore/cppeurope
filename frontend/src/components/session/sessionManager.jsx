// File: frontend/src/components/session/SessionManager.jsx

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../common/Spinner';

const resolveUserApi = () => {
  const fallback = 'http://localhost:8082/api/users';
  const raw = (process.env.REACT_APP_USER_API || fallback).trim();

  try {
    const parsed = new URL(raw);
    if (parsed.port === '6000') {
      parsed.port = '8082';
      return parsed.toString().replace(/\/$/, '');
    }
    return raw.replace(/\/$/, '');
  } catch {
    return fallback;
  }
};

const USER_API = resolveUserApi();
const expiryWarning = parseInt(process.env.REACT_APP_SESSION_EXPIRY_WARNING, 10) || 60;

// Contexte pour partager timeLeft et l'état de phase session entre SessionManager et SessionTimer
const SessionContext = createContext({
  timeLeft: 0,
  setTimeLeft: () => {},
  switchToRealToken: () => {},
  isInitialSession: true,
  justLoggedIn: false,
});

export const useSessionTimer = () => {
  const context = useContext(SessionContext);
  return context?.timeLeft || 0;
};

// Provider à wrapper autour de App
export const SessionProvider = ({ children, isAuthenticated = false, accessToken = null }) => {
  const [timeLeft, setTimeLeft] = useState(0); // Démarre à 0 tant que non connecté
  const [isInitialSession, setIsInitialSession] = useState(true);
  const [justLoggedIn, setJustLoggedIn] = useState(false);
  const prevAuthRef = useRef(false);
  const lastTokenRef = useRef(null);

  const getTokenRemainingTime = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return 0;
    try {
      const decoded = jwtDecode(token);
      const now = Math.floor(Date.now() / 1000);
      if (!decoded.exp || typeof decoded.exp !== 'number') return 0;
      return decoded.exp - now;
    } catch {
      return 0;
    }
  };

  // Après login, démarrer à 60s puis attendre la prolongation
  useEffect(() => {
    const wasAuth = prevAuthRef.current;
    prevAuthRef.current = isAuthenticated;

    if (!isAuthenticated) {
      lastTokenRef.current = null;
      setTimeLeft(0);
      setIsInitialSession(true);
      setJustLoggedIn(false);
      return;
    }

    // Ne réinitialiser le timer qu'en cas de login effectif (pas navigation)
    if (isAuthenticated && !wasAuth) {
      lastTokenRef.current = accessToken; // Éviter de confondre avec une prolongation au prochain render
      setIsInitialSession(true);
      setJustLoggedIn(true);
      setTimeLeft(expiryWarning); // 60s après login (ou REACT_APP_SESSION_EXPIRY_WARNING)
      sessionStorage.setItem('sessionJustLoggedIn', '1'); // Flag pour modale
    }

    // Prolongation uniquement : token change alors qu'on était déjà connecté (PAS au premier login)
    if (isAuthenticated && wasAuth && accessToken && accessToken !== lastTokenRef.current) {
      lastTokenRef.current = accessToken;
      setIsInitialSession(false); // Prolongation : passe à la vraie durée
      setJustLoggedIn(false);
      setTimeLeft(getTokenRemainingTime()); // Passe à la vraie durée uniquement après prolongation
      sessionStorage.removeItem('sessionJustLoggedIn');
    }
  }, [isAuthenticated, accessToken]);

  // Timer 60s après login/prolongation
  useEffect(() => {
    if (!isAuthenticated) return;
    if (isInitialSession && justLoggedIn) {
      setTimeLeft(expiryWarning);
      let current = expiryWarning;
      const timer = setInterval(() => {
        current -= 1;
        setTimeLeft(current);
        if (current <= 0) {
          clearInterval(timer);
        }
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isInitialSession, justLoggedIn, isAuthenticated]);

  // Après prolongation, afficher la vraie durée du token
  useEffect(() => {
    if (!isAuthenticated) return;
    if (!isInitialSession && !justLoggedIn) {
      const updateTimeLeft = () => {
        const remaining = getTokenRemainingTime();
        setTimeLeft(remaining > 0 ? remaining : 0);
      };
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [isInitialSession, justLoggedIn, isAuthenticated]);

  // Méthode à appeler après "Prolonger"
  const switchToRealToken = () => {
    setIsInitialSession(false);
    setJustLoggedIn(false);
  };

  return (
    <SessionContext.Provider
      value={{ timeLeft, setTimeLeft, switchToRealToken, isInitialSession, justLoggedIn }}
    >
      {children}
    </SessionContext.Provider>
  );
};

const SessionManager = () => {
  const dispatch = useDispatch();
  const context = useContext(SessionContext);
  const timeLeft = context?.timeLeft || 0;
  const setTimeLeft = context?.setTimeLeft || (() => {});
  const switchToRealToken = context?.switchToRealToken || (() => {});
  const isInitialSession = context?.isInitialSession ?? true;
  const justLoggedIn = context?.justLoggedIn ?? false;
  const [showModal, setShowModal] = useState(false);
  const [isExtending, setIsExtending] = useState(false);

  const hasInitialized = useRef(false);

  // Composant inline pour le cadenas/timer visuel (déplacé hors de handleLogout)
  const VisualTimer = ({ timeLeft, onLogout }) => {
    let color = '#4caf50'; // vert
    let iconClass = 'fa-lock-open';
    if (timeLeft <= 20 && timeLeft > 5) {
      color = '#ff9800'; // orange
    } else if (timeLeft <= 5) {
      color = '#f44336'; // rouge
      iconClass = 'fa-lock';
    }
    return (
      <div
        className="App__header__actions__cadenas"
        onClick={onLogout}
      >
        <i
          className={`App__header__actions__cadenas__icon fas ${iconClass}`}
          style={{ color }}
        />
        <span
          className="App__header__actions__cadenas__timer"
          style={{ color }}
        >
          {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </span>
      </div>
    );
  };

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    sessionStorage.removeItem('sessionJustLoggedIn');
    window.location.hash = 'auth';
    window.location.reload();
  }, [dispatch]);

  // handleExtend doit être au niveau principal du composant
  const handleExtend = async () => {
    console.log('🟡 Tentative de prolongation de session...');
    const refreshToken = localStorage.getItem('refreshToken');
    console.log('🔑 refreshToken récupéré :', refreshToken);
    if (!refreshToken) {
      console.warn('❌ Aucun refreshToken trouvé, déconnexion...');
      return handleLogout();
    }

    setIsExtending(true);

    try {
      const response = await fetch(`${USER_API}/extend-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`
        }
      });

      console.log('📡 Réponse reçue du backend :', response);
      const data = await response.json();
      console.log('📦 Contenu JSON reçu :', data);

      if (!response.ok || !data.accessToken) {
        console.warn('❌ Token non reçu ou réponse invalide, déconnexion...');
        return handleLogout();
      }

      localStorage.setItem('accessToken', data.accessToken);
      console.log('✅ Nouveau accessToken stocké :', data.accessToken);

      dispatch({ type: 'LOGIN_SUCCESS', payload: data.accessToken });

      // 🔄 Réinitialiser immédiatement à 30 min (vraie durée du token, pas 60s restant + 30min)
      const remaining = (() => {
        try {
          const decoded = jwtDecode(data.accessToken);
          const now = Math.floor(Date.now() / 1000);
          return decoded?.exp && typeof decoded.exp === 'number' ? Math.max(0, decoded.exp - now) : 0;
        } catch {
          return 0;
        }
      })();
      switchToRealToken(); // Passe en mode "durée réelle" avant setTimeLeft
      setTimeLeft(remaining);

      setShowModal(false);
      setIsExtending(false);
      console.log('🟢 Session prolongée avec succès, timer réinitialisé à 30 min.');
    } catch (err) {
      console.error('❌ Erreur lors de la requête de prolongation :', err);
      setIsExtending(false);
      handleLogout();
    }
  };

  // Afficher la modale immédiatement après login (le Provider gère le timer 60s)
  useEffect(() => {
    const sessionJustLoggedIn = sessionStorage.getItem('sessionJustLoggedIn') === '1';
    const hash = window.location.hash.slice(1);
    const isAuthPage = hash === 'auth';
    if (sessionJustLoggedIn && !hasInitialized.current && !isAuthPage) {
      hasInitialized.current = true;
      setShowModal(true);
      sessionStorage.removeItem('sessionJustLoggedIn');
      console.log('🔔 Modale de session affichée (timer 60s géré par SessionProvider)');
    }
  }, []);

  useEffect(() => {
    if (showModal && timeLeft <= 0) {
      handleLogout();
    }
  }, [showModal, timeLeft, handleLogout]);

  // 🔁 Déconnexion automatique lorsque le timer "réel" (≈30 min) arrive à 0
  // Sans cliquer sur quoi que ce soit, on reproduit le comportement du timer 60s :
  // redirection vers /#auth via handleLogout.
  // On se limite aux cas où la modale n'est pas affichée ET où on est en phase "réelle" (après prolongation)
  // pour ne pas perturber la phase initiale 60s ni le montage initial.
  useEffect(() => {
    if (!showModal && !isInitialSession && !justLoggedIn && timeLeft <= 0) {
      handleLogout();
    }
  }, [showModal, isInitialSession, justLoggedIn, timeLeft, handleLogout]);

  return (
    <>
      {/* VisualTimer placé dans le header (via App) sans texte supplémentaire */}
      <VisualTimer timeLeft={timeLeft} onLogout={handleLogout} />
      {showModal && (
        <div style={{
          position: 'fixed',
          top: '30%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: '#fff',
          padding: '20px',
          border: '2px solid #333',
          zIndex: 1000
        }}>
          <p>⏰ Votre session va expirer.</p>
          <p style={{ fontWeight: 'bold', color: 'red' }}>
            Déconnexion automatique dans : {timeLeft} secondes
          </p>
          <button type="button" onClick={handleExtend} disabled={isExtending} data-testid="prolonger-session" aria-label="Prolonger la session">
            {isExtending ? <Spinner size="small" inline={true} /> : 'Prolonger'}
          </button>
          <button onClick={handleLogout}>Déconnecter</button>
        </div>
      )}
    </>
  );
};

export default SessionManager;
