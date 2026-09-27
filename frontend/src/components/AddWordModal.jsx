import React, { useState, useEffect } from "react";
import { LANGUAGES, CEFR_LEVELS, THEMES } from "../vocabularyData";

export default function AddWordModal({ isOpen, onClose, onAddWord, selectedLang }) {
  const [parola, setParola] = useState("");
  const [traduzione, setTraduzione] = useState("");
  const [livello, setLivello] = useState("B1");
  const [tema, setTema] = useState("tech");
  const [lingua, setLingua] = useState(selectedLang);
  const [note, setNote] = useState("");
  const [esempi, setEsempi] = useState([""]); // Array di stringhe per gli esempi
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      setLingua(selectedLang);
      setError(null);
    }
  }, [isOpen, selectedLang]);

  if (!isOpen) return null;

  // Gestione dinamica degli input per gli esempi
  const handleExampleChange = (index, value) => {
    const updated = [...esempi];
    updated[index] = value;
    setEsempi(updated);
  };

  const addExampleField = () => {
    setEsempi((prev) => [...prev, ""]);
  };

  const removeExampleField = (index) => {
    setEsempi((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!parola.trim() || !traduzione.trim()) return;

    setLoading(true);
    setError(null);

    // Filtra gli esempi vuoti o con soli spazi
    const cleanEsempi = esempi.map((es) => es.trim()).filter(Boolean);

    try {
      await onAddWord({
        parola: parola.trim(),
        traduzione: traduzione.trim(),
        livello,
        tema,
        lingua,
        note: note.trim() || null,
        esempi: cleanEsempi,
      });

      // Reset del form e chiusura
      setParola("");
      setTraduzione("");
      setLivello("B1");
      setTema("tech");
      setNote("");
      setEsempi([""]);
      onClose();
    } catch (err) {
      setError(err.message || "Errore nel salvataggio della parola");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl p-6 shadow-2xl flex flex-col gap-4 text-zinc-100 max-h-[90vh] overflow-y-auto"
      >
        {/* Header Modale */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h3 className="text-base font-bold text-white">Aggiungi Nuova Parola</h3>
            <p className="text-xs text-zinc-400 mt-0.5">Verrà salvata esclusivamente nel tuo mazzo personale.</p>
          </div>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-zinc-500 hover:text-zinc-300 text-lg leading-none p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-xs text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          {/* Termine */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Termine *</label>
            <input
              type="text"
              required
              placeholder="Es. Scalability"
              value={parola}
              onChange={(e) => setParola(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Traduzione */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Traduzione / Significato *</label>
            <input
              type="text"
              required
              placeholder="Es. Scalabilità"
              value={traduzione}
              onChange={(e) => setTraduzione(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>

          {/* Lingua, Livello e Tema */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Lingua</label>
              <select
                value={lingua}
                onChange={(e) => setLingua(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-300 focus:outline-none focus:border-cyan-400"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.id} value={l.id} className="bg-zinc-900 text-zinc-200">
                    {l.flag} {l.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">Livello</label>
              <select
                value={livello}
                onChange={(e) => setLivello(e.target.value)}
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
                value={tema}
                onChange={(e) => setTema(e.target.value)}
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

          {/* Note Personali */}
          <div>
            <label className="text-xs font-mono uppercase text-zinc-400 mb-1 block">
              Note Personali <span className="text-zinc-600 lowercase font-sans">(opzionale)</span>
            </label>
            <textarea
              rows="2"
              placeholder="Aggiungi una regola mnemonica, contesto d'uso o sfumature..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition resize-none"
            />
          </div>

          {/* Frasi d'Esempio */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-mono uppercase text-zinc-400">
                Frasi di Esempio <span className="text-zinc-600 lowercase font-sans">(opzionale)</span>
              </label>
              <button
                type="button"
                onClick={addExampleField}
                className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition cursor-pointer"
              >
                + Aggiungi Esempio
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {esempi.map((es, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Es. ${idx === 0 ? "The system needs scalability to handle spikes." : "Altro esempio..."}`}
                    value={es}
                    onChange={(e) => handleExampleChange(idx, e.target.value)}
                    className="flex-1 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition"
                  />
                  {esempi.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeExampleField(idx)}
                      className="text-zinc-500 hover:text-red-400 px-2 py-1 text-sm cursor-pointer transition"
                      title="Rimuovi questo esempio"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Bottoni Azione */}
          <div className="flex items-center justify-end gap-3 mt-2 pt-3 border-t border-zinc-800/80">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer disabled:opacity-40"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-cyan-400 hover:bg-cyan-300 text-black font-semibold rounded-xl text-xs transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer disabled:opacity-40"
            >
              {loading ? "Salvataggio..." : "Salva Parola"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}