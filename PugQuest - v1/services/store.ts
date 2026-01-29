
import { supabase } from './supabase.js';
import { User, Campaign, Membership, Character, Location, Story, Info, Monster, Role, ItemStatus } from '../types.js';

const mapCampaign = (c: any): Campaign => ({
  id: c.id,
  name: c.name,
  description: c.description,
  inviteCode: c.invite_code,
  // Fix: changed 'owner_id' to 'ownerId' to match the Campaign type definition
  ownerId: c.owner_id,
  createdAt: new Date(c.created_at).getTime(),
  imageUrl: c.image_url,
  status: c.status || 'Ativa'
});

export const Store = {
  // Auth
  async getCurrentUser(): Promise<User | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // 1. Pegamos os dados do Auth Metadata (sempre atualizados após updateProfile)
      let name = user.user_metadata?.name;
      let avatar = user.user_metadata?.avatar;
      
      // 2. Buscamos no profile apenas como redundância ou para pegar dados se o metadata falhar
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('name, avatar')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          // Só usamos o dado do banco se o metadata estiver vazio
          if (!name) name = profile.name;
          if (!avatar) avatar = profile.avatar;
        }
      } catch (e) {
        // Silencioso
      }

      // 3. Fallbacks finais
      return {
        id: user.id,
        email: user.email!,
        name: name || user.email?.split('@')[0] || 'Aventureiro',
        avatar: avatar || 'Shield'
      };
    } catch (e) {
      console.error("Auth error:", e);
      return null;
    }
  },

  async updateProfile(userId: string, data: { name: string, avatar: string }) {
    // 1. Atualiza metadados do Auth (Instantâneo para o usuário atual)
    const { error: authError } = await supabase.auth.updateUser({
      data: { name: data.name, avatar: data.avatar }
    });
    
    if (authError) {
      console.error("Erro ao atualizar metadados:", authError);
      throw authError;
    }

    // 2. Atualiza tabela profiles (Para que outros vejam seu nome/avatar)
    // Se isso falhar por falta de RLS, o Metadata acima ainda garante que a TopBar funcione.
    try {
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ name: data.name, avatar: data.avatar })
        .eq('id', userId);
      
      if (profileError) {
        console.warn("Erro ao atualizar tabela profiles (verifique as políticas RLS):", profileError);
      }
    } catch (e) {
      console.warn("Tabela profiles não pôde ser atualizada.");
    }

    // 3. Notifica o sistema de que houve mudança
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('profileUpdate'));
  },

  async signUp(email: string, password: string, name: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { name, avatar: 'Shield' } 
      }
    });
    if (error) throw error;
    return data.user;
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
  },

  async signOut() {
    await supabase.auth.signOut();
    window.dispatchEvent(new Event('storage'));
  },

  // Campaigns
  async getCampaigns(userId: string): Promise<{ master: Campaign[], player: Campaign[] }> {
    const { data: memberships, error } = await supabase
      .from('memberships')
      .select('role, campaign_id')
      .eq('user_id', userId);

    if (error) throw error;
    if (!memberships || memberships.length === 0) return { master: [], player: [] };

    const campaignIds = memberships.map(m => m.campaign_id);

    const { data: campaigns, error: cError } = await supabase
      .from('campaigns')
      .select('*')
      .in('id', campaignIds);

    if (cError) throw cError;

    const master: Campaign[] = [];
    const player: Campaign[] = [];

    campaigns?.forEach((c: any) => {
      const mem = memberships.find(m => m.campaign_id === c.id);
      const campaign = mapCampaign(c);
      if (mem?.role === 'MASTER') master.push(campaign);
      else player.push(campaign);
    });

    return { master, player };
  },

  async createCampaign(name: string, description: string, userId: string) {
    const inviteCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    const { data: campaign, error: cError } = await supabase
      .from('campaigns')
      .insert([{ 
        name, 
        description, 
        invite_code: inviteCode, 
        owner_id: userId,
        status: 'Ativa'
      }])
      .select()
      .single();

    if (cError) throw new Error(`Erro ao criar aventura: ${cError.message}`);

    const { error: mError } = await supabase
      .from('memberships')
      .insert([{ 
        user_id: userId, 
        campaign_id: campaign.id, 
        role: 'MASTER' 
      }]);

    if (mError) {
      await supabase.from('campaigns').delete().eq('id', campaign.id);
      throw new Error(`Erro ao vincular mestre: ${mError.message}`);
    }

    return mapCampaign(campaign);
  },

  async updateCampaign(id: string, data: Partial<Campaign>) {
    const dbData: any = {};
    if (data.name) dbData.name = data.name;
    if (data.description !== undefined) dbData.description = data.description;
    if (data.imageUrl !== undefined) dbData.image_url = data.imageUrl;
    if (data.status) dbData.status = data.status;

    const { error } = await supabase.from('campaigns').update(dbData).eq('id', id);
    if (error) throw error;
  },

  async deleteCampaign(id: string) {
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) throw error;
  },

  async joinCampaign(userId: string, inviteCode: string) {
    const { data: campaign, error: cError } = await supabase
      .from('campaigns')
      .select('id')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (cError || !campaign) throw new Error('Aventura não encontrada.');

    const { error: mError } = await supabase
      .from('memberships')
      .insert([{ user_id: userId, campaign_id: campaign.id, role: 'PLAYER' }]);

    if (mError) {
      if (mError.code === '23505') throw new Error('Você já faz parte desta aventura.');
      throw mError;
    }
    
    return campaign.id;
  },

  async getCampaignById(id: string): Promise<Campaign | null> {
    const { data, error } = await supabase.from('campaigns').select('*').eq('id', id).single();
    if (error) return null;
    return mapCampaign(data);
  },

  async getMembership(userId: string, campaignId: string): Promise<Membership | null> {
    const { data, error } = await supabase
      .from('memberships')
      .select('*')
      .eq('user_id', userId)
      .eq('campaign_id', campaignId)
      .single();
    if (error) return null;
    return {
      userId: data.user_id,
      campaignId: data.campaign_id,
      role: data.role as Role
    };
  },

  async getCampaignMembers(campaignId: string): Promise<Membership[]> {
    const { data: memberships, error: mError } = await supabase
      .from('memberships')
      .select('*')
      .eq('campaign_id', campaignId);
    
    if (mError) throw mError;
    if (!memberships) return [];

    const userIds = memberships.map(m => m.user_id);
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select('*')
      .in('id', userIds);

    return memberships.map(m => {
      const profile = profiles?.find(p => p.id === m.user_id);
      return {
        userId: m.user_id,
        campaignId: m.campaign_id,
        role: m.role as Role,
        profile: profile ? {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          avatar: profile.avatar
        } : undefined
      };
    });
  },

  async removeMember(campaignId: string, userId: string) {
    const { error } = await supabase
      .from('memberships')
      .delete()
      .eq('campaign_id', campaignId)
      .eq('user_id', userId);
    if (error) throw error;
  },

  async getMembershipCount(campaignId: string): Promise<number> {
    const { data, error } = await supabase
      .from('memberships')
      .select('id')
      .eq('campaign_id', campaignId);
    
    if (error) return 0;
    return data?.length || 0;
  },

  async getCharacters(campaignId: string): Promise<Character[]> {
    const { data, error } = await supabase.from('characters').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return (data || []).map(c => ({
      ...c,
      id: c.id,
      campaignId: c.campaign_id,
      imageUrl: c.image_url,
      characterType: c.character_type,
      isVisibleToPlayers: c.is_visible_to_players,
      createdAt: new Date(c.created_at).getTime()
    }));
  },

  async saveCharacter(char: any) {
    const dbChar: any = {
      campaign_id: char.campaignId,
      name: char.name,
      description: char.description,
      history: char.history,
      image_url: char.imageUrl,
      status: char.status,
      character_type: char.characterType,
      is_visible_to_players: char.isVisibleToPlayers
    };
    if (char.id) dbChar.id = char.id;
    const { data, error } = await supabase.from('characters').upsert(dbChar).select().single();
    if (error) throw error;
    return data;
  },

  async deleteCharacter(id: string) {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (error) throw error;
  },

  async getLocations(campaignId: string): Promise<Location[]> {
    const { data, error } = await supabase.from('locations').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return (data || []).map(l => ({
      ...l,
      id: l.id,
      campaignId: l.campaign_id,
      parentId: l.parent_id,
      imageUrl: l.image_url,
      isVisibleToPlayers: l.is_visible_to_players,
      createdAt: new Date(l.created_at).getTime()
    }));
  },

  async saveLocation(loc: any) {
    const dbLoc: any = {
      campaign_id: loc.campaignId,
      name: loc.name,
      description: loc.description,
      image_url: loc.imageUrl,
      parent_id: loc.parentId || null,
      is_visible_to_players: loc.isVisibleToPlayers
    };
    if (loc.id) dbLoc.id = loc.id;
    const { data, error } = await supabase.from('locations').upsert(dbLoc).select().single();
    if (error) throw error;
    return data;
  },

  async deleteLocation(id: string) {
    const { error } = await supabase.from('locations').delete().eq('id', id);
    if (error) throw error;
  },

  async getStories(campaignId: string): Promise<Story[]> {
    const { data, error } = await supabase.from('stories').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return (data || []).map(s => ({
      ...s,
      id: s.id,
      campaignId: s.campaign_id,
      imageUrl: s.image_url,
      isVisibleToPlayers: s.is_visible_to_players,
      createdAt: new Date(s.created_at).getTime()
    }));
  },

  async saveStory(story: any) {
    const dbStory: any = {
      campaign_id: story.campaignId,
      name: story.name,
      description: story.description,
      image_url: story.imageUrl,
      is_visible_to_players: story.isVisibleToPlayers
    };
    if (story.id) dbStory.id = story.id;
    const { data, error = null } = await supabase.from('stories').upsert(dbStory).select().single();
    if (error) throw error;
    return data;
  },

  async deleteStory(id: string) {
    const { error } = await supabase.from('stories').delete().eq('id', id);
    if (error) throw error;
  },

  async getInfos(campaignId: string): Promise<Info[]> {
    const { data, error } = await supabase.from('infos').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return (data || []).map(i => ({
      ...i,
      id: i.id,
      campaignId: i.campaign_id,
      category: i.category,
      imageUrl: i.image_url,
      isVisibleToPlayers: i.is_visible_to_players,
      createdAt: new Date(i.created_at).getTime()
    }));
  },

  async saveInfo(info: any) {
    const dbInfo: any = {
      campaign_id: info.campaignId,
      name: info.name,
      description: info.description,
      category: info.category,
      image_url: info.imageUrl,
      is_visible_to_players: info.isVisibleToPlayers
    };
    if (info.id) dbInfo.id = info.id;
    const { data, error } = await supabase.from('infos').upsert(dbInfo).select().single();
    if (error) throw error;
    return data;
  },

  async deleteInfo(id: string) {
    const { error } = await supabase.from('infos').delete().eq('id', id);
    if (error) throw error;
  },

  async getMonsters(campaignId: string): Promise<Monster[]> {
    const { data, error } = await supabase.from('monsters').select('*').eq('campaign_id', campaignId);
    if (error) return [];
    return (data || []).map(m => ({
      ...m,
      id: m.id,
      campaignId: m.campaign_id,
      difficulty: m.difficulty,
      imageUrl: m.image_url,
      isVisibleToPlayers: m.is_visible_to_players,
      createdAt: new Date(m.created_at).getTime()
    }));
  },

  async saveMonster(monster: any) {
    const dbMonster: any = {
      campaign_id: monster.campaignId,
      name: monster.name,
      description: monster.description,
      difficulty: monster.difficulty,
      image_url: monster.imageUrl,
      is_visible_to_players: monster.isVisibleToPlayers
    };
    if (monster.id) dbMonster.id = monster.id;
    const { data, error } = await supabase.from('monsters').upsert(dbMonster).select().single();
    if (error) throw error;
    return data;
  },

  async deleteMonster(id: string) {
    const { error } = await supabase.from('monsters').delete().eq('id', id);
    if (error) throw error;
  }
};
