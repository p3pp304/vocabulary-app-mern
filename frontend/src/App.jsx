import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import Dashboard from './components/Dashboard';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user, fetchingUser } = useAuth();

  // Schermata di caricamento iniziale mentre si controlla il cookie HTTP-only
  if (fetchingUser) {
    return (
      <div className="min-h-screen bg-[#070709] flex items-center justify-center text-zinc-400 font-mono text-sm">
        Caricamento sessione...
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col">
        {/* Navbar non ha più bisogno di prop drilling: user e logout li prende da useAuth() */}
        <Navbar />

        <Routes>
          {/* Rotta principale: Hero per guest, Dashboard per utenti loggati */}
          <Route
            path="/"
            element={
              <main className="flex-1 w-full">
                {!user ? <HeroSection /> : <Dashboard />}
              </main>
            }
          />

          {/* Se l'utente è già loggato e naviga su /login o /register, viene rimandato alla home */}
          <Route
            path="/login"
            element={!user ? <LoginView /> : <Navigate to="/" replace />}
          />
          <Route
            path="/register"
            element={!user ? <RegisterView /> : <Navigate to="/" replace />}
          />

          {/* Fallback per rotte sconosciute */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}