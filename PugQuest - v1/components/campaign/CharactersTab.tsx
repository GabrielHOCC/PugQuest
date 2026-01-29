
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Skull, Heart, HelpCircle, Eye, EyeOff, Edit2, Trash2, XCircle, Search as SearchIcon } from 'lucide-react';
import { Character, ItemStatus, CharacterType, Campaign } from '../../types.js';
import { Card } from '../Card.js';
import { Button } from '../Button.js';
import { Store } from '../../services/store.js';

interface CharactersTabProps {
  campaign: Campaign;
  characters: Character[];
  isMaster: boolean;
  onRefresh: () => void;
  openForm: (item?: any) => void;
  openView: (item: any) => void;
  openDelete: (item: any) => void;
  toggleVisibility: (item: any, e: React.MouseEvent) => void;
}

export const CharactersTab: React.FC<CharactersTabProps> = ({
  campaign, characters, isMaster, onRefresh, openForm, openView, openDelete, toggleVisibility
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  const filteredItems = useMemo(() => {
    let items = isMaster ? characters : characters.filter(c => c.isVisibleToPlayers);
    if (filterType !== 'all') items = items.filter(c => c.characterType === filterType);
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [characters, isMaster, searchQuery, filterType]);

  const getStatusIcon = (status: ItemStatus) => {
    switch (status) {
      case ItemStatus.ALIVE: return <Heart size={16} className="text-emerald-400 fill-emerald-400/20" />;
      case ItemStatus.DEAD: return <Skull size={16} className="text-red-500" />;
      case ItemStatus.MISSING: return <SearchIcon size={16} className="text-blue-400" />;
      case ItemStatus.UNKNOWN: return <HelpCircle size={16} className="text-stone-400" />;
      default: return <HelpCircle size={16} className="text-stone-400" />;
    }
  };

  const getTypeColor = (type: CharacterType) => {
    switch (type) {
      case 'Aliado': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Inimigo': return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'Neutro': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'NPC': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      default: return 'bg-stone-500/10 text-stone-400 border-stone-500/20';
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar heróis e vilões..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111c31]/40 border border-amber-900/20 rounded-xl py-3 pl-12 pr-4 text-stone-100 outline-none focus:border-amber-500/40 transition-all font-story text-base"
            />
          </div>
          <select 
            value={filterType} 
            onChange={e => setFilterType(e.target.value)}
            className="bg-stone-900/80 border border-stone-700/50 rounded-xl px-4 py-3 text-stone-100 font-medieval text-xs uppercase tracking-widest outline-none focus:border-amber-500/60 transition-all shadow-lg"
          >
            <option value="all" className="bg-stone-900">Todos os Tipos</option>
            <option value="Aliado" className="bg-stone-900">Aliados</option>
            <option value="NPC" className="bg-stone-900">NPCs</option>
            <option value="Inimigo" className="bg-stone-900">Inimigos</option>
            <option value="Neutro" className="bg-stone-900">Neutros</option>
          </select>
          {(searchQuery || filterType !== 'all') && (
            <button onClick={() => {setSearchQuery(''); setFilterType('all');}} className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-colors text-[10px] font-medieval uppercase tracking-widest px-4 py-3 border border-stone-800 rounded-xl">
              <XCircle size={14} /> Limpar
            </button>
          )}
        </div>
        {isMaster && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openForm()} className="rpg-button-primary px-8 py-3 flex items-center gap-3 shadow-xl">
            <Plus size={18} />
            <span className="font-medieval text-xs uppercase tracking-[0.2em]">Novo Personagem</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => (
            <Card key={item.id} className={`!p-0 h-full flex flex-col group border-amber-900/20 bg-slate-900/40 overflow-hidden shadow-2xl transition-all ${!item.isVisibleToPlayers && isMaster ? 'opacity-60 grayscale-[0.3]' : ''}`} onClick={() => openView(item)}>
              <div className="aspect-[4/3] relative overflow-hidden bg-black/40">
                <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/600/450`} className="w-full h-full object-cover object-top transition-transform duration-1000 group-hover:scale-105" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/60 border border-amber-500/20 flex items-center justify-center backdrop-blur-md">
                  {getStatusIcon(item.status)}
                </div>
                {isMaster && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={(e) => toggleVisibility(item, e)} className="w-8 h-8 rounded-lg bg-black/60 border border-amber-500/20 flex items-center justify-center text-amber-500 backdrop-blur-md hover:bg-amber-500/20 transition-colors">
                      {item.isVisibleToPlayers ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-500" />}
                    </button>
                  </div>
                )}
                {isMaster && (
                  <div className="absolute bottom-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                    <div className="flex bg-black/80 rounded-lg border border-amber-500/30 overflow-hidden shadow-xl backdrop-blur-md">
                      <button onClick={(e) => {e.stopPropagation(); openForm(item);}} className="p-2.5 text-amber-500 hover:bg-amber-500/20 transition-colors border-r border-amber-500/20"><Edit2 size={14} /></button>
                      <button onClick={(e) => {e.stopPropagation(); openDelete(item);}} className="p-2.5 text-red-500 hover:bg-red-500/20 transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-medieval text-amber-100 mb-2 tracking-wide group-hover:text-amber-400 transition-colors leading-tight">{item.name}</h3>
                <div className="mb-3">
                   <span className={`px-2.5 py-1 rounded border text-[9px] font-medieval uppercase tracking-widest ${getTypeColor(item.characterType)}`}>
                     {item.characterType}
                   </span>
                </div>
                <p className="text-sm text-stone-400 line-clamp-3 leading-relaxed font-story">{item.description}</p>
              </div>
            </Card>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
