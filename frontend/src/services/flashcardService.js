import { API_BASE_URL } from "./apiConfig";

export const getFlashcards = async (lingua = "en") => {
  const res = await fetch(`${API_BASE_URL}/api/flashcards?lingua=${lingua}`, {
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Errore nel caricamento delle flashcard");
  }

  return res.json();
};

export const submitFlashcardReview = async (deckItemId, remembered) => {
  const res = await fetch(`${API_BASE_URL}/api/flashcards/${deckItemId}/review`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ remembered }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Errore nel salvataggio della revisione");
  }

  return res.json();
};