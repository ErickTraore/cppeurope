// src/actions/authActions.js

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


export const registerRequest = () => ({
  type: 'REGISTER_REQUEST'
});
export const registerSuccess = (user) => ({
  type: 'REGISTER_SUCCESS',
  payload: user
});
export const registerFail = (error) => ({
  type: 'REGISTER_FAIL',
  payload: error
});

export const registerUser = (userData) => async (dispatch) => {
  dispatch(registerRequest());
  try {
    console.log("📤 Données reçues :", userData);

    // Simuler une requête API
    const response = await fetch(`${USER_API}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    dispatch(registerSuccess(data));
    if (data.redirectUrl) {
      window.location.href = data.redirectUrl;
      window.location.reload();
    }

  } 
  catch (error) {
    dispatch(registerFail(error.message));
  }
};

export const loginUser = (token) => (dispatch) => {
  dispatch({
    type: 'LOGIN_REQUEST'
  });

  try {
    // Stocker le token dans le localStorage
    localStorage.setItem('accessToken', token);
    dispatch({
      type: 'LOGIN_SUCCESS',
      payload: token
    });
  } catch (error) {
    dispatch({
      type: 'LOGIN_FAILURE',
      payload: error.message
    });
  }
};