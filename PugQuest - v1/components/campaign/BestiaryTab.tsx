
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Swords, Eye, EyeOff, Edit2, Trash2, XCircle } from 'lucide-react';
import { Monster, MonsterDifficulty, Campaign } from '../../types.js';
import { Card } from '../Card.js';

interface BestiaryTabProps {
  monsters: Monster[];
  isMaster: boolean;
  openForm: (item?: any) => void;
  openView: (item: any) => void;
  openDelete: (item: any) => void;
  toggleVisibility: (item: any, e: React.MouseEvent) => void;
}

export const BestiaryTab: React.FC<BestiaryTabProps> = ({
  monsters, isMaster, openForm, openView, openDelete, toggleVisibility
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');

  const filteredItems = useMemo(() => {
    let items = isMaster ? monsters : monsters.filter(m => m.isVisibleToPlayers);
    if (filterDifficulty !== 'all') items = items.filter(m => m.difficulty === filterDifficulty);
    
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [monsters, isMaster, searchQuery, filterDifficulty]);

  const getDifficultyColor = (diff: MonsterDifficulty) => {
    switch (diff) {
      case 'Fácil': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Médio': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Difícil': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'Lendário': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex flex-wrap items-center gap-4 flex-1">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar feras e horrores..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111c31]/40 border border-amber-900/20 rounded-xl py-3 pl-12 pr-4 text-stone-100 outline-none focus:border-amber-500/40 transition-all font-story text-base"
            />
          </div>
          <select 
            value={filterDifficulty} 
            onChange={e => setFilterDifficulty(e.target.value)}
            className="bg-stone-900/80 border border-stone-700/50 rounded-xl px-4 py-3 text-stone-100 font-medieval text-xs uppercase tracking-widest outline-none focus:border-amber-500/60 transition-all shadow-lg"
          >
            <option value="all" className="bg-stone-900">Todas as Dificuldades</option>
            <option value="Fácil" className="bg-stone-900">Fácil</option>
            <option value="Médio" className="bg-stone-900">Médio</option>
            <option value="Difícil" className="bg-stone-900">Difícil</option>
            <option value="Lendário" className="bg-stone-900">Lendário</option>
          </select>
        </div>
        {isMaster && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openForm()} className="rpg-button-primary px-8 py-3 flex items-center gap-3 shadow-xl">
            <Plus size={18} />
            <span className="font-medieval text-xs uppercase tracking-[0.2em]">Novo Monstro</span>
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
                   <Swords size={14} className="text-amber-400" />
                </div>
                {isMaster && (
                  <div className="absolute top-3 right-3 flex gap-2">
                    <button onClick={(e) => toggleVisibility(item, e)} className="w-8 h-8 rounded-lg bg-black/60 border border-amber-500/20 flex items-center justify-center text-amber-500 backdrop-blur-md hover:bg-amber-500/20 transition-colors">
                      {item.isVisibleToPlayers ? <Eye size={14} /> : <EyeOff size={14} className="text-gray-500" />}
                    </button>
                  </div>
                )}
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-xl font-medieval text-amber-100 mb-2 tracking-wide group-hover:text-amber-400 transition-colors leading-tight">{item.name}</h3>
                <div className="mb-3">
                   <span className={`px-2.5 py-1 rounded border text-[9px] font-medieval uppercase tracking-widest ${getDifficultyColor(item.difficulty)}`}>
                     {item.difficulty}
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
