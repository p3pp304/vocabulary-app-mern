import { API_BASE_URL } from './apiConfig';

export const addWordToDeck = async (wordId) => {
  const res = await fetch(`${API_BASE_URL}/api/deck`, {
    method: 'POST',
    credentials: 'include', // Invia il cookie con il token JWT
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ wordId }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Errore durante l'aggiunta al mazzo (${res.status})`
    );
  }

  return res.json();
};

export const removeWordFromDeck = async (wordId) => {
  const res = await fetch(`${API_BASE_URL}/api/deck/${wordId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore durante la rimozione');
  }

  return res.json();
};

// Crea vocabolo custom privato (solo in DeckItem)
export const createCustomDeckWord = async (wordData) => {
  const res = await fetch(`${API_BASE_URL}/api/deck/custom`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(wordData),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Errore nella creazione della parola");
  }

  return res.json();
};