import {apiClient} from "./axios";

export const login = async (workEmail: string, password: string) => {
  return apiClient.post(
    "/auth/login",
    { workEmail, password },
    { withCredentials: true }
  );
};

export const logout = async () => {
  return apiClient.post("/auth/logout", {}, { withCredentials: true });
};

export const getMe = async () => {
  return apiClient.get("/auth/me", { withCredentials: true });
};
