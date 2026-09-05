import jwt from 'jsonwebtoken'
import Word from '../models/word.js'

export const protect = (req,res,next) =>{  // protect è una dunzione intermedia (middleware).
    //Esegue controlli o trasformazioni (es. verificare un token JWT, parsare i cookie o i body JSON) 
    // e decide se passare la richiesta allo step successivo (next()) oppure bloccarla restituendo subito un errore.
    const {token} = req.cookies;

    /* 4XX PROBLEMI LATO CLIENT
    400 Bad Request: Richiesta malformata
    401 Unauthorized: 
    403 Forbidden: L'utente è autenticato ma non dispone dei permessi necessari per accedere alla risorsa.
    404 Not Found: La risorsa o l'endpoint API richiesto non esiste nel server. 
    
    2XX SUCCESSO
    200 OK, 201 CREATED*/

    if (!token){
        return res.status(401).json({message: ' Accesso negato: token mancante'})
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Salviamo lo userId per usarlo nelle query
        next(); // passa all'altro middleware
    } catch (error) {
        return res.status(401).json({ message: 'Sessione scaduta o non valida' });
    }
};

export const getWords = async (req, res) =>{  // GET
    try{
        const words = await Word.find({userId: req.userId}).sort({parola:1})  //parole dell'utente specifico con ordine crescente A-Z
        res.status(200).json(words);
    }catch(error){
        res.status(500).json({message: error.message})  // 500: Internal Server error --> errore generico dipendente dal server Express
    }
}

export const createWord = async (req, res) =>{  // CREATE
    try{
        const newWord = await Word.create({
            ...req.body, // Spread Operator -->  "spacchettare" ed estrarre tutte le proprietà presenti dentro l'oggetto req.body
            userId: req.userId
        })
        res.status(201).json(newWord);
    }catch (error){
        res.status(400).json({message: error.message})
    }
}

// PUT: Modifica un termine (solo se appartiene all'utente)
export const updateWord = async (req, res) => {
  const { id } = req.params;

  try {
    const updated = await Word.findOneAndUpdate(
      { _id: id, userId: req.userId },  // filtro di ricerca
      req.body,  // contiene campi aggiornati
      { new: true, runValidators: true }  // new --> restituisce il documento aggiornato; runValidators --> applica i vincoli dello schema anche durante l'aggiornamento
    );

    if (!updated) {
      return res.status(404).json({ message: 'Parola non trovata o non autorizzato' });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE: Rimuove un termine (solo se appartiene all'utente)
export const deleteWord = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Word.findOneAndDelete({ _id: id, userId: req.userId });

    if (!deleted) {
      return res.status(404).json({ message: 'Parola non trovata o non autorizzato' });
    }

    res.status(200).json({ message: 'Termine eliminato con successo' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

