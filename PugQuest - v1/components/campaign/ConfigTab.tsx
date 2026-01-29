
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Users, Upload, Copy, Check, X, ChevronRight, AlertTriangle, Trash2, Mail, User as UserIcon, Shield } from 'lucide-react';
import { Campaign, Membership, User } from '../../types.js';
import { Button } from '../Button.js';

interface ConfigTabProps {
  campaign: Campaign;
  user: User | null;
  members: Membership[];
  isSaving: boolean;
  onUpdate: (data: any) => Promise<void>;
  onRemoveMember: (userId: string) => Promise<void>;
  onDeleteCampaign: () => Promise<void>;
  copyCode: () => void;
  copiedId: boolean;
}

export const ConfigTab: React.FC<ConfigTabProps> = ({
  campaign, user, members, isSaving, onUpdate, onRemoveMember, onDeleteCampaign, copyCode, copiedId
}) => {
  const [configData, setConfigData] = useState({
    name: campaign.name,
    description: campaign.description || '',
    status: campaign.status || 'Ativa',
    imageUrl: campaign.imageUrl || ''
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setConfigData({ ...configData, imageUrl: reader.result as string });
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(configData);
  };

  return (
    <div className="space-y-12 animate-in fade-in duration-700 max-w-5xl mx-auto pb-20">
      {/* Configurações da Campanha */}
      <section className="bg-[#111c31]/20 border border-amber-900/20 rounded-[2.5rem] p-8 md:p-12 backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
           <AlertTriangle size={120} />
        </div>
        
        <h2 className="font-medieval text-amber-500 text-sm tracking-[0.4em] uppercase mb-12 opacity-70 flex items-center gap-3">
          <div className="w-8 h-px bg-amber-500/30" />
          Configurações do Reino
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-12 relative z-10">
          <div>
            <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500/60 mb-4 block">Estandarte da Campanha (Capa)</label>
            <div onClick={() => fileInputRef.current?.click()} className="w-full aspect-[21/9] bg-black/40 border-2 border-dashed border-amber-900/20 rounded-3xl flex items-center justify-center cursor-pointer hover:border-amber-500/30 transition-all group overflow-hidden relative">
              {configData.imageUrl ? (
                <>
                  <img src={configData.imageUrl} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute top-6 right-6 z-10">
                    <button type="button" onClick={(e) => {e.stopPropagation(); setConfigData({...configData, imageUrl: ''});}} className="p-3 bg-black/60 rounded-xl text-red-500 border border-red-500/20 hover:bg-red-500/20 transition-all"><X size={20} /></button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-4 text-amber-500/40">
                  <Upload size={48} className="animate-float" />
                  <span className="text-xs uppercase font-medieval tracking-[0.3em]">Alterar Estandarte</span>
                </div>
              )}
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-2">
              <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500/60 mb-2 block">Título da Saga</label>
              <input value={configData.name} onChange={e => setConfigData({...configData, name: e.target.value})} className="w-full bg-[#0a0f1d] border border-amber-900/30 rounded-2xl p-5 text-stone-100 outline-none focus:border-amber-500/50 font-story text-lg transition-all shadow-inner" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500/60 mb-2 block">Estado do Mundo</label>
              <div className="relative">
                <select value={configData.status} onChange={e => setConfigData({...configData, status: e.target.value})} className="w-full bg-[#0a0f1d] border border-amber-900/30 rounded-2xl p-5 text-stone-100 outline-none appearance-none font-story text-lg uppercase cursor-pointer focus:border-amber-500/50 transition-all shadow-inner">
                  <option value="Ativa">Ativa</option>
                  <option value="Finalizada">Finalizada</option>
                  <option value="Pausada">Pausada</option>
                </select>
                <ChevronRight size={20} className="absolute right-6 top-1/2 -translate-y-1/2 rotate-90 text-amber-500/40 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-medieval uppercase tracking-[0.2em] text-amber-500/60 mb-2 block">Resumo das Eras</label>
            <textarea rows={4} value={configData.description} onChange={e => setConfigData({...configData, description: e.target.value})} className="w-full bg-[#0a0f1d] border border-amber-900/30 rounded-2xl p-5 text-stone-100 outline-none focus:border-amber-500/50 font-story text-lg leading-relaxed resize-none transition-all shadow-inner" />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" disabled={isSaving} size="lg" className="shadow-2xl !px-16 text-sm">
              {isSaving ? 'Conjurando...' : 'Salvar Alterações'}
            </Button>
          </div>
        </form>
      </section>

      {/* Convite e Jogadores */}
      <div className="grid lg:grid-cols-5 gap-8">
        <section className="lg:col-span-2 bg-[#111c31]/20 border border-amber-900/20 rounded-[2.5rem] p-10 backdrop-blur-md flex flex-col items-center text-center justify-center">
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mb-8 border border-amber-500/20 shadow-[0_0_30px_rgba(245,158,11,0.1)]">
            <Users className="text-amber-500" size={32} />
          </div>
          <h2 className="font-medieval text-amber-100 text-lg uppercase tracking-widest mb-4">Código de Convite</h2>
          <div className="bg-black/60 px-8 py-4 rounded-2xl border border-amber-500/20 text-3xl font-mono tracking-[0.3em] text-amber-400 shadow-inner mb-6">
            {campaign.inviteCode}
          </div>
          <button onClick={copyCode} className="w-full flex items-center justify-center gap-4 bg-white hover:bg-stone-100 text-stone-950 py-4 rounded-xl font-medieval text-xs uppercase tracking-widest transition-all shadow-xl">
            {copiedId ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
            {copiedId ? 'Código Copiado!' : 'Copiar Runa'}
          </button>
        </section>

        <section className="lg:col-span-3 bg-[#111c31]/20 border border-amber-900/20 rounded-[2.5rem] p-10 backdrop-blur-md">
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
                <Users className="text-amber-500" size={20} />
              </div>
              <h2 className="font-medieval text-amber-100 text-sm tracking-[0.3em] uppercase">Jogadores no Reino ({members.length})</h2>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {members.length > 0 ? members.map(member => (
              <div key={member.userId} className="group flex items-center justify-between p-5 bg-[#0a0f1d]/60 border border-amber-900/10 rounded-2xl hover:border-amber-500/30 transition-all">
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-medieval border shadow-lg ${member.role === 'MASTER' ? 'bg-amber-500/10 border-amber-500/40 text-amber-500' : 'bg-stone-800 border-white/5 text-stone-400'}`}>
                    {member.role === 'MASTER' ? <Shield size={18} /> : <UserIcon size={18} />}
                  </div>
                  <div>
                    <p className="text-amber-400 text-lg font-story lowercase opacity-90">{member.profile?.email || 'aventureiro@anônimo.com'}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-stone-500 font-medieval uppercase tracking-widest">
                        {member.role === 'MASTER' ? 'Mestre Supremo' : 'Viajante'}
                      </span>
                      {member.userId === user?.id && (
                         <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/20 uppercase font-medieval">Você</span>
                      )}
                    </div>
                  </div>
                </div>
                {member.userId !== user?.id && (
                  <button onClick={() => onRemoveMember(member.userId)} className="p-3 text-red-500/30 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all" title="Banir do Reino">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
            )) : (
              <div className="py-20 flex flex-col items-center justify-center text-center opacity-30 grayscale">
                <Users size={48} className="mb-4" />
                <p className="font-medieval uppercase tracking-[0.3em] text-xs">O reino aguarda seus primeiros caminhantes</p>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* Zona de Perigo */}
      <section className="bg-red-950/10 border border-red-900/20 rounded-[2.5rem] p-10 mt-12">
        <div className="flex items-center gap-5 mb-8 text-red-500">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <AlertTriangle size={24} />
          </div>
          <h2 className="font-medieval text-sm tracking-[0.4em] uppercase">Vórtice do Esquecimento</h2>
        </div>
        <p className="text-red-200/40 font-story text-base mb-10 leading-relaxed max-w-2xl">
          Apagar esta campanha fará com que todos os personagens, locais e crônicas se percam nas areias do tempo para sempre. Esta ação é <span className="text-red-500 font-bold uppercase tracking-widest">irreversível</span>.
        </p>
        <button onClick={onDeleteCampaign} className="px-10 py-5 bg-red-950/40 hover:bg-red-600 text-red-100 border border-red-500/30 rounded-xl font-medieval text-[11px] uppercase tracking-[0.3em] transition-all flex items-center gap-4 shadow-xl group">
          <Trash2 size={20} className="group-hover:rotate-12 transition-transform" /> Excluir Todas as Crônicas
        </button>
      </section>
    </div>
  );
};
