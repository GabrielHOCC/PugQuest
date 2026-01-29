
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Shield, LogIn, Sparkles, ScrollText, Copy, Check, Key } from 'lucide-react';
import { Store } from '../services/store.js';
import { Campaign, User } from '../types.js';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { Modal } from '../components/Modal.js';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [masterCampaigns, setMasterCampaigns] = useState<Campaign[]>([]);
  const [playerCampaigns, setPlayerCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  
  const [newCampaign, setNewCampaign] = useState({ name: '', description: '' });
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const currentUser = await Store.getCurrentUser();
        if (!currentUser) {
          window.location.hash = '#/login';
          return;
        }
        setUser(currentUser);
        await refreshCampaigns(currentUser.id);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  const refreshCampaigns = async (userId: string) => {
    const { master, player } = await Store.getCampaigns(userId);
    setMasterCampaigns(master);
    setPlayerCampaigns(player);
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    try {
      await Store.createCampaign(newCampaign.name, newCampaign.description, user.id);
      setIsCreateModalOpen(false);
      setNewCampaign({ name: '', description: '' });
      await refreshCampaigns(user.id);
    } catch (e) {
      alert('Erro ao forjar destino.');
    }
  };

  const handleJoinCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !joinCode) return;
    
    setIsJoining(true);
    setJoinError('');
    
    try {
      const campaignId = await Store.joinCampaign(user.id, joinCode.toUpperCase().trim());
      if (campaignId) {
        window.location.hash = `#/campaign/${campaignId}`;
      }
    } catch (err: any) {
      setJoinError(err.message || 'Runa não encontrada ou já vinculada.');
    } finally {
      setIsJoining(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Sparkles className="text-amber-500 animate-spin" size={40} />
        <span className="font-medieval text-amber-500 text-sm tracking-[0.5em] uppercase">Lendo os Oráculos...</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-24 px-4 md:px-12 pt-8 max-w-7xl mx-auto">
      <header className="mb-12 md:mb-16 text-center md:text-left border-b border-amber-900/10 pb-10 md:pb-12">
        <h1 className="text-3xl md:text-6xl font-medieval text-stone-100 mb-4 uppercase tracking-widest amber-glow">Salão de Heróis</h1>
        <p className="text-stone-400 font-story text-base md:text-xl max-w-2xl">Escolha seu caminho no grande livro das eras.</p>
        
        <div className="flex flex-col sm:flex-row gap-4 mt-8 md:mt-10 justify-center md:justify-start">
          <Button onClick={() => setIsCreateModalOpen(true)} className="w-full sm:w-auto">
            <Plus size={18} className="mr-2" /> Forjar Aventura
          </Button>
          <Button variant="secondary" onClick={() => setIsJoinModalOpen(true)} className="w-full sm:w-auto">
            <LogIn size={18} className="mr-2" /> Entrar com Runa
          </Button>
        </div>
      </header>

      <div className="space-y-16 md:space-y-24">
        <section>
          <div className="flex items-center gap-4 mb-8 md:mb-10 group">
            <div className="p-2 bg-amber-900/20 rounded-xl border border-amber-700/30 group-hover:scale-110 transition-transform">
              <Shield className="text-amber-500" size={20} />
            </div>
            <h2 className="text-lg md:text-xl font-medieval text-stone-200 uppercase tracking-widest">Grimórios que Você Mestra</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {masterCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} role="MASTER" />
            ))}
            {masterCampaigns.length === 0 && <EmptyState message="O trono de mestre está vazio..." />}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-8 md:mb-10 group">
            <div className="p-2 bg-blue-900/20 rounded-xl border border-blue-700/30 group-hover:scale-110 transition-transform">
              <Users className="text-blue-500" size={20} />
            </div>
            <h2 className="text-lg md:text-xl font-medieval text-stone-200 uppercase tracking-widest">Caminhos Trilhandos</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {playerCampaigns.map(campaign => (
              <CampaignCard key={campaign.id} campaign={campaign} role="PLAYER" />
            ))}
            {playerCampaigns.length === 0 && <EmptyState message="Nenhuma jornada iniciada..." />}
          </div>
        </section>
      </div>

      {/* Modal de Criação */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Forjar Nova Crônica">
        <form onSubmit={handleCreateCampaign} className="space-y-6 md:space-y-8">
          <div>
            <label className="text-[10px] md:text-xs font-medieval uppercase tracking-widest text-amber-500 mb-2 md:mb-3 block">Título da Saga</label>
            <input required value={newCampaign.name} onChange={e => setNewCampaign({...newCampaign, name: e.target.value})} className="w-full bg-stone-950 border border-amber-900/30 rounded-xl md:rounded-2xl p-4 md:p-5 text-stone-100 focus:border-amber-500 outline-none font-story text-lg md:text-xl shadow-inner" placeholder="Ex: O Retorno do Rei-Bruxo" />
          </div>
          <div>
            <label className="text-[10px] md:text-xs font-medieval uppercase tracking-widest text-amber-500 mb-2 md:mb-3 block">Prefácio do Mundo</label>
            <textarea rows={4} value={newCampaign.description} onChange={e => setNewCampaign({...newCampaign, description: e.target.value})} className="w-full bg-stone-950 border border-amber-900/30 rounded-xl md:rounded-2xl p-4 md:p-5 text-stone-100 focus:border-amber-500 outline-none resize-none font-story text-base md:text-lg shadow-inner" placeholder="Narração curta para os viajantes..." />
          </div>
          <Button fullWidth size="lg" type="submit">Inscrever Destino</Button>
        </form>
      </Modal>

      {/* Modal de Entrada por Código (Runa) */}
      <Modal isOpen={isJoinModalOpen} onClose={() => setIsJoinModalOpen(false)} title="Entrar com Runa" size="md">
        <form onSubmit={handleJoinCampaign} className="space-y-8 md:space-y-10">
          <div className="text-center">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 md:mb-6 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
              <Key className="text-amber-500 animate-float" size={32} />
            </div>
            <p className="text-stone-400 font-story text-base md:text-lg mb-6 md:mb-8">Insira o código sagrado de 6 caracteres fornecido pelo seu mestre para se vincular a este reino.</p>
          </div>

          <div>
            <input 
              required
              value={joinCode}
              onChange={e => setJoinCode(e.target.value)}
              className="w-full bg-stone-950 border-2 border-amber-900/30 rounded-xl md:rounded-2xl p-4 md:p-6 text-center text-3xl md:text-5xl font-mono tracking-[0.3em] md:tracking-[0.4em] text-amber-500 focus:border-amber-500 outline-none transition-all uppercase shadow-inner"
              placeholder="XXXXXX"
              maxLength={6}
            />
          </div>

          {joinError && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }} 
              animate={{ opacity: 1, y: 0 }}
              className="p-3 md:p-4 bg-red-950/20 border border-red-900/30 rounded-xl text-center"
            >
              <p className="text-red-500 text-[10px] md:text-xs font-medieval uppercase tracking-widest">{joinError}</p>
            </motion.div>
          )}

          <Button fullWidth size="lg" type="submit" disabled={isJoining} variant="primary" className="text-base md:text-lg">
            {isJoining ? 'Buscando Runa...' : 'Vincular Alma'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};

