// File: frontend/src/actions/profileActions.js

import {
  CREATE_PROFILEINFO_REQUEST,
  CREATE_PROFILEINFO_SUCCESS,
  CREATE_PROFILEINFO_FAIL,

  CREATE_PROFILEMEDIA_REQUEST,
  CREATE_PROFILEMEDIA_SUCCESS,
  CREATE_PROFILEMEDIA_FAIL,

  FETCH_PROFILEINFO_REQUEST,
  FETCH_PROFILEINFO_SUCCESS,
  FETCH_PROFILEINFO_FAIL,

  UPDATE_PROFILEINFO_REQUEST,
  UPDATE_PROFILEINFO_SUCCESS,
  UPDATE_PROFILEINFO_FAIL,

  UPDATE_PROFILEMEDIA_REQUEST,
  UPDATE_PROFILEMEDIA_SUCCESS,
  UPDATE_PROFILEMEDIA_FAIL,

  FETCH_PROFILEMEDIA_REQUEST,
  FETCH_PROFILEMEDIA_SUCCESS,
  FETCH_PROFILEMEDIA_FAIL

} from './types';

const resolveApiBase = (value, fallback) => {
  const raw = (value || fallback).trim();

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

const isFrontend3000 =
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  window.location.port === '3000';

const normalizeNetworkError = (error) => {
  if (error?.message === 'Failed to fetch') {
    return 'API injoignable (vérifie que localhost:8082 est démarré)';
  }
  return error?.message || 'Erreur réseau';
};

const buildApiCandidates = (primary, fallback) => {
  const main = resolveApiBase(primary, fallback);
  const candidates = [main];

  try {
    const url = new URL(main);
    if (url.hostname === 'localhost') {
      url.hostname = '127.0.0.1';
      candidates.push(url.toString().replace(/\/$/, ''));
    } else if (url.hostname === '127.0.0.1') {
      url.hostname = 'localhost';
      candidates.push(url.toString().replace(/\/$/, ''));
    }
  } catch {
    return [main];
  }

  return [...new Set(candidates)];
};

const fetchWithApiFallback = async (apiBases, endpoint, options) => {
  let lastError = null;

  for (const apiBase of apiBases) {
    try {
      return await fetch(`${apiBase}${endpoint}`, options);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Failed to fetch');
};

const PROFILE_MEDIA_API = isFrontend3000
  ? '/api/user-media-profile'
  : resolveApiBase(
      process.env.REACT_APP_PROFILE_MEDIA_API || process.env.REACT_APP_USER_MEDIA_PROFILE_API || process.env.REACT_APP_MEDIA_API,
      'http://localhost:8082/api/user-media-profile'
    );
const USER_API_CANDIDATES = isFrontend3000
  ? ['/api/users', 'http://localhost:8082/api/users', 'http://127.0.0.1:8082/api/users']
  : buildApiCandidates(process.env.REACT_APP_USER_API, 'http://localhost:8082/api/users');
const PROFILE_MEDIA_API_CANDIDATES = isFrontend3000
  ? ['/api/user-media-profile', 'http://localhost:8082/api/user-media-profile', 'http://127.0.0.1:8082/api/user-media-profile']
  : buildApiCandidates(
      process.env.REACT_APP_PROFILE_MEDIA_API || process.env.REACT_APP_USER_MEDIA_PROFILE_API || process.env.REACT_APP_MEDIA_API,
      'http://localhost:8082/api/user-media-profile'
    );



export const fetchProfileInfo = (id) => async (dispatch) => {
  dispatch({ type: FETCH_PROFILEINFO_REQUEST });
  const token = localStorage.getItem('accessToken');

  if (!token) {
    dispatch({ type: FETCH_PROFILEINFO_FAIL, payload: 'Token manquant' });
    return;
  }

  try {
    const response = await fetchWithApiFallback(USER_API_CANDIDATES, '/infoProfile/user', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur récupération profil');

    dispatch({ type: FETCH_PROFILEINFO_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_PROFILEINFO_FAIL, payload: normalizeNetworkError(error) });
  }
}

export const createFullProfile = ({ profileInfoCreate = {}, profileMediaCreate = [] }) => async (dispatch) => {
  // 🔹 Création du profil utilisateur
  if (Object.keys(profileInfoCreate).length > 0) {
    dispatch({ type: CREATE_PROFILEINFO_REQUEST });
    try {
        const response = await fetchWithApiFallback(USER_API_CANDIDATES, '/infoProfile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileInfoCreate)
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erreur création profil');
      dispatch({ type: CREATE_PROFILEINFO_SUCCESS, payload: data });

      const profileId = data.id;

      // 🔹 Création des médias liés au profil
      if (profileMediaCreate.length > 0) {
        for (const media of profileMediaCreate) {
          dispatch({ type: CREATE_PROFILEMEDIA_REQUEST });
          try {
            const mediaResponse = await fetchWithApiFallback(PROFILE_MEDIA_API_CANDIDATES, '/mediaProfile/', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...media, profileId })
            });
            const mediaData = await mediaResponse.json();
            if (!mediaResponse.ok) throw new Error(mediaData.error || 'Erreur création média');
            dispatch({ type: CREATE_PROFILEMEDIA_SUCCESS, payload: mediaData });
          } catch (error) {
            dispatch({ type: CREATE_PROFILEMEDIA_FAIL, payload: error.message });
          }
        }
      }
    } catch (error) {
      dispatch({ type: CREATE_PROFILEINFO_FAIL, payload: error.message });
    }
  }
};


export const updateProfileInfo = (id, formData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILEINFO_REQUEST });

  const token = localStorage.getItem('accessToken'); // ✅ dynamique

  if (!token) {
    dispatch({ type: UPDATE_PROFILEINFO_FAIL, payload: 'Token manquant' });
    return;
  }

  try {
    const response = await fetchWithApiFallback(USER_API_CANDIDATES, `/infoProfile/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur mise à jour profil');

    dispatch({ type: UPDATE_PROFILEINFO_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: UPDATE_PROFILEINFO_FAIL, payload: normalizeNetworkError(error) });
  }
};


export const updateProfileMedia = (mediaId, payload) => async (dispatch) => {
  console.log('📤 Début updateProfileMedia pour mediaId :', mediaId);
  console.log('📦 Payload envoyé :', payload);

  dispatch({ type: UPDATE_PROFILEMEDIA_REQUEST });
  const token = localStorage.getItem('accessToken');

  if (!token) {
    console.error('❌ Token manquant');
    dispatch({ type: UPDATE_PROFILEMEDIA_FAIL, payload: 'Token manquant' });
    return;
  }

  const url = `${PROFILE_MEDIA_API}/mediaProfile/${mediaId}`;
  console.log('🚀 Requête PUT vers :', url);

  try {
    const response = await fetchWithApiFallback(PROFILE_MEDIA_API_CANDIDATES, `/mediaProfile/${mediaId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    console.log('📨 Réponse reçue du backend');
    const data = await response.json();
    console.log('📄 Contenu JSON :', data);

    if (!response.ok) {
      console.error('❌ Réponse non OK :', response.status);
      throw new Error(data.error || 'Erreur mise à jour média');
    }

    console.log('✅ Mise à jour réussie, dispatch UPDATE_PROFILEMEDIA_SUCCESS');
    dispatch({ type: UPDATE_PROFILEMEDIA_SUCCESS, payload: data });
  } catch (error) {
    console.error('❌ Erreur updateProfileMedia :', error.message);
    dispatch({ type: UPDATE_PROFILEMEDIA_FAIL, payload: normalizeNetworkError(error) });
  }
};


export const fetchProfileMedia = (profileId) => async (dispatch) => {
  dispatch({ type: FETCH_PROFILEMEDIA_REQUEST });
  const token = localStorage.getItem('accessToken');

  if (!token) {
    dispatch({ type: FETCH_PROFILEMEDIA_FAIL, payload: 'Token manquant' });
    return;
  }

  const url = `${PROFILE_MEDIA_API}/mediaProfile/${profileId}`;
  console.log('[fetchProfileMedia] GET', url, 'profileId=', profileId);

  try {
    const response = await fetchWithApiFallback(PROFILE_MEDIA_API_CANDIDATES, `/mediaProfile/${profileId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Erreur récupération médias');

    // Debug : réponse complète de l'API (voir onglet Console au chargement du profil)
    console.log('[fetchProfileMedia] Réponse brute:', JSON.stringify(data).slice(0, 500), '| type:', Array.isArray(data) ? 'array' : typeof data, Array.isArray(data) ? `length=${data.length}` : (data ? `keys=[${Object.keys(data).join(', ')}]` : ''));

    // Normaliser la réponse : tableau ou objet avec liste de médias
    const slots = Array.isArray(data)
      ? data
      : (data?.slots ?? data?.media ?? data?.data ?? data?.items ?? data?.results ?? data?.mediaProfiles ?? data?.list ?? []);

    if (!Array.isArray(slots)) {
      console.warn('[fetchProfileMedia] Liste de slots non-tableau après normalisation:', slots);
      dispatch({ type: FETCH_PROFILEMEDIA_SUCCESS, payload: [] });
      return;
    }
    console.log('[fetchProfileMedia] Slots normalisés:', slots.length, slots);

    dispatch({ type: FETCH_PROFILEMEDIA_SUCCESS, payload: slots });
  } catch (error) {
    dispatch({ type: FETCH_PROFILEMEDIA_FAIL, payload: normalizeNetworkError(error) });
  }
};
