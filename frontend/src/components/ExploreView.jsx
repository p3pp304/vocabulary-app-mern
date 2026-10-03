import { useState, useEffect } from 'react';
import { CEFR_LEVELS, THEMES } from '../vocabularyData';
import { fetchWords } from '../services/fetchWords';
import { isSpeechSupported, speakText } from '../services/speechService';

export default function ExploreView({
  selectedLang,
  mySavedWords,
  toggleSaveWord,
  searchQuery,
  onSelectWord,
}) {
  // Filtri ARRAY per selezione multipla
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState([]);

  // Dati e paginazione da backend
  const [words, setWords] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalWords, setTotalWords] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [speakingWordId, setSpeakingWordId] = useState(null);

  const supportsSpeech = isSpeechSupported();

  useEffect(() => () => window.speechSynthesis?.cancel(), []);

  const handleSpeakWord = (event, word) => {
    event.stopPropagation();
    event.preventDefault();
    if (!supportsSpeech) return;

    speakText(word.parola, word.lingua || 'en', {
      onStart: () => setSpeakingWordId(word._id),
      onEnd: () => setSpeakingWordId(null),
      onError: () => setSpeakingWordId(null),
    });
  };

  const toggleLevelFilter = (lvl) => {
    setSelectedLevel((prev) =>
      prev.includes(lvl) ? prev.filter((item) => item !== lvl) : [...prev, lvl]
    );
    setPage(1);
  };

  const toggleThemeFilter = (themeId) => {
    setSelectedTheme((prev) =>
      prev.includes(themeId) ? prev.filter((item) => item !== themeId) : [...prev, themeId]
    );
    setPage(1);
  };

  // Reset pagina se cambia la lingua o la query di ricerca globale
  useEffect(() => {
    setPage(1);
  }, [selectedLang, searchQuery]);

  // Fetch asincrona dei dati con gestione abort
  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWords(
          {
            lingua: selectedLang,
            page,
            livello: selectedLevel.join(','),
            tema: selectedTheme.join(','),
            search: searchQuery,
          },
          controller.signal
        );

        setWords(data.words || []);
        setTotalPages(data.totalPages || 1);
        setTotalWords(data.totalWords || 0);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message || 'Errore nel caricamento dei vocaboli');
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      controller.abort();
    };
  }, [selectedLang, page, selectedLevel, selectedTheme, searchQuery]);

  const savedWordsInResults = words.filter((word) =>
    mySavedWords.includes(String(word._id))
  ).length;

  return (
    <div className="flex flex-col gap-4 sm:gap-8 w-full">
      {/* Filtri Funzionali: Livello & Nucleo Tematico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm">
        
        {/* Livelli CEFR */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Per Livello Linguistico
            </span>
            {selectedLevel.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
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
                key={lvl}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleLevelFilter(lvl);
                }}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition cursor-pointer ${
                  selectedLevel.includes(lvl)
                    ? 'bg-purple-500 text-white font-bold shadow-md shadow-purple-500/20'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Nuclei Tematici */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Per Nucleo Tematico
            </span>
            {selectedTheme.length > 0 && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
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
                key={theme.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  toggleThemeFilter(theme.id);
                }}
                className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer ${
                  selectedTheme.includes(theme.id)
                    ? 'bg-zinc-200 text-black font-semibold'
                    : 'bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Elenco Vocaboli */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold leading-snug text-zinc-100 sm:text-lg">
            Vocaboli Consigliati <span className="text-zinc-400">({totalWords})</span>
          </h2>
          <span
            aria-live="polite"
            className="inline-flex min-h-8 max-w-full items-center gap-2 rounded-lg border border-zinc-800 bg-zinc-900/60 px-2.5 text-[11px] font-mono text-zinc-400 sm:text-xs"
          >
            <span>Salvati tra i risultati</span>
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-md bg-emerald-950/50 px-1.5 font-semibold text-emerald-300">
              {savedWordsInResults}
            </span>
          </span>
        </div>

        {/* Feedback di Errore */}
        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl text-xs text-center">
            {error}
          </div>
        )}

        {/* Griglia Vocaboli con transizione fluida */}
        <div className={`transition-opacity duration-200 ${loading ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {words.length === 0 && !loading ? (
            <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-sm">
              Nessun vocabolo trovato per i filtri selezionati.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {words.map((word) => {
                const wordId = word._id;
                const isSaved = mySavedWords.includes(wordId);

                return (
                  <div
                    key={wordId}
                    onClick={() => onSelectWord(wordId)}
                    className="p-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between gap-3 transition group cursor-pointer"
                  >
                    <div className="flex min-w-0 flex-1 flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono text-purple-400 bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.5 rounded">
                          {word.livello}
                        </span>
                        <span className="text-[11px] font-mono text-zinc-500 uppercase">
                          {word.tema}
                        </span>
                      </div>
                      <span className="wrap-break-word text-base font-bold text-white group-hover:text-cyan-300 transition-colors capitalize">
                        {word.parola}
                      </span>
                      <span className="wrap-break-word text-xs text-zinc-400 capitalize">
                        {word.traduzione}
                      </span>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2">
                      <button
                        type="button"
                        onClick={(event) => handleSpeakWord(event, word)}
                        disabled={!supportsSpeech}
                        aria-label={`Ascolta la pronuncia inglese di ${word.parola}`}
                        aria-pressed={speakingWordId === wordId}
                        title={supportsSpeech ? `Ascolta ${word.parola}` : 'Sintesi vocale non disponibile'}
                        className="min-h-10 rounded-xl border border-zinc-700 px-3 text-xs font-semibold text-cyan-300 transition hover:border-cyan-500 hover:bg-cyan-950/40 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {speakingWordId === wordId ? 'In riproduzione' : 'Ascolta'}
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          toggleSaveWord(wordId);
                        }}
                        className={`min-h-10 rounded-xl border px-2.5 text-xs font-semibold transition cursor-pointer ${
                          isSaved
                            ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                            : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-cyan-500 hover:text-black hover:border-cyan-400'
                        }`}
                        title={isSaved ? 'Rimuovi dal mio mazzo' : 'Aggiungi al mio mazzo'}
                      >
                        {isSaved ? '✓ Nel Mazzo' : '+ Aggiungi'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Paginazione */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.max(p - 1, 1));
              }}
              disabled={page <= 1}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 disabled:opacity-40 hover:border-zinc-700 cursor-pointer"
            >
              Precedente
            </button>

            <span className="text-xs text-zinc-400 font-mono">
              Pagina {page} di {totalPages}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                setPage((p) => Math.min(p + 1, totalPages));
              }}
              disabled={page >= totalPages}
              className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-xs font-semibold text-zinc-300 disabled:opacity-40 hover:border-zinc-700 cursor-pointer"
            >
              Successiva
            </button>
          </div>
        )}
      </div>
    </div>
  );
}