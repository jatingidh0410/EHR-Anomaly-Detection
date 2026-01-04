import { create } from 'zustand';
import type { Threat, DashboardStats } from '../types';

interface ThreatState {
  threats: Threat[];
  stats: DashboardStats;
  selectedThreat: Threat | null;
  loading: boolean;
  
  setThreats: (threats: Threat[]) => void;
  addThreat: (threat: Threat) => void;
  setStats: (stats: DashboardStats) => void;
  setSelectedThreat: (threat: Threat | null) => void;
  setLoading: (loading: boolean) => void;
  clearThreats: () => void;
}

export const useThreatStore = create<ThreatState>((set) => ({
  threats: [],
  stats: {
    total_threats: 0,
    critical: 0,
    warnings: 0,
    avg_confidence: 0,
    accuracy: 0.99,
    precision: 0.99,
    recall: 0.98,
    f1: 0.98
  },
  selectedThreat: null,
  loading: true,
  
  setThreats: (threats) => set({ threats }),
  addThreat: (threat) => set((state) => ({ threats: [...state.threats, threat] })),
  setStats: (stats) => set({ stats }),
  setSelectedThreat: (threat) => set({ selectedThreat: threat }),
  setLoading: (loading) => set({ loading }),
  clearThreats: () => set({ threats: [] })
}));
