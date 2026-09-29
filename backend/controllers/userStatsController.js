import mongoose from "mongoose";
import DeckItem from "../models/DeckItem.js";
import FlashcardSession from "../models/FlashcardSession.js";

// GET /api/user/stats
export const getUserStats = async (req, res) => {
  try {
    const userId = req.userId || req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: "Non autorizzato." });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const now = new Date();

    // 1. Conteggi aggregati per stato (nuova, in_ripasso, appresa)
    const statusCounts = await DeckItem.aggregate([
      { $match: { userId: userObjectId } },
      { $group: { _id: "$stato", count: { $sum: 1 } } },
    ]);

    // Inizializza i valori base
    const counts = {
      totale: 0,
      nuova: 0,
      in_ripasso: 0,
      appresa: 0,
    };

    statusCounts.forEach((item) => {
      if (item._id && counts[item._id] !== undefined) {
        counts[item._id] = item.count;
      }
      counts.totale += item.count;
    });

    // 2. Carte attualmente pronte per il ripasso nelle flashcard
    const daRipassareSubito = await DeckItem.countDocuments({
      userId: userObjectId,
      $or: [{ prossimoRipasso: { $lte: now } }, { prossimoRipasso: null }],
    });

    const [scoreSummary] = await FlashcardSession.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          mediaPunteggi: { $avg: "$score" },
          sessioniConcluse: { $sum: 1 },
        },
      },
    ]);

    // 3. Percentuale di padronanza globale
    const masteryPercentage = counts.totale > 0 
      ? Math.round((counts.appresa / counts.totale) * 100) 
      : 0;

    return res.status(200).json({
      totale: counts.totale,
      nuova: counts.nuova,
      in_ripasso: counts.in_ripasso,
      appresa: counts.appresa,
      daRipassareSubito,
      masteryPercentage,
      mediaPunteggi: Math.round(scoreSummary?.mediaPunteggi || 0),
      sessioniConcluse: scoreSummary?.sessioniConcluse || 0,
    });
  } catch (error) {
    console.error("Errore recupero statistiche:", error);
    return res.status(500).json({ message: "Errore nel caricamento delle statistiche." });
  }
};