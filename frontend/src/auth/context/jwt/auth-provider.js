import PropTypes from 'prop-types';
import { useEffect, useReducer, useCallback, useMemo } from 'react';
// utils
import axios, { endpoints } from 'src/utils/axios';
//
import { AuthContext } from './auth-context';
import { isValidToken, setSession } from './utils';

const initialState = {
  user: null,
  loading: true,
};

const reducer = (state, action) => {
  if (action.type === 'INITIAL') {
    return {
      loading: false,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGIN') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'REGISTER') {
    return {
      ...state,
      user: action.payload.user,
    };
  }
  if (action.type === 'LOGOUT') {
    return {
      ...state,
      user: null,
    };
  }
  return state;
};

// ----------------------------------------------------------------------

const STORAGE_KEY = 'token';

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const initialize = useCallback(async () => {
    try {
      const token = sessionStorage.getItem(STORAGE_KEY);

      if (token && isValidToken(token)) {
        setSession(token);

        try {
          const response = await axios.get(endpoints.auth.me);

          const user = response.data;

          dispatch({
            type: 'INITIAL',
            payload: {
              user,
            },
          });
        } catch (error) {
          console.error('Network request failed: ', error);
          // Here, even if token is valid but network request fails,
          // we dispatch INITIAL with user: null
          dispatch({
            type: 'INITIAL',
            payload: {
              user: null,
            },
          });
        }
      } else {
        // If token is invalid
        dispatch({
          type: 'INITIAL',
          payload: {
            user: null,
          },
        });
      }
    } catch (error) {
      console.error('Error in initialize function: ', error); // Log the error
      dispatch({
        type: 'INITIAL',
        payload: {
          user: null,
        },
      });
    }
  }, []);


  useEffect(() => {
    initialize();
  }, [initialize]);

  // LOGIN
  const login = useCallback(async (email, password) => {
    const data = {
      email,
      password,
    };

    const response = await axios.post(endpoints.auth.login, data);

    const { token, user } = response.data;

    setSession(token);

    dispatch({
      type: 'LOGIN',
      payload: {
        user,
      },
    });
  }, []);

  // REGISTER
  const register = useCallback(async (email, password, firstName, lastName) => {
    const name = `${firstName} ${lastName}`;
    const data = {
      name,
      email,
      password,

    };

    const response = await axios.post(endpoints.auth.register, data);

    const { token, user } = response.data;

    sessionStorage.setItem(STORAGE_KEY, token);

    dispatch({
      type: 'REGISTER',
      payload: {
        user,
      },
    });
  }, []);

  // LOGOUT
  const logout = useCallback(async () => {
    setSession(null);

    dispatch({
      type: 'LOGOUT',
    });
  }, []);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user,
      method: 'jwt',
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
      //
      login,
      register,
      logout,
    }),
    [login, logout, register, state.user, status]
  );

  return <AuthContext.Provider value={memoizedValue}>{children}</AuthContext.Provider>;
}

AuthProvider.propTypes = {
  children: PropTypes.node,
};
