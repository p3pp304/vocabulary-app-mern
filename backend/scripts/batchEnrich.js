import "dotenv/config";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INPUT_PATH = path.join(__dirname, "../seeds/raw_words.json");
const OUTPUT_PATH = path.join(__dirname, "../seeds/wordsSeed.json");

// 7 parole garantiscono che la risposta stia ampiamente sotto il limite dei token
const CHUNK_SIZE = 7;
const DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function enrichBatch(chunk) {
  const prompt = `
Sei un lessicografo bilingue esperto. Prendi questo array di vocaboli:
${JSON.stringify(chunk)}

Restituisci un oggetto JSON valido contenente la chiave "words".
"words" deve essere un array di oggetti, ciascuno con ESATTAMENTE questi campi:
- "parola": stringa in minuscolo (il termine inglese)
- "definizione": stringa concisa in inglese
- "traduzione": traduzione principale in italiano (usa quella di input se fornita)
- "tipo": "n.", "v.", "adj.", "adv.", "phr. v." o "idiom"
- "livello": uno tra "A1", "A2", "B1", "B2", "C1", "C2"
- "tema": uno tra "tech", "business", "travel", "daily"
- "lingua": "en"
- "espressione": collocazione o frase comune, oppure null
- "sinonimi": sinonimi separati da virgola, oppure null
- "contrari": contrari separati da virgola, oppure null
- "note": breve annotazione grammaticale o d'uso in italiano, oppure null
- "esempi": array di 1 o 2 frasi di esempio naturali in inglese

VINCOLI TASSATIVI:
Restituisci SOLO un oggetto JSON valido nella forma { "words": [...] }. Nessun markdown, nessun testo prima o dopo.
`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "Rispondi unicamente con un JSON valido nella forma { \"words\": [...] }.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.words)) return parsed.words;
  if (Array.isArray(parsed.data)) return parsed.data;

  // Fallback se il modello usa una chiave differente
  const firstKey = Object.keys(parsed)[0];
  if (firstKey && Array.isArray(parsed[firstKey])) {
    return parsed[firstKey];
  }

  throw new Error("Formato JSON non conforme (chiave words non trovata)");
}

async function run() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`File di input non trovato in: ${INPUT_PATH}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  console.log(`Totale parole originali nel file: ${rawData.length}`);

  let outputData = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      outputData = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
      console.log(`Trovate ${outputData.length} parole già salvate. Riprendo...`);
    } catch {
      outputData = [];
    }
  }

  // Set delle parole già elaborate per evitare duplicati
  const alreadyProcessedTerms = new Set(
    outputData
      .map((w) => (w.parola || w.term || "").trim().toLowerCase())
      .filter(Boolean)
  );

  const wordsToProcess = rawData.filter((w) => {
    const term = typeof w === "string" ? w : (w.parola || w.term || w.word || "");
    return !alreadyProcessedTerms.has(term.trim().toLowerCase());
  });

  console.log(`Parole rimanenti da elaborare: ${wordsToProcess.length}`);

  let i = 0;
  let retryCount = 0;
  let currentChunkSize = CHUNK_SIZE;

  while (i < wordsToProcess.length) {
    const rawChunk = wordsToProcess.slice(i, i + currentChunkSize);

    // Mappatura compatibile sia con stringhe che con oggetti { parola, traduzione }
    const chunk = rawChunk.map((w) => {
      if (typeof w === "string") return { parola: w };
      return {
        parola: w.parola || w.term || w.word,
        traduzione: w.traduzione || w.translation || undefined,
        livello: w.livello || w.level || undefined,
      };
    });

    const currentBatchNum = Math.floor(i / CHUNK_SIZE) + 1;
    const totalBatches = Math.ceil(wordsToProcess.length / CHUNK_SIZE);

    try {
      process.stdout.write(`Batch ~${currentBatchNum}/${totalBatches} (${chunk.length} parole)... `);
      const enrichedChunk = await enrichBatch(chunk);

      outputData.push(...enrichedChunk);

      // Scrittura immediata su disco
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2), "utf-8");
      console.log("OK!");

      i += chunk.length;
      retryCount = 0;
      currentChunkSize = CHUNK_SIZE; // Ripristina la dimensione standard

      await sleep(DELAY_MS);
    } catch (err) {
      retryCount++;
      console.error(`\nErrore nel batch: ${err.message}`);

      if (retryCount >= 2 && currentChunkSize > 3) {
        // Se continua a fallire, dimezza il blocco per isolare la parola lunga o problematica
        console.log("Riduco temporaneamente la dimensione del blocco a 3 parole per superare il punto critico...");
        currentChunkSize = 3;
        retryCount = 0;
      } else if (retryCount >= 4) {
        // Se fallisce ripetutamente anche con batch ridotto, salta l'elemento problematico per non bloccare tutto
        console.log("Impossibile elaborare questo specifico set. Salto 1 elemento e proseguo...");
        i += 1;
        retryCount = 0;
        currentChunkSize = CHUNK_SIZE;
      }

      console.log("Attendo 5 secondi prima di riprovare...");
      await sleep(5000);
    }
  }

  console.log(`\nOperazione terminata! Tutte le parole sono state salvate in: ${OUTPUT_PATH}`);
}

run();


/*
import "dotenv/config";
import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const INPUT_PATH = path.join(__dirname, "../seeds/raw_words.json");
const OUTPUT_PATH = path.join(__dirname, "../seeds/wordsSeed.json");

// 7 parole garantiscono che la risposta stia ampiamente sotto il limite dei token
const CHUNK_SIZE = 7;
const DELAY_MS = 1500;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function enrichBatch(chunk) {
  const prompt = `
