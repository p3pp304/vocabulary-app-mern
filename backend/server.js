import express from 'express';
import userRouter from './routers/authRouter.js'
import wordRouter from './routers/wordRouter.js'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import cookieParser from 'cookie-parser';

dotenv.config(); // legge file di testo .env ed estrae le coppie chiave-valore inserendole in process.env

const app = express();
const port = process.env.PORT || 3000;

// CONNESSIONE a MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connesso con successo'))
    .catch((error)=> console.error('Errore di connessione a MongoDB:', error));  // , --> unisce argomenti separati

// Middleware globali (fondamentali PRIMA delle rotte)
app.use(express.json()); // trasforma il body in formato JSON
app.use(cookieParser()); // elabora l'oggetto req.cookies 

app.get('/', (req, res)=>{
    res.send('Benvenuto')
})

app.get('/home', (req, res)=>{   // /home = rotta (endpoint URL); .get = metodo che serve ad ascoltare le richieste get del browser
    res.send('Sim trnat');
})

app.use('/api', userRouter); // use --> aggancia middleware, router  
app.use('/api', wordRouter); 

app.listen(port, ()=>{
    console.log(`Il server è in ascolto sulla porta ${port}`)
})