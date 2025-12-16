import React, { createContext, useState, useEffect } from 'react';
import { apiPost, apiGet } from '../utils/apiClient';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Vérifier si l'utilisateur est déjà connecté au chargement
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }

    setIsLoading(false);
  }, []);

  // REGISTER - Créer un nouveau compte
  const register = async (username, email, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiPost('/auth/register', {
        username,
        email,
        password
      });

      const { token: newToken, ...userData } = response;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIN - Se connecter
  const login = async (username, password) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await apiPost('/auth/login', {
        username,
        password
      });

      const { token: newToken, ...userData } = response;

      localStorage.setItem('authToken', newToken);
      localStorage.setItem('authUser', JSON.stringify(userData));

      setToken(newToken);
      setUser(userData);

      return userData;
    } catch (err) {
      const errorMessage = err.response?.data?.error || 'Erreur lors de la connexion';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // LOGOUT - Se déconnecter
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    setError(null);
  };

  const value = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    register,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
