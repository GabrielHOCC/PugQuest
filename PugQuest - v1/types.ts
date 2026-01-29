
export type Role = 'MASTER' | 'PLAYER';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Profile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface Campaign {
  id: string;
  name: string;
  description?: string;
  inviteCode: string;
  ownerId: string;
  createdAt: number;
  imageUrl?: string;
  status: string;
}

export interface Membership {
  userId: string;
  campaignId: string;
  role: Role;
  profile?: Profile;
}

export enum ItemStatus {
  ALIVE = 'Alive',
  DEAD = 'Dead',
  UNKNOWN = 'Unknown',
  MISSING = 'Missing'
}

export type CharacterType = 'Aliado' | 'NPC' | 'Neutro' | 'Inimigo';

export type InfoCategory = 'Regra' | 'História/Lore' | 'Mapa' | 'Símbolo' | 'Aviso' | 'Segredo' | 'Outro';

export type MonsterDifficulty = 'Fácil' | 'Médio' | 'Difícil' | 'Lendário';

export interface CampaignItem {
  id: string;
  campaignId: string;
  name: string;
  description: string;
  imageUrl?: string;
  isVisibleToPlayers: boolean;
  createdAt: number;
}

export interface Character extends CampaignItem {
  status: ItemStatus;
  characterType: CharacterType;
  history?: string;
}

export interface Location extends CampaignItem {
  parentId?: string;
}

export interface Story extends CampaignItem {}

export interface Info extends CampaignItem {
  category: InfoCategory;
}

export interface Monster extends CampaignItem {
  difficulty: MonsterDifficulty;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
