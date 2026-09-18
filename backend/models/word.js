import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    parola: { 
      type: String, 
      required: true, 
      trim: true,
      lowercase: true, // Evita problemi di duplicati per maiuscole/minuscole
    },
    definizione: { type: String, required: true, trim: true },
    traduzione: { type: String, required: true, trim: true },
    tipo: { type: String, default: null, trim: true }, // es. "n.", "v.", "adj."
    livello: {
      type: String,
      enum: ["A1", "A2", "B1", "B2", "C1", "C2"],
      required: true,
      index: true,
    },
    tema: { type: String, required: true, index: true }, // es. "daily", "business"
    lingua: { type: String, required: true, index: true }, // es. "en", "es"
    espressione: { type: String, default: null, trim: true },
    sinonimi: { type: String, default: null, trim: true },
    contrari: { type: String, default: null, trim: true },
    note: { type: String, default: null, trim: true },
    esempi: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

// 1. Evita duplicati: una parola può esistere una sola volta per lingua
wordSchema.index({ lingua: 1, parola: 1 });
wordSchema.index({ lingua: 1, livello: 1 });
wordSchema.index({ lingua: 1, tema: 1 });

// 2. Indice testuale completo (inclusa la traduzione) con pesi di rilevanza
wordSchema.index(
  { parola: "text", traduzione: "text", definizione: "text" },
  { weights: { parola: 5, traduzione: 3, definizione: 1 } }
);

export default mongoose.model("Word", wordSchema);