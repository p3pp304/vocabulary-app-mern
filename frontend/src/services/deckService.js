const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/api';

export const addWordToDeck = async (wordId) => {
  const res = await fetch(`${BASE_URL}/deck/`, {
    method: 'POST',
    credentials: 'include', // Invia il cookie con il token JWT
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wordId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore durante l\'aggiunta al mazzo');
  }

  return res.json();
};

export const removeWordFromDeck = async (wordId) => {
  const res = await fetch(`${BASE_URL}/deck/${wordId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore durante la rimozione');
  }

  return res.json();
};