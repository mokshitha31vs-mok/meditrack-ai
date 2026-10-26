import React, { createContext, useState, useEffect, useContext } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('meditrack_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('meditrack_token') || null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState({ latitude: 13.0827, longitude: 80.2707 });

  // Get geolocation if permitted by user browser
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLocation({
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.log("Geolocation notice (using default location):", err.message);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await authAPI.login({ email, password });
      const { token: jwtToken, user: userData } = res.data;
      setToken(jwtToken);
      setUser(userData);
      localStorage.setItem('meditrack_token', jwtToken);
      localStorage.setItem('meditrack_user', JSON.stringify(userData));
      return { success: true, user: userData };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Login failed. Please check your credentials.'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const res = await authAPI.register(userData);
      const { token: jwtToken, user: newUser } = res.data;
      setToken(jwtToken);
      setUser(newUser);
      localStorage.setItem('meditrack_token', jwtToken);
      localStorage.setItem('meditrack_user', JSON.stringify(newUser));
      return { success: true, user: newUser };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error || 'Registration failed.'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('meditrack_token');
    localStorage.removeItem('meditrack_user');
  };

  const updateUserProfile = async (data) => {
    try {
      const res = await authAPI.updateProfile(data);
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem('meditrack_user', JSON.stringify(updatedUser));
      return { success: true, user: updatedUser };
    } catch (err) {
      return { success: false, error: err.response?.data?.error || 'Failed to update profile.' };
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      loading,
      userLocation,
      login,
      register,
      logout,
      updateUserProfile,
      isAuthenticated: !!token && !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
