import { useState, useEffect } from "react";
import { CEFR_LEVELS, THEMES } from "../vocabularyData";
import { isSpeechSupported, speakText } from "../services/speechService";

const ITEMS_PER_PAGE = 12;

export default function MyDeck({
  selectedLang,
  deckItems = [],
  isLoading = false,
  error = null,
  toggleSaveWord,
  searchQuery = "",
  onSelectWord,
}) {
  const [speakingWordId, setSpeakingWordId] = useState(null);

  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState([]);
  const [page, setPage] = useState(1);

  const supportsSpeech = isSpeechSupported();

  useEffect(() => () => window.speechSynthesis?.cancel(), []);
  useEffect(() => setPage(1), [selectedLang, searchQuery]);

  // La Dashboard aggiorna la lista condivisa dopo la rimozione.
  const handleRemoveWord = async (e, targetDeckItemId) => {
    e.stopPropagation();
    if (toggleSaveWord) {
      await toggleSaveWord(targetDeckItemId);
    }
  };

  const handleSpeakWord = (event, word, targetId) => {
    event.stopPropagation();
    event.preventDefault();
    if (!supportsSpeech) return;

    speakText(word.parola, word.lingua || selectedLang || "en", {
      onStart: () => setSpeakingWordId(targetId),
      onEnd: () => setSpeakingWordId(null),
      onError: () => setSpeakingWordId(null),
    });
  };

  const toggleLevelFilter = (lvl) => {
    setPage(1);
    setSelectedLevel((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    );
  };

  const toggleThemeFilter = (themeId) => {
    setPage(1);
    setSelectedTheme((prev) =>
      prev.includes(themeId) ? prev.filter((item) => item !== themeId) : [...prev, themeId]
    );
  };

  const filteredWords = deckItems.filter((item) => {
    const matchLanguage = item.lingua?.toLowerCase() === selectedLang.toLowerCase();
    const matchLevel = selectedLevel.length === 0 || selectedLevel.includes(item.livello);
    const matchTheme = selectedTheme.length === 0 || selectedTheme.includes(item.tema);
    const query = searchQuery.trim().toLowerCase();
    
    // Cerca sia nella parola che in entrambe le traduzioni
    const matchQuery =
      !query ||
      item.parola?.toLowerCase().includes(query) ||
      item.traduzioneCatalogo?.toLowerCase().includes(query) ||
      item.customTraduzione?.toLowerCase().includes(query) ||
      item.traduzione?.toLowerCase().includes(query);

    return matchLanguage && matchLevel && matchTheme && matchQuery;
  });

  const totalPages = Math.max(1, Math.ceil(filteredWords.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const visibleWords = filteredWords.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage((previousPage) => Math.min(previousPage, totalPages));
  }, [totalPages]);

  return (
    <div className="flex flex-col md:gap-8 gap-4 w-full">
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
                onClick={() => {
                  setSelectedLevel([]);
                  setPage(1);
                }}
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
                onClick={() => {
                  setSelectedTheme([]);
                  setPage(1);
                }}
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
      <div className="flex flex-col md:gap-4 gap-2">
        <h2 className="text-lg font-semibold text-zinc-100">
          Vocaboli nel tuo mazzo ({filteredWords.length})
        </h2>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs text-center">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="p-12 text-center text-zinc-500 text-sm font-mono animate-pulse">
            Caricamento del tuo mazzo...
          </div>
        ) : filteredWords.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-sm">
            Nessun vocabolo presente nel mazzo per i filtri selezionati.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {visibleWords.map((word) => {
              const targetId = String(word.deckItemId);

              return (
                <div
                  key={word.deckItemId}
                  onClick={() => onSelectWord(targetId)}
                  className="p-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between gap-3 transition duration-150 group cursor-pointer hover:bg-zinc-900/90"
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-1">
                    {/* Badge Livello, Tema e Custom */}
                    <div className="flex items-center gap-2 mb-0.5">
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

                    {/* Parola principale */}
                    <span className="wrap-break-word text-base font-bold text-white capitalize group-hover:text-cyan-300 transition-colors">
                      {word.parola}
                    </span>

                    {/* Traduzioni: Base Catalogo e/o Personalizzata */}
                    <div className="flex flex-col gap-0.5 text-xs">
                      {word.traduzioneCatalogo && (
                        <div className="flex items-baseline gap-1.5 text-zinc-400">
                          <span className="text-[10px] uppercase font-mono text-zinc-500">Ufficiale:</span>
                          <span className="truncate">{word.traduzioneCatalogo}</span>
                        </div>
                      )}

                      {word.customTraduzione && (
                        <div className="flex items-baseline gap-1.5 text-cyan-300 font-medium">
                          <span className="text-[10px] uppercase font-mono text-cyan-500/80">Personalizzata:</span>
                          <span className="truncate">{word.customTraduzione}</span>
                        </div>
                      )}

                      {/* Fallback per parole interamente custom (senza traduzioneCatalogo) */}
                      {!word.traduzioneCatalogo && !word.customTraduzione && word.traduzione && (
                        <span className="text-zinc-400 truncate">{word.traduzione}</span>
                      )}
                    </div>
                  </div>

                  {/* Pulsanti Azione */}
                  <div className="flex shrink-0 flex-col gap-2">
                    <button
                      type="button"
                      onClick={(event) => handleSpeakWord(event, word, targetId)}
                      disabled={!supportsSpeech}
                      aria-label={`Ascolta la pronuncia di ${word.parola}`}
                      aria-pressed={speakingWordId === targetId}
                      title={supportsSpeech ? `Ascolta ${word.parola}` : "Sintesi vocale non disponibile"}
                      className="min-h-10 rounded-xl border border-zinc-700 px-3 text-xs font-semibold text-cyan-300 transition hover:border-cyan-500 hover:bg-cyan-950/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {speakingWordId === targetId ? "In riproduzione" : "Ascolta"}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleRemoveWord(e, targetId)}
                      className="min-h-10 rounded-xl border border-red-900/40 bg-red-950/20 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-600 hover:text-white cursor-pointer"
                      title="Rimuovi dal mazzo"
                    >
                      Rimuovi
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-zinc-800/80 pt-4">
            <button
              type="button"
              onClick={() => setPage((previousPage) => Math.max(previousPage - 1, 1))}
              disabled={currentPage === 1}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 disabled:opacity-40"
            >
              Precedente
            </button>
            <span className="font-mono text-xs text-zinc-400">
              Pagina {currentPage} di {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((previousPage) => Math.min(previousPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-2 text-xs font-semibold text-zinc-300 transition hover:border-zinc-700 disabled:opacity-40"
            >
              Successiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}