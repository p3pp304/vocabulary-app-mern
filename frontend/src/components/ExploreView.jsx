import React, { useState } from 'react';
import { CEFR_LEVELS, THEMES } from '../vocabularyData';

export default function ExploreView({
  selectedLang,
  wordsList,
  mySavedWords,
  toggleSaveWord,
}) {
  const [selectedLevel, setSelectedLevel] = useState([]);
  const [selectedTheme, setSelectedTheme] = useState([]);

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

  const filteredWords = wordsList.filter((item) => {
    const matchLang = item.lang === selectedLang;
    const matchLevel = selectedLevel.length === 0 || selectedLevel.includes(item.level);
    const matchTheme = selectedTheme.length === 0 || selectedTheme.includes(item.theme);
    return matchLang && matchLevel && matchTheme;
  });

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* Filtri Funzionali: Livello & Nucleo Tematico */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 bg-zinc-900/40 border border-zinc-800/80 p-5 rounded-2xl backdrop-blur-sm">
        
        {/* Livelli CEFR */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between sm:justify-start sm:gap-25">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Per Livello Linguistico
            </span>
            {selectedLevel.length > 0 && (
              <button
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
                key={lvl}
                onClick={() => toggleLevelFilter(lvl)}
                className={`px-3 py-1 rounded-lg text-xs font-mono transition ${
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
          <div className="flex items-center justify-between sm:justify-start sm:gap-86">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Per Nucleo Tematico
            </span>
            {selectedTheme.length > 0 && (
              <button
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
                key={theme.id}
                onClick={() => toggleThemeFilter(theme.id)}
                className={`px-3 py-1 rounded-lg text-xs transition ${
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
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-zinc-100">
            Vocaboli Consigliati ({filteredWords.length})
          </h2>
          <span className="text-xs text-zinc-500 font-mono">
            Salvati nel tuo mazzo: {mySavedWords.length}
          </span>
        </div>

        {filteredWords.length === 0 ? (
          <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-500 text-sm">
            Nessun vocabolo trovato per i filtri selezionati.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWords.map((word) => {
              const isSaved = mySavedWords.includes(word.id);
              return (
                <div
                  key={word.id}
                  className="p-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl flex items-center justify-between gap-3 transition group"
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-purple-400 bg-purple-950/40 border border-purple-800/40 px-1.5 py-0.5 rounded">
                        {word.level}
                      </span>
                      <span className="text-[11px] font-mono text-zinc-500 uppercase">
                        {word.theme}
                      </span>
                    </div>
                    <span className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {word.term}
                    </span>
                    <span className="text-xs text-zinc-400">{word.translation}</span>
                  </div>

                  <button
                    onClick={() => toggleSaveWord(word.id)}
                    className={`p-2.5 rounded-xl border text-xs font-semibold transition ${
                      isSaved
                        ? 'bg-emerald-950/40 border-emerald-600 text-emerald-400'
                        : 'bg-zinc-800/60 border-zinc-700 text-zinc-300 hover:bg-cyan-500 hover:text-black hover:border-cyan-400'
                    }`}
                    title={isSaved ? 'Rimuovi dal mio vocabolario' : 'Aggiungi al mio vocabolario'}
                  >
                    {isSaved ? '✓ Nel Mazzo' : '+ Aggiungi'}
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