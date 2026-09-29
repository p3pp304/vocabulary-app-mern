import { useState, useEffect } from "react";
import {
  getFlashcards,
  saveFlashcardSessionScore,
  submitFlashcardReview,
} from "../services/flashcardService";

export default function FlashcardView({ selectedLang }) {
  const [cards, setCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [sessionScore, setSessionScore] = useState(null);
  const [scoreSaveError, setScoreSaveError] = useState(null);

  const supportsSpeech =
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window;

  const loadCards = async () => {
    setLoading(true);
    setError(null);
    setSessionCompleted(false);
    setCurrentIndex(0);
    setIsFlipped(false);
    setCorrectAnswers(0);
    setSessionScore(null);
    setScoreSaveError(null);

    try {
      const data = await getFlashcards(selectedLang);
      setCards(data || []);
    } catch (err) {
      setError(err.message || "Errore nel recupero delle flashcard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCards();
  }, [selectedLang]);

  const currentCard = cards[currentIndex];

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!supportsSpeech || !currentCard?.parola) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentCard.parola);
    utterance.lang = currentCard.lingua || selectedLang || "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleReview = async (remembered) => {
    if (!currentCard || submitting) return;

    setSubmitting(true);
    try {
      await submitFlashcardReview(currentCard.deckItemId, remembered);
      const nextCorrectAnswers = correctAnswers + (remembered ? 1 : 0);
      setCorrectAnswers(nextCorrectAnswers);

      setIsFlipped(false);

      if (currentIndex + 1 < cards.length) {
        // Breve ritardo per attendere il reset dell'animazione di flip
        setTimeout(() => {
          setCurrentIndex((prev) => prev + 1);
        }, 150);
      } else {
        const finalScore = Math.round((nextCorrectAnswers / cards.length) * 100);
        setSessionScore(finalScore);

        try {
          await saveFlashcardSessionScore({
            correctAnswers: nextCorrectAnswers,
            totalCards: cards.length,
            lingua: selectedLang,
          });
        } catch (scoreError) {
          setScoreSaveError(scoreError.message || "Punteggio non salvato nelle statistiche.");
        }

        setSessionCompleted(true);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Errore durante il salvataggio.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 text-zinc-500 font-mono text-sm animate-pulse">
        Caricamento sessione flashcard...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-950/20 border border-red-900/40 rounded-3xl max-w-md mx-auto flex flex-col gap-4 text-red-400">
        <p className="text-sm font-medium">{error}</p>
        <button
          onClick={loadCards}
          className="self-center px-5 py-2.5 bg-zinc-900 text-zinc-200 rounded-xl text-xs font-mono hover:bg-zinc-800 transition cursor-pointer"
        >
          Riprova
        </button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="max-w-md mx-auto p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-emerald-950/60 border border-emerald-800/50 flex items-center justify-center text-emerald-400 text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">Sessione completata</h2>
        <div className="text-5xl font-black text-emerald-300">{sessionScore}%</div>
        <p className="text-sm text-zinc-300">
          Ricordate {correctAnswers} su {cards.length} parole
        </p>
        {scoreSaveError && (
          <p role="status" className="text-xs text-amber-300">
            Punteggio non aggiunto alla media: {scoreSaveError}
          </p>
        )}
        <button
          onClick={loadCards}
          className="mt-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer"
        >
          Ricarica Flashcard
        </button>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="max-w-md mx-auto p-8 bg-zinc-900/50 border border-zinc-800 rounded-3xl text-center flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-cyan-950/60 border border-cyan-800/50 flex items-center justify-center text-cyan-400 text-2xl">
          ✓
        </div>
        <h2 className="text-xl font-bold text-white">Nessun ripasso in programma</h2>
        <p className="text-xs whitespace-pre-line text-zinc-400 leading-relaxed max-w-xs">
          Non hai vocaboli da ripassare al momento per questa lingua. Inserisci altri vocaboli nel tuo mazzo per continuare ad esercitarti!
        </p>
        <button
          onClick={loadCards}
          className="mt-2 px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold tracking-wide transition cursor-pointer"
        >
          Ricarica Flashcard
        </button>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + 1) / cards.length) * 100);

  return (
    <div className="max-w-xl mx-auto w-full flex flex-col gap-6 text-zinc-100 select-none pb-8">
      {/* Header sessione: progresso */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>
            Carta {currentIndex + 1} di {cards.length}
          </span>
          <span className="text-cyan-400">{progressPercent}%</span>
        </div>
        <div className="w-full h-1.5 bg-zinc-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* FLASHCARD INTERATTIVA (Touch & Click) */}
      <div
        onClick={() => setIsFlipped((prev) => !prev)}
        className="w-full min-h-[320px] sm:min-h-[360px] p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800/80 hover:border-zinc-700 transition-all shadow-2xl flex flex-col justify-between cursor-pointer relative"
      >
        {/* Intestazione card: badge e audio */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-purple-400 bg-purple-950/50 border border-purple-800/50 px-2.5 py-0.5 rounded-lg">
              {currentCard.livello}
            </span>
            {currentCard.tema && (
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">
                {currentCard.tema}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSpeak}
            disabled={!supportsSpeech}
            className="p-2 rounded-xl border border-zinc-800 text-cyan-300 hover:border-cyan-500 hover:bg-cyan-950/40 cursor-pointer disabled:opacity-40"
            title="Ascolta pronuncia"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          </button>
        </div>

        {/* Contenuto Card (Fronte / Retro) */}
        {!isFlipped ? (
          /* FRONTE: Vocabolo */
          <div className="flex flex-col items-center justify-center text-center my-auto py-8">
            <h2 className="text-3xl sm:text-4xl font-extrabold capitalize text-white tracking-tight">
              {currentCard.parola}
            </h2>
            {currentCard.pronuncia && (
              <span className="text-xs font-mono text-zinc-500 mt-2">
                /{currentCard.pronuncia}/
              </span>
            )}
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wider mt-6">
              Tocca la carta per scoprire la traduzione
            </span>
          </div>
        ) : (
          /* RETRO: Traduzioni affiancate & Note */
          <div className="flex flex-col gap-4 my-auto py-4">
            <div className="flex flex-col gap-2">
              {currentCard.traduzioneBase && (
                <div className="p-3 bg-zinc-950/60 border border-zinc-800/80 rounded-xl flex items-baseline gap-2">
                  <span className="text-[10px] font-mono uppercase text-zinc-500 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded">
                    Base
                  </span>
                  <span className="text-sm font-semibold text-zinc-200">
                    {currentCard.traduzioneBase}
                  </span>
                </div>
              )}

              {currentCard.traduzionePersonale && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-800/50 rounded-xl flex items-baseline gap-2">
                  <span className="text-[10px] font-mono uppercase text-cyan-400 bg-cyan-950 border border-cyan-800 px-1.5 py-0.5 rounded">
                    Personale
                  </span>
                  <span className="text-sm font-semibold text-cyan-200">
                    {currentCard.traduzionePersonale}
                  </span>
                </div>
              )}

              {!currentCard.traduzioneBase && !currentCard.traduzionePersonale && (
                <div className="text-center text-lg font-bold text-white">
                  {currentCard.traduzione}
                </div>
              )}
            </div>

            {currentCard.note && (
              <p className="text-xs text-zinc-400 bg-zinc-950/40 p-3 rounded-xl border border-zinc-800/50 leading-relaxed italic">
                "{currentCard.note}"
              </p>
            )}
          </div>
        )}

        {/* Footer card: indicatore ripetizioni */}
        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-zinc-800/60">
          <span>Stato: {currentCard.stato}</span>
          <span>Livello SRS: {currentCard.ripetizioni}</span>
        </div>
      </div>

      {/* PULSANTI DI RISPOSTA SRS (Attivi solo dopo aver voltato la carta) */}
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          disabled={!isFlipped || submitting}
          onClick={() => handleReview(false)}
          className="min-h-[50px] flex items-center justify-center gap-2 rounded-2xl bg-red-950/30 hover:bg-red-900/50 border border-red-900/50 text-red-300 font-semibold text-xs transition active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Non ricordata (Ripeti)</span>
        </button>

        <button
          type="button"
          disabled={!isFlipped || submitting}
          onClick={() => handleReview(true)}
          className="min-h-[50px] flex items-center justify-center gap-2 rounded-2xl bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-900/50 text-emerald-300 font-semibold text-xs transition active:scale-95 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed shadow-lg shadow-emerald-950/30"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
          <span>Ricordata (Buono)</span>
        </button>
      </div>
    </div>
  );
}