export const fetchWords = async ({ lingua = 'en', page = 1, livello = '', tema='', search = '' } = {}) => {
  const params = new URLSearchParams({
    lingua,
    page: String(page),
  });

  if (livello) params.append('livello', livello);
  if (tema) params.append('tema', tema);
  if (search.trim()) params.append('search', search.trim());

  const res = await fetch(`http://localhost:3000/api/words?${params.toString()}`, {
    credentials: 'include',
  });

  if (!res.ok) throw new Error('Errore durante il recupero dei dati');
  return res.json();
};