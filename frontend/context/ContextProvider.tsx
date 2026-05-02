"use client";

import useLocalStorage from "@/hooks/useLocalStorage";
import { jwtDecode } from "jwt-decode";
import { createContext, useContext, useEffect, useState } from "react";

interface Props {
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  userRole: string;
  setUserRole: (value: string) => void;
  logout: () => void;
  decodedToken: (value: string) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
}

const Context = createContext<Props | null>(null);

import React from "react";

const ContextProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const { removeToken, setToken, accessToken, refreshToken } =
    useLocalStorage();

  const decodedToken = (access: string) => {
    try {
      const decoded: any = jwtDecode(access);
      setUserRole(decoded.role);
      return decoded;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const access = localStorage.getItem("access");
    const refresh = localStorage.getItem("refresh");

    if (access && refresh) {
      setIsAuthenticated(true);
      decodedToken(access);
    }
  }, []);

  const logout = () => {
    removeToken();
    setIsAuthenticated(false);
  };

  let value = {
    isAuthenticated,
    setIsAuthenticated,
    logout,
    userRole,
    setUserRole,
    decodedToken,
    loading,
    setLoading,
  };

  return <Context.Provider value={value}>{children}</Context.Provider>;
};

export default ContextProvider;

export const useContextValues = () => {
  const context = useContext(Context);

  if (!context) {
    throw new Error("useContextValues must be used within a ContextProvider");
  }
  return context;
};
