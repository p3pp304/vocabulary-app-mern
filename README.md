# vocabulary-app-mern

## Deploy

Per prima cosa importa il progetto frontend su Vercel e annota il suo URL pubblico; la build iniziale riesce anche senza configurare l'API. Ti servirà come `CLIENT_URL` nel passaggio seguente.

### Backend su Render

1. Crea un Web Service collegato al repository e imposta **Root Directory** su `backend`.
2. Usa `npm install` come Build Command e `npm start` come Start Command.
3. Configura queste variabili d'ambiente:
	- `MONGO_URI`: connection string del database MongoDB Atlas.
	- `JWT_SECRET`: una chiave casuale lunga e privata.
	- `CLIENT_URL`: URL pubblico del frontend Vercel, senza slash finale.
	- `NODE_ENV`: `production`.

In MongoDB Atlas, configura **Network Access** per consentire le connessioni in uscita dal servizio Render.

### Frontend su Vercel

1. Nell'impostazione Vercel già creata, imposta `VITE_BACKEND_URL` con l'URL pubblico del Web Service Render, senza slash finale (per esempio `https://nome-servizio.onrender.com`).
2. Ridistribuisci il frontend. Vercel usa `npm run build` con output in `dist`.

`CLIENT_URL` e `VITE_BACKEND_URL` devono corrispondere ai rispettivi domini Render/Vercel. Dopo aver modificato le variabili `VITE_*`, ridistribuisci il frontend. Non caricare i file `.env` nel repository.