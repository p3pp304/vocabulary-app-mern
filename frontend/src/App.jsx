import { useState } from 'react';
import Navbar from './components/Navbar';
import HeroSection from './components/HeroSection';

function App() {
  // Stato utente mock per testare la Navbar (imposta a null per vedere lo stato 'disconnesso')
  const [user, setUser] = useState({ name: 'Giuseppe', email: 'test@example.com' });

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <HeroSection></HeroSection>
    </div>
    
  );
}

export default App;