import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import api from "../utils/api";

const PermissionsContext = createContext({
  permissions: [],
  loading: false,
  error: null,
  refreshPermissions: async () => [],
});

export const PermissionsProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch permissions from backend
  const fetchPermissions = async () => {
    const token = localStorage.getItem('token');
    //console.log('Token is',token)
    if (!token) {
      setPermissions([]);
      return [];
    }
//console.log('Token was there trying to fetch permissions')
    setLoading(true);
    try {
      const response = await api.get('/api/allen', {
        headers: { Authorization: `Bearer ${token}` },
      });


      //console.log("Fetched permissions:", response.data.permissions);
      //console.log('response',response.data)
      const fetched = response.data.permissions || [];
      setPermissions(fetched);
      setError(null);
      return fetched; // return permissions so we can await it
    } catch (err) {
     // console.error('Failed to load permissions:', err);
      setError(err.response?.data?.message || 'Failed to fetch permissions');
      setPermissions([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Refresh permissions manually
  const refreshPermissions = async () => {
    return fetchPermissions();
  };

  // Auto-fetch permissions when token changes
  useEffect(() => {
    const token = localStorage.getItem('token');
   // console.log('Token was obtained')
    if (token) fetchPermissions();
    else setPermissions([]);
  }, []);

  return (
    <PermissionsContext.Provider
      value={{ permissions, loading, error, refreshPermissions }}
    >
      {children}
    </PermissionsContext.Provider>
  );
};

// Custom hook
export const usePermissions = () => useContext(PermissionsContext);
