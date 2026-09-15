import Word from '../models/word.js'

export const getWords = async (req, res) => {
  try {
    const words = await Word.find({ userId: req.userId }).sort({ parola: 1 });
    res.status(200).json(words);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};



