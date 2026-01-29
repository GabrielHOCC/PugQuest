
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Shield, Sword, Skull, BookOpen, Sparkles, Map, 
  Compass, Flame, Ghost, Moon, Sun, Wand2, 
  ArrowLeft, Check, User as UserIcon, Save
} from 'lucide-react';
import { Store } from '../services/store.js';
import { User } from '../types.js';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';

const RPG_ICONS = [
  { id: 'Shield', Icon: Shield, label: 'Paladino' },
  { id: 'Sword', Icon: Sword, label: 'Guerreiro' },
  { id: 'Wand2', Icon: Wand2, label: 'Mago' },
  { id: 'Skull', Icon: Skull, label: 'Necromante' },
  { id: 'BookOpen', Icon: BookOpen, label: 'Escriba' },
  { id: 'Sparkles', Icon: Sparkles, label: 'Bardo' },
  { id: 'Map', Icon: Map, label: 'Explorador' },
  { id: 'Compass', Icon: Compass, label: 'Rastreador' },
  { id: 'Flame', Icon: Flame, label: 'Piroclasta' },
  { id: 'Ghost', Icon: Ghost, label: 'Ladino' },
  { id: 'Moon', Icon: Moon, label: 'Druida da Lua' },
  { id: 'Sun', Icon: Sun, label: 'Clérigo do Sol' }
];

const ProfileSettings: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    avatar: 'Shield'
  });

  useEffect(() => {
    const init = async () => {
      const currentUser = await Store.getCurrentUser();
      if (!currentUser) {
        window.location.hash = '#/login';
        return;
      }
      setUser(currentUser);
      setFormData({
        name: currentUser.name,
        avatar: currentUser.avatar || 'Shield'
      });
      setLoading(false);
    };
    init();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSaving(true);
    setSuccess(false);
    try {
      await Store.updateProfile(user.id, formData);
      setSuccess(true);
      
      // Força a atualização local e global
      window.dispatchEvent(new Event('profileUpdate'));
      
      setTimeout(() => setSuccess(false), 3000);
    } catch (e) {
      alert('Erro ao gravar sua alma nos registros.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen py-12 px-6 max-w-4xl mx-auto animate-in fade-in duration-700">
      <button 
        onClick={() => window.location.hash = '#/dashboard'}
        className="flex items-center gap-2 text-stone-500 hover:text-amber-500 transition-all mb-12 group"
      >
        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] uppercase font-medieval tracking-[0.3em]">Retornar ao Mural</span>
      </button>

      <div className="flex items-center gap-6 mb-16">
        <div className="w-20 h-20 rounded-[2rem] bg-amber-950/20 border border-amber-500/30 flex items-center justify-center shadow-2xl amber-glow">
          {(() => {
            const Icon = RPG_ICONS.find(i => i.id === formData.avatar)?.Icon || Shield;
            return <Icon size={36} className="text-amber-500" />;
          })()}
        </div>
        <div>
          <h1 className="text-4xl font-medieval text-stone-100 uppercase tracking-widest amber-glow">Configurações de Alma</h1>
          <p className="text-stone-500 font-story text-lg uppercase tracking-wider">Ajuste sua essência no grimório das eras</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-12">
        <section className="bg-stone-900/40 border border-amber-900/10 rounded-[2.5rem] p-10 backdrop-blur-md shadow-inner">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="space-y-4">
              <label className="text-[10px] font-medieval uppercase tracking-[0.3em] text-amber-500/60 block">Designação (Nome)</label>
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-amber-500/30" size={20} />
                <input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({...formData, name: e.target.value})} 
                  className="w-full bg-stone-950 border border-amber-900/20 rounded-2xl p-5 pl-14 text-stone-100 focus:border-amber-500 outline-none font-story text-xl shadow-inner transition-all" 
                />
              </div>
            </div>
            <div className="space-y-4 opacity-50 cursor-not-allowed">
              <label className="text-[10px] font-medieval uppercase tracking-[0.3em] text-stone-500 block">Vínculo Espiritual (E-mail)</label>
              <div className="bg-stone-950/50 border border-white/5 rounded-2xl p-5 text-stone-600 font-story text-xl">
                {user?.email}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-amber-500/30" />
            <h2 className="text-[10px] font-medieval uppercase tracking-[0.4em] text-amber-500/60">Escolha seu Brasão</h2>
            <div className="flex-1 h-px bg-amber-500/30" />
          </div>

          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {RPG_ICONS.map(({ id, Icon, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setFormData({...formData, avatar: id})}
                className={`
                  flex flex-col items-center gap-3 p-6 rounded-2xl border transition-all relative group
                  ${formData.avatar === id 
                    ? 'bg-amber-500/10 border-amber-500 shadow-[0_0_20px_rgba(245,158,11,0.2)]' 
                    : 'bg-stone-950/40 border-amber-900/10 hover:border-amber-500/40'
                  }
                `}
              >
                <Icon 
                  size={24} 
                  className={formData.avatar === id ? 'text-amber-400' : 'text-stone-600 group-hover:text-amber-500/60'} 
                />
                <span className={`text-[8px] font-medieval uppercase tracking-widest text-center ${formData.avatar === id ? 'text-amber-400' : 'text-stone-700'}`}>
                  {label}
                </span>
                {formData.avatar === id && (
                  <motion.div layoutId="avatar-active" className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center border-2 border-stone-950 shadow-lg">
                    <Check size={8} className="text-stone-950 font-bold" />
                  </motion.div>
                )}
              </button>
            ))}
          </div>
        </section>

        <div className="flex flex-col items-center gap-6 pt-12 border-t border-amber-900/10">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSaving} 
            className="!px-20 shadow-amber-900/40"
          >
            {isSaving ? (
              <span className="animate-pulse flex items-center gap-3"><Sparkles size={16} /> Gravando...</span>
            ) : (
              <span className="flex items-center gap-3"><Save size={16} /> Selar Alterações</span>
            )}
          </Button>

          {success && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-emerald-500 font-medieval text-[10px] uppercase tracking-[0.4em] flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Grimório Atualizado com Sucesso
            </motion.div>
          )}
        </div>
      </form>
    </div>
  );
};

export default ProfileSettings;
