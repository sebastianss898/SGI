import React, { createContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadToken = async () => {
      try {
        const savedToken = await AsyncStorage.getItem("token");
        if (savedToken) setToken(savedToken);
      } catch (e) {
        console.error("Error cargando token:", e);
      } finally {
        setLoading(false);
      }
    };
    loadToken();
  }, []);

  const login = async (newToken) => {
    await AsyncStorage.setItem("token", newToken);
    setToken(newToken);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
