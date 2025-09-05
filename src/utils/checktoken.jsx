// utils/auth.js

import {jwtDecode }from 'jwt-decode';

export const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;

  try {
    const decoded = jwtDecode(token);
    const { exp } = decoded;

    if (!exp) return false;

    const isExpired = Date.now() >= exp * 1000;
    return !isExpired;
  } catch (error) {
    console.error('Invalid token:', error);
    return false;
  }
};
