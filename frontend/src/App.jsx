import React, { useEffect } from 'react';
import Navbar from './components/Navbar';
import ChatDrawer from './components/ChatDrawer';
import Home from './pages/Home';
import GameArena from './pages/GameArena';
import Profile from './pages/Profile';
import AIStudio from './pages/AIStudio';
import BattleLobby from './pages/BattleLobby';
import Leaderboard from './pages/Leaderboard';
import Auth from './pages/Auth';
import Admin from './pages/Admin';

function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/puzzle.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <>
      <Navbar />
      <main className="container">
        <Home />
        <GameArena />
        <Profile />
        <AIStudio />
        <BattleLobby />
        <Leaderboard />
        <Auth />
        <Admin />
        
        <ChatDrawer />
        
        <button id="chatToggleBtn" className="chat-toggle-btn glass pulse-idle">
            <span className="btn-icon">💬</span> Sohbet & Ses
            <span className="badge" id="chatBadge">0</span>
        </button>
      </main>
    </>
  );
}

export default App;
