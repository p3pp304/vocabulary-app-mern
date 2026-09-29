import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchWordDetail } from "../services/wordService";
import { updateDeckWord, addWordToDeck, removeWordFromDeck } from "../services/deckService";

export default function WordDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [wordData, setWordData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state per le personalizzazioni
  const [customTraduzione, setCustomTraduzione] = useState("");
  const [customNote, setCustomNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeckProcessing, setIsDeckProcessing] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState("");

  // Stato audio sintesi vocale
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const supportsSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWordDetail(id);

        if (isMounted) {
          setWordData(data);
          setCustomTraduzione(data.customTraduzione || "");
          setCustomNote(data.customNote || "");
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Impossibile recuperare i dettagli del termine.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      loadData();
    }

    return () => {
      isMounted = false;
      window.speechSynthesis?.cancel();
    };
  }, [id]);

  // Gestione sintesi vocale
  const handleSpeak = () => {
    if (!supportsSpeech || !wordData?.parola) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(wordData.parola);
    utterance.lang = wordData.lingua || "en-US";
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  // Toggle Aggiungi / Rimuovi dal mazzo SEMPRE PRESENTE
  const handleToggleDeck = async () => {
    setIsDeckProcessing(true);
    setSaveSuccessMsg("");

    try {
      if (wordData.isInDeck) {
        // RIMOZIONE: usiamo sempre deckItemId
        await removeWordFromDeck(wordData.deckItemId);

        setWordData((prev) => ({
          ...prev,
          isInDeck: false,
          deckItemId: null,
          customTraduzione: null,
          customNote: null,
          traduzione: prev.traduzioneCatalogo || "",
          note: prev.noteCatalogo || "",
        }));
        setCustomTraduzione("");
        setCustomNote("");
        setSaveSuccessMsg("Vocabolo rimosso dal tuo mazzo.");
      } else {
        // AGGIUNTA
        const newDeckItem = await addWordToDeck(wordData.wordId || wordData.id);

        setWordData((prev) => ({
          ...prev,
          isInDeck: true,
          deckItemId: newDeckItem._id,
        }));
        setSaveSuccessMsg("Vocabolo aggiunto al tuo mazzo!");
      }
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message || "Operazione non riuscita.");
    } finally {
      setIsDeckProcessing(false);
    }
  };

  // Salvataggio personalizzazioni
  const handleSaveCustomData = async (e) => {
    e.preventDefault();
    if (!wordData?.deckItemId) return;

    setIsSaving(true);
    setSaveSuccessMsg("");

    try {
      const payload = {
        customTraduzione: customTraduzione.trim() || null,
        customNote: customNote.trim() || null,
      };

      await updateDeckWord(wordData.deckItemId, payload);

      setWordData((prev) => ({
        ...prev,
        customTraduzione: payload.customTraduzione,
        customNote: payload.customNote,
        traduzione: payload.customTraduzione || prev.traduzioneCatalogo || prev.traduzione,
        note: payload.customNote || prev.noteCatalogo || "",
      }));

      setSaveSuccessMsg("Modifiche personali salvate con successo!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    } catch (err) {
      console.error(err);
      alert(err.message || "Errore durante il salvataggio.");
    } finally {
      setIsSaving(false);
    }
  };

  // Ripristina ai valori di default del catalogo
  const handleResetDefaults = async () => {
    if (!window.confirm("Vuoi rimuovere le tue note e ripristinare la traduzione base?")) return;

    setIsSaving(true);
    try {
      const payload = {
        customTraduzione: null,
        customNote: null,
      };

      await updateDeckWord(wordData.deckItemId, payload);

      setCustomTraduzione("");
      setCustomNote("");
      setWordData((prev) => ({
        ...prev,
        customTraduzione: null,
        customNote: null,
        traduzione: prev.traduzioneCatalogo || prev.traduzione,
        note: prev.noteCatalogo || "",
      }));

      setSaveSuccessMsg("Valori ripristinati con successo!");
      setTimeout(() => setSaveSuccessMsg(""), 3000);
    } catch (err) {
      alert("Errore durante il ripristino.");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-mono text-sm animate-pulse">
        Caricamento dettagli termine...
      </div>
    );
  }

  if (error || !wordData) {
    return (
      <div className="max-w-md mx-auto my-12 p-6 bg-red-950/20 border border-red-900/50 rounded-3xl text-center flex flex-col gap-4 text-red-400">
        <p className="text-sm font-medium">{error || "Vocabolo non trovato."}</p>
        <button
          onClick={() => navigate(-1)}
          className="self-center min-h-[44px] px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-200 rounded-xl text-xs font-mono transition cursor-pointer"
        >
          ← Torna indietro
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6 text-zinc-100 pb-12">
      {/* 1. Header superiore: Torna indietro (Touch-friendly per Mobile) */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className=" inline-flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-300 hover:text-white transition active:scale-95 cursor-pointer"
          aria-label="Torna alla schermata precedente"
        >
          <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="font-semibold">Indietro</span>
        </button>

        {wordData.isInDeck ? (
          <div className=" text-xs py-3 font-mono uppercase tracking-wider text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-4  rounded-2xl">
            Nel tuo mazzo
          </div>
        ) : (
          <div className=" text-xs py-3 px-4 font-mono uppercase tracking-wider text-zinc-400 bg-zinc-900 border border-zinc-800 rounded-2xl">
            Catalogo
          </div>
        )}
      </div>

      {/* 2. Scheda Termine Principale */}
      <div className="bg-zinc-900/70 border border-zinc-800/80 p-5 sm:p-7 rounded-3xl flex flex-col md:flex-row md:items-center justify-between gap-5 backdrop-blur-md">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/50 border border-purple-800/50 px-2.5 py-0.5 rounded-lg">
              {wordData.livello}
            </span>
            {wordData.tema && (
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {wordData.tema}
              </span>
            )}
            {wordData.isCustom && (
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/50 border border-cyan-800/50 px-2 py-0.5 rounded-lg">
                Custom
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold capitalize text-white tracking-tight break-words">
            {wordData.parola}
          </h1>

          {wordData.pronuncia && (
            <span className="text-xs sm:text-sm font-mono text-zinc-400">
              /{wordData.pronuncia}/
            </span>
          )}
        </div>

        {/* Pulsanti Azione Termine: Audio + AGGIUNGI/RIMUOVI MAZZO (SEMPRE PRESENTE) */}
        <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
          {/* Tasto Pronuncia */}
          <button
            type="button"
            onClick={handleSpeak}
            disabled={!supportsSpeech}
            className="min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800/90 hover:bg-zinc-700 text-cyan-300 border border-zinc-700/80 rounded-2xl text-xs font-semibold transition active:scale-95 cursor-pointer disabled:opacity-40"
          >
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
            <span>{isPlayingAudio ? "Ascolto..." : "Pronuncia"}</span>
          </button>

          {/* Tasto Aggiungi/Rimuovi Mazzo sempre presente */}
          <button
            type="button"
            onClick={handleToggleDeck}
            disabled={isDeckProcessing}
            className={`min-h-[44px] flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-semibold tracking-wide transition active:scale-95 cursor-pointer disabled:opacity-50 ${
              wordData.isInDeck
                ? "bg-red-950/30 hover:bg-red-900/50 text-red-300 border border-red-800/50"
                : "bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-950/40"
            }`}
          >
            {isDeckProcessing ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                Aggiornamento...
              </span>
            ) : wordData.isInDeck ? (
              <>
                <svg className="w-4 h-4 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Rimuovi dal mazzo</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                </svg>
                <span>Aggiungi al mazzo</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feedback Alert Operazioni */}
      {saveSuccessMsg && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm rounded-2xl text-center font-mono animate-fadeIn">
          {saveSuccessMsg}
        </div>
      )}

      {/* 3. Griglia a Due Colonne: Base vs Personale */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* COLONNA 1: Scheda Base (Catalogo Ufficiale) */}
        <div className="bg-zinc-900/50 border border-zinc-800/80 p-5 sm:p-6 rounded-3xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400 flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-500"></span>
              Traduzione Base
            </span>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
              Significato ufficiale
            </span>
            <p className="text-base font-semibold text-zinc-200 mt-1">
              {wordData.traduzioneCatalogo || wordData.traduzione || "(Nessuna traduzione di catalogo)"}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
              Note esplicative
            </span>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed whitespace-pre-wrap">
              {wordData.noteCatalogo || "Nessuna nota aggiuntiva fornita dal catalogo."}
            </p>
          </div>

          <div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
              Esempi del dizionario
            </span>
            {wordData.esempiCatalogo && wordData.esempiCatalogo.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-2">
                {wordData.esempiCatalogo.map((es, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 italic bg-zinc-950/70 p-3 rounded-xl border border-zinc-900">
                    "{es}"
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-zinc-500 italic mt-1">Nessun esempio fornito.</p>
            )}
          </div>
        </div>

        {/* COLONNA 2: Scheda Personale (Personalizzazioni & Note) */}
        <div className="bg-zinc-900/80 border border-zinc-800 p-5 sm:p-6 rounded-3xl flex flex-col gap-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3 gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-2 font-semibold">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              Traduzione Personale
            </span>

            {/* Pulsante Ripristina Base: Ottimizzato per Touch */}
            {wordData.isInDeck && (customTraduzione || customNote) && (
              <button
                type="button"
                onClick={handleResetDefaults}
                disabled={isSaving}
                className="min-h-[36px] px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-zinc-400 hover:text-red-400 hover:border-red-900/40 transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                Ripristina Base
              </button>
            )}
          </div>

          {wordData.isInDeck ? (
            <form onSubmit={handleSaveCustomData} className="flex flex-col gap-4 flex-1">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                  La tua traduzione preferita
                </label>
                <input
                  type="text"
                  value={customTraduzione}
                  onChange={(e) => setCustomTraduzione(e.target.value)}
                  placeholder={wordData.traduzioneCatalogo || "Es. significato contestuale..."}
                  className="min-h-[44px] bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-2xl px-4 py-2.5 text-sm text-white focus:outline-none transition"
                />
              </div>

              <div className="flex flex-col gap-1.5 flex-1">
                <label className="text-[11px] font-mono text-zinc-400 uppercase tracking-wide">
                  Appunti personali e mnemonica
                </label>
                <textarea
                  rows="4"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Scrivi regole, contesti d'uso o frasi per ricordare..."
                  className="w-full flex-1 bg-zinc-950 border border-zinc-800 focus:border-cyan-500 rounded-2xl p-3.5 text-xs text-white focus:outline-none resize-none leading-relaxed transition"
                />
              </div>

              {/* Tasto Salva con comodo touch target */}
              <button
                type="submit"
                disabled={isSaving}
                className="min-h-[46px] mt-2 w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-semibold tracking-wider transition active:scale-98 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-950/40"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Salvataggio...</span>
                  </>
                ) : (
                  "Salva Personalizzazioni"
                )}
              </button>
            </form>
          ) : (
            /* Box informativo quando la parola è solo nel catalogo */
            <div className="flex flex-col items-center justify-center text-center p-6 sm:p-8 bg-zinc-950/40 border border-dashed border-zinc-800 rounded-2xl gap-3 my-auto">
              <span className="text-sm font-semibold text-zinc-300">
                Non ancora nel tuo mazzo
              </span>
              <p className="text-xs text-zinc-500 max-w-xs leading-relaxed">
                Salva questo vocabolo per sbloccare la tua traduzione alternativa e inserire le tue note di studio personalizzate.
              </p>
              <button
                type="button"
                onClick={handleToggleDeck}
                disabled={isDeckProcessing}
                className="min-h-[44px] mt-2 px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-cyan-300 rounded-xl text-xs font-semibold transition active:scale-95 cursor-pointer"
              >
                + Aggiungi al mazzo ora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}