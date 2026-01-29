
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, Map, BookOpen, Skull, Settings, Info as InfoIcon, Swords, 
  ChevronLeft, Sparkles, Shield, Trash2, Eye, EyeOff, Edit2, MapPin, Check,
  Upload, X, Heart, HelpCircle, AlertTriangle, ChevronRight, Compass, Navigation,
  User as UserIcon, Search
} from 'lucide-react';
import { Store } from '../services/store.js';
import { 
  Campaign, User, Membership, Character, 
  Location, Story, Info, Monster, ItemStatus,
  CharacterType, InfoCategory, MonsterDifficulty
} from '../types.js';
import { Button } from '../components/Button.js';
import { Modal } from '../components/Modal.js';

// Importando componentes das abas
import { CharactersTab } from '../components/campaign/CharactersTab.js';
import { LocationsTab } from '../components/campaign/LocationsTab.js';
import { StoriesTab } from '../components/campaign/StoriesTab.js';
import { InfoTab } from '../components/campaign/InfoTab.js';
import { BestiaryTab } from '../components/campaign/BestiaryTab.js';
import { ConfigTab } from '../components/campaign/ConfigTab.js';

type Tab = 'CHARACTERS' | 'LOCATIONS' | 'STORIES' | 'INFO' | 'BESTIARY' | 'CONFIG';

const CampaignDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [membership, setMembership] = useState<Membership | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('CHARACTERS');
  const [copiedId, setCopiedId] = useState(false);

  // States de Dados
  const [members, setMembers] = useState<Membership[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [stories, setStories] = useState<Story[]>([]);
  const [infos, setInfos] = useState<Info[]>([]);
  const [monsters, setMonsters] = useState<Monster[]>([]);

  // States de UI
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMaster = membership?.role === 'MASTER';

  useEffect(() => {
    const init = async () => {
      setIsInitialLoading(true);
      try {
        const currentUser = await Store.getCurrentUser();
        if (!currentUser) { window.location.hash = '#/login'; return; }
        setUser(currentUser);

        if (id) {
          const camp = await Store.getCampaignById(id);
          if (!camp) { window.location.hash = '#/dashboard'; return; }
          setCampaign(camp);

          const mem = await Store.getMembership(currentUser.id, id);
          if (!mem) { window.location.hash = '#/dashboard'; return; }
          setMembership(mem);

          await refreshItems(id);
        }
      } catch (error) {
        console.error("Erro ao carregar crônicas:", error);
      } finally {
        setTimeout(() => setIsInitialLoading(false), 800);
      }
    };
    init();
  }, [id]);

  const refreshItems = async (campId: string) => {
    setIsRefreshing(true);
    try {
      const [chars, locs, stors, infs, mons, currentMembers] = await Promise.all([
        Store.getCharacters(campId).catch(() => []),
        Store.getLocations(campId).catch(() => []),
        Store.getStories(campId).catch(() => []),
        Store.getInfos(campId).catch(() => []),
        Store.getMonsters(campId).catch(() => []),
        Store.getCampaignMembers(campId).catch(() => [])
      ]);
      setCharacters(chars);
      setLocations(locs);
      setStories(stors);
      setInfos(infs);
      setMonsters(mons);
      setMembers(currentMembers);
    } catch (err) {
      console.error("Erro ao sincronizar dados:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedItem((prev: any) => ({ ...prev, imageUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleVisibility = async (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = { ...item, isVisibleToPlayers: !item.isVisibleToPlayers };
    try {
      if (activeTab === 'CHARACTERS') await Store.saveCharacter(updated);
      else if (activeTab === 'LOCATIONS') await Store.saveLocation(updated);
      else if (activeTab === 'STORIES') await Store.saveStory(updated);
      else if (activeTab === 'INFO') await Store.saveInfo(updated);
      else if (activeTab === 'BESTIARY') await Store.saveMonster(updated);
      if (campaign) await refreshItems(campaign.id);
    } catch (err) {
      console.error("Erro ao alterar visibilidade:", err);
    }
  };

  const handleItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    setIsSaving(true);
    try {
      const data = { ...selectedItem, campaignId: campaign.id, createdAt: selectedItem?.createdAt || Date.now() };
      if (activeTab === 'CHARACTERS') await Store.saveCharacter(data);
      else if (activeTab === 'LOCATIONS') await Store.saveLocation(data);
      else if (activeTab === 'STORIES') await Store.saveStory(data);
      else if (activeTab === 'INFO') await Store.saveInfo(data);
      else if (activeTab === 'BESTIARY') await Store.saveMonster(data);
      
      setIsFormOpen(false);
      await refreshItems(campaign.id);
      setShowSuccessToast(true);
      setTimeout(() => setShowSuccessToast(false), 3000);
    } catch (err: any) {
      alert(`Erro ao salvar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!campaign || !itemToDelete) return;
    setIsSaving(true);
    try {
      if (activeTab === 'CHARACTERS') await Store.deleteCharacter(itemToDelete.id);
      else if (activeTab === 'LOCATIONS') await Store.deleteLocation(itemToDelete.id);
      else if (activeTab === 'STORIES') await Store.deleteStory(itemToDelete.id);
      else if (activeTab === 'INFO') await Store.deleteInfo(itemToDelete.id);
      else if (activeTab === 'BESTIARY') await Store.deleteMonster(itemToDelete.id);
      
      await refreshItems(campaign.id);
      setIsDeleteModalOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  const openForm = (item: any = null) => {
    setSelectedItem(item || { 
      name: '', description: '', history: '', imageUrl: '', 
      parentId: '', category: 'Outro', difficulty: 'Médio', 
      isVisibleToPlayers: true, status: ItemStatus.ALIVE, characterType: 'NPC'
    });
    setEditMode(!!item);
    setIsFormOpen(true);
  };

  const copyCode = () => {
    if (!campaign) return;
    navigator.clipboard.writeText(campaign.inviteCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getTabLabel = () => {
    switch(activeTab) {
      case 'CHARACTERS': return 'Personagem';
      case 'LOCATIONS': return 'Local';
      case 'STORIES': return 'História';
      case 'INFO': return 'Informação';
      case 'BESTIARY': return 'Monstro';
      default: return 'Registro';
    }
  };

  const getStatusDisplay = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.ALIVE: return { label: 'Vivo', icon: <Heart size={14} />, color: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' };
      case ItemStatus.DEAD: return { label: 'Perecido', icon: <Skull size={14} />, color: 'bg-red-500/10 border-red-500/30 text-red-400' };
      case ItemStatus.MISSING: return { label: 'Desaparecido', icon: <Search size={14} />, color: 'bg-blue-500/10 border-blue-500/30 text-blue-400' };
      case ItemStatus.UNKNOWN: return { label: 'Desconhecido', icon: <HelpCircle size={14} />, color: 'bg-stone-500/10 border-stone-500/30 text-stone-400' };
      default: return { label: 'Outro', icon: <HelpCircle size={14} />, color: 'bg-stone-500/10 border-stone-500/30 text-stone-400' };
    }
  };

  const getTypeColor = (type?: CharacterType) => {
    if (!type) return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    switch (type) {
      case 'Aliado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Inimigo': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Neutro': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'NPC': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    }
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-stone-950 flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(146,64,14,0.1)_0%,_transparent_70%)]" />
        <div className="relative">
          <div className="w-24 h-24 border-2 border-amber-900/30 border-t-amber-500 rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center"><Sparkles className="text-amber-500 animate-pulse" size={32} /></div>
        </div>
        <p className="font-medieval text-amber-500 text-xl tracking-[0.4em] mt-10 uppercase animate-pulse">Lendo Oráculos...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 px-4 md:px-12 pt-8 overflow-x-hidden relative">
      <AnimatePresence>
        {isRefreshing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed top-24 right-12 z-[60] flex items-center gap-3 bg-stone-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/20 shadow-2xl">
            <Sparkles className="text-amber-500 animate-spin" size={16} />
            <span className="font-medieval text-xs text-amber-500 uppercase tracking-widest">Sincronizando...</span>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessToast && (
          <motion.div initial={{ opacity: 0, y: 50, x: '-50%' }} animate={{ opacity: 1, y: 0, x: '-50%' }} exit={{ opacity: 0, y: 20, x: '-50%' }} className="fixed bottom-12 left-1/2 z-[100] bg-emerald-950/90 backdrop-blur-xl border border-emerald-500/30 px-10 py-5 rounded-2xl shadow-2xl flex items-center gap-5">
            <div className="w-10 h-10 rounded-full bg-emerald-500 flex items-center justify-center shadow-lg"><Check size={22} className="text-white" /></div>
            <div className="flex flex-col"><span className="font-medieval text-emerald-400 text-[10px] uppercase tracking-widest leading-none mb-1">Grimório Atualizado</span><span className="font-story text-stone-100 text-sm">O destino foi registrado com sucesso.</span></div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <button onClick={() => window.location.hash = '#/dashboard'} className="flex items-center gap-2 text-stone-500 hover:text-white transition-all mb-6 group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-[10px] uppercase font-medieval tracking-[0.3em]">Retornar ao Mural</span>
          </button>
          <div className="flex flex-col md:flex-row justify-between items-start gap-8">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-2">
                <h1 className="text-4xl md:text-5xl font-medieval text-amber-100 uppercase tracking-wider amber-glow">{campaign?.name}</h1>
                {isMaster && <div className="px-3 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/30 rounded-lg text-[10px] font-medieval uppercase tracking-widest flex items-center gap-1.5 shadow-sm"><Shield size={11} /> Mestre</div>}
              </div>
              <p className="text-stone-400 text-lg mb-4 leading-relaxed font-story max-w-2xl">{campaign?.description}</p>
              <div className="flex items-center gap-2 text-stone-500 text-[10px] font-medieval uppercase tracking-[0.2em]"><Users size={14} className="text-amber-500/40" /><span>{members.length} jogadores nas crônicas</span></div>
            </div>
          </div>
        </div>

        <div className="flex overflow-x-auto no-scrollbar w-full mb-8 border-b border-white/10">
          <NavTab active={activeTab === 'CHARACTERS'} onClick={() => setActiveTab('CHARACTERS')} icon={<Skull size={14} />} label="Personagens" />
          <NavTab active={activeTab === 'LOCATIONS'} onClick={() => setActiveTab('LOCATIONS')} icon={<Map size={14} />} label="Locais" />
          <NavTab active={activeTab === 'STORIES'} onClick={() => setActiveTab('STORIES')} icon={<BookOpen size={14} />} label="Histórias" />
          <NavTab active={activeTab === 'INFO'} onClick={() => setActiveTab('INFO')} icon={<InfoIcon size={14} />} label="Informações" />
          <NavTab active={activeTab === 'BESTIARY'} onClick={() => setActiveTab('BESTIARY')} icon={<Swords size={14} />} label="Bestiário" />
          {isMaster && <NavTab active={activeTab === 'CONFIG'} onClick={() => setActiveTab('CONFIG')} icon={<Settings size={14} />} label="Configurações" />}
        </div>

        <main className="min-h-[60vh]">
          {activeTab === 'CHARACTERS' && (
            <CharactersTab campaign={campaign!} characters={characters} isMaster={isMaster} onRefresh={() => refreshItems(campaign!.id)} openForm={openForm} openView={(item) => {setSelectedItem(item); setIsViewOpen(true);}} openDelete={(item) => {setItemToDelete(item); setIsDeleteModalOpen(true);}} toggleVisibility={handleToggleVisibility} />
          )}
          {activeTab === 'LOCATIONS' && (
            <LocationsTab campaign={campaign!} locations={locations} isMaster={isMaster} onRefresh={() => refreshItems(campaign!.id)} openForm={openForm} openView={(item) => {setSelectedItem(item); setIsViewOpen(true);}} openDelete={(item) => {setItemToDelete(item); setIsDeleteModalOpen(true);}} toggleVisibility={handleToggleVisibility} />
          )}
          {activeTab === 'STORIES' && (
            <StoriesTab stories={stories} isMaster={isMaster} openForm={openForm} openView={(item) => {setSelectedItem(item); setIsViewOpen(true);}} openDelete={(item) => {setItemToDelete(item); setIsDeleteModalOpen(true);}} toggleVisibility={handleToggleVisibility} />
          )}
          {activeTab === 'INFO' && (
            <InfoTab infos={infos} isMaster={isMaster} openForm={openForm} openView={(item) => {setSelectedItem(item); setIsViewOpen(true);}} openDelete={(item) => {setItemToDelete(item); setIsDeleteModalOpen(true);}} toggleVisibility={handleToggleVisibility} />
          )}
          {activeTab === 'BESTIARY' && (
            <BestiaryTab monsters={monsters} isMaster={isMaster} openForm={openForm} openView={(item) => {setSelectedItem(item); setIsViewOpen(true);}} openDelete={(item) => {setItemToDelete(item); setIsDeleteModalOpen(true);}} toggleVisibility={handleToggleVisibility} />
          )}
          {activeTab === 'CONFIG' && isMaster && (
            <ConfigTab campaign={campaign!} user={user} members={members} isSaving={isSaving} onUpdate={async (data) => { await Store.updateCampaign(campaign!.id, data); await refreshItems(campaign!.id); }} onRemoveMember={async (userId) => { await Store.removeMember(campaign!.id, userId); await refreshItems(campaign!.id); }} onDeleteCampaign={async () => { await Store.deleteCampaign(campaign!.id); window.location.hash = '#/dashboard'; }} copyCode={copyCode} copiedId={copiedId} />
          )}
        </main>
      </div>

      <Modal isOpen={isViewOpen} onClose={() => setIsViewOpen(false)} title={selectedItem?.name || "Registro"} size="xl">
        <div className="flex flex-col gap-8">
          {activeTab === 'LOCATIONS' && selectedItem && (
            <div className="flex justify-between items-center bg-slate-950/40 border border-stone-800 p-4 rounded-2xl mb-2">
              <div className="flex items-center gap-3 text-white font-medieval text-xs uppercase tracking-widest">
                <MapPin size={16} className="text-amber-500" />
                <span>{selectedItem?.name}</span>
              </div>
              
              <div className="relative group min-w-[200px]">
                <select 
                  value={selectedItem?.id}
                  onChange={(e) => {
                    const newLoc = locations.find(l => l.id === e.target.value);
                    if (newLoc) setSelectedItem(newLoc);
                  }}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-4 py-2 text-white font-story text-sm outline-none appearance-none cursor-pointer focus:border-amber-500 transition-all shadow-lg"
                >
                  <optgroup label="Locais Principais" className="bg-stone-900 text-amber-500 font-medieval uppercase text-[10px]">
                    {locations.filter(l => !l.parentId).map(l => (
                      <option key={l.id} value={l.id} className="font-story text-sm text-white">📍 {l.name}</option>
                    ))}
                  </optgroup>
                  {locations.some(l => l.parentId) && (
                    <optgroup label="Sub-locais" className="bg-stone-900 text-blue-500 font-medieval uppercase text-[10px]">
                      {locations.filter(l => l.parentId).map(l => (
                        <option key={l.id} value={l.id} className="font-story text-sm text-white">↳ {l.name}</option>
                      ))}
                    </optgroup>
                  )}
                </select>
                <ChevronRight size={14} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-stone-500 pointer-events-none" />
              </div>
            </div>
          )}

          {selectedItem && (
            <div className="w-full flex justify-center bg-black/60 rounded-3xl border border-amber-900/20 p-4 relative overflow-hidden group shadow-inner">
               <div className="absolute top-0 left-0 w-12 h-12 border-t-2 border-l-2 border-amber-500/30 rounded-tl-3xl" />
               <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-amber-500/30 rounded-br-3xl" />
               <img src={selectedItem?.imageUrl || `https://picsum.photos/seed/${selectedItem?.id}/1200/800`} className="max-h-[500px] w-full object-cover rounded-2xl shadow-2xl transition-transform duration-1000 group-hover:scale-[1.02]" alt="Illustration" />
            </div>
          )}

          <div className="space-y-8 px-2">
             {activeTab === 'CHARACTERS' && selectedItem && (
               <div className="flex flex-wrap gap-4">
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medieval text-[10px] uppercase tracking-widest ${getTypeColor(selectedItem?.characterType)} shadow-sm`}>
                   <UserIcon size={14} /> {selectedItem?.characterType || 'NPC'}
                 </div>
                 <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medieval text-[10px] uppercase tracking-widest ${getStatusDisplay(selectedItem?.status || ItemStatus.UNKNOWN).color} shadow-sm`}>
                   {getStatusDisplay(selectedItem?.status || ItemStatus.UNKNOWN).icon} {getStatusDisplay(selectedItem?.status || ItemStatus.UNKNOWN).label}
                 </div>
               </div>
             )}

             <section className="break-words">
               <span className="text-amber-500 font-medieval uppercase tracking-[0.3em] text-[10px] mb-4 block opacity-60 flex items-center gap-2">
                 <div className="w-4 h-px bg-amber-500/30" /> DESCRIÇÃO
               </span>
               <p className="font-story text-stone-200 text-lg leading-relaxed whitespace-pre-wrap">{selectedItem?.description}</p>
             </section>

             {activeTab === 'LOCATIONS' && selectedItem && locations.some(l => l.parentId === selectedItem?.id) && (
               <section className="pt-8 border-t border-amber-900/10">
                 <div className="flex items-center gap-3 mb-6">
                   <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
                     <Navigation size={18} />
                   </div>
                   <h3 className="text-stone-100 font-medieval text-sm uppercase tracking-[0.2em]">Sub-locais em {selectedItem?.name}</h3>
                 </div>
                 
                 <div className="grid grid-cols-1 gap-3">
                   {locations.filter(l => l.parentId === selectedItem?.id).map(sub => (
                     <button 
                       key={sub.id}
                       onClick={() => setSelectedItem(sub)}
                       className="flex items-center justify-between p-5 bg-[#0a0f1d] border border-white/5 rounded-2xl hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group shadow-xl"
                     >
                       <div className="flex items-center gap-4">
                         <div className="p-2 bg-stone-900 border border-amber-500/20 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-stone-900 transition-all">
                           <Compass size={18} />
                         </div>
                         <span className="font-story text-stone-300 text-lg font-bold group-hover:text-amber-400 transition-colors">{sub.name}</span>
                       </div>
                       <ChevronRight size={20} className="text-stone-700 group-hover:text-amber-500 transition-all translate-x-0 group-hover:translate-x-1" />
                     </button>
                   ))}
                 </div>
               </section>
             )}

             {selectedItem?.history && (
               <section className="pt-8 border-t border-white/5 break-words">
                 <span className="text-amber-500 font-medieval uppercase tracking-[0.3em] text-[10px] mb-4 block opacity-60 flex items-center gap-2">
                   <div className="w-4 h-px bg-amber-500/30" /> CRÔNICAS & DETALHES
                 </span>
                 <p className="font-story text-stone-400 text-base leading-relaxed whitespace-pre-wrap">{selectedItem.history}</p>
               </section>
             )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} title={`${editMode ? 'Esculpir' : 'Forjar'} ${getTabLabel()}`} size="lg">
        <form onSubmit={handleItemSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Visual (Estandarte/Retrato)</label>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full aspect-video bg-black/40 border-2 border-dashed border-amber-900/20 rounded-3xl flex items-center justify-center cursor-pointer hover:border-amber-500/30 transition-all group overflow-hidden relative shadow-inner"
            >
              {selectedItem?.imageUrl ? (
                <>
                  <img src={selectedItem.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                     <Upload size={32} className="text-white drop-shadow-lg" />
                  </div>
                  <button type="button" onClick={(e) => {e.stopPropagation(); setSelectedItem({...selectedItem, imageUrl: ''});}} className="absolute top-4 right-4 p-2 bg-black/60 rounded-xl text-red-500 hover:bg-red-500/20 transition-all z-20">
                    <X size={16} />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-amber-500/30">
                  <Upload size={40} className="animate-float" />
                  <span className="text-xs uppercase font-medieval tracking-[0.3em]">Enviar Runa Visual</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Designação (Nome)</label>
              <input required value={selectedItem?.name || ''} onChange={e => setSelectedItem({...selectedItem, name: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white focus:border-amber-500 outline-none font-story text-lg shadow-inner transition-all" />
            </div>

            {activeTab === 'CHARACTERS' && (
              <div className="space-y-2">
                <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Linhagem / Natureza</label>
                <div className="relative">
                  <select value={selectedItem?.characterType || 'NPC'} onChange={e => setSelectedItem({...selectedItem, characterType: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white outline-none appearance-none font-story text-lg focus:border-amber-500 transition-all shadow-inner">
                    <option value="NPC" className="bg-stone-900">NPC Comum</option>
                    <option value="Aliado" className="bg-stone-900">Aliado</option>
                    <option value="Neutro" className="bg-stone-900">Neutro</option>
                    <option value="Inimigo" className="bg-stone-900">Inimigo</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-stone-500 pointer-events-none" />
                </div>
              </div>
            )}

            {activeTab === 'LOCATIONS' && (
              <div className="space-y-2">
                <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Reino Superior (Pai)</label>
                <div className="relative">
                  <select value={selectedItem?.parentId || ''} onChange={e => setSelectedItem({...selectedItem, parentId: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white outline-none appearance-none font-story text-lg focus:border-amber-500 transition-all shadow-inner">
                    <option value="" className="bg-stone-900">Nenhum (Local Principal)</option>
                    {locations.filter(l => l.id !== selectedItem?.id).map(loc => (
                      <option key={loc.id} value={loc.id} className="bg-stone-900">{loc.name}</option>
                    ))}
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-stone-500 pointer-events-none" />
                </div>
              </div>
            )}

            {activeTab === 'INFO' && (
              <div className="space-y-2">
                <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Categoria</label>
                <div className="relative">
                  <select value={selectedItem?.category || 'Outro'} onChange={e => setSelectedItem({...selectedItem, category: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white outline-none appearance-none font-story text-lg focus:border-amber-500 transition-all shadow-inner">
                    <option value="Regra" className="bg-stone-900">Regra</option>
                    <option value="História/Lore" className="bg-stone-900">História/Lore</option>
                    <option value="Mapa" className="bg-stone-900">Mapa</option>
                    <option value="Símbolo" className="bg-stone-900">Símbolo</option>
                    <option value="Aviso" className="bg-stone-900">Aviso</option>
                    <option value="Segredo" className="bg-stone-900">Segredo</option>
                    <option value="Outro" className="bg-stone-900">Outro</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-stone-500 pointer-events-none" />
                </div>
              </div>
            )}

            {activeTab === 'BESTIARY' && (
              <div className="space-y-2">
                <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Grau de Ameaça</label>
                <div className="relative">
                  <select value={selectedItem?.difficulty || 'Médio'} onChange={e => setSelectedItem({...selectedItem, difficulty: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white outline-none appearance-none font-story text-lg focus:border-amber-500 transition-all shadow-inner">
                    <option value="Fácil" className="bg-stone-900">Fácil</option>
                    <option value="Médio" className="bg-stone-900">Médio</option>
                    <option value="Difícil" className="bg-stone-900">Difícil</option>
                    <option value="Lendário" className="bg-stone-900">Lendário</option>
                  </select>
                  <ChevronRight size={18} className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-stone-500 pointer-events-none" />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Narrativa (Descrição)</label>
            <textarea rows={4} value={selectedItem?.description || ''} onChange={e => setSelectedItem({...selectedItem, description: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white focus:border-amber-500 outline-none resize-none font-story text-base shadow-inner leading-relaxed transition-all" />
          </div>

          {activeTab === 'CHARACTERS' && (
             <div className="space-y-2">
                <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500 mb-2 block opacity-60">Crônicas do Passado (História)</label>
                <textarea rows={4} value={selectedItem?.history || ''} onChange={e => setSelectedItem({...selectedItem, history: e.target.value})} className="w-full bg-stone-950 border border-stone-800 rounded-2xl p-4 text-white focus:border-amber-500 outline-none resize-none font-story text-base shadow-inner leading-relaxed transition-all" />
             </div>
          )}

          <div className="flex items-center justify-between py-4 border-t border-amber-900/10">
            <div className="flex items-center gap-3">
              <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500/60">Revelar para Viajantes?</label>
              <button 
                type="button"
                onClick={() => setSelectedItem({...selectedItem, isVisibleToPlayers: !selectedItem.isVisibleToPlayers})}
                className={`w-12 h-6 rounded-full p-1 transition-all ${selectedItem?.isVisibleToPlayers ? 'bg-amber-500' : 'bg-stone-800'}`}
              >
                <div className={`w-4 h-4 bg-white rounded-full transition-transform ${selectedItem?.isVisibleToPlayers ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            {activeTab === 'CHARACTERS' && (
               <div className="space-y-2 min-w-[180px]">
                 <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500/60 mb-2 block">Estado Vital</label>
                 <div className="relative">
                   <select 
                     value={selectedItem?.status || ItemStatus.ALIVE} 
                     onChange={e => setSelectedItem({...selectedItem, status: e.target.value})} 
                     className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3 text-white outline-none appearance-none font-story text-sm focus:border-amber-500 transition-all"
                   >
                      <option value={ItemStatus.ALIVE} className="bg-stone-900">Vivo</option>
                      <option value={ItemStatus.DEAD} className="bg-stone-900">Perecido</option>
                      <option value={ItemStatus.MISSING} className="bg-stone-900">Desaparecido</option>
                      <option value={ItemStatus.UNKNOWN} className="bg-stone-900">Desconhecido</option>
                   </select>
                   <ChevronRight size={14} className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-stone-500 pointer-events-none" />
                 </div>
               </div>
            )}
          </div>

          <div className="pt-4">
            <Button fullWidth size="lg" type="submit" disabled={isSaving} className="shadow-2xl text-xs tracking-[0.3em] py-5">
              {isSaving ? 'CONJURANDO...' : `GRAVAR NAS CRÔNICAS`}
            </Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="SENTENÇA DE ESQUECIMENTO" size="md">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-red-950/20 border border-red-500/30 rounded-full flex items-center justify-center mb-8 shadow-inner">
            <Trash2 size={32} className="text-red-500 animate-pulse" />
          </div>
          <p className="font-medieval text-xl text-stone-100 uppercase tracking-widest mb-6 px-4">Deseja realmente banir este registro das crônicas para sempre?</p>
          <div className="flex flex-col w-full gap-4">
            <Button variant="danger" fullWidth onClick={confirmDelete} disabled={isSaving} className="py-4 text-xs tracking-widest">CONFIRMAR SENTENÇA</Button>
            <Button variant="secondary" fullWidth onClick={() => setIsDeleteModalOpen(false)} className="py-4 text-xs tracking-widest">VOLTAR AO REINO</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

const NavTab: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-2 px-8 py-6 transition-all font-medieval text-[10px] uppercase tracking-[0.3em] whitespace-nowrap border-b-2 relative group ${active ? 'text-amber-500 border-amber-500 bg-amber-500/5' : 'text-stone-600 border-transparent hover:text-amber-500/60'}`}>
    {active && (
      <motion.div layoutId="tab-glow" className="absolute inset-0 bg-gradient-to-t from-amber-500/10 to-transparent" />
    )}
    <span className={active ? 'text-amber-400' : 'text-stone-700 group-hover:text-amber-500/50 transition-colors'}>{icon}</span>
    {label}
  </button>
);

export default CampaignDetail;
