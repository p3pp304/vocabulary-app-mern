import DeckItem from "../models/DeckItem.js";
import Word from "../models/word.js";

// 1. GET /api/deck - Recupera tutti i vocaboli nel mazzo dell'utente
export const getMyDeck = async (req, res) => {
  try {
    const { lingua, stato } = req.query;

    const query = { userId: req.userId };
    if (stato) query.stato = stato;

    // Popola solo le parole che corrispondono alla lingua richiesta
    const deck = await DeckItem.find(query)
      .populate({
        path: "wordId",
        match: lingua ? { lingua } : {},
      })
      .sort({ createdAt: -1 })
      .lean();

    // Filtra eventuali wordId null (lingua diversa o parola rimossa) e mappa con fallback
    const userWords = deck
      .filter((item) => item.wordId)
      .map((item) => ({
        deckItemId: item._id,
        wordId: item.wordId._id,
        parola: item.wordId.parola,
        livello: item.wordId.livello,
        tema: item.wordId.tema,
        lingua: item.wordId.lingua,
        tipo: item.wordId.tipo,
        // Fallback: se l'utente ha personalizzato usa il suo valore, altrimenti quello globale
        traduzione: item.customTraduzione || item.wordId.traduzione,
        note: item.customNote || item.wordId.note,
        esempi:
          item.customEsempi?.length > 0 ? item.customEsempi : item.wordId.esempi,
        espressione: item.wordId.espressione,
        sinonimi: item.wordId.sinonimi,
        contrari: item.wordId.contrari,
        stato: item.stato,
        ripetizioni: item.ripetizioni,
        prossimoRipasso: item.prossimoRipasso,
        aggiuntoIl: item.createdAt,
      }));

    return res.status(200).json(userWords);
  } catch (error) {
    console.error("Errore getMyDeck:", error);
    return res.status(500).json({ message: "Errore nel caricamento del mazzo." });
  }
};

// 2. POST /api/deck - Aggiunge un vocabolo del catalogo al mazzo personale
export const addWordToDeck = async (req, res) => {
  try {
    const { wordId, customTraduzione, customNote, customEsempi } = req.body;

    if (!wordId) {
      return res.status(400).json({ message: "wordId è obbligatorio." });
    }

    // Verifica che la parola esista nel catalogo globale
    const wordExists = await Word.findById(wordId);
    if (!wordExists) {
      return res.status(404).json({ message: "Vocabolo non trovato nel catalogo." });
    }

    // Controlla se è già presente nel mazzo dell'utente
    const alreadySaved = await DeckItem.findOne({
      userId: req.userId,
      wordId,
    });

    if (alreadySaved) {
      return res.status(409).json({ message: "La parola è già presente nel tuo mazzo." });
    }

    const newDeckItem = await DeckItem.create({
      userId: req.userId,
      wordId,
      customTraduzione: customTraduzione || null,
      customNote: customNote || null,
      customEsempi: customEsempi || [],
    });

    return res.status(201).json(newDeckItem);
  } catch (error) {
    console.error("Errore addWordToDeck:", error);
    return res.status(500).json({ message: "Errore durante l'aggiunta al mazzo." });
  }
};

// 3. PUT /api/deck/:id - Modifica note personali, traduzione o stato flashcard
export const updateDeckWord = async (req, res) => {
  try {
    const { id } = req.params; // Questo è il _id del DeckItem
    const { customTraduzione, customNote, customEsempi, stato, incrementoRipasso } = req.body;

    const deckItem = await DeckItem.findOne({ _id: id, userId: req.userId });

    if (!deckItem) {
      return res.status(404).json({ message: "Vocabolo non trovato nel tuo mazzo." });
    }

    // Aggiornamento campi facoltativi se forniti nel body
    if (customTraduzione !== undefined) deckItem.customTraduzione = customTraduzione;
    if (customNote !== undefined) deckItem.customNote = customNote;
    if (customEsempi !== undefined) deckItem.customEsempi = customEsempi;
    if (stato !== undefined) deckItem.stato = stato;

    // Gestione logica studio/flashcard (incrementa contatore e data di ripasso)
    if (incrementoRipasso) {
      deckItem.ripetizioni += 1;
      // Imposta il prossimo ripasso (es. +2 giorni moltiplicato per il numero di ripetizioni)
      const giorniAttesa = Math.max(1, deckItem.ripetizioni * 2);
      const dataProssima = new Date();
      dataProssima.setDate(dataProssima.getDate() + giorniAttesa);
      deckItem.prossimoRipasso = dataProssima;
    }

    await deckItem.save();

    return res.status(200).json(deckItem);
  } catch (error) {
    console.error("Errore updateDeckWord:", error);
    return res.status(500).json({ message: "Errore durante l'aggiornamento del vocabolo." });
  }
};

// 4. DELETE /api/deck/:id - Rimuove un vocabolo dal mazzo personale
export const removeWordFromDeck = async (req, res) => {
  try {
    const { id } = req.params; // Può accettare sia deckItemId che wordId

    // Rimuove solo se il record appartiene all'utente loggato
    const deletedItem = await DeckItem.findOneAndDelete({
      userId: req.userId,
      $or: [{ _id: id }, { wordId: id }],
    });

    if (!deletedItem) {
      return res.status(404).json({ message: "Vocabolo non trovato nel tuo mazzo." });
    }

    return res.status(200).json({ message: "Vocabolo rimosso con successo dal mazzo." });
  } catch (error) {
    console.error("Errore removeWordFromDeck:", error);
    return res.status(500).json({ message: "Errore durante la rimozione dal mazzo." });
  }
};