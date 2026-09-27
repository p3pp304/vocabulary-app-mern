import mongoose from "mongoose";

const deckItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    // FONDAMENTALE: required DEVE essere rimosso o false, con default null
    wordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Word",
      default: null,
      required: false, // <-- Non più obbligatorio!
    },

    // Campi per vocaboli personalizzati creati dall'utente
    customParola: { type: String, default: null, trim: true },
    customTraduzione: { type: String, default: null, trim: true },
    customNote: { type: String, default: null, trim: true },
    customEsempi: [{ type: String, trim: true }],
    lingua: { type: String, default: "en", lowercase: true },
    livello: { type: String, default: "B1" },
    tema: { type: String, default: "tech", lowercase: true },

    // Campi di studio / spaced repetition
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

// Indice parziale: garantisce unicità della coppia (userId, wordId) solo quando wordId esiste
deckItemSchema.index(
  { userId: 1, wordId: 1 },
  { unique: true, partialFilterExpression: { wordId: { $type: "objectId" } } }
);

export default mongoose.model("DeckItem", deckItemSchema);