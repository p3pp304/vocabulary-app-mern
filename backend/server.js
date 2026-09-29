import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

import userRouter from './routers/authRouter.js';
import wordRouter from './routers/wordRouter.js';
import deckRouter from './routers/deckRouter.js';

// 1. Inizializza subito le variabili d'ambiente
dotenv.config();

// 2. Inizializza l'applicazione Express
const app = express();
const port = process.env.PORT || 3000;

// 3. Origini consentite da CORS
const allowedOrigins = [
  process.env.NODE_ENV === "production" ?
  process.env.CLIENT_URL:  // URL del frontend su Vercel
  'http://localhost:5173' // frontend locale Vite
].filter(Boolean); // rimuove valori null/undefined

// 4. Middleware CORS (una sola volta, prima di ogni rotta)
app.use(cors({ origin: allowedOrigins, credentials: true }));

// 5. Middleware di parsing (processo di trasformazioni da dati grezzi a dati strutturati)
app.use(express.json()); // paersing JSON  
app.use(cookieParser());  // parsing COOKIE

/* DATO GREZZO --> '{"username": "mario", "age": 30}'
   CON PARSING --> 
{
  username: "mario",
  age: 30
}
  */

// 6. Connessione a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso con successo'))
  .catch((error) => console.error('Errore di connessione a MongoDB:', error));

// 8. Router API
app.use('/api/auth', userRouter);
app.use('/api/words', wordRouter);
app.use('/api/deck', deckRouter);

// 9. Avvio server
app.listen(port, () => {
  console.log(`Il server è in ascolto sulla porta ${port}`);
});