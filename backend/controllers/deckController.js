import DeckItem from "../models/DeckItem.js";
import Word from "../models/word.js";
import mongoose from "mongoose";

// 1. GET /api/deck - Recupera tutti i vocaboli nel mazzo dell'utente (globali + custom)
export const getMyDeck = async (req, res) => {
  try {
    const { lingua, stato } = req.query;

    const query = { userId: req.userId };
    if (stato) query.stato = stato;

    // Popola wordId se presente (se è null, Mongoose lo lascia semplicemente a null)
    const deck = await DeckItem.find(query)
      .populate("wordId")
      .sort({ createdAt: -1 })
      .lean();

    const userWords = deck
      .filter((item) => {
        // Se non ha wordId né customParola, è un record non valido
        if (!item.wordId && !item.customParola) return false;

        // Determina la lingua del record (da wordId globale o da campo diretto custom)
        const itemLingua = item.wordId ? item.wordId.lingua : item.lingua;

        // Filtra per lingua solo se il parametro è stato passato nella query
        return lingua ? itemLingua?.toLowerCase() === lingua.toLowerCase() : true;
      })
      .map((item) => {
        const isCustom = !item.wordId;

        return {
          deckItemId: item._id,
          // Se custom, l'id identificativo per il frontend è l'id stesso del deckItem
          wordId: isCustom ? item._id : item.wordId._id,
          isCustom,
          parola: isCustom ? item.customParola : item.wordId.parola,
          livello: isCustom ? item.livello : item.wordId.livello,
          tema: isCustom ? item.tema : item.wordId.tema,
          lingua: isCustom ? item.lingua : item.wordId.lingua,
          tipo: item.wordId?.tipo || null,

          // Traduzione: usa la custom se presente, altrimenti quella globale
          traduzione: item.customTraduzione || item.wordId?.traduzione || "",
          note: item.customNote || item.wordId?.note || "",
          esempi:
            item.customEsempi && item.customEsempi.length > 0
              ? item.customEsempi
              : item.wordId?.esempi || [],
          espressione: item.wordId?.espressione || null,
          sinonimi: item.wordId?.sinonimi || [],
          contrari: item.wordId?.contrari || [],

          // Parametri di studio
          stato: item.stato,
          ripetizioni: item.ripetizioni,
          prossimoRipasso: item.prossimoRipasso,
          aggiuntoIl: item.createdAt,
        };
      });

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

    if (!mongoose.isValidObjectId(wordId)) {
      return res.status(400).json({ message: "ID del vocabolo non valido." });
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
    if (error.code === 11000) {
      return res.status(409).json({ message: "La parola è già presente nel tuo mazzo." });
    }
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


export const createCustomDeckWord = async (req, res) => {
  try {
    const userId = req.userId;
    const { parola, traduzione, lingua, livello, tema, note, esempi } = req.body;

    if (!parola || !traduzione) {
      return res.status(400).json({ message: "Termine e traduzione sono obbligatori." });
    }

    const cleanParola = parola.trim();
    const cleanLingua = (lingua || "en").toLowerCase();

    // 1. Verifica se la parola esiste già nel catalogo globale Word
    const existingWord = await Word.findOne({
      parola: { $regex: new RegExp(`^${cleanParola}$`, "i") },
      lingua: cleanLingua,
    });

    let newDeckItem;

    if (existingWord) {
      // Caso A: Esiste nel catalogo predefinito -> collega wordId senza duplicare in Word
      const alreadyInDeck = await DeckItem.findOne({
        userId,
        wordId: existingWord._id,
      });

      if (alreadyInDeck) {
        return res.status(409).json({ message: "Questa parola è già presente nel tuo mazzo." });
      }

      newDeckItem = await DeckItem.create({
        userId,
        wordId: existingWord._id,
        customTraduzione: traduzione.trim() !== existingWord.traduzione ? traduzione.trim() : null,
        customNote: note ? note.trim() : null,
        customEsempi: Array.isArray(esempi) ? esempi : [],
        stato: "nuova",
        ripetizioni: 0,
        prossimoRipasso: new Date(),
      });

      return res.status(201).json({
        message: "Vocabolo associato al mazzo dal catalogo.",
        id: String(existingWord._id),
        deckItemId: newDeckItem._id,
        item: newDeckItem,
      });
    }

    // Caso B: Non esiste nel catalogo -> crea SOLO in DeckItem (Word resta intatto)
    const alreadyCustom = await DeckItem.findOne({
      userId,
      wordId: null,
      customParola: { $regex: new RegExp(`^${cleanParola}$`, "i") },
      lingua: cleanLingua,
    });

    if (alreadyCustom) {
      return res.status(409).json({ message: "Questa parola personalizzata è già presente nel tuo mazzo." });
    }

    newDeckItem = await DeckItem.create({
      userId,
      wordId: null,
      customParola: cleanParola,
      customTraduzione: traduzione.trim(),
      lingua: cleanLingua,
      livello: livello || "B1",
      tema: (tema || "tech").toLowerCase(),
      customNote: note ? note.trim() : null,
      customEsempi: Array.isArray(esempi) ? esempi : [],
      stato: "nuova",
      ripetizioni: 0,
      prossimoRipasso: new Date(),
    });

    return res.status(201).json({
      message: "Parola personalizzata creata solo nel tuo mazzo.",
      id: String(newDeckItem._id),
      deckItemId: newDeckItem._id,
      item: newDeckItem,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "Questa parola è già presente nel tuo mazzo." });
    }

    console.error("Errore createCustomDeckWord:", error);
    return res.status(500).json({ message: "Errore interno durante il salvataggio." });
  }
};

