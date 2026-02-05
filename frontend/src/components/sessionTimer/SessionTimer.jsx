// File: frontend/src/components/sessionTimer/SessionTimer.jsx

import React from 'react';
import { useSessionTimer } from '../session/sessionManager';

const SessionTimer = ({ onLogout }) => {
  const sessionTimeLeft = useSessionTimer();

  return (
    <div className="App__header__actions__cadenas" onClick={onLogout} style={{ cursor: 'pointer' }}>
      {sessionTimeLeft > 20 ? (
        // Cadenas vert (plus de 20 secondes)
        <>
          <i className="App__header__actions__cadenas__icon fas fa-lock-open"></i>
          <span className="App__header__actions__cadenas__timer">
            {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </>
      ) : sessionTimeLeft > 5 ? (
        // Cadenas orange (6-20 secondes)
        <>
          <i className="App__header__actions__cadenas__icon App__header__actions__cadenas__icon--warning fas fa-lock-open" style={{ color: '#ff9800' }}></i>
          <span className="App__header__actions__cadenas__timer" style={{ color: '#ff9800' }}>
            0:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </>
      ) : (
        // Cadenas rouge (5 secondes ou moins - critique)
        <>
          <i className="App__header__actions__cadenas__icon App__header__actions__cadenas__icon--logout fas fa-lock" style={{ color: '#f44336' }}></i>
          <span className="App__header__actions__cadenas__timer App__header__actions__cadenas__timer--logout" style={{ color: '#f44336' }}>
            0:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </>
      )}
    </div>
  );
};

export default React.memo(SessionTimer);
