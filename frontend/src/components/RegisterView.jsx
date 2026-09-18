import React from 'react';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

export default function RegisterView() {

  const navigate = useNavigate();
  const {signup, isLoading, error, clearError} = useAuth();

  const [formData, setFormData] = useState({
    username: '',
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
      await signup(formData.username, formData.email, formData.password);
      navigate('/', { replace: true });
    } catch {
      // L'errore è già impostato nel context e visibile a schermo
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#070709] text-zinc-100 flex items-start justify-center p-4 relative overflow-hidden">

      {/* Card principale */}
      <div className=" relative w-full max-w-md bg-zinc-900/50 border border-white/50 rounded-3xl p-8 flex flex-col">
        
        {/* Brand & Intestazione */}
        <div className="text-center mb-8">
          <h1 className="text-xl font-semibold text-white mt-2">Crea il tuo account</h1>
          <p className="text-sm text-zinc-400 mt-1">Inizia a memorizzare i vocaboli senza sforzo</p>
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
              Username
            </label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="mario01"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="nome@esempio.com"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white transition-all duration-200"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-zinc-400">
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Minimo 8 caratteri"
              className="w-full px-4 py-3 bg-zinc-950/70 border border-zinc-800 rounded-xl text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-white transition-all duration-200"
            />
          </div>

          {/* Bottone Neon */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-3 w-full py-3.5 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-bold rounded-xl text-sm transition-all duration-200 cursor-pointer"
          >
            {isLoading ? 'Registrazione in corso...' : 'Inizia Ora'}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
          Hai già un profilo attivo?{' '}
          <Link to="/login" className="text-purple-400 font-semibold hover:text-purple-300 transition-colors">
            Accedi
          </Link>
        </div>
      </div>
    </div>
  );
}