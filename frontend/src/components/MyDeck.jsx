import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CEFR_LEVELS, THEMES } from "../vocabularyData";

export default function MyDeck({
  selectedLang,
  toggleSaveWord,
  searchQuery = "",
  onSelectWord,
}) {
  const [deckWords, setDeckWords] = useState([]);
  // Carica a schermo intero solo la primissima volta in assoluto
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState([]);
  const navigate = useNavigate();

  // Flag per sapere se abbiamo già caricato almeno una volta
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    const controller = new AbortController();

    const fetchDeck = async () => {
      // Mostra "Caricamento..." SOLO se è il primo mount in assoluto
      if (!hasLoadedOnce.current) {
        setInitialLoading(true);
      }
      setError(null);

      try {
        const res = await fetch(
          `http://localhost:3000/api/deck?lingua=${selectedLang}`,
          {
            credentials: "include",
            signal: controller.signal,
          }
        );

        if (!res.ok) throw new Error("Errore nel recupero del mazzo");

        const data = await res.json();
        setDeckWords(Array.isArray(data) ? data : []);
        hasLoadedOnce.current = true;
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message || "Impossibile caricare il mazzo.");
        }
      } finally {
        if (!controller.signal.aborted) {
          setInitialLoading(false);
        }
      }
    };

    fetchDeck();

    return () => {
      controller.abort();
    };
  }, [selectedLang]); // <-- DIPENDE SOLO DALLA LINGUA! Niente mySavedWords qui!

  // Rimozione immediata e silenziosa dalla UI (senza ricaricare nulla)
  const handleRemoveWord = async (e, targetId) => {
    e.stopPropagation(); // Blocca l'apertura del dettaglio

    // 1. Rimuove subito visivamente la card con animazione fluida
    setDeckWords((prev) =>
      prev.filter(
        (w) => String(w.wordId) !== String(targetId) && String(w.deckItemId) !== String(targetId)
      )
    );

    // 2. Notifica il genitore e il backend in background
    if (toggleSaveWord) {
      await toggleSaveWord(targetId);
    }
  };

  const toggleLevelFilter = (lvl) => {
    setSelectedLevel((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    );
  };

  const toggleThemeFilter = (themeId) => {
    setSelectedTheme((prev) =>
      prev.includes(themeId) ? prev.filter((item) => item !== themeId) : [...prev, themeId]
    );
  };

  const filteredWords = deckWords.filter((item) => {
    const matchLevel = selectedLevel.length === 0 || selectedLevel.includes(item.livello);
    const matchTheme = selectedTheme.length === 0 || selectedTheme.includes(item.tema);
    const query = searchQuery.trim().toLowerCase();
    const matchQuery =
      !query ||
      item.parola?.toLowerCase().includes(query) ||
      item.traduzione?.toLowerCase().includes(query);

    return matchLevel && matchTheme && matchQuery;
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Filtri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm">
        {/* Livelli */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Per Livello Linguistico
            </span>
            {selectedLevel.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedLevel([])}
                className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                Azzera
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {CEFR_LEVELS.map((lvl) => (
              <button
                type="button"
                key={lvl}
                onClick={() => toggleLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  selectedLevel.includes(lvl)
                    ? "bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Temi */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Per Nucleo Tematico
            </span>
            {selectedTheme.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTheme([])}
                className="text-[10px] font-mono text-cyan-400 hover:underline cursor-pointer"
              >
                Azzera
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {THEMES.map((theme) => (
              <button
                type="button"
                key={theme.id}
                onClick={() => toggleThemeFilter(theme.id)}
                className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer ${
                  selectedTheme.includes(theme.id)
                    ? "bg-zinc-200 text-black font-semibold"
                    : "bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lista Vocaboli */}
      <div className="flex flex-col gap-4">
        <h2 className="text-lg font-semibold text-zinc-100">
          Vocaboli nel tuo mazzo ({filteredWords.length})
        </h2>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs text-center">
            {error}
          </div>
        )}

        {initialLoading ? (
          <div className="p-12 text-center text-zinc-500 text-sm font-mono animate-pulse">
            Caricamento del tuo mazzo...
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-sm">
            Nessun vocabolo presente nel mazzo per i filtri selezionati.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => {
              const targetId = String(word.wordId || word.deckItemId);

              return (
                <div
                  key={word.deckItemId}
                  onClick={() => onSelectWord(targetId)}
                  className="p-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between gap-3 transition duration-150 group cursor-pointer hover:bg-zinc-900/90"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-purple-400 bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.5 rounded">
                        {word.livello}
                      </span>
                      {word.tema && (
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">
                          {word.tema}
                        </span>
                      )}
                      {word.isCustom && (
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-800/40 px-1.5 py-0.5 rounded">
                          Custom
                        </span>
                      )}
                    </div>
                    <span className="text-base font-bold text-white capitalize group-hover:text-cyan-300 transition-colors">
                      {word.parola}
                    </span>
                    <span className="text-xs text-zinc-400">{word.traduzione}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleRemoveWord(e, targetId)}
                    className="p-2.5 rounded-xl border border-red-900/40 bg-red-950/20 text-red-400 text-xs font-semibold hover:bg-red-600 hover:text-white transition cursor-pointer"
                    title="Rimuovi dal mazzo"
                  >
                    Rimuovi
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}