import React, { useState } from "react";

export default function NavbarDashboard({
  selectedLang,
  setSelectedLang,
  LANGUAGES,
  activeTab,
  setActiveTab,
  deckCount = 0,
  onAddWord, // Funzione che aggiorna wordsList in Dashboard
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6 w-full">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Dashboard di Studio
          </span>

          {/* Pulsanti per il cambio tab */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => setActiveTab("explore")}
              className={`text-sm md:text-base font-semibold pb-1.5 border-b-2 transition-all ${
                activeTab === "explore"
                  ? "border-cyan-400 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Esplora Catalogo
            </button>

            <button
              onClick={() => setActiveTab("deck")}
              className={`text-sm md:text-base font-semibold pb-1.5 border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "deck"
                  ? "border-cyan-400 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <span>Il tuo Mazzo</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono bg-zinc-800 text-cyan-400 border border-zinc-700">
                {deckCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("flashcards")}
              className={`text-sm md:text-base font-semibold pb-1.5 border-b-2 transition-all ${
                activeTab === "flashcards"
                  ? "border-cyan-400 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              Flashcard
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Selettore lingua */}
          <div className="relative">
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="appearance-none bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 text-zinc-200 text-sm font-medium py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:border-cyan-400 cursor-pointer shadow-sm transition"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-zinc-900 text-zinc-200">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-zinc-400">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>

          {/* Pulsante apertura modale */}
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-black font-semibold text-sm hover:brightness-110 transition shadow-lg shadow-cyan-500/20 active:scale-95 whitespace-nowrap"
          >
            <span>+ Aggiungi Parola</span>
          </button>
        </div>
      </header>

      {/* Modale integrato direttamente nella Navbar */}
      <AddWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWord={onAddWord}
        defaultLang={selectedLang}
      />
    </>
  );
}