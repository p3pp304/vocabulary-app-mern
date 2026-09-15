import mongoose from "mongoose";

const deckItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Word",
      required: true,
    },

    // --- Campi sovrascrivibili / modificabili dall'utente ---
    customTraduzione: { type: String, default: null, trim: true },
    customNote: { type: String, default: null, trim: true },
    customEsempi: [{ type: String, trim: true }], // Esempi personali aggiunti dall'utente

    // --- Dati di studio / Flashcard ---
    stato: {
      type: String,
      enum: ["nuova", "in_ripasso", "appresa"],
      default: "nuova",
    },
    ripetizioni: { type: Number, default: 0 },
    prossimoRipasso: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Un utente non può salvare due volte la stessa parola nel mazzo
deckItemSchema.index({ userId: 1, wordId: 1 }, { unique: true });

export default mongoose.model("DeckItem", deckItemSchema);