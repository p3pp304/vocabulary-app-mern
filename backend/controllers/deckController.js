import DeckItem from "../models/DeckItem.js";
import Word from "../models/word.js";
import mongoose from "mongoose";

// 1. GET /api/deck - Recupera tutti i vocaboli con dettagli sia originali che custom
export const getMyDeck = async (req, res) => {
  try {
    const { lingua, stato } = req.query;

    const query = { userId: req.userId };
    if (stato) {
      query.stato = stato;
    }

    const deck = await DeckItem.find(query)
      .populate("wordId")
      .sort({ createdAt: -1 })
      .lean();

    const userWords = [];

    for (const item of deck) {
      if (!item.wordId && !item.customParola) {
        continue;
      }

      const isCustom = !item.wordId;
      const w = item.wordId || {};

      // Determinazione lingua per eventuale filtro
      const linguaRecord = item.customLingua || w.lingua;
      if (lingua && linguaRecord.toLowerCase() !== lingua.toLowerCase()) {
        continue;
      }

      // Valori preimpostati (dal catalogo globale)
      const traduzioneCatalogo = w.traduzione || null;
      const noteCatalogo = w.note || null;
      const esempiCatalogo = Array.isArray(w.esempi) ? w.esempi : [];

      // Valori custom dell'utente
      const customTraduzione = item.customTraduzione || null;
      const customNote = item.customNote || null;
      let customEsempi = [];
      if (Array.isArray(item.customEsempi) && item.customEsempi.length > 0) {
        customEsempi = item.customEsempi;
      }

      // Valore effettivo per lo studio (priorità: custom -> catalogo)
      const traduzioneAttiva = customTraduzione || traduzioneCatalogo || "";
      const noteAttive = customNote || noteCatalogo || "";
      const esempiAttivi = customEsempi.length > 0 ? customEsempi : esempiCatalogo;

      userWords.push({
        deckItemId: item._id,
        wordId: isCustom ? null : w._id,
        isCustom,

        // Testo principale e metadati
        parola: item.customParola || w.parola || "",
        livello: item.customLivello || w.livello || "B1",
        tema: item.customTema || w.tema || "tech",
        lingua: linguaRecord,
        tipo: w.tipo || null,
        espressione: w.espressione || null,
        sinonimi: w.sinonimi || [],
        contrari: w.contrari || [],

        // --- I DUE CAMPI SEPARATI PER LA TUA UI ---
        // 1. Dati ufficiali / preimpostati
        traduzioneCatalogo,
        noteCatalogo,
        esempiCatalogo,

        // 2. Dati personalizzati dall'utente (null se non modificati)
        customTraduzione,
        customNote,
        customEsempi,

        // 3. Valore attivo pronto per la flashcard (evita logica complessa nella card)
        traduzione: traduzioneAttiva,
        note: noteAttive,
        esempi: esempiAttivi,

        // Parametri di studio
        stato: item.stato,
        ripetizioni: item.ripetizioni,
        prossimoRipasso: item.prossimoRipasso,
        aggiuntoIl: item.createdAt,
      });
    }

    return res.status(200).json(userWords);
  } catch (error) {
    console.error("Errore getMyDeck:", error);
    return res.status(500).json({ message: "Errore nel caricamento del mazzo." });
  }
};

// 2. POST /api/deck/:id - Aggiunge un vocabolo del catalogo al mazzo personale
export const addWordToDeck = async (req, res) => {
  try {
    const { wordId} = req.body;

    if (!wordId || !mongoose.isValidObjectId(wordId)) {
          return res.status(400).json({ message: "ID del vocabolo mancante o non valido." });
        }

    const newDeckItem = await DeckItem.create({
      userId: req.userId,
      wordId,
      customParola: null,
      customTraduzione: null,
      customNote: null,
      customEsempi: null,
      customLingua: null,
      customLivello: null,
      customTema: null,
    });

    return res.status(201).json(newDeckItem);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "La parola è già presente nel tuo mazzo." });
    }
    console.error("Errore addWordToDeck:", error);
    return res.status(500).json({ message: "Errore durante l'aggiunta al mazzo." });
  }
};

