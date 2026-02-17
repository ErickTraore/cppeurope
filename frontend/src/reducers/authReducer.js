// src/reducers/authReducer.js
// Ne jamais restaurer la session au chargement : à chaque réinitialisation d’URL / rechargement,
// l’app considère qu’il n’y a pas de session active (timer à zéro, logout).
const initialState = {
  token: null,
  isAuthenticated: false,
  user: null,
  loading: false,
  error: null
};

const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, loading: false, token: action.payload, isAuthenticated: true };
    case 'LOGIN_FAILURE':
      return { ...state, loading: false, error: action.payload };
    case 'REGISTER_REQUEST':
      return { ...state, loading: true };
    case 'REGISTER_SUCCESS':
      return { ...state, isAuthenticated: true, user: action.payload, loading: false };
    case 'REGISTER_FAIL':
      return { ...state, error: action.payload, loading: false };
    case 'LOGOUT':
      return { ...state, token: null, isAuthenticated: false, user: null, loading: false, error: null };
    default:
      return state;
  }
};

export default authReducer;
