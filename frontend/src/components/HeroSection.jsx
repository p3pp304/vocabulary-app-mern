import hero from '../assets/hero.png'; // aggiusta il percorso relativo in base alla tua cartella
import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-zinc-100 py-8 lg:py-15 px-6">
      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
      
        {/* Colonna Testuale / Call To Action */}
        <div className="flex-1 text-center lg:text-left space-y-6 gap-10">
          <div className='flex flex-col lg:flex-row gap-2 items-center whitespace-nowrap'>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/70 border border-blue-800/50 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Nuova esperienza di apprendimento
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/70 border border-blue-800/50 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Flashcard interattive
            </div>
            <div className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/70 border border-blue-800/50 text-blue-300">
              <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
              Vocabolario per ogni lingua
            </div>
          </div>
          
          <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fai crescere il tuo vocabolario, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              ramo dopo ramo.
            </span>
          </h1>

          <p className="text-zinc-400 text-base lg:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Memorizza vocaboli in modo intuitivo, traccia i tuoi progressi e sviluppa radici solide nella padronanza linguistica con la possibilità di creare diversi vocabolari per ogni lingua.
          </p>

          <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              type="button"
              className="w-full lg:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-blue-600/25 transition duration-200"
            >
              Registrati subito gratis
            </button>
          </div>

          {/* Social Proof / Statistiche rapide */}
          <div className="pt-6 grid grid-cols-3 gap-4 border-t border-zinc-800/80 max-w-md mx-auto lg:mx-0">
            <div>
              <p className="text-2xl font-bold text-white">5k+</p>
              <p className="text-xs text-zinc-500">Parole attive</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">100%</p>
              <p className="text-xs text-zinc-500">Personalizzato</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">Flash</p>
              <p className="text-xs text-zinc-500">Ripetizione rapida</p>
            </div>
          </div>
        </div>

        {/* Colonna Visual / Logo in evidenza */}
        <div className="flex-1">
            <div className="relative bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm p-6 rounded-3xl flex flex-col items-center shadow-2xl">
              <img
                src={hero}
                alt="Simbolo Vocably - Albero della conoscenza"
                className="w-full max-w-2xl h-auto object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <div className="mt-4 text-center">
                <span className="text-xs uppercase tracking-widest text-amber-400/80 font-mono">Vocably Tree</span>
                <p className="text-sm text-zinc-400 mt-1">Coltiva la tua conoscenza ogni giorno</p>
              </div>
            </div>
        </div>

      </div>
    </section>
  );
}