// 3. PUT /api/deck/:id - Modifica note personali, traduzione o stato flashcard
export const updateDeckWord = async (req, res) => {
  try {
    const { id } = req.params; // Questo è il _id del DeckItem

    // 1. Controllo validità dell'ID per evitare crash 500 di Mongoose
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID del record non valido." });
    }

    const {
      customParola,
      customTraduzione,
      customLingua,
      customLivello,
      customTema,
      customNote,
      customEsempi,
      stato,
      incrementoRipasso,
    } = req.body;

    const deckItem = await DeckItem.findOne({ _id: id, userId: req.userId });

    if (!deckItem) {
      return res.status(404).json({ message: "Vocabolo non trovato nel tuo mazzo." });
    }

    // 2. Aggiornamento con pulizia stringhe e normalizzazione
    if (customParola !== undefined) {
      deckItem.customParola = customParola ? customParola.trim() : null;
    }
    if (customTraduzione !== undefined) {
      deckItem.customTraduzione = customTraduzione ? customTraduzione.trim() : null;
    }
    if (customNote !== undefined) {
      deckItem.customNote = customNote ? customNote.trim() : null;
    }
    if (customLingua !== undefined) {
      deckItem.customLingua = customLingua ? customLingua.toLowerCase().trim() : null;
    }
    if (customLivello !== undefined) {
      deckItem.customLivello = customLivello || null;
    }
    if (customTema !== undefined) {
      deckItem.customTema = customTema ? customTema.toLowerCase().trim() : null;
    }
    if (customEsempi !== undefined) {
      deckItem.customEsempi = Array.isArray(customEsempi) ? customEsempi : [];
    }

    // 3. Parametri di studio
    if (stato !== undefined) {
      deckItem.stato = stato;
    }

    // 4. Gestione logica studio/flashcard
    if (incrementoRipasso) {
      deckItem.ripetizioni += 1;
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

// 4 DELETE /api/deck/:id
export const removeWordFromDeck = async (req, res) => {
  try {
    const { id } = req.params; // Questo è SOLO deckItemId

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ message: "ID del record non valido." });
    }

    // Ricerca diretta per ID del deck item
    const deletedItem = await DeckItem.findOneAndDelete({
      _id: id,
      userId: req.userId,
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

// 5 POST /api/deck/custom - Aggiunge parola (collegata al catalogo o 100% custom)

export const createCustomDeckWord = async (req, res) => {
  try {
    const { parola, traduzione, lingua, livello, tema, note, esempi } = req.body;

    if (!parola?.trim() || !traduzione?.trim()) {
      return res.status(400).json({ message: "Termine e traduzione sono obbligatori." });
    }

    const cleanParola = parola.trim();
    const cleanTraduzione = traduzione.trim();
    const cleanLingua = lingua.toLowerCase();

    // 1. Cerca se la parola esiste già nel catalogo globale
    const existingWord = await Word.findOne({
      parola: { $regex: new RegExp(`^${cleanParola}$`, "i") },
      lingua: cleanLingua,
    }).lean();

    // 2. Controllo duplicato unificato nel mazzo dell'utente
    const duplicateQuery = existingWord
      ? { userId: req.userId, wordId: existingWord._id }
      : { userId: req.userId, customParola: { $regex: new RegExp(`^${cleanParola}$`, "i") }, customLingua: cleanLingua };

    if (await DeckItem.exists(duplicateQuery)) {
      return res.status(409).json({ message: "Questa parola è già presente nel tuo mazzo." });
    }

    // 3. Prepara il payload sfruttando i default dello schema (stato, ripetizioni, prossimoRipasso)
    const itemData = {
      userId: req.userId,
      customNote: note?.trim() || null,
      customEsempi: Array.isArray(esempi) ? esempi : [],
    };

    if (existingWord) {
      itemData.wordId = existingWord._id;
      itemData.customTraduzione = cleanTraduzione !== existingWord.traduzione ? cleanTraduzione : null;
    } else {
      itemData.wordId = null;
      itemData.customParola = cleanParola;
      itemData.customTraduzione = cleanTraduzione;
      itemData.customLingua = cleanLingua;
      itemData.customLivello = livello;
      itemData.customTema = tema.toLowerCase();
    }

    const newDeckItem = await DeckItem.create(itemData);

    return res.status(201).json({
      message: existingWord ? "Vocabolo associato dal catalogo." : "Parola personalizzata creata.",
      id: String(existingWord ? existingWord._id : newDeckItem._id),
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