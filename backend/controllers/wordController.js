import Word from '../models/word.js';
import DeckItem from '../models/DeckItem.js';
import mongoose from 'mongoose';

export const getWords = async (req, res) => {
  try {
    const { lingua = 'en', page = 1, livello, tema, search } = req.query;

    const pageNum = Math.max(1, Number(page) || 1);
    const limit = 18;
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

// GET /api/words/:id (o /api/vocab/:id)
// Funziona sia con wordId che con deckItemId
export const getWordDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId; // Dal middleware auth (se presente)

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID non valido." });
    }

    // 1. Cerca se è un DeckItem (dell'utente loggato)
    let deckItem = null;
    if (userId) {
      deckItem = await DeckItem.findOne({
        _id: id,
        userId,
      }).populate("wordId").lean();
    }

    let word = null;

    if (deckItem) {
      // Caso A: L'ID passato era un deckItemId!
      // Se era collegato a una Word del catalogo, ce l'abbiamo già popolata in wordId
      word = deckItem.wordId || null;
    } else {
      // Caso B: L'ID non era un deckItem, cerchiamo nella collezione Word del catalogo
      word = await Word.findById(id).lean();

      // Se esiste nel catalogo e l'utente è loggato, verifichiamo se l'utente la possiede già nel suo mazzo
      if (word && userId) {
        deckItem = await DeckItem.findOne({
          userId,
          wordId: word._id,
        }).lean();
      }
    }

    // Se non esiste né come deckItem né come word di catalogo
    if (!deckItem && !word) {
      return res.status(404).json({ message: "Vocabolo non trovato." });
    }

    // A questo punto abbiamo tutti i dati necessari per comporre la risposta:
    const isCustom = deckItem ? !deckItem.wordId : false;
    const isInDeck = Boolean(deckItem);
    const w = word || {};
    const d = deckItem || {};

    return res.status(200).json({
      // Identificatori chiave
      id: w._id || d._id,
      wordId: w._id || null,
      deckItemId: d._id || null,
      isInDeck,
      isCustom,

      // Dati generali (priorità ai dati custom del mazzo se presenti, altrimenti catalogo)
      parola: d.customParola || w.parola || "",
      livello: d.customLivello || w.livello || "B1",
      tema: d.customTema || w.tema || "generale",
      lingua: d.customLingua || w.lingua || "en",
      tipo: w.tipo || null,
      pronuncia: w.pronuncia || null,
      sinonimi: w.sinonimi || [],
      contrari: w.contrari || [],

      // 1. Dati Ufficiali di Catalogo (mostrati sempre a sinistra/base)
      traduzioneCatalogo: w.traduzione || null,
      noteCatalogo: w.note || null,
      esempiCatalogo: Array.isArray(w.esempi) ? w.esempi : [],

      // 2. Personalizzazioni Utente (mostrate a destra/personale se presenti)
      customTraduzione: d.customTraduzione || null,
      customNote: d.customNote || null,
      customEsempi: Array.isArray(d.customEsempi) ? d.customEsempi : [],
      customParola: d.customParola || null,
      customLingua: d.customLingua || null,
      customLivello: d.customLivello || null,
      customTema: d.customTema || null,

      // 3. Valore attivo pronto per la visualizzazione immediata
      traduzione: d.customTraduzione || w.traduzione || "",
      note: d.customNote || w.note || "",
      esempi: d.customEsempi?.length > 0 ? d.customEsempi : (w.esempi || []),

      // Dati flashcard/studio (null se non è nel mazzo)
      studio: isInDeck
        ? {
            stato: d.stato,
            ripetizioni: d.ripetizioni,
            prossimoRipasso: d.prossimoRipasso,
          }
        : null,
    });
  } catch (error) {
    console.error("Errore getWordDetail:", error);
    return res.status(500).json({ message: "Errore nel caricamento del vocabolo." });
  }
};