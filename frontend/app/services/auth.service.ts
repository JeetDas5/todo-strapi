import { api } from "../lib/api";

export const registerUser = async (
  username: string,
  email: string,
  password: string,
) => {
  const res = await api.post("/auth/local/register", {
    username,
    email,
    password,
  });

  return res.data;
};

export const loginUser = async (email: string, password: string) => {
  const res = await api.post("/auth/local", {
    identifier: email,
    password,
  });

  return res.data;
};

export const getCurrentUser = async () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  if (!token) return null;

  const res = await api.get("/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return res.data;
};
