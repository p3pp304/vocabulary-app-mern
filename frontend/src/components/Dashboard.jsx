import React, { useState, useEffect } from "react";
import NavbarDashboard from "./Navbar-Dashboard";
import ExploreView from "./ExploreView";
import MyDeck from "./MyDeck";
import WordDetailView from "./WordDetailView";
import AddWordModal from "./AddWordModal";
import { LANGUAGES } from "../vocabularyData";
import { addWordToDeck, removeWordFromDeck, createCustomDeckWord } from "../services/deckService";

export default function Dashboard({ defaultTab = "explore" }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedLang, setSelectedLang] = useState("en");
  const [mySavedWords, setMySavedWords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  // ID della parola aperta nel dettaglio (null se siamo nelle liste)
  const [selectedWordId, setSelectedWordId] = useState(null);

  // Caricamento mazzo per sapere quali parole sono salvate
  useEffect(() => {
    const fetchUserDeck = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/deck", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        
        const ids = data
          .map((w) => {
            const rawId = w.wordId || w.deckItemId || w._id;
            return rawId ? String(rawId) : null;
          })
          .filter(Boolean);

        setMySavedWords(ids);
      } catch (err) {
        console.error("Impossibile recuperare il mazzo:", err);
      }
    };

    fetchUserDeck();
  }, []);

  // Quando l'utente clicca su una scheda nella navbar (Esplora / Mazzo)
  const handleTabChange = (newTab) => {
    setSelectedWordId(null); // Chiude il dettaglio parola
    setActiveTab(newTab);
  };

  const handleLangChange = (newLang) => {
    setSelectedWordId(null);
    setSelectedLang(newLang);
  };

  const toggleSaveWord = async (id) => {
    const strId = String(id);
    const isAlreadySaved = mySavedWords.includes(strId);

    setMySavedWords((prev) =>
      isAlreadySaved ? prev.filter((wordId) => wordId !== strId) : [...prev, strId]
    );

    try {
      if (isAlreadySaved) {
        await removeWordFromDeck(strId);
      } else {
        await addWordToDeck(strId);
      }
    } catch (err) {
      console.error(err);
      setMySavedWords((prev) =>
        isAlreadySaved ? [...prev, strId] : prev.filter((wordId) => wordId !== strId)
      );
      alert(err.message || "Operazione non riuscita");
    }
  };

  const handleAddWord = async (newWordData) => {
    const data = await createCustomDeckWord(newWordData);
    const newId = String(data.id || data.deckItemId || data.item?._id);

    if (newId) {
      setMySavedWords((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
    }

    if (newWordData.lingua && newWordData.lingua !== selectedLang) {
      setSelectedLang(newWordData.lingua);
    }
  };

  return (
    <div className="p-6 lg:p-10 flex flex-col items-center w-full">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        
        {/* 1. QUESTA BARRA RESTA SEMPRE QUI, NON SCOMPARE MAI */}
        <NavbarDashboard
          selectedLang={selectedLang}
          setSelectedLang={handleLangChange}
          LANGUAGES={LANGUAGES}
          activeTab={selectedWordId ? null : activeTab}
          setActiveTab={handleTabChange}
          deckCount={mySavedWords.length}
          onAddWord={handleAddWord}
          onOpenAddModal={() => setIsModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* 2. AREA CONTENUTO: mostra WordDetailView O le viste a elenco */}
        {selectedWordId ? (
          <WordDetailView
            wordId={selectedWordId}
            onBack={() => setSelectedWordId(null)}
            onGoToDeck={() => {
              setSelectedWordId(null);
              setActiveTab("deck");
            }}
            toggleSaveWord={toggleSaveWord}
            isSaved={mySavedWords.includes(String(selectedWordId))}
          />
        ) : (
          <>
            {activeTab === "explore" && (
              <ExploreView
                selectedLang={selectedLang}
                mySavedWords={mySavedWords}
                toggleSaveWord={toggleSaveWord}
                searchQuery={searchQuery}
                onSelectWord={(id) => setSelectedWordId(id)}
              />
            )}

            {activeTab === "deck" && (
              <MyDeck
                selectedLang={selectedLang}
                mySavedWords={mySavedWords}
                toggleSaveWord={toggleSaveWord}
                searchQuery={searchQuery}
                onSelectWord={(id) => setSelectedWordId(id)}
              />
            )}

            {activeTab === "flashcards" && (
              <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-400">
                Sezione Flashcard in arrivo.
              </div>
            )}
          </>
        )}
      </div>

      <AddWordModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddWord={handleAddWord}
        selectedLang={selectedLang}
      />
    </div>
  );
}