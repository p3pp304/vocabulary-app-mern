import React, { useState } from 'react';
import NavbarDashboard from './Navbar-Dashboard'; // Parentesi graffe per export nominato
import ExploreView from './ExploreView';
import { LANGUAGES, INITIAL_WORDS } from '../vocabularyData';
import AddWordModal from './AddWordModal';
import MyDeck from './MyDeck';

export default function Dashboard({ user }) {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedLang, setSelectedLang] = useState('en');
  const [wordsList, setWordsList] = useState(INITIAL_WORDS);
  const [mySavedWords, setMySavedWords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')

  // Aggiungi / Rimuovi dal mazzo
  const toggleSaveWord = (id) => {
    setMySavedWords((prev) =>
      prev.includes(id) ? prev.filter((wordId) => wordId !== id) : [...prev, id]
    );
  };

  // Creazione nuova parola dal modale
  const handleAddWord = (newWord) => {
    setWordsList((prev) => [newWord, ...prev]);
    setMySavedWords((prev) => [...prev, newWord.id]);

    // Se la lingua inserita è diversa da quella attiva, sposta la vista
    if (newWord.lang !== selectedLang) {
      setSelectedLang(newWord.lang);
    }
  };

  const savedCount = wordsList.filter(
    (w) => w.lang === selectedLang && mySavedWords.includes(w.id)
  ).length;

  return (
    <div className="p-6 lg:p-10 flex flex-col items-center">
      <div className="w-full max-w-6xl flex flex-col gap-8">
        
        {/* Navbar interna */}
        <NavbarDashboard
        selectedLang={selectedLang}
        setSelectedLang={setSelectedLang}
        LANGUAGES={LANGUAGES}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        deckCount={savedCount}
        onAddWord={handleAddWord}
        onOpenAddModal={()=> setIsModalOpen(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        />

        {/* Vista Catalogo Esplora */}
        {activeTab === 'explore' && (
          <ExploreView
            selectedLang={selectedLang}
            wordsList={wordsList}
            mySavedWords={mySavedWords}
            toggleSaveWord={toggleSaveWord}
            searchQuery={searchQuery}
          />
        )}

        {/* Vista Il Tuo Mazzo */}
        {activeTab === 'deck' && (
          <MyDeck
            selectedLang={selectedLang}
            mySavedWords={mySavedWords}
            toggleSaveWord={toggleSaveWord}
            wordsList={wordsList}
            searchQuery={searchQuery}
          />
        )}

        {/* Vista Flashcard (placeholder per il prossimo step) */}
        {activeTab === 'flashcards' && (
          <div className="p-8 text-center bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl text-zinc-400">
            Sezione Flashcard in arrivo.
          </div>
        )}
        
      </div>
      <AddWordModal
            isOpen={isModalOpen}
            onClose={()=> setIsModalOpen(false)}
            onAddWord={handleAddWord}
            selectedLang={selectedLang}
        />

    </div>
  );
}