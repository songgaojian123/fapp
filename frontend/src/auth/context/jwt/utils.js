// routes
import { paths } from 'src/routes/paths';
// utils
import axios from 'src/utils/axios';

function jwtDecode(token) {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split('')
      .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
      .join('')
  );

  return JSON.parse(jsonPayload);
}

export const isValidToken = (token) => {
  if (!token) {
    
    return false;
  }

  const decoded = jwtDecode(token);
  const currentTime = Date.now() / 1000;

  

  return decoded.exp > currentTime;
};

export const tokenExpired = (exp) => {
  let expiredTimer;
  const currentTime = Date.now();
  const timeLeft = exp * 1000 - currentTime;

  

  clearTimeout(expiredTimer);
  expiredTimer = setTimeout(() => {
    
    sessionStorage.removeItem('token');
    
    window.location.href = paths.auth.jwt.login;
  }, timeLeft);
};

export const setSession = (token) => {
  if (token) {
    sessionStorage.setItem('token', token);
    
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    const { exp } = jwtDecode(token); 
    
    tokenExpired(exp);
  } else {
    sessionStorage.removeItem('token');
    delete axios.defaults.headers.common.Authorization;
  }
};
