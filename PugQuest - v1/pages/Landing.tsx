
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sword, Shield, ScrollText, Sparkles, BookOpen, Eye, 
  Zap, ChevronDown, Users, Map as MapIcon, Library,
  Mail, Lock, User as UserIcon, ShieldCheck, X, MailOpen, Send
} from 'lucide-react';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { Modal } from '../components/Modal.js';
import { Store } from '../services/store.js';

const Landing: React.FC = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  const [isVerificationSent, setIsVerificationSent] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '', name: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const user = await Store.getCurrentUser();
      if (user) {
        window.location.hash = '#/dashboard';
      }
    };
    checkUser();
  }, []);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (authMode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          setError('As senhas não coincidem.');
          return;
        }
        await Store.signUp(formData.email, formData.password, formData.name);
        setIsVerificationSent(true);
      } else {
        await Store.signIn(formData.email, formData.password);
        window.dispatchEvent(new Event('storage'));
        window.location.hash = '#/dashboard';
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao processar sua entrada.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setAuthMode(prev => prev === 'login' ? 'register' : 'login');
    setError('');
    setIsVerificationSent(false);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    setTimeout(() => {
      setIsVerificationSent(false);
      setError('');
    }, 300);
  };

  return (
    <div className="min-h-screen overflow-x-hidden relative">
      <header className="absolute top-0 left-0 w-full pt-8 md:pt-12 pb-6 z-20 flex flex-col items-center px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="flex flex-col items-center gap-1 md:gap-2"
        >
          <div className="flex items-center gap-2 md:gap-4">
            <div className="hidden sm:block h-px w-8 md:w-12 bg-gradient-to-r from-transparent to-amber-500/50" />
            <Sword className="text-amber-500/40 w-4 h-4 md:w-5 md:h-5" />
            <h1 className="font-medieval text-2xl md:text-5xl text-stone-100 tracking-[0.2em] md:tracking-[0.4em] uppercase amber-glow">
              Pug Quest
            </h1>
            <Sword className="text-amber-500/40 w-4 h-4 md:w-5 md:h-5 scale-x-[-1]" />
            <div className="hidden sm:block h-px w-8 md:w-12 bg-gradient-to-l from-transparent to-amber-500/50" />
          </div>
          <span className="font-medieval text-[7px] md:text-[9px] text-amber-500/40 tracking-[0.5em] md:tracking-[0.8em] uppercase text-center">O Guia do Mestre</span>
        </motion.div>
      </header>

      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-amber-500/20 rounded-full"
            initial={{ 
              x: Math.random() * window.innerWidth, 
              y: window.innerHeight + 10 
            }}
            animate={{ 
              y: -10,
              opacity: [0, 0.4, 0]
            }}
            transition={{ 
              duration: Math.random() * 10 + 10,
              repeat: Infinity,
              delay: Math.random() * 5
            }}
          />
        ))}
      </div>

      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-32 pb-20 md:pt-20">
        <div className="relative z-10 max-w-7xl mx-auto w-full grid lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-3 bg-amber-950/40 border border-amber-700/30 rounded-2xl px-4 py-1.5 md:px-5 md:py-2 backdrop-blur-md mb-6 md:mb-8"
            >
              <Sparkles className="w-3 h-3 md:w-4 md:h-4 text-amber-500 animate-pulse" />
              <span className="font-medieval text-amber-200 text-[8px] md:text-[10px] font-bold tracking-[0.2em] md:tracking-[0.3em] uppercase">Crônicas de uma Nova Era</span>
            </motion.div>

            <h1 className="font-medieval text-5xl md:text-8xl text-stone-100 leading-tight md:leading-[1.1] mb-6 md:mb-8 amber-glow uppercase">
              Esculpa Seu <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-orange-500 to-amber-700">
                Destino
              </span>
            </h1>
            
            <p className="font-story text-lg md:text-2xl text-stone-300/80 mb-10 md:mb-12 max-w-xl mx-auto lg:mx-0 leading-relaxed border-l-2 border-amber-900/50 pl-4 md:pl-6 uppercase">
              O grimório digital definitivo para mestres e jogadores. Forje mundos, controle o destino e eternize suas sagas.
            </p>

            <div className="flex flex-wrap gap-4 md:gap-6 justify-center lg:justify-start">
              <Button onClick={() => { setAuthMode('register'); setIsAuthModalOpen(true); }} size="lg" className="w-full sm:w-auto shadow-amber-900/20">
                <Sword className="w-5 h-5 mr-3" />
                Iniciar Campanha
              </Button>
              <Button 
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                variant="secondary"
                size="lg"
                className="w-full sm:w-auto backdrop-blur-xl"
              >
                <ScrollText className="w-5 h-5 mr-3" />
                Explorar Grimório
              </Button>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:block relative"
          >
            <div className="absolute -inset-8 bg-amber-600/10 rounded-full blur-[100px] animate-pulse" />
            <Card className="!p-12 !bg-stone-900/90 border-amber-900/40 shadow-2xl relative overflow-visible">
               <div className="absolute -top-3 -left-3 w-12 h-12 bg-stone-900 border border-amber-500/30 rounded-xl flex items-center justify-center rotate-45">
                 <Shield className="w-5 h-5 text-amber-500 -rotate-45" />
               </div>
               <div className="text-center relative">
                 <div className="w-20 h-20 mx-auto mb-10 bg-gradient-to-b from-amber-950/60 to-transparent rounded-full flex items-center justify-center border border-amber-500/20">
                    <Library className="w-10 h-10 text-amber-500 animate-float" />
                 </div>
                 <h2 className="font-medieval text-3xl text-stone-100 mb-6 tracking-widest uppercase">Saudações, Mestre</h2>
                 <div className="space-y-4 max-w-xs mx-auto">
                    <FeatureBadge icon={<Zap className="text-amber-500" />} label="Controle 100%" />
                    <FeatureBadge icon={<Eye className="text-emerald-500" />} label="Ajuste de visilibidade" />
                    <FeatureBadge icon={<MapIcon className="text-blue-500" />} label="Acompanhamento de lore" />
                 </div>
               </div>
            </Card>
          </motion.div>
        </div>

        <motion.div 
          animate={{ y: [0, 10, 0] }} 
          transition={{ repeat: Infinity, duration: 3 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-amber-500/30 flex flex-col items-center gap-2 cursor-pointer"
          onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
        >
          <span className="font-medieval text-[9px] tracking-[0.4em] uppercase">Descer às Masmorras</span>
          <ChevronDown size={20} />
        </motion.div>
      </section>

      <section id="features" className="py-20 md:py-32 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="font-medieval text-3xl md:text-4xl text-stone-100 mb-6 uppercase tracking-[0.2em] amber-glow">Tradições do Reino</h2>
            <div className="w-32 md:w-40 h-1 bg-gradient-to-r from-transparent via-amber-600 to-transparent mx-auto rounded-full" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
            <FeatureCard 
              icon={<Users className="w-7 h-7" />}
              title="Aliados & Rivais"
              description="Gestão completa de NPCs com biografias dinâmicas e retratos épicos."
            />
            <FeatureCard 
              icon={<MapIcon className="w-7 h-7" />}
              title="Locais Sagrados"
              description="Mapeie tavernas, reinos e masmorras com controle total de visibilidade."
            />
            <FeatureCard 
              icon={<BookOpen className="w-7 h-7" />}
              title="Contos Ocultos"
              description="Documente a lore do seu mundo e revele segredos no momento certo."
            />
          </div>
        </div>
      </section>

      <footer className="py-16 md:py-20 border-t border-amber-900/20 text-center relative z-10 bg-stone-950">
        <div className="max-w-7xl mx-auto flex flex-col items-center gap-6 md:gap-8 px-4">
          <div className="flex items-center gap-3 opacity-40">
             <Sword className="w-6 h-6 text-amber-500" />
             <span className="font-medieval text-lg text-stone-200 tracking-[0.3em] uppercase">Pug Quest</span>
          </div>
          <p className="text-stone-600 font-story text-sm tracking-widest uppercase">Forjado sob a luz de mil tochas em 2026.</p>
        </div>
      </footer>

      <Modal 
        isOpen={isAuthModalOpen} 
        onClose={closeAuthModal} 
        title={isVerificationSent ? 'Mensageiro Partiu' : (authMode === 'login' ? 'Identifique-se' : 'Nova Jornada')}
        size="md"
      >
        <AnimatePresence mode="wait">
          {isVerificationSent ? (
            <motion.div 
              key="verification"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center py-4 md:py-6"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-6 md:mb-8 border border-emerald-500/30 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
                <Send className="text-emerald-500 animate-float" size={32} md={40} />
              </div>
              <h4 className="font-medieval text-xl md:text-2xl text-stone-100 mb-4 uppercase tracking-widest amber-glow">O Vínculo Está Quase Completo!</h4>
              <p className="text-stone-300 font-story text-base md:text-lg mb-8 leading-relaxed">
                Um pergaminho de confirmação foi enviado para <span className="text-amber-400 font-bold">{formData.email}</span>. 
                <br /><br />
                Verifique seu oráculo (e-mail) para selar o pacto e iniciar sua jornada.
              </p>
              <div className="space-y-4">
                <Button fullWidth onClick={closeAuthModal} variant="secondary">Entendido, Mestre</Button>
                <p className="text-stone-500 text-[10px] uppercase tracking-widest">Não recebeu? Verifique a névoa (pasta de spam).</p>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="text-center mb-8 md:mb-10">
                <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 md:mb-6 border border-amber-500/30 shadow-[0_0_20px_rgba(251,191,36,0.1)]">
                  <ShieldCheck className="text-amber-500" size={24} md={28} />
                </div>
                <p className="text-amber-200/50 font-story text-sm md:text-base uppercase">
                  {authMode === 'login' ? 'Retorne ao seu tomo de aventuras.' : 'Crie sua conta para mestrar ou jogar.'}
                </p>
              </div>
              <form onSubmit={handleAuthSubmit} className="space-y-4 md:space-y-6">
                {authMode === 'register' && (
                  <div>
                    <label className="text-[9px] md:text-[10px] font-medieval uppercase tracking-widest text-amber-500 mb-1.5 md:mb-2 block">Nome do Herói / Mestre</label>
                    <div className="relative">
                      <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={16} />
                      <input 
                        required
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full bg-stone-950 border border-amber-900/40 rounded-xl p-3 md:p-3.5 pl-11 md:pl-12 text-stone-100 focus:border-amber-500 outline-none transition-all font-story text-base md:text-lg shadow-inner"
                        placeholder="Ex: Holdor Escudo de Ferro"
                      />
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-[9px] md:text-[10px] font-medieval uppercase tracking-widest text-amber-500 mb-1.5 md:mb-2 block">Vínculo Espiritual (Email)</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={16} />
                    <input 
                      required
                      type="email"
                      value={formData.email}
                      onChange={e => setFormData({...formData, email: e.target.value})}
                      className="w-full bg-stone-950 border border-amber-900/40 rounded-xl p-3 md:p-3.5 pl-11 md:pl-12 text-stone-100 focus:border-amber-500 outline-none transition-all font-story text-base md:text-lg shadow-inner"
                      placeholder="oraculo@reino.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] md:text-[10px] font-medieval uppercase tracking-widest text-amber-500 mb-1.5 md:mb-2 block">Palavra-Passe</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={16} />
                    <input 
                      required
                      type="password"
                      value={formData.password}
                      onChange={e => setFormData({...formData, password: e.target.value})}
                      className="w-full bg-stone-950 border border-amber-900/40 rounded-xl p-3 md:p-3.5 pl-11 md:pl-12 text-stone-100 focus:border-amber-500 outline-none transition-all font-story text-base md:text-lg shadow-inner"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                {authMode === 'register' && (
                  <div>
                    <label className="text-[9px] md:text-[10px] font-medieval uppercase tracking-widest text-amber-500 mb-1.5 md:mb-2 block">Confirmar Pacto</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500/40" size={16} />
                      <input 
                        required
                        type="password"
                        value={formData.confirmPassword}
                        onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                        className="w-full bg-stone-950 border border-amber-900/40 rounded-xl p-3 md:p-3.5 pl-11 md:pl-12 text-stone-100 focus:border-amber-500 outline-none transition-all font-story text-base md:text-lg shadow-inner"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
                {error && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500/80 text-[10px] text-center font-medieval uppercase tracking-widest py-3 bg-red-950/20 rounded-xl border border-red-900/30">
                    {error}
                  </motion.p>
                )}
                <Button fullWidth size="lg" type="submit" disabled={isLoading} className="shadow-lg mt-4">
                  {isLoading ? 'Conjurando...' : authMode === 'login' ? 'Entrar no Reino' : 'Forjar Minha Conta'}
                </Button>
                <div className="text-center mt-4 md:mt-6">
                  <button type="button" onClick={toggleAuthMode} className="text-amber-500/60 hover:text-amber-400 text-[10px] md:text-[11px] font-medieval uppercase tracking-[0.2em] transition-colors">
                    {authMode === 'login' ? 'Ainda não é um herói? Registre-se' : 'Já possui linhagem? Entre'}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </Modal>
    </div>
  );
};

const FeatureBadge: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
  <div className="flex items-center gap-4 bg-stone-950/60 p-3 rounded-2xl border border-white/5 transition-all hover:border-amber-500/30 group">
    <div className="p-1.5 bg-white/5 rounded-lg group-hover:scale-110 transition-transform">{icon}</div>
    <span className="text-[10px] text-stone-300 font-medieval tracking-widest uppercase">{label}</span>
  </div>
);

const FeatureCard: React.FC<{ icon: React.ReactNode, title: string, description: string }> = ({ icon, title, description }) => (
  <Card className="!p-8 md:!p-10 flex flex-col items-center text-center group border-amber-900/10">
    <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-amber-950/40 flex items-center justify-center mb-6 md:mb-8 border border-amber-500/20 group-hover:bg-amber-600 group-hover:text-amber-100 transition-all text-amber-500">
      {icon}
    </div>
    <h3 className="font-medieval text-lg md:text-xl text-stone-100 mb-3 md:mb-4 uppercase tracking-widest group-hover:text-amber-400 transition-colors">{title}</h3>
    <p className="font-story text-stone-400 leading-relaxed uppercase text-sm md:text-base">{description}</p>
  </Card>
);

export default Landing;
