import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView'; // Corretto il refuso 'RegistrerView'
import Dashboard from './components/Dashboard';

export default function App() {
  // Stato utente mock (null = disconnesso)
  const [user, setUser] = useState({ name: 'Giuseppe', email: 'test@example.com' });

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col">
        <Navbar user={user} onLogout={handleLogout} />
        
        <Routes>
          {/* Rotta principale: Landing per ospiti, Dashboard per autenticati */}
          <Route
            path="/"
            element={
              <main className="flex-1 w-full">
                {!user ? <HeroSection /> : <Dashboard user={user} />}
              </main>
            }
          />

          {/* Rotte di autenticazione */}
          <Route path="/login" element={<LoginView />} />
          <Route path="/register" element={<RegisterView />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}