const CampaignCard: React.FC<{ campaign: Campaign, role: string }> = ({ campaign, role }) => {
  const [copied, setCopied] = useState(false);
  const [membersCount, setMembersCount] = useState(0);

  useEffect(() => {
    Store.getMembershipCount(campaign.id).then(setMembersCount);
  }, [campaign.id]);

  const copyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(campaign.inviteCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativa': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Finalizada': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    }
  };

  return (
    <Card onClick={() => { window.location.hash = `#/campaign/${campaign.id}`; }} className="!p-0 border-amber-900/10 group h-full">
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[1.4rem]">
        <img src={campaign.imageUrl || `https://picsum.photos/seed/${campaign.id}/800/500`} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110 grayscale-[20%] group-hover:grayscale-0" alt={campaign.name} />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/20 to-transparent" />
        
        <div className="absolute top-3 md:top-4 left-3 md:left-4 flex flex-col gap-1.5 md:gap-2">
          <div className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border backdrop-blur-md text-[8px] md:text-[9px] uppercase font-medieval tracking-widest font-bold ${role === 'MASTER' ? 'bg-amber-950/60 text-amber-400 border-amber-500/30' : 'bg-blue-950/60 text-blue-400 border-blue-500/30'}`}>
            {role === 'MASTER' ? 'Mestre' : 'Viajante'}
          </div>
          <div className={`px-3 md:px-4 py-1 md:py-1.5 rounded-lg md:rounded-xl border backdrop-blur-md text-[8px] md:text-[9px] uppercase font-medieval tracking-widest font-bold ${getStatusColor(campaign.status)}`}>
            {campaign.status}
          </div>
        </div>
      </div>
      <div className="p-6 md:p-8">
        <h3 className="text-xl md:text-2xl font-medieval text-stone-100 mb-3 md:mb-4 uppercase tracking-wide group-hover:text-amber-400 transition-colors leading-tight">
          {campaign.name}
        </h3>
        <p className="text-stone-400 font-story text-sm md:text-[15px] leading-relaxed line-clamp-2 mb-6">
          {campaign.description || "O tomo aguarda sua primeira escrita..."}
        </p>

        <div className="flex items-center justify-between border-t border-white/5 pt-5 md:pt-6">
          <div className="flex items-center gap-2 md:gap-3 text-stone-500 text-[9px] md:text-[11px] font-medieval uppercase tracking-widest">
            <Users size={14} /> {membersCount} {membersCount === 1 ? 'Jogador' : 'Jogadores'}
          </div>
          
          <button 
            onClick={copyCode}
            className="flex items-center gap-1.5 md:gap-2 text-stone-500 hover:text-amber-500 transition-all text-[9px] md:text-[11px] font-medieval uppercase tracking-widest group/btn"
          >
            {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            {campaign.inviteCode}
          </button>
        </div>
      </div>
    </Card>
  );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
  <div className="col-span-full py-12 md:py-20 flex flex-col items-center justify-center bg-stone-900/40 rounded-3xl border border-dashed border-amber-900/20 px-4 text-center">
    <ScrollText className="text-stone-700 mb-4" size={48} />
    <p className="text-stone-500 font-medieval tracking-[0.2em] uppercase text-[10px] md:text-xs">{message}</p>
  </div>
);

export default Dashboard;
