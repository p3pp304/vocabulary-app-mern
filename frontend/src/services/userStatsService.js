import { API_BASE_URL } from "./apiConfig";

export const fetchUserStats = async () => {
  const res = await fetch(`${API_BASE_URL}/api/stats`, {
    credentials: "include",
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Errore nel recupero delle statistiche");
  }

  return res.json();
};