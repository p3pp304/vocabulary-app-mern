import mongoose from "mongoose";
import DeckItem from "../models/DeckItem.js";
import FlashcardSession from "../models/FlashcardSession.js";

export const saveFlashcardSessionScore = async (req, res) => {
  try {
    const correctAnswers = Number(req.body.correctAnswers);
    const totalCards = Number(req.body.totalCards);

    if (
      !Number.isInteger(correctAnswers) ||
      !Number.isInteger(totalCards) ||
      totalCards < 1 ||
      correctAnswers < 0 ||
      correctAnswers > totalCards
    ) {
      return res.status(400).json({ message: "Punteggio della sessione non valido." });
    }

    const score = Math.round((correctAnswers / totalCards) * 100);
    const session = await FlashcardSession.create({
      userId: req.userId,
      correctAnswers,
      totalCards,
      score,
      lingua: req.body.lingua || "en",
    });

    return res.status(201).json({
      score: session.score,
      correctAnswers: session.correctAnswers,
      totalCards: session.totalCards,
    });
  } catch (error) {
    console.error("Errore salvataggio punteggio flashcard:", error);
    return res.status(500).json({ message: "Errore nel salvataggio del punteggio." });
  }
};

// GET /api/flashcards?lingua=en - Recupera i vocaboli da ripassare
export const getFlashcards = async (req, res) => {
  try {
    const userId = req.userId;
    const { lingua = "en", limit = 20 } = req.query;

    const now = new Date();

    // Query: parole dell'utente per lingua selezionata che sono da ripassare (data passata o non ancora impostata)
    const query = {
      userId,
      $or: [
        { prossimoRipasso: { $lte: now } },
        { prossimoRipasso: null },
      ],
    };

    // Popola i dati del catalogo globale
    const items = await DeckItem.find(query)
      .populate("wordId")
      .limit(Number(limit))
      .lean();

    // Filtra per lingua (considerando sia customLingua che wordId.lingua)
    const filtered = items.filter((item) => {
      const itemLang = item.customLingua || item.wordId?.lingua || "en";
      return !lingua || itemLang.toLowerCase() === lingua.toLowerCase();
    });

    const flashcards = filtered.map((item) => {
      const isCustom = !item.wordId;
      const w = item.wordId || {};

      return {
        deckItemId: item._id,
        parola: item.customParola || w.parola || "",
        livello: item.customLivello || w.livello || "B1",
        tema: item.customTema || w.tema || "generale",
        lingua: item.customLingua || w.lingua || "en",
        pronuncia: w.pronuncia || null,
        // Traduzioni
        traduzioneBase: w.traduzione || null,
        traduzionePersonale: item.customTraduzione || null,
        traduzione: item.customTraduzione || w.traduzione || "",
        // Note ed esempi
        note: item.customNote || w.note || "",
        esempi: item.customEsempi?.length > 0 ? item.customEsempi : (w.esempi || []),
        // SRS Data
        stato: item.stato || "nuova",
        ripetizioni: item.ripetizioni || 0,
      };
    });

    return res.status(200).json(flashcards);
  } catch (error) {
    console.error("Errore recupero flashcard:", error);
    return res.status(500).json({ message: "Errore nel caricamento delle flashcard." });
  }
};

// POST /api/flashcards/:deckItemId/review - Registra l'esito della revisione (SRS)
export const submitReview = async (req, res) => {
  try {
    const { deckItemId } = req.params;
    const { remembered } = req.body; // boolean: true (ricordata), false (da ripetere)
    const userId = req.userId;

    if (!mongoose.isValidObjectId(deckItemId)) {
      return res.status(400).json({ message: "ID non valido." });
    }

    const item = await DeckItem.findOne({ _id: deckItemId, userId });
    if (!item) {
      return res.status(404).json({ message: "Vocabolo non trovato nel tuo mazzo." });
    }

    let ripetizioni = item.ripetizioni || 0;
    let nextDate = new Date();
    let stato = item.stato;

    if (remembered) {
      ripetizioni += 1;
      stato = ripetizioni >= 4 ? "appresa" : "in_ripasso";

      // Intervalli SRS in giorni: 1, 3, 7, 14, 30
      const daysToAdd = [1, 3, 7, 14, 30][Math.min(ripetizioni - 1, 4)];
      nextDate.setDate(nextDate.getDate() + daysToAdd);
    } else {
      ripetizioni = 0;
      stato = "in_ripasso";
      // Riproposta entro 1 ora
      nextDate.setHours(nextDate.getHours() + 1);
    }

    item.ripetizioni = ripetizioni;
    item.stato = stato;
    item.prossimoRipasso = nextDate;
    item.ultimoRipasso = new Date();

    await item.save();

    return res.status(200).json({
      message: "Progresso salvato",
      deckItemId: item._id,
      stato: item.stato,
      ripetizioni: item.ripetizioni,
      prossimoRipasso: item.prossimoRipasso,
    });
  } catch (error) {
    console.error("Errore salvataggio ripasso:", error);
    return res.status(500).json({ message: "Errore nel salvataggio del ripasso." });
  }
};