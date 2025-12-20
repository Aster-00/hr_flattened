"use client";

import { useEffect, useState } from "react";
import { getMe, login as loginApi, logout as logoutApi } from "../api/auth";

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await getMe();
      setUser(res.data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const login = async (workEmail: string, password: string) => {
    await loginApi(workEmail, password);
    await fetchMe();
  };

  const logout = async () => {
    await logoutApi();
    setUser(null);
  };

  return {
    user,
    loading,
    authenticated: !!user,
    login,
    logout,
    refreshUser: fetchMe,
  };
};
