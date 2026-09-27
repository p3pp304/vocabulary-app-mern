const BASE_URL = 'http://localhost:3000/api';

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