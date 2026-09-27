import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import NavbarDashboard from "./Navbar-Dashboard";
import ExploreView from "./ExploreView";
import MyDeck from "./MyDeck";
import AddWordModal from "./AddWordModal";
import { LANGUAGES } from "../vocabularyData";
import { addWordToDeck, removeWordFromDeck, createCustomDeckWord } from "../services/deckService";
import { API_BASE_URL } from "../services/apiConfig";

export default function Dashboard({ currentTab = "explore" }) {
  const [selectedLang, setSelectedLang] = useState("en");
  const [mySavedWords, setMySavedWords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserDeck = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/deck`, {
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

  // Cambio scheda sincronizzato con gli URL reali
  const handleTabChange = (newTab) => {
    if (newTab === "explore") {
      navigate("/dashboard");
    } else if (newTab === "deck") {
      navigate("/deck");
    }
  };

  const handleLangChange = (newLang) => {
    setSelectedLang(newLang);
  };

  const handleSelectWord = (id) => {
    if (id && id !== "undefined") {
      navigate(`/words/${id}`);
    }
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
    try {
      const data = await createCustomDeckWord(newWordData);
      const rawId = data.id || data.deckItemId || data.item?._id;

      if (rawId) {
        const newId = String(rawId);
        setMySavedWords((prev) => (prev.includes(newId) ? prev : [...prev, newId]));
      }

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
    <div className="p-6 lg:p-10 flex flex-col items-center w-full">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        <NavbarDashboard
          selectedLang={selectedLang}
          setSelectedLang={handleLangChange}
          LANGUAGES={LANGUAGES}
          activeTab={currentTab}
          setActiveTab={handleTabChange}
          deckCount={mySavedWords.length}
          onAddWord={handleAddWord}
          onOpenAddModal={() => setIsModalOpen(true)}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {currentTab === "explore" && (
          <ExploreView
            selectedLang={selectedLang}
            mySavedWords={mySavedWords}
            toggleSaveWord={toggleSaveWord}
            searchQuery={searchQuery}
            onSelectWord={handleSelectWord}
          />
        )}

        {currentTab === "deck" && (
          <MyDeck
            selectedLang={selectedLang}
            mySavedWords={mySavedWords}
            toggleSaveWord={toggleSaveWord}
            searchQuery={searchQuery}
            onSelectWord={handleSelectWord}
          />
        )}

        {currentTab === "flashcards" && (
          <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-400">
            Sezione Flashcard in arrivo.
          </div>
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