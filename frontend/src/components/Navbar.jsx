import logo from '../assets/logo.png'; // Aggiusta il percorso in base alla tua cartella

export default function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Brand */}
        <a href="/" className="flex items-center gap-3 group focus:outline-none">
          <div className="relative flex items-center justify-center">
            <div className="absolute -inset-1 rounded-lg bg-blue-500/20 blur opacity-0 group-hover:opacity-100 transition duration-300" />
            <img 
              src={logo} 
              alt="Logo Vocably" 
              className="relative h-9 w-9 object-contain transform group-hover:scale-105 transition duration-200" 
            />
          </div>
          <span className="font-bold text-lg text-zinc-100 tracking-tight group-hover:text-white transition">
            Vocably
          </span>
        </a>

        {/* Azioni Utente */}
        <div className="flex items-center gap-3 text-sm">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800">
                <div className="w-6 h-6 rounded-full bg-blue-600/30 text-blue-400 flex items-center justify-center text-xs font-semibold uppercase">
                  {user.name ? user.name.charAt(0) : 'U'}
                </div>
                <span className="text-zinc-300 text-xs font-medium pr-1">
                  {user.name || 'Utente'}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="text-zinc-400 hover:text-red-400 hover:bg-red-950/30 px-3 py-1.5 rounded-lg border border-transparent hover:border-red-900/40 transition duration-150 text-xs font-medium"
              >
                Esci
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                className="text-zinc-300 hover:text-white px-3 py-1.5 text-sm font-medium transition duration-150"
              >
                Accedi
              </button>
              <button
                type="button"
                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-md shadow-blue-600/20 hover:shadow-blue-600/30 transition duration-150 active:scale-95"
              >
                Registrati
              </button>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}