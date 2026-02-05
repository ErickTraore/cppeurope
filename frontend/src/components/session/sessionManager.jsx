// File: frontend/src/components/session/SessionManager.jsx

import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import Spinner from '../common/Spinner';

const USER_API = process.env.REACT_APP_USER_API;
const expiryWarning = parseInt(process.env.REACT_APP_SESSION_EXPIRY_WARNING, 10) || 60;

// Contexte pour partager timeLeft entre SessionManager et SessionTimer
const SessionContext = createContext({ timeLeft: 0 });

export const useSessionTimer = () => {
  const context = useContext(SessionContext);
  return context?.timeLeft || 0;
};

// Provider à wrapper autour de App
export const SessionProvider = ({ children }) => {
  const [timeLeft, setTimeLeft] = useState(60); // 60s après login
  const [isInitialSession, setIsInitialSession] = useState(true);

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
    if (isInitialSession) {
      setTimeLeft(60);
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    } else {
      // Après prolongation, afficher la vraie durée du token
      const updateTimeLeft = () => {
        const remaining = getTokenRemainingTime();
        setTimeLeft(remaining > 0 ? remaining : 0);
      };
      updateTimeLeft();
      const interval = setInterval(updateTimeLeft, 1000);
      return () => clearInterval(interval);
    }
  }, [isInitialSession]);

  // Méthode à appeler après "Prolonger"
  const switchToRealToken = () => {
    setIsInitialSession(false);
  };

  return (
    <SessionContext.Provider value={{ timeLeft, setTimeLeft, switchToRealToken }}>
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
  const [showModal, setShowModal] = useState(false);
  const [isExtending, setIsExtending] = useState(false);
  const [hasExtended, setHasExtended] = useState(false);

  const modalTimerRef = useRef(null);
  const hasInitialized = useRef(false);

  const handleLogout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.hash = 'auth';
  }, [dispatch]);

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

  // Afficher la modale immédiatement après login
  useEffect(() => {
    if (timeLeft > 0 && !hasInitialized.current) {
      hasInitialized.current = true;
      setShowModal(true);
      console.log('🔔 Modale de session affichée immédiatement après login, temps restant:', timeLeft);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (showModal && timeLeft <= 0) {
      // Si le temps est écoulé, déconnecter
      handleLogout();
    }
  }, [showModal, timeLeft, handleLogout]);



  useEffect(() => {
    if (timeLeft <= expiryWarning && timeLeft > 0 && !showModal && !hasExtended) {
      console.log('🔔 Session proche de l\'expiration, affichage de la modale');
      setShowModal(true);
    }
  }, [timeLeft, showModal, hasExtended]);


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

      // Le timeLeft sera mis à jour automatiquement par le Provider
      setShowModal(false);
      setHasExtended(true); // Empêcher la modale de se réafficher
      clearInterval(modalTimerRef.current); // 🛑 Stoppe le timer de la modale
      modalTimerRef.current = null;
      setIsExtending(false);
      switchToRealToken(); // 🔄 Passer à la vraie durée du token pour le cadenas
      console.log('🟢 Session prolongée avec succès, modale fermée.');
    } catch (err) {
      console.error('❌ Erreur lors de la requête de prolongation :', err);
      setIsExtending(false);
      handleLogout();
    }
  };
  return (
    <>
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
          <button onClick={handleExtend} disabled={isExtending}>
            {isExtending ? <Spinner size="small" inline={true} /> : 'Prolonger'}
          </button>
          <button onClick={handleLogout}>Déconnecter</button>
        </div>
      )}
    </>
  );
};

export default SessionManager;
