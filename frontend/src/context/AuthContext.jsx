import React, { createContext, useState, useContext, useEffect } from 'react'; // <-- THIS LINE IS NOW FIXED
import api from '../services/api';

// 1. Create and EXPORT the context
export const AuthContext = createContext();

// 2. Export the provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if a token is in localStorage when app loads
    const token = localStorage.getItem('token');
    const userInfo = localStorage.getItem('user');
    if (token && userInfo) {
      setUser(JSON.parse(userInfo)); // <-- This will now have the isAdmin flag
      api.setAuthToken(token);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const { data } = await api.login(email, password);
    // data now contains { token, email, agencyName, isAdmin, ... }
    const userData = { ...data };
    delete userData.token; // Don't store token inside the user object

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData)); // <-- Store full user object
    api.setAuthToken(data.token);
    setUser(userData); // <-- Set full user object in state
  };

  const signup = async (agencyName, email, password) => {
    const { data } = await api.signup(agencyName, email, password);
    // data now contains { token, email, agencyName, isAdmin, ... }
    const userData = { ...data };
    delete userData.token;

    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(userData)); // <-- Store full user object
    api.setAuthToken(data.token);
    setUser(userData); // <-- Set full user object in state
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    api.setAuthToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};