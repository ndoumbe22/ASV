import React, { createContext, useState, useContext, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if user is already logged in on mount
  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem("access_token");
      const userData = {
        username: localStorage.getItem("username"),
        firstName: localStorage.getItem("first_name"),
        lastName: localStorage.getItem("last_name"),
        role: localStorage.getItem("role"),
        email: localStorage.getItem("email"),
      };

      if (token && userData.username) {
        setUser(userData);
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = (userData, tokens) => {
    // Store tokens
    localStorage.setItem("access_token", tokens.access);
    if (tokens.refresh) {
      localStorage.setItem("refresh_token", tokens.refresh);
    }

    // Store user data
    localStorage.setItem("username", userData.username);
    localStorage.setItem("first_name", userData.first_name || "");
    localStorage.setItem("last_name", userData.last_name || "");
    localStorage.setItem("role", userData.role || "patient");
    localStorage.setItem("email", userData.email || "");

    setUser({
      username: userData.username,
      firstName: userData.first_name,
      lastName: userData.last_name,
      role: userData.role,
      email: userData.email,
    });
    setIsAuthenticated(true);
  };

  const logout = () => {
    // Clear all stored data
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("first_name");
    localStorage.removeItem("last_name");
    localStorage.removeItem("role");
    localStorage.removeItem("email");

    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
