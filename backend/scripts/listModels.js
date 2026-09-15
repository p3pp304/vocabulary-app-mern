import "dotenv/config";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function checkModels() {
  try {
    const list = await groq.models.list();
    console.log("Modelli disponibili per il tuo account:\n");
    list.data.forEach((m) => console.log(`- ${m.id}`));
  } catch (err) {
    console.error("Errore recupero modelli:", err.message);
  }
}

checkModels();