Sei un lessicografo bilingue esperto. Prendi questo array di vocaboli:
${JSON.stringify(chunk)}

Restituisci un oggetto JSON valido contenente la chiave "words".
"words" deve essere un array di oggetti, ciascuno con ESATTAMENTE questi campi:
- "parola": stringa in minuscolo (il termine inglese)
- "definizione": stringa concisa in inglese
- "traduzione": traduzione principale in italiano (usa quella di input se fornita)
- "tipo": "n.", "v.", "adj.", "adv.", "phr. v." o "idiom"
- "livello": uno tra "A1", "A2", "B1", "B2", "C1", "C2"
- "tema": uno tra "tech", "business", "travel", "daily"
- "lingua": "en"
- "espressione": collocazione o frase comune, oppure null
- "sinonimi": sinonimi separati da virgola, oppure null
- "contrari": contrari separati da virgola, oppure null
- "note": breve annotazione grammaticale o d'uso in italiano, oppure null
- "esempi": array di 1 o 2 frasi di esempio naturali in inglese

VINCOLI TASSATIVI:
Restituisci SOLO un oggetto JSON valido nella forma { "words": [...] }. Nessun markdown, nessun testo prima o dopo.
`;

  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: "Rispondi unicamente con un JSON valido nella forma { \"words\": [...] }.",
      },
      { role: "user", content: prompt },
    ],
    response_format: { type: "json_object" },
    temperature: 0.1,
    max_tokens: 4096,
  });

  const raw = completion.choices[0]?.message?.content?.trim() || "{}";
  const parsed = JSON.parse(raw);

  if (Array.isArray(parsed)) return parsed;
  if (Array.isArray(parsed.words)) return parsed.words;
  if (Array.isArray(parsed.data)) return parsed.data;

  // Fallback se il modello usa una chiave differente
  const firstKey = Object.keys(parsed)[0];
  if (firstKey && Array.isArray(parsed[firstKey])) {
    return parsed[firstKey];
  }

  throw new Error("Formato JSON non conforme (chiave words non trovata)");
}

async function run() {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`File di input non trovato in: ${INPUT_PATH}`);
    process.exit(1);
  }

  const rawData = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  console.log(`Totale parole originali nel file: ${rawData.length}`);

  let outputData = [];
  if (fs.existsSync(OUTPUT_PATH)) {
    try {
      outputData = JSON.parse(fs.readFileSync(OUTPUT_PATH, "utf-8"));
      console.log(`Trovate ${outputData.length} parole già salvate. Riprendo...`);
    } catch {
      outputData = [];
    }
  }

  // Set delle parole già elaborate per evitare duplicati
  const alreadyProcessedTerms = new Set(
    outputData
      .map((w) => (w.parola || w.term || "").trim().toLowerCase())
      .filter(Boolean)
  );

  const wordsToProcess = rawData.filter((w) => {
    const term = typeof w === "string" ? w : (w.parola || w.term || w.word || "");
    return !alreadyProcessedTerms.has(term.trim().toLowerCase());
  });

  console.log(`Parole rimanenti da elaborare: ${wordsToProcess.length}`);

  let i = 0;
  let retryCount = 0;
  let currentChunkSize = CHUNK_SIZE;

  while (i < wordsToProcess.length) {
    const rawChunk = wordsToProcess.slice(i, i + currentChunkSize);

    // Mappatura compatibile sia con stringhe che con oggetti { parola, traduzione }
    const chunk = rawChunk.map((w) => {
      if (typeof w === "string") return { parola: w };
      return {
        parola: w.parola || w.term || w.word,
        traduzione: w.traduzione || w.translation || undefined,
        livello: w.livello || w.level || undefined,
      };
    });

    const currentBatchNum = Math.floor(i / CHUNK_SIZE) + 1;
    const totalBatches = Math.ceil(wordsToProcess.length / CHUNK_SIZE);

    try {
      process.stdout.write(`Batch ~${currentBatchNum}/${totalBatches} (${chunk.length} parole)... `);
      const enrichedChunk = await enrichBatch(chunk);

      outputData.push(...enrichedChunk);

      // Scrittura immediata su disco
      fs.writeFileSync(OUTPUT_PATH, JSON.stringify(outputData, null, 2), "utf-8");
      console.log("OK!");

      i += chunk.length;
      retryCount = 0;
      currentChunkSize = CHUNK_SIZE; // Ripristina la dimensione standard

      await sleep(DELAY_MS);
    } catch (err) {
      retryCount++;
      console.error(`\nErrore nel batch: ${err.message}`);

      if (retryCount >= 2 && currentChunkSize > 3) {
        // Se continua a fallire, dimezza il blocco per isolare la parola lunga o problematica
        console.log("Riduco temporaneamente la dimensione del blocco a 3 parole per superare il punto critico...");
        currentChunkSize = 3;
        retryCount = 0;
      } else if (retryCount >= 4) {
        // Se fallisce ripetutamente anche con batch ridotto, salta l'elemento problematico per non bloccare tutto
        console.log("Impossibile elaborare questo specifico set. Salto 1 elemento e proseguo...");
        i += 1;
        retryCount = 0;
        currentChunkSize = CHUNK_SIZE;
      }

      console.log("Attendo 5 secondi prima di riprovare...");
      await sleep(5000);
    }
  }

  console.log(`\nOperazione terminata! Tutte le parole sono state salvate in: ${OUTPUT_PATH}`);
}

run();
*/


/*

*/