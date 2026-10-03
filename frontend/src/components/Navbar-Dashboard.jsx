import React from "react";

export default function NavbarDashboard({
  selectedLang,
  setSelectedLang,
  LANGUAGES = [],
  activeTab,
  setActiveTab,
  deckCount = 0,
  onOpenAddModal,
  searchQuery,
  setSearchQuery
}) {
  // Trova l'oggetto della lingua correntemente selezionata
  const currentLangObj = LANGUAGES.find((l) => l.id === selectedLang);

  return (
    <header className="flex flex-col border-b border-zinc-800/80 pb-4 w-full">
      <div className="flex flex-col gap-3 sm:flex-row sm:justify-between w-full sm:items-center">
        {/* Tab di navigazione */}
          <div className="grid w-full grid-cols-3 items-stretch gap-1 sm:flex sm:w-auto sm:items-center sm:gap-10">
          <button
            type="button"
            onClick={() => setActiveTab("explore")}
            className={`flex min-h-12 items-center justify-center px-1 text-sm sm:min-h-0 sm:justify-start sm:px-0 sm:text-base font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "explore"
                ? "border-cyan-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Esplora Catalogo
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("deck")}
            className={`flex min-h-12 items-center justify-center gap-1 px-1 text-sm sm:min-h-0 sm:justify-start sm:px-0 sm:text-base font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "deck"
                ? "border-cyan-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            <span>Il tuo Mazzo</span>
            <span className="px-1 py-0.1 rounded-full text-xs sm:text-sm font-mono bg-zinc-800 text-cyan-400 border border-zinc-700">
              {deckCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("flashcards")}
            className={`flex min-h-12 items-center justify-center px-1 text-sm sm:min-h-0 sm:justify-start sm:px-0 sm:text-base font-semibold pb-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === "flashcards"
                ? "border-cyan-400 text-white"
                : "border-transparent text-zinc-500 hover:text-zinc-300"
            }`}
          >
            Flashcard
          </button>
        </div>
        
        <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-2 sm:flex sm:w-auto sm:justify-end sm:gap-5">
          {/* Barra di Ricerca */}
          <div className="relative col-span-2 w-full sm:col-span-1 sm:w-44 sm:flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-zinc-500 sm:pl-2.5">
              <svg className="w-5 h-5 fill-current sm:w-3.5 sm:h-3.5" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                  clipRule="evenodd"
                />
              </svg>
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cerca termine..."
              className="min-h-12 w-full bg-zinc-900 border border-zinc-800 hover:border-zinc-700 focus:border-cyan-400 rounded-xl py-3 pl-11 pr-3 text-base sm:min-h-0 sm:py-1.5 sm:pl-8 sm:pr-2 sm:text-sm text-zinc-200 placeholder-zinc-500 focus:outline-none transition shadow-sm"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-base text-zinc-500 hover:text-zinc-300 sm:pr-2 sm:text-xs cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>
          
          {/*Bottone Aggiungi parola*/}
          <button
            type='button'
            onClick={()=> onOpenAddModal()}
            className="min-h-12 bg-cyan-700 border text-sm sm:min-h-0 sm:text-sm border-zinc-700/80 hover:border-zinc-500 rounded-xl transition shadow-sm px-3 sm:py-2 sm:px-3 cursor-pointer"
          >
            <span className="text-sm sm:text-base leading-none">
              Aggiungi Parola  {" "}
            </span>
            <span className="">
              +
            </span>
          </button>

          {/* Selettore lingua: solo bandierina su smartphone, bandiera + nome da sm */}
          <div className="relative flex min-h-12 min-w-12 items-center justify-center bg-zinc-900 border border-zinc-700/80 hover:border-zinc-500 rounded-xl transition shadow-sm sm:min-h-0 sm:min-w-0">
            {/* Select invisibile sovrapposta: cattura tocco/click nativo */}
            <select
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.id} value={lang.id} className="bg-zinc-900 text-zinc-200">
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>

            {/* Rendering visivo: bandierina sempre, testo con classe responsive hidden sm:inline */}
            <div className="flex items-center py-1.5 px-1.5 sm:py-2 sm:px-3 sm:gap-2 text-sm sm:text-sm font-medium text-zinc-200 pointer-events-none">
              <span className="text-xl sm:text-base leading-none">
                {currentLangObj?.flag}
              </span>
              <span className="hidden sm:inline">
                {currentLangObj?.label}
              </span>
              <svg
                className="w-4 h-4 fill-current text-zinc-400 ml-0.5 sm:w-3.5 sm:h-3.5"
                viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}