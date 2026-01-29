
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, BookOpen, Eye, EyeOff, Edit2, Trash2, XCircle } from 'lucide-react';
import { Story, Campaign } from '../../types.js';
import { Card } from '../Card.js';

interface StoriesTabProps {
  stories: Story[];
  isMaster: boolean;
  openForm: (item?: any) => void;
  openView: (item: any) => void;
  openDelete: (item: any) => void;
  toggleVisibility: (item: any, e: React.MouseEvent) => void;
}

export const StoriesTab: React.FC<StoriesTabProps> = ({
  stories, isMaster, openForm, openView, openDelete, toggleVisibility
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = useMemo(() => {
    let items = isMaster ? stories : stories.filter(s => s.isVisibleToPlayers);
    return items.filter(item => 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ).sort((a, b) => b.createdAt - a.createdAt);
  }, [stories, isMaster, searchQuery]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative min-w-[300px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={18} />
            <input 
              type="text" 
              placeholder="Buscar contos e lendas..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#111c31]/40 border border-amber-900/20 rounded-xl py-3 pl-12 pr-4 text-stone-100 outline-none focus:border-amber-500/40 transition-all font-story text-base"
            />
          </div>
        </div>
        {isMaster && (
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => openForm()} className="rpg-button-primary px-8 py-3 flex items-center gap-3 shadow-xl">
            <Plus size={18} />
            <span className="font-medieval text-xs uppercase tracking-[0.2em]">Nova História</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredItems.map(item => (
            <Card key={item.id} className={`!p-0 h-full flex flex-col group border-amber-900/20 bg-slate-900/40 overflow-hidden shadow-2xl transition-all ${!item.isVisibleToPlayers && isMaster ? 'opacity-60 grayscale-[0.3]' : ''}`} onClick={() => openView(item)}>
              <div className="aspect-[4/3] relative overflow-hidden bg-black/40">
                <img src={item.imageUrl || `https://picsum.photos/seed/${item.id}/600/450`} className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105" alt={item.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-90" />
                <div className="absolute top-3 left-3 w-8 h-8 rounded-lg bg-black/60 border border-amber-500/20 flex items-center justify-center backdrop-blur-md">
                   <BookOpen size={14} className="text-amber-400" />
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
                <p className="text-sm text-stone-400 line-clamp-3 leading-relaxed font-story">{item.description}</p>
              </div>
            </Card>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};