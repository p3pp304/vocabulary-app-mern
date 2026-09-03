import mongoose from "mongoose";

const wordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true, 
    },
    parola: {
      type: String,
      required: true,
      trim: true,      // Rimuove spazi vuoti accidentali
      lowercase: true, // Salva tutto in minuscolo per evitare duplicati come "Apple" e "apple"
    },
    definizione: {
      type: String,
      required: true,
      trim: true,
    },
    tipo: {
      type: String, // es. "v.", "n.", "adj."
      trim: true,
      default: '',
    },
    espressione: {
      type: String,
      trim: true,
      default: null,
    },
    sinonimi: {
      type: String,
      trim: true,
      default: null,
    },
    contrari: {
      type: String,
      trim: true,
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: null,
    },
    esempi: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true, // Per consistenza nei filtri (es. "business", "idioms")
      },
    ]
  },
  {
    timestamps: true, // Crea e aggiorna in automatico createdAt e updatedAt
  }
);

// Indice per velocizzare la barra di ricerca testuale
wordSchema.index({ parola: 'text', definizione: 'text' });

export default mongoose.model('Word', wordSchema);