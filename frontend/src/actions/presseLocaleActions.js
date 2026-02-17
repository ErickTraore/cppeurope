// File: frontend/src/actions/presseLocaleActions.js

export const FETCH_PRESSE_LOCALE = 'FETCH_PRESSE_LOCALE';
export const FETCH_PRESSE_LOCALE_BY_CITY = 'FETCH_PRESSE_LOCALE_BY_CITY';
export const FILTER_PRESSE_LOCALE_BY_CITY = 'FILTER_PRESSE_LOCALE_BY_CITY';

const PRESSE_LOCALE_API = process.env.REACT_APP_PRESSE_LOCALE_API || process.env.REACT_APP_USER_API;
const PRESSE_LOCALE_SITE_KEY = process.env.REACT_APP_PRESSE_LOCALE_SITE_KEY || '';

/**
 * Récupère tous les messages presse locale depuis le user-backend
 */
export const fetchPresseLocale = () => {
  return async dispatch => {
    try {
      const siteKeyParam = PRESSE_LOCALE_SITE_KEY
        ? `&siteKey=${encodeURIComponent(PRESSE_LOCALE_SITE_KEY)}`
        : '';

      const response = await fetch(`${PRESSE_LOCALE_API}/messages/?categ=presse-locale${siteKeyParam}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Erreur ${response.status}`);
      }
      
      const data = await response.json();
      dispatch({ 
        type: FETCH_PRESSE_LOCALE, 
        payload: data 
      });
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des presses locales:', error);
      dispatch({ 
        type: FETCH_PRESSE_LOCALE, 
        payload: [] 
      });
    }
  };
};

/**
 * Filtre les messages presse locale par ville (lyon, paris, marseille)
 */
export const filterPresseLocaleByCity = (city) => {
  return {
    type: FILTER_PRESSE_LOCALE_BY_CITY,
    payload: city
  };
};
