const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const fetchWordDetail = async (id) => {
  const res = await fetch(`${BASE_URL}/words/${id}`, {
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore nel recupero del termine');
  }

  return res.json();
};