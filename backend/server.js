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
  'http://localhost:5173', // frontend locale Vite
  process.env.CLIENT_URL,  // URL del frontend su Vercel/Netlify
].filter(Boolean); // rimuove valori null/undefined

// 4. Middleware CORS (una sola volta, prima di ogni rotta)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Non consentito da CORS'));
      }
    },
    credentials: true,
  })
);

// 5. Middleware di parsing
app.use(express.json());
app.use(cookieParser());

// 6. Connessione a MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connesso con successo'))
  .catch((error) => console.error('Errore di connessione a MongoDB:', error));

// 7. Endpoint base di test
app.get('/', (req, res) => {
  res.send('Benvenuto');
});

app.get('/home', (req, res) => {
  res.send('Sim trnat');
});

// 8. Router API
app.use('/api/auth', userRouter);
app.use('/api/words', wordRouter);
app.use('/api/deck', deckRouter);

// 9. Avvio server
app.listen(port, () => {
  console.log(`Il server è in ascolto sulla porta ${port}`);
});