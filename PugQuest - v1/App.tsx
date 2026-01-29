
import React, { useState, useEffect, useCallback } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Landing from './pages/Landing.js';
import Auth from './pages/Auth.js';
import Dashboard from './pages/Dashboard.js';
import CampaignDetail from './pages/CampaignDetail.js';
import ProfileSettings from './pages/ProfileSettings.js';
import { 
  Sword, LogOut, LayoutGrid, Sparkles, Shield, AlertTriangle, 
  Skull, Wand2, BookOpen, Map, Compass, 
  Flame, Ghost, Moon, Sun, Settings
} from 'lucide-react';
import { Store } from './services/store.js';
import { User } from './types.js';
import { Modal } from './components/Modal.js';
import { Button } from './components/Button.js';

const RPG_ICON_MAP: Record<string, any> = {
  Shield, Sword, Wand2, Skull, BookOpen, Map, Compass, Flame, Ghost, Moon, Sun
};

const Navigation: React.FC<{ currentUser: User | null, handleLogout: () => void }> = ({ currentUser, handleLogout }) => {
  const location = useLocation();
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  
  if (location.pathname === '/') return null;

  const userAvatar = currentUser?.avatar || 'Shield';
  const AvatarIcon = RPG_ICON_MAP[userAvatar] || Shield;

  return (
    <>
      <nav className="fixed top-2 md:top-4 left-1/2 -translate-x-1/2 z-50 w-[96%] md:w-[95%] max-w-7xl px-4 md:px-10 py-3 md:py-4 flex justify-between items-center bg-stone-900/85 backdrop-blur-2xl border border-amber-900/30 rounded-[1.5rem] md:rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div 
          className="flex items-center gap-3 md:gap-5 cursor-pointer group"
          onClick={() => window.location.hash = '#/profile'}
        >
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-gradient-to-br from-amber-700/20 to-amber-900/40 flex items-center justify-center shadow-lg border border-amber-500/20 group-hover:scale-110 group-hover:border-amber-500/50 transition-all">
            <AvatarIcon size={20} md={24} className="text-amber-400 animate-float" />
          </div>
          <div className="flex flex-col">
            <span className="hidden sm:block font-medieval text-[8px] md:text-[10px] text-amber-500/60 uppercase tracking-[0.4em] mb-0.5">Caminhante do Reino</span>
            <span className="font-medieval text-sm md:text-xl text-stone-100 tracking-wider group-hover:text-amber-400 transition-colors whitespace-nowrap overflow-hidden text-ellipsis max-w-[120px] sm:max-w-none">
              <span className="hidden md:inline">Bem-vindo, </span><span className="amber-glow">{currentUser?.name || 'Inominado'}</span>
            </span>
          </div>
        </div>

        {currentUser && (
          <div className="flex items-center gap-2 md:gap-8">
            <div 
              className="flex items-center gap-2 md:gap-3 text-stone-300 hover:text-amber-400 transition-all cursor-pointer group px-3 py-2 md:px-5 md:py-2.5 rounded-xl md:rounded-2xl hover:bg-amber-500/10 border border-transparent hover:border-amber-500/20" 
              onClick={() => window.location.hash = '#/dashboard'}
            >
              <LayoutGrid size={18} md={22} className="group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline text-sm md:text-lg font-medieval uppercase tracking-[0.2em]">Grimório</span>
            </div>
            
            <div 
              className="hidden sm:flex flex-col items-end border-r border-amber-900/30 pr-4 md:pr-8 mr-1 md:mr-2 cursor-pointer group"
              onClick={() => window.location.hash = '#/profile'}
            >
              <span className="text-sm md:text-lg text-stone-100 font-medieval uppercase tracking-widest leading-tight group-hover:text-amber-400 transition-colors">{currentUser.name}</span>
              <div className="hidden md:flex items-center gap-2 text-stone-500 font-story tracking-wider uppercase group-hover:text-amber-500/60 transition-colors">
                <span className="text-xs">Configurar Alma</span>
                <Settings size={10} />
              </div>
            </div>

            <button 
              onClick={() => setIsLogoutModalOpen(true)}
              className="p-2 md:p-3 text-stone-500 hover:text-red-400 transition-all rounded-xl md:rounded-2xl hover:bg-red-500/10 border border-transparent hover:border-red-900/20 group"
              title="Abandonar Missão"
            >
              <LogOut size={18} md={22} className="group-hover:-translate-x-1 transition-transform" />
            </button>
          </div>
        )}
      </nav>

      <Modal isOpen={isLogoutModalOpen} onClose={() => setIsLogoutModalOpen(false)} title="Romper Vínculo?" size="md">
        <div className="flex flex-col items-center text-center py-2 md:py-4">
          <div className="w-16 h-16 md:w-20 md:h-20 bg-red-950/30 border border-red-500/30 rounded-full flex items-center justify-center mb-6 md:mb-8 shadow-[0_0_30px_rgba(239,68,68,0.1)]">
            <AlertTriangle size={32} md={40} className="text-red-500 animate-pulse" />
          </div>
          <h4 className="font-medieval text-lg md:text-xl text-stone-100 mb-4 uppercase tracking-widest">Deseja realmente abandonar a jornada?</h4>
          <p className="font-story text-stone-400 text-base md:text-lg mb-8 md:mb-10 px-2 md:px-4">Suas crônicas serão fechadas e sua alma desconectada do grimório.</p>
          <div className="flex flex-col w-full gap-4">
            <Button variant="danger" size="lg" fullWidth onClick={() => { setIsLogoutModalOpen(false); handleLogout(); }}>Abandonar Missão</Button>
            <Button variant="secondary" size="md" fullWidth onClick={() => setIsLogoutModalOpen(false)}>Permanecer no Reino</Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

const AppContent: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const location = useLocation();

  const fetchUser = useCallback(async () => {
    try {
      const user = await Store.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error("Erro nos oráculos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
    // Escuta tanto storage quanto eventos customizados
    window.addEventListener('storage', fetchUser);
    window.addEventListener('profileUpdate', fetchUser);
    return () => {
      window.removeEventListener('storage', fetchUser);
      window.removeEventListener('profileUpdate', fetchUser);
    };
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await Store.signOut();
    } catch (e) {}
    setCurrentUser(null);
    window.location.hash = '#/';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center">
        <div className="w-24 h-24 border-2 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
        <p className="mt-10 font-medieval text-amber-500 text-xl tracking-[0.4em] uppercase amber-glow animate-pulse">Invocando Crônicas</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen selection:bg-amber-600 selection:text-white">
      <Navigation currentUser={currentUser} handleLogout={handleLogout} />
      <main className={location.pathname === '/' ? '' : 'pt-24 md:pt-32'}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/register" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/campaign/:id" element={<CampaignDetail />} />
          <Route path="/profile" element={<ProfileSettings />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => (
  <HashRouter>
    <AppContent />
  </HashRouter>
);

export default App;
