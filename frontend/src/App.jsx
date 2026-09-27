import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import Dashboard from './components/Dashboard';
import WordDetailView from './components/WordDetailView';
import { useAuth } from './store/AuthContext';

// Componente Wrapper per le Rotte Protette
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
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
                  <Dashboard defaultTab="explore" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/deck"
              element={
                <ProtectedRoute>
                  <Dashboard defaultTab="deck" />
                </ProtectedRoute>
              }
            />
            <Route
              path="/flashcards"
              element={
                <ProtectedRoute>
                  <Dashboard defaultTab="flashcards" />
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
      </div>
    </BrowserRouter>
  );
}