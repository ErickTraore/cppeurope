// File: frontend/src/components/sessionTimer/SessionTimer.jsx

import React from 'react';
import { useSessionTimer } from '../session/sessionManager';

const SessionTimer = ({ onLogout }) => {
  const sessionTimeLeft = useSessionTimer();

  return (
    <div className="App__header__actions__cadenas" onClick={onLogout} style={{ cursor: 'pointer' }}>
      {sessionTimeLeft > 0 ? (
        <>
          <i className="App__header__actions__cadenas__icon fas fa-lock-open"></i>
          <span className="App__header__actions__cadenas__timer">
            {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
          </span>
        </>
      ) : (
        <>
          <i className="App__header__actions__cadenas__icon App__header__actions__cadenas__icon--logout fas fa-lock"></i>
          <span className="App__header__actions__cadenas__timer App__header__actions__cadenas__timer--logout">
            00:00
          </span>
        </>
      )}
    </div>
  );
};

export default React.memo(SessionTimer);
