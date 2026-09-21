import React, { useState,useEffect } from 'react';
import NavbarDashboard from './Navbar-Dashboard'; // Parentesi graffe per export nominato
import ExploreView from './ExploreView';
import { LANGUAGES} from '../vocabularyData';
import  {addWordToDeck, removeWordFromDeck} from '../services/deckService'
import AddWordModal from './AddWordModal';
import MyDeck from './MyDeck';

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('explore');
  const [selectedLang, setSelectedLang] = useState('en');
  const [mySavedWords, setMySavedWords] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('')

  // Recupera all'avvio le parole già salvate nel mazzo dell'utente
  useEffect(() => {
    const fetchUserDeck = async () => {
      try {
        const res = await fetch('http://localhost:3000/api/deck', {
          credentials: 'include',
        });
        if (!res.ok) return;
        const data = await res.json();
        // Assume che l'endpoint restituisca una lista o un array di ID/oggetti
        const ids = data.map((w) => String(w.wordId));
        setMySavedWords(ids);
      } catch (err) {
        console.error('Impossibile recuperare il mazzo salvato:', err);
      }
    };

    fetchUserDeck();
  }, []);
  
  // Aggiungi / Rimuovi dal mazzo
    const toggleSaveWord = async (id) => {
      const isAlreadySaved = mySavedWords.includes(id);

      // 1. Aggiornamento Ottimistico
      setMySavedWords((prev) =>
        isAlreadySaved ? prev.filter((wordId) => wordId !== id) : [...prev, id]
      );

      try {
        if (isAlreadySaved) {
          await removeWordFromDeck(id);
        } else {
          await addWordToDeck(id);
        }
      } catch (err) {
        console.error(err);
        // 2. Rollback: usa 'id' (wordId generava il ReferenceError)
        setMySavedWords((prev) =>
          isAlreadySaved ? [...prev, id] : prev.filter((wordId) => wordId !== id)
        );
        alert(err.message || 'Operazione fallita');
      }
    };

  // Creazione nuova parola dal modale
  const handleAddWord = (newItem) => {
    // 1. Estrai l'id univoco (se parola custom, l'id identificativo è _id o deckItemId)
    const targetId = newItem.wordId;

    if (targetId) {
      const idString = String(targetId);

      // Aggiunge l'id evitando eventuali duplicati
      setMySavedWords((prev) =>
        prev.includes(idString) ? prev : [...prev, idString]
      );
    }

    // 2. Controllo della lingua usando coerentemente 'newItem' e 'lingua'
    const itemLang = newItem.lingua;
    if (itemLang && itemLang !== selectedLang) {
      setSelectedLang(itemLang);
    }
  };
  
  const savedCount = mySavedWords.length;

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