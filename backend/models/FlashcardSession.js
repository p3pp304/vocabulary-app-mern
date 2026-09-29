import mongoose from "mongoose";

const flashcardSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    correctAnswers: { type: Number, required: true, min: 0 },
    totalCards: { type: Number, required: true, min: 1 },
    score: { type: Number, required: true, min: 0, max: 100 },
    lingua: { type: String, default: "en", lowercase: true, trim: true },
  },
  { timestamps: true }
);

export default mongoose.model("FlashcardSession", flashcardSessionSchema);