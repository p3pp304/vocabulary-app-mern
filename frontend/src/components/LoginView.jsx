import React from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

export default function LoginView() {
  return (
    <div className="min-h-screen w-full bg-[#070709] text-zinc-100 flex items-start justify-center p-4 relative overflow-hidden">

      {/* Card principale */}
      <div className="relative w-full max-w-md bg-zinc-900/50 border border-white/50 rounded-3xl p-8 flex flex-col">
        
        {/* Brand & Intestazione */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white mt-2">Bentornato</h1>
          <p className="text-sm text-zinc-400 mt-1">Accedi per continuare a coltivare il tuo lessico</p>
        </div>

        {/* Campi input */}
        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              type="email"
              placeholder="nome@esempio.com"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
                Password
              </label>

            </div>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white transition-all duration-200"
            />
            <div className='flex justify-end'>
                <a href="#reset" className="text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors">
                    Password dimenticata?
                </a>    
            </div>       
          </div>

          {/* Bottone Neon */}
          <button
            type="submit"
            className="mt-3 w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer"
          >
            Accedi al Profilo
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Non hai ancora un account?{' '}
          <Link to="/register" className="text-cyan-400 font-semibold hover:text-cyan-300 transition-colors">
            Registrati qui
          </Link>
        </div>
      </div>
    </div>
  );
}