import Word from '../models/word.js';

export const getWords = async (req, res) => {
  try {
    const { lingua = 'en', page = 1, livello, tema, search } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limit = 20;
    const skip = (pageNum - 1) * limit;

    const query = { lingua };

    // Gestione Livello (singolo o multiplo: "A1,B2")
    if (livello && livello.trim() !== '') {
      const list = livello.split(',').map((l) => l.trim().toUpperCase()).filter(Boolean);
      if (list.length > 0) {
        query.livello = { $in: list };
      }
    }

    // Gestione Tema (singolo o multiplo)
    if (tema && tema.trim() !== '') {
      const list = tema.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      if (list.length > 0) {
        query.tema = { $in: list };
      }
    }

    // Ricerca parziale su termine originale (parola) OPPURE traduzione italiana
    if (search && search.trim() !== '') {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const searchRegex = { $regex: safeSearch, $options: 'i' };

      query.$or = [
        { parola: searchRegex },
        { traduzione: searchRegex },
      ];
    }

    const [words, total] = await Promise.all([
      Word.find(query)
        .sort({ parola: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Word.countDocuments(query),
    ]);

    res.status(200).json({
      words,
      page: pageNum,
      totalPages: Math.ceil(total / limit) || 1,
      totalWords: total,
    });
  } catch (error) {
    console.error('ERRORE CONTROLLER GET /words:', error);
    res.status(500).json({ message: error.message || 'Errore interno server' });
  }
};