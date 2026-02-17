// File: frontend/src/components/login/Login.jsx

import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../actions/authActions';
import Spinner from '../common/Spinner';
import '../auth/AuthForm.scss';

const USER_API = process.env.REACT_APP_USER_API;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Tentative de connexion avec :', { email, password, rememberMe });

    if (!email || !password) {
      console.error('Email et mot de passe requis');
      return;
    }

    try {
      const response = await fetch(`${USER_API}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log('Réponse du login :', data);

      if (response.ok) {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        sessionStorage.setItem('sessionJustLoggedIn', '1');

        dispatch(loginUser(data.accessToken));

        if (data.redirectUrl) {
          window.location.href = data.redirectUrl;
        }
        console.log('Connexion réussie, redirection vers :', data.redirectUrl);
      } else {
        console.error('Échec de la connexion :', data.message);
      }
    } catch (error) {
      console.error('Erreur réseau ou serveur :', error.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form" translate="no">
      {/* Champ Email */}
      <div className="auth-input-group">
        <div className="auth-icon"><i className="fas fa-user"></i></div>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="auth-input with-icon"
          required
        />
      </div>

      {/* Champ Mot de passe */}
      <div className="auth-input-group">
        <div className="auth-icon"><i className="fas fa-lock"></i></div>
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mot de passe"
          className="auth-input with-icon"
          required
        />
        <div
          className="auth-toggle-visibility"
          onClick={() => setShowPassword(!showPassword)}
        >
          <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} visible`}></i>
        </div>
      </div>

      {/* Checkbox alignée */}
      <div className="auth-checkbox-group">
        <input
          type="checkbox"
          id="rememberMe"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
        />
        <label htmlFor="rememberMe">Se souvenir de moi</label>
      </div>

      {/* Bouton */}
      <button type="submit" className="auth-submit" disabled={loading}>
        {loading ? <Spinner size="small" inline={true} /> : 'Se connecter'}
      </button>

      {/* Messages */}
      {error && <p className="error-message">Erreur : {error}</p>}
    </form>
  );
};

export default Login;
