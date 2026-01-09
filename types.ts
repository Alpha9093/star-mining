
export type Tab = 'mine' | 'boost' | 'tasks' | 'friends' | 'wallet' | 'admin';

export interface Boost {
  id: string;
  name: string;
  description: string;
  baseCost: number;
  multiplier: number;
  level: number;
  icon: string;
}

export interface Task {
  id: string;
  title: string;
  reward: number;
  icon: string;
  link: string;
  completed: boolean;
}

export interface WithdrawalRequest {
  id: string;
  userId: string;
  address: string;
  amount: number;
  amountUsd?: number;
  status: 'pending' | 'completed';
  timestamp: number;
}

export interface UserProfile {
  id: string;
  balance: number;
  isBanned?: boolean;
  isAdmin?: boolean;
  lastUpdate: number;
}

export interface GameState {
  balance: number;
  energy: number;
  maxEnergy: number;
  rechargeRate: number;
  multitap: number;
  autoMiningRate: number;
  lastUpdate: number;
  isBanned?: boolean;
  isAdmin?: boolean;
}
