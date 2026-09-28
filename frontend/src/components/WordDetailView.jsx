import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWordDetail } from "../services/wordService";
import { addWordToDeck, removeWordFromDeck } from "../services/deckService";

export default function WordDetailView() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [word, setWord] = useState(null);
  const [isInDeck, setIsInDeck] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechError, setSpeechError] = useState(null);

  const canSpeak =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  useEffect(() => {
    if (!id || id === "undefined") {
      setError("ID del vocabolo non valido.");
      setLoading(false);
      return;
    }

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchWordDetail(id);
        setWord(data);
        setIsInDeck(Boolean(data.isInDeck));
      } catch (err) {
        setError(err.message || "Impossibile recuperare il termine.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  const handleToggleDeck = async () => {
    if (!id) return;
    try {
      if (isInDeck) {
        await removeWordFromDeck(id);
        setIsInDeck(false);
      } else {
        await addWordToDeck(id);
        setIsInDeck(true);
      }
    } catch (err) {
      alert(err.message || "Operazione fallita");
    }
  };

  const handleSpeakWord = () => {
    if (!canSpeak || !word?.parola) {
      setSpeechError("La sintesi vocale non è disponibile su questo dispositivo.");
      return;
    }

    window.speechSynthesis.cancel();
    setSpeechError(null);

    const utterance = new SpeechSynthesisUtterance(word.parola);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeechError("Non è stato possibile riprodurre la pronuncia.");
    };

    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="w-full py-28 text-center text-zinc-500 font-mono text-sm">
        Caricamento dati del vocabolo...
      </div>
    );
  }

  if (error || !word) {
    return (
      <div className="w-full max-w-4xl mx-auto py-16 flex flex-col items-center gap-4">
        <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs">
          {error || "Vocabolo non trovato."}
        </div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
        >
          ← Torna indietro
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6 lg:p-10 flex flex-col gap-6 text-zinc-100">
      {/* Top Bar */}
      <div className="flex flex-col gap-3 border-b border-zinc-800 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <nav aria-label="Navigazione del vocabolo" className="flex w-full gap-2 sm:w-auto">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-zinc-800 px-3 text-sm text-zinc-300 transition hover:border-zinc-600 hover:text-white cursor-pointer sm:flex-none"
          >
            Indietro
          </button>
          <button
            type="button"
            onClick={() => navigate("/deck")}
            className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg border border-zinc-800 px-3 text-sm text-cyan-300 transition hover:border-cyan-700 hover:text-cyan-200 cursor-pointer sm:flex-none"
          >
            Il tuo mazzo
          </button>
        </nav>

        <div className="flex w-full items-center gap-2 sm:w-auto sm:justify-end">
          {word.isCustom && (
            <span className="shrink-0 rounded border border-cyan-700/60 bg-cyan-950/60 px-2 py-1 text-[10px] font-mono uppercase text-cyan-300">
              Personale
            </span>
          )}
          <button
            type="button"
            onClick={handleToggleDeck}
            className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-xl border px-3 py-2 text-xs font-semibold transition cursor-pointer sm:flex-none sm:px-4 ${
              isInDeck
                ? "bg-red-950/20 border-red-900/40 text-red-400 hover:bg-red-600 hover:text-white"
                : "bg-cyan-400 text-black border-cyan-400 hover:bg-cyan-300 shadow-md shadow-cyan-500/20"
            }`}
          >
            {isInDeck ? "Rimuovi dal Mazzo" : "+ Aggiungi al Mazzo"}
          </button>
        </div>
      </div>

      {/* Scheda Termine */}
      <div className="bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 backdrop-blur-sm flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-2.5 py-1 text-xs font-mono bg-purple-950/40 border border-purple-800/50 text-purple-400 font-bold rounded-lg">
            {word.livello}
          </span>
          {word.tema && (
            <span className="px-2.5 py-1 text-xs font-mono uppercase bg-zinc-800/60 border border-zinc-700/50 text-zinc-400 rounded-lg">
              {word.tema}
            </span>
          )}
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="max-w-full break-words text-3xl font-extrabold text-white capitalize sm:text-4xl">
              {word.parola}
            </h1>
            <button
              type="button"
              onClick={handleSpeakWord}
              disabled={!canSpeak}
              aria-label={`Ascolta la pronuncia inglese di ${word.parola}`}
              className="inline-flex min-h-10 items-center justify-center rounded-lg border border-zinc-700 px-3 text-sm text-cyan-300 transition hover:border-cyan-500 hover:bg-cyan-950/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSpeaking ? "In riproduzione" : "Ascolta"}
            </button>
          </div>
          <p className="text-xl sm:text-2xl text-cyan-400 font-medium mt-2 capitalize">
            {word.traduzione}
          </p>
          {speechError && (
            <p role="status" className="mt-2 text-xs text-amber-300">
              {speechError}
            </p>
          )}
        </div>
      </div>

      {/* Due Colonne: Esempi & Note */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            Frasi di Esempio
          </h3>
          {word.esempi?.length > 0 ? (
            <ul className="flex flex-col gap-2.5">
              {word.esempi.map((es, idx) => (
                <li
                  key={idx}
                  className="p-3 bg-zinc-950/60 border border-zinc-800/60 rounded-xl text-xs text-zinc-300 font-sans"
                >
                  "{es}"
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-zinc-500 italic">Nessun esempio registrato.</p>
          )}
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
            Note Personali
          </h3>
          {word.note ? (
            <p className="text-xs text-zinc-300 bg-zinc-950/60 border border-zinc-800/60 p-3 rounded-xl whitespace-pre-wrap">
              {word.note}
            </p>
          ) : (
            <p className="text-xs text-zinc-500 italic">Nessuna nota presente.</p>
          )}
        </div>
      </div>
    </div>
  );
}