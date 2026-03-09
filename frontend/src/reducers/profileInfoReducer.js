// File: frontend/src/reducers/profileInfoReducer.js

const initialState = {
  data: null,
  loading: false,
  error: null
};

export const profileInfoReducer = (state = initialState, action) => {
  switch (action.type) {
    case 'FETCH_PROFILEINFO_REQUEST':
      return { ...state, loading: true, error: null };

    case 'FETCH_PROFILEINFO_SUCCESS':
      return { ...state, loading: false, error: null, data: action.payload };

    case 'FETCH_PROFILEINFO_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'UPDATE_PROFILEINFO_REQUEST':
      return { ...state, loading: true, error: null };

    case 'UPDATE_PROFILEINFO_SUCCESS':
      return { ...state, loading: false, error: null, data: action.payload };

    case 'UPDATE_PROFILEINFO_FAIL':
      return { ...state, loading: false, error: action.payload };

    default:
      return state;
  }
};

export default profileInfoReducer;
