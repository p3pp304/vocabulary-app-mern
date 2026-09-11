import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/75 backdrop-blur-md">
      {/* Header: h-14*/}
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-2">
        
        {/* Brand */}
        <Link to='/' className="flex items-center">
          <img
            src={logo}
            alt="Vocably Logo"
            className="h-20 w-auto transition duration-200 hover:scale-105 hover:drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]"
          />
        </Link>

        {/* Azioni Utente */}
        <nav className="flex items-center gap-3.5 text-sm">
          {user ? (
            <>
              {/* Badge Utente */}
              <div className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 border border-white/10 bg-white/5 transition cursor-pointer hover:bg-black/10 hover:border-amber-50">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan-500/20 text-[10px] sm:text-xs font-semibold text-cyan-300">
                  {user.name?.charAt(0).toUpperCase() || 'U'}
                </span>
                <span className="text-xs lg:text-sm font-medium text-zinc-300">
                  {user.name || 'Utente'}
                </span>
              </div>

              {/* Tasto Logout */}
              <Link
                to='/'
                onClick={onLogout}
                className="rounded-lg px-2.5 py-1 text-xs lg:text-sm  text-zinc-300 border border-white/10 bg-white/5 transition cursor-pointer hover:bg-black/10 hover:border-amber-50"
              >
                Esci
              </Link>
            </>
          ) : (
            <>
              <Link
                to='/login'
                className="rounded-lg px-3 py-1.5 text-sm font-medium  text-zinc-300 border border-white/10 bg-white/5 transition cursor-pointer hover:bg-black/10 hover:border-amber-50"
              >
                Accedi
              </Link>
              <Link
                to='/register'
                className="rounded-lg px-3 py-1.5 text-sm font-medium  text-zinc-300 border border-white/10 bg-white/5 transition cursor-pointer hover:bg-black/10 hover:border-amber-50"
              >
                Registrati
              </Link>
            </>
          )}
        </nav>

      </div>
    </header>
  );
}