import Word from '../models/word.js';
import DeckItem from '../models/DeckItem.js';
import mongoose from 'mongoose';

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

export const getWordDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Dal middleware di autenticazione

    // Validazione preventiva dell'ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID vocabolo non valido." });
    }

    // 1. Cerca nel catalogo globale Word
    const word = await Word.findById(id).lean();

    if (word) {
      // Controlla se l'utente loggato ha salvato questa parola nel mazzo
      const deckEntry = userId
        ? await DeckItem.findOne({ userId, wordId: word._id }).lean()
        : null;

      return res.status(200).json({
        id: word._id,
        parola: word.parola,
        traduzione: deckEntry?.customTraduzione || word.traduzione,
        livello: word.livello,
        tema: word.tema,
        lingua: word.lingua,
        tipo: word.tipo || null,
        pronuncia: word.pronuncia || null,
        note: deckEntry?.customNote || word.note || "",
        esempi: deckEntry?.customEsempi?.length > 0 
          ? deckEntry.customEsempi 
          : word.esempi || [],
        sinonimi: word.sinonimi || [],
        contrari: word.contrari || [],
        isCustom: false,
        isInDeck: Boolean(deckEntry),
        deckData: deckEntry
          ? {
              deckItemId: deckEntry._id,
              stato: deckEntry.stato,
              ripetizioni: deckEntry.ripetizioni,
              prossimoRipasso: deckEntry.prossimoRipasso,
            }
          : null,
      });
    }

    // 2. Se non è in Word, cerca nei DeckItem dell'utente (parola custom privata)
    if (userId) {
      const customItem = await DeckItem.findOne({ _id: id, userId }).lean();

      if (customItem) {
        return res.status(200).json({
          id: customItem._id,
          parola: customItem.customParola,
          traduzione: customItem.customTraduzione,
          livello: customItem.livello,
          tema: customItem.tema,
          lingua: customItem.lingua,
          tipo: null,
          pronuncia: null,
          note: customItem.customNote || "",
          esempi: customItem.customEsempi || [],
          sinonimi: [],
          contrari: [],
          isCustom: true,
          isInDeck: true,
          deckData: {
            deckItemId: customItem._id,
            stato: customItem.stato,
            ripetizioni: customItem.ripetizioni,
            prossimoRipasso: customItem.prossimoRipasso,
          },
        });
      }
    }

    // 3. Non trovata né in Word né in DeckItem
    return res.status(404).json({ message: "Vocabolo non trovato." });
  } catch (error) {
    console.error("Errore getWordDetail:", error);
    return res.status(500).json({ message: "Errore nel caricamento del vocabolo." });
  }
};