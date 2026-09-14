import React, { useState, useEffect } from "react";
import { LANGUAGES, CEFR_LEVELS, THEMES } from "../vocabularyData";

export default function AddWordModal({ isOpen, onClose, onAddWord, selectedLang }) {
  const [term, setTerm] = useState("");
  const [translation, setTranslation] = useState("");
  const [level, setLevel] = useState("B1");
  const [theme, setTheme] = useState("tech");
  const [lang, setLang] = useState(selectedLang);

  // Sincronizza la lingua con quella attiva nella Dashboard
  useEffect(() => {
    if (isOpen) {
      setLang(selectedLang);
    }
  }, [isOpen, selectedLang]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!term.trim() || !translation.trim()) return;

    onAddWord({
      id: `custom_${Date.now()}`,
      term: term.trim(),
      translation: translation.trim(),
      level,
      theme,
      lang,
    });

    // Reset campi e chiusura
    setTerm("");
    setTranslation("");
    setLevel("B1");
    setTheme("tech");
    onClose();
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      {/* Contenitore modale (stop click per evitare chiusure accidentali) */}
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100"
      >
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Aggiungi Nuova Parola</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Inserisci un termine per il tuo studio.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-zinc-500 hover:text-zinc-300 text-lg leading-none p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Termine */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Termine</label>
            <input
              type="text"
              required
              placeholder="Es. Scalability"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Traduzione */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Traduzione / Significato</label>
            <input
              type="text"
              required
              placeholder="Es. Scalabilità"
              value={translation}
              onChange={(e) => setTranslation(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Lingua */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Lingua</label>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-cyan-400"
            >
              {LANGUAGES.map((l) => (
                <option key={l.id} value={l.id} className="bg-zinc-900 text-zinc-200">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
          </div>

          {/* Livello e Tema */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Livello</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-cyan-400"
              >
                {CEFR_LEVELS.map((lvl) => (
                  <option key={lvl} value={lvl} className="bg-zinc-900 text-zinc-200">
                    {lvl}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Tema</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-cyan-400"
              >
                {THEMES.map((t) => (
                  <option key={t.id} value={t.id} className="bg-zinc-900 text-zinc-200">
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Bottoni Azione */}
          <div className="flex items-center justify-end gap-3 mt-3 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl text-xs transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer"
            >
              Salva Parola
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}