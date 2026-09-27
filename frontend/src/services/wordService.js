const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

export const fetchWordDetail = async (id) => {
  const res = await fetch(`${API_BASE_URL}/api/words/${id}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore nel recupero del termine');
  }

  return res.json();
};