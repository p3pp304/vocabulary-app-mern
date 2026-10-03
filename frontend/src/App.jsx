import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import Dashboard from './components/Dashboard';
import WordDetailView from './components/WordDetailView';
import InstallPrompt from './components/InstallPrompt';
import { useAuth } from './store/AuthContext';

// Componente Wrapper per le Rotte Protette
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function AppFooter() {
  const { pathname } = useLocation();
  const isDashboardRoute = ['/dashboard', '/deck', '/flashcards'].includes(pathname);

  return (
    <footer className={`${isDashboardRoute ? 'hidden md:block' : ''} w-full border-t border-zinc-800/80 px-4 py-5 text-center text-xs text-zinc-500`}>
      <p className="flex flex-col items-center gap-1 sm:flex-row sm:justify-center sm:gap-0">
        <span>&copy; {new Date().getFullYear()} Vocably. Tutti i diritti riservati.</span>
        <span className="hidden sm:inline sm:mx-2 text-zinc-700">|</span>
        <span>Created by <span className="text-zinc-300">Giuseppe Fuzio</span></span>
      </p>
    </footer>
  );
}

export default function App() {
  const { user, fetchingUser } = useAuth();

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
        <InstallPrompt />
        <Navbar />

        <main className="flex-1 w-full">
          <Routes>
            {/* Landing: Guest vede Hero, Utente loggato reindirizzato alla Dashboard */}
            <Route
              path="/"
              element={!user ? <HeroSection /> : <Navigate to="/dashboard" replace />}
            />

            {/* Auth Routes */}
            <Route
              path="/login"
              element={!user ? <LoginView /> : <Navigate to="/dashboard" replace />}
            />
            <Route
              path="/register"
              element={!user ? <RegisterView /> : <Navigate to="/dashboard" replace />}
            />

            {/* Rotte Applicazione (Protette) */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard currentTab="explore" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deck"
              element={
                <ProtectedRoute>
                  <Dashboard currentTab="deck" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <Dashboard currentTab="flashcards" />
                </ProtectedRoute>
              }
            />

            {/* Rotta Dedicata per il Dettaglio Parola */}
            <Route
              path="/words/:id"
              element={
                <ProtectedRoute>
                  <WordDetailView />
                </ProtectedRoute>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <AppFooter />
      </div>
    </BrowserRouter>
  );
}