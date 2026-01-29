
import React, { useState } from 'react';
import { Store } from '../services/store.js';
import { Button } from '../components/Button.js';
import { Card } from '../components/Card.js';
import { ChevronLeft, Key } from 'lucide-react';

const JoinCampaign: React.FC = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = await Store.getCurrentUser();
    if (!user) {
      window.location.hash = '#/login';
      return;
    }

    try {
      const campaignId = await Store.joinCampaign(user.id, code.toUpperCase());
      if (campaignId) {
        window.location.hash = `#/campaign/${campaignId}`;
      } else {
        setError('Código de convite inválido ou não encontrado.');
      }
    } catch (err: any) {
      setError(err.message || 'Código de convite inválido ou não encontrado.');
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center p-4">
      <Card className="w-full max-w-md !cursor-default">
        <button 
          onClick={() => window.location.hash = '#/dashboard'}
          className="flex items-center text-amber-400 text-sm font-medieval uppercase tracking-widest mb-8 hover:opacity-80 transition-opacity"
        >
          <ChevronLeft size={16} className="mr-1" /> Voltar
        </button>

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4 border border-amber-500/30">
            <Key className="text-amber-400" />
          </div>
          <h2 className="text-3xl font-medieval text-white mb-2">Entrar em Aventura</h2>
          <p className="text-stone-400 font-story">Insira o código fornecido pelo seu mestre.</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-6">
          <div>
            <input 
              required
              value={code}
              onChange={e => setCode(e.target.value)}
              className="w-full bg-black/40 border-2 border-amber-500/20 rounded-lg p-4 text-center text-3xl font-medieval tracking-[0.5em] text-amber-400 focus:border-amber-500 outline-none transition-all uppercase"
              placeholder="XXXXXX"
              maxLength={6}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center font-medieval uppercase tracking-widest">{error}</p>}

          <Button fullWidth size="lg" type="submit">Vincular Alma</Button>
        </form>
      </Card>
    </div>
  );
};

export default JoinCampaign;
