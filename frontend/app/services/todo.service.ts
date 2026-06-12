import { api } from "../lib/api";

const getHeaders = () => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return {
    Authorization: token ? `Bearer ${token}` : "",
  };
};

export const getTodos = async () => {
  const res = await api.get("/todos", {
    headers: getHeaders(),
  });
  return res.data; // Res.data is { data: [ { id, documentId, title, completed ... } ], meta: {...} }
};

export const createTodo = async (title: string) => {
  const res = await api.post(
    "/todos",
    {
      data: {
        title,
        completed: false,
      },
    },
    {
      headers: getHeaders(),
    }
  );
  return res.data;
};

export const updateTodo = async (
  documentId: string,
  data: { title?: string; completed?: boolean }
) => {
  const res = await api.put(
    `/todos/${documentId}`,
    {
      data,
    },
    {
      headers: getHeaders(),
    }
  );
  return res.data;
};

export const deleteTodo = async (documentId: string) => {
  const res = await api.delete(`/todos/${documentId}`, {
    headers: getHeaders(),
  });
  return res.data;
};
