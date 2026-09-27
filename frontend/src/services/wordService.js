import { API_BASE_URL } from './apiConfig';

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