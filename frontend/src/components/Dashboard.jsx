import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarDashboard from "./Navbar-Dashboard";
import ExploreView from "./ExploreView";
import MyDeck from "./MyDeck";
import FlashcardView from "./FlashcardView";
import AddWordModal from "./AddWordModal";
import { LANGUAGES } from "../vocabularyData";
import {
  getMyDeck,
  addWordToDeck,
  removeWordFromDeck,
  createCustomDeckWord,
} from "../services/deckService";

export default function Dashboard({ currentTab = "explore" }) {
  const getSavedLang = () => {
    if (typeof window === "undefined") return "en";

    const saved = window.localStorage.getItem("selectedLang");
    return saved && LANGUAGES.some((lang) => lang.id === saved) ? saved : "en";
  };

  const [selectedLang, setSelectedLang] = useState(() => getSavedLang());
  // Memorizziamo gli elementi del mazzo con la loro struttura completa
  const [userDeck, setUserDeck] = useState([]);
  const [isDeckLoading, setIsDeckLoading] = useState(true);
  const [deckError, setDeckError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Caricamento mazzo tramite la funzione di servizio
  const fetchUserDeck = async (lang = selectedLang) => {
    setDeckError(null);
    try {
      const data = await getMyDeck(lang);
      setUserDeck(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Impossibile recuperare il mazzo:", err);
      setDeckError(err.message || "Impossibile caricare il mazzo.");
    } finally {
      setIsDeckLoading(false);
    }
  };

  useEffect(() => {
    fetchUserDeck(selectedLang);
  }, [selectedLang]);

  // Lista di ID usata da ExploreView per sapere se la card ha l'icona "salvata"
  const savedWordIds = userDeck.map((item) => {
    if (item.wordId) {
      return String(item.wordId);
    }
    return String(item.deckItemId);
  });

  const handleTabChange = (newTab) => {
    if (newTab === "explore") {
      navigate("/dashboard");
    } else if (newTab === "deck") {
      navigate("/deck");
    } else if (newTab === "flashcards") {
      navigate("/flashcards");
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("selectedLang", selectedLang);
    }
  }, [selectedLang]);

  const handleLangChange = (newLang) => {
    setSelectedLang(newLang);
  };

  const handleSelectWord = (id) => {
    if (id && id !== "undefined") {
      navigate(`/words/${id}`);
    }
  };

  // Toggle che risolve SEMPRE il deckItemId corretto per la cancellazione
  const toggleSaveWord = async (targetId) => {
    const strId = String(targetId);

    // Cerca se esiste già nel mazzo (confrontando sia wordId che deckItemId)
    const existingItem = userDeck.find((item) => {
      const wId = item.wordId ? String(item.wordId) : null;
      const dId = String(item.deckItemId);
      return wId === strId || dId === strId;
    });

    if (existingItem) {
      // 1. RIMOZIONE: abbiamo il deckItemId esatto da passare al backend
      const deckItemIdToRemove = existingItem.deckItemId;

      // Aggiornamento ottimistico dell'interfaccia
      setUserDeck((prev) => prev.filter((item) => item.deckItemId !== deckItemIdToRemove));

      try {
        await removeWordFromDeck(deckItemIdToRemove);
      } catch (err) {
        console.error("Errore rimozione:", err);
        // Rollback in caso di fallimento
        setUserDeck((prev) => [...prev, existingItem]);
        alert(err.message || "Operazione non riuscita");
      }
    } else {
      // 2. AGGIUNTA: si tratta di un wordId proveniente dal catalogo di ExploreView
      try {
        await addWordToDeck(strId);
        // Ricarichiamo il mazzo per ottenere il nuovo deckItemId generato da Mongo
        await fetchUserDeck(selectedLang);
      } catch (err) {
        console.error("Errore aggiunta:", err);
        alert(err.message || "Operazione non riuscita");
      }
    }
  };

  const handleAddWord = async (newWordData) => {
    try {
      await createCustomDeckWord(newWordData);
      await fetchUserDeck(selectedLang);

      if (newWordData.lingua && newWordData.lingua !== selectedLang) {
        setSelectedLang(newWordData.lingua);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Errore aggiunta vocabolo:", err);
      alert(err.message || "Errore durante la creazione del vocabolo");
    }
  };

  return (
    <div className="px-6 pt-3 pb-6 sm:pt-6 lg:px-10 lg:pt-4 lg:pb-10 flex flex-col items-center w-full">
      <div className="w-full max-w-6xl flex flex-col gap-4 sm:gap-8">
        <NavbarDashboard
          selectedLang={selectedLang}
          setSelectedLang={handleLangChange}
          LANGUAGES={LANGUAGES}
          activeTab={currentTab}
          setActiveTab={handleTabChange}
          deckCount={userDeck.length}
          onAddWord={handleAddWord}
          onOpenAddModal={() => setIsModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {selectedLang !== "en" && selectedLang !== "es" ? (
          <div className="flex min-h-[40vh] w-full items-center justify-center">
            <h1 className="text-center font-mono text-xl font-semibold uppercase tracking-widest text-zinc-300">
              SEZIONE IN ARRIVO
            </h1>
          </div>
        ) : (
          <>
            {currentTab === "explore" && (
              <ExploreView
                selectedLang={selectedLang}
                mySavedWords={savedWordIds}
                toggleSaveWord={toggleSaveWord}
                searchQuery={searchQuery}
                onSelectWord={handleSelectWord}
              />
            )}

            {currentTab === "deck" && (
              <MyDeck
                selectedLang={selectedLang}
                deckItems={userDeck}
                isLoading={isDeckLoading}
                error={deckError}
                toggleSaveWord={toggleSaveWord}
                searchQuery={searchQuery}
                onSelectWord={handleSelectWord}
              />
            )}

            {currentTab === "flashcards" && (
              <FlashcardView selectedLang={selectedLang} />
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