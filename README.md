# VocaFlow 📚

This project aims to create a modern web application designed to expand and master your foreign language vocabulary. It allows you to memorize words efficiently through an adaptive Spaced Repetition System (SRS) and monitor your learning progress in real time.

---

## 🌐 Live Demo

- **Application URL:** [https://vocaflow-two.vercel.app](https://vocaflow-two.vercel.app)

---

## 🛠️️ Stack Tecnologico

L'applicazione è realizzata seguendo i principi dello stack tecnologico **MERN**:

- **MongoDB:** Database NoSQL utilizzato per memorizzare il catalogo dei vocaboli, i mazzi personalizzati degli utenti e lo storico delle revisioni SRS.
- **Express.js:** Framework web minimalista per Node.js utilizzato per sviluppare le API RESTful del backend.
- **React.js:** Libreria JavaScript dichiarativa utilizzata per realizzare l'interfaccia utente interattiva e reattiva con supporto PWA.
- **Node.js:** Ambiente di runtime JavaScript per l'esecuzione della logica applicativa del server.

---

## ✨ Key Features

- **🧠 Sistema di Ripetizione Spaziata (SRS):** Algoritmo a intervalli crescenti (`1, 3, 7, 14, 30` giorni) basato su un ciclo a 3 stati: `nuova`, `in_ripasso` e `appresa`.
- **🃏 Flashcard Interattive:** Schede di studio con animazione 3D flip, traduzioni affiancate (base del catalogo e personalizzata dell'utente) e sintesi vocale per la corretta pronuncia audio.
- **📖 Catalogo & Mazzo Personale (My Deck):** Esplora vocaboli divisi per lingua, livello CEFR (A1-C2) e tema, con possibilità di salvarli, personalizzarli o aggiungerne di propri.
- **📊 Statistiche & Padronanza Utente:** Modale profilo con aggregazioni in tempo reale su parole apprese, stato di avanzamento e conteggio esatto delle carte pronte al ripasso.
- **📱 PWA (Progressive Web App):** Installabile su smartphone e desktop come un'app nativa, ottimizzata per l'uso mobile-first con tema scuro.
- **🔐 Autenticazione & Sessione Protetta:** Registrazione e accesso utente gestiti con JWT e cookie sicuri `HttpOnly`.

---

## 🚀 Come avviare il progetto (Setup Locale)

### Prerequisiti
- **Node.js** (v18 o superiore consigliata)
- **npm**
- Un'istanza **MongoDB** (in locale o tramite MongoDB Atlas)

---

### 1. Clonare la repository

```bash
git clone [https://github.com/](https://github.com/)<tuo-username>/vocaflow.git
cd vocaflow
2. Configurazione e Avvio del Backend
Entra nella directory del backend:

Bash
cd backend
Installa le dipendenze:

Bash
npm install
Crea un file .env all'interno della cartella backend/:

Snippet di codice
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
Avvia il server backend:

Bash
npm run dev
Il backend sarà in ascolto su http://localhost:3000.

3. Configurazione e Avvio del Frontend
Apri un secondo terminale ed entra nella directory del frontend:

Bash
cd frontend
Installa le dipendenze:

Bash
npm install
Crea un file .env all'interno della cartella frontend/:

Snippet di codice
VITE_API_BASE_URL=http://localhost:3000
Avvia l'applicazione Vite:

Bash
npm run dev
L'applicazione sarà accessibile dal browser su http://localhost:5173.

📄 Licenza
Distribuito sotto licenza MIT.
