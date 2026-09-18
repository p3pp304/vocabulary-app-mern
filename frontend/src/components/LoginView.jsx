import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function LoginView() {
  const navigate = useNavigate();
  const { login, isLoading, error, clearError } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData.email, formData.password);
      navigate('/', { replace: true });
    } catch {
      // L'errore viene memorizzato nel context e mostrato a schermo
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070709] text-zinc-100 flex items-start justify-center p-4 relative overflow-hidden">
      
      {/* Card principale */}
      <div className="relative w-full max-w-md bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 flex flex-col mt-12 backdrop-blur-xl">
        
        {/* Brand & Intestazione */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white">Bentornato</h1>
          <p className="text-sm text-zinc-400 mt-1">Accedi per continuare a coltivare il tuo lessico</p>
        </div>

        {/* Banner Errore API */}
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs text-center font-medium">
            {error}
          </div>
        )}

        {/* Campi input */}
        <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              required
              onChange={handleChange}
              placeholder="nome@esempio.com"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-all duration-200"
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
              name="password"
              value={formData.password}
              required
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-cyan-400 transition-all duration-200"
            />
          </div>

          {/* Bottone Neon */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-full py-3.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-black font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer shadow-lg shadow-cyan-500/10"
          >
            {isLoading ? 'Accesso in corso...' : 'Accedi al Profilo'}
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