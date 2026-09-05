import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const registrati = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Tutti i campi sono obbligatori
    if (!username || !email || !password) {
      return res.status(400).json({ message: "Tutti i campi sono richiesti!" });
    }

    // Controlla se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email già registrata' });
    }

    // Hash della password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Salva l'utente
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword
    });


    // Genera il token JWT e lo invia in un cookie httpOnly (valido 7 giorni)
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    });

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Restituisce l'utente senza la password
    const userObj = newUser.toObject();
    delete userObj.password;

    return res.status(201).json({
      user: userObj,
      message: "L'Utente è stato creato con successo!",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const accedi = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cerca utente
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Credenziali non valide' });
    }

    // Verifica password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Credenziali non valide' });
    }

    // Genera il token JWT e lo invia in un cookie httpOnly (valido 7 giorni)
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
    });

    res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    });

    // Restituisce l'utente senza la password
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      user: userObj,
      message: "Accesso eseguito con successo!",
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

  // Restituisce l'utente loggato leggendo il token JWT dal cookie di sessione
export const fetchUser = async (req, res) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({ message: "Nessun token fornito." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({ message: "Token non valido." });
    }

    const userDoc = await User.findById(decoded.id).select("-password");

    if (!userDoc) {
      return res.status(404).json({ message: "No user found." });
    }

    res.status(200).json({ user: userDoc });
  } catch (error) {
    console.log("Errore durante il fetching dell'utente: ", error.message);

    return res.status(401).json({ message: error.message });
  }
};

// Logout: cancella il cookie di sessione
export const logout = async (req, res) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logout avvenuto correttamente." });
};

