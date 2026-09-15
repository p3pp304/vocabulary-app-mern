import jwt from 'jsonwebtoken'

export const verifyToken = (req,res,next) =>{  // protect è una dunzione intermedia (middleware).
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