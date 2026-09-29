import { API_BASE_URL } from './apiConfig';


export const getMyDeck = async (lingua = '', stato = '') => {
  const params = new URLSearchParams();
  if (lingua) {
    params.append('lingua', lingua);
  }
  if (stato) {
    params.append('stato', stato);
  }

  let queryString = '';
  if (params.toString()) {
    queryString = `?${params.toString()}`;
  }

  const res = await fetch(`${API_BASE_URL}/api/deck${queryString}`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || 'Errore durante il recupero del mazzo');
  }

  return res.json();
};

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

export const removeWordFromDeck = async (deckItemId) => {
  const res = await fetch(`${API_BASE_URL}/api/deck/${deckItemId}`, {
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

// Aggiorna un elemento del mazzo (note, traduzione custom, ripasso)
export const updateDeckWord = async (deckItemId, updateData) => {
  const res = await fetch(`${API_BASE_URL}/api/deck/${deckItemId}`, {
    method: 'PUT',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updateData),
  });
  
  if (!res.ok) {
  const errorData = await res.json().catch(() => ({}));
  throw new Error(errorData.message || "Errore nella modifica della parola");
  }

  return res.json();
};