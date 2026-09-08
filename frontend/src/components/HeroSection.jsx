import logo from '../assets/logo.png'; // aggiusta il percorso relativo in base alla tua cartella
import React from 'react';

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-zinc-950 text-zinc-100 py-20 sm:py-28 px-6">
      {/* Effetto luce soffusa sullo sfondo */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 transform blur-3xl opacity-20"
      >
        <div className="aspect-[1155/678] w-[72rem] bg-gradient-to-tr from-blue-600 to-amber-400" />
      </div>

      <div className="max-w-6xl mx-auto flex flex-col-reverse lg:flex-row items-center justify-between gap-12">
        
        {/* Colonna Testuale / Call To Action */}
        <div className="flex-1 text-center lg:text-left space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-blue-950/70 border border-blue-800/50 text-blue-300">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            Nuova esperienza di apprendimento
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Fai crescere il tuo vocabolario, <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-amber-300 bg-clip-text text-transparent">
              ramo dopo ramo.
            </span>
          </h1>

          <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
            Memorizza vocaboli in modo intuitivo, traccia i tuoi progressi e sviluppa radici solide nella padronanza linguistica con percorsi su misura.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
            <button
              type="button"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg shadow-lg shadow-blue-600/25 transition duration-200"
            >
              Inizia subito gratis
            </button>
            <button
              type="button"
              className="w-full sm:w-auto bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-zinc-800 px-6 py-3 rounded-lg font-medium transition duration-200"
            >
              Come funziona
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
        <div className="flex-1 flex justify-center lg:justify-end">
          <div className="relative group">
            {/* Alone luminoso attorno all'albero */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-blue-500/20 to-amber-500/20 blur-2xl group-hover:opacity-100 transition duration-500 opacity-70" />
            
            <div className="relative bg-zinc-900/60 border border-zinc-800 backdrop-blur-sm p-8 sm:p-12 rounded-3xl flex flex-col items-center shadow-2xl">
              <img
                src={logo}
                alt="Simbolo Vocably - Albero della conoscenza"
                className="w-56 h-56 sm:w-72 sm:h-72 object-contain drop-shadow-md hover:scale-105 transition-transform duration-300"
              />
              <div className="mt-4 text-center">
                <span className="text-xs uppercase tracking-widest text-amber-400/80 font-mono">Vocably Tree</span>
                <p className="text-sm text-zinc-400 mt-1">Coltiva la tua conoscenza ogni giorno</p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}