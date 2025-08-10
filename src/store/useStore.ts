/**
 * Zustand Store for CupNote v6
 * Global state management
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ========================================
// Type Definitions
// ========================================

interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  level: number;
  points: number;
}

interface CoffeeRecord {
  id: string;
  mode: 'cafe' | 'homecafe';
  coffeeName: string;
  cafeName?: string;
  roastery?: string;
  brewMethod?: string;
  waterTemp?: number;
  brewTime?: string;
  flavors: string[];
  sensoryExpressions: string[];
  ratings?: {
    acidity: number;
    sweetness: number;
    bitterness: number;
    body: number;
    balance: number;
    cleanliness: number;
    aftertaste: number;
  };
  overallRating: number;
  notes?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TastingFlowData {
  mode?: 'cafe' | 'homecafe';
  currentScreen?: string; // 현재 진행 중인 스크린
  lastUpdated?: Date; // 마지막 업데이트 시간
  coffeeInfo?: {
    coffeeName: string;
    cafeName?: string;
    roastery?: string;
    roasterNote?: string;
  };
  brewSetup?: {
    brewMethod: string;
    waterTemp: number;
    brewTime: string;
  };
  flavors?: string[];
  sensoryExpressions?: string[];
  ratings?: {
    acidity: number;
    sweetness: number;
    bitterness: number;
    body: number;
    balance: number;
    cleanliness: number;
    aftertaste: number;
  };
  personalNotes?: {
    overallRating: number;
    notes: string;
    shareToCommnity: boolean;
  };
}

interface AppState {
  // User
  user: User | null;
  isAuthenticated: boolean;
  
  // Coffee Records
  records: CoffeeRecord[];
  currentRecord: CoffeeRecord | null;
  
  // TastingFlow
  tastingFlowData: TastingFlowData;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  
  // Stats
  stats: {
    totalRecords: number;
    cafeRecords: number;
    homecafeRecords: number;
    averageRating: number;
    totalAchievements: number;
  };
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  setRecords: (records: CoffeeRecord[]) => void;
  addRecord: (record: CoffeeRecord) => void;
  updateRecord: (id: string, record: Partial<CoffeeRecord>) => void;
  deleteRecord: (id: string) => void;
  setCurrentRecord: (record: CoffeeRecord | null) => void;
  setTastingFlowData: (data: Partial<TastingFlowData>) => void;
  resetTastingFlowData: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  updateStats: (stats: Partial<AppState['stats']>) => void;
  logout: () => void;
}

// ========================================
// Store Implementation
// ========================================

const useStore = create<AppState>()(
  persist(
    (set) => ({
      // Initial State
      user: null,
      isAuthenticated: false,
      records: [],
      currentRecord: null,
      tastingFlowData: {},
      isLoading: false,
      error: null,
      stats: {
        totalRecords: 0,
        cafeRecords: 0,
        homecafeRecords: 0,
        averageRating: 0,
        totalAchievements: 0,
      },
      
      // Actions
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
      
      setRecords: (records) => set({ records }),
      
      addRecord: (record) => 
        set((state) => ({
          records: [record, ...state.records],
          stats: {
            ...state.stats,
            totalRecords: state.stats.totalRecords + 1,
            cafeRecords: state.stats.cafeRecords + (record.mode === 'cafe' ? 1 : 0),
            homecafeRecords: state.stats.homecafeRecords + (record.mode === 'homecafe' ? 1 : 0),
            averageRating: 
              (state.stats.averageRating * state.stats.totalRecords + record.overallRating) / 
              (state.stats.totalRecords + 1),
          },
        })),
      
      updateRecord: (id, updates) =>
        set((state) => ({
          records: state.records.map((record) =>
            record.id === id
              ? { ...record, ...updates, updatedAt: new Date() }
              : record
          ),
          currentRecord:
            state.currentRecord?.id === id
              ? { ...state.currentRecord, ...updates, updatedAt: new Date() }
              : state.currentRecord,
        })),
      
      deleteRecord: (id) =>
        set((state) => {
          const deletedRecord = state.records.find(r => r.id === id);
          const newRecords = state.records.filter((record) => record.id !== id);
          
          return {
            records: newRecords,
            currentRecord: state.currentRecord?.id === id ? null : state.currentRecord,
            stats: deletedRecord ? {
              ...state.stats,
              totalRecords: state.stats.totalRecords - 1,
              cafeRecords: state.stats.cafeRecords - (deletedRecord.mode === 'cafe' ? 1 : 0),
              homecafeRecords: state.stats.homecafeRecords - (deletedRecord.mode === 'homecafe' ? 1 : 0),
              averageRating: 
                state.stats.totalRecords > 1
                  ? (state.stats.averageRating * state.stats.totalRecords - deletedRecord.overallRating) / 
                    (state.stats.totalRecords - 1)
                  : 0,
            } : state.stats,
          };
        }),
      
      setCurrentRecord: (record) => set({ currentRecord: record }),
      
      setTastingFlowData: (data) =>
        set((state) => ({
          tastingFlowData: { 
            ...state.tastingFlowData, 
            ...data,
            lastUpdated: new Date() 
          },
        })),
      
      resetTastingFlowData: () => set({ tastingFlowData: {} }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error }),
      
      updateStats: (stats) =>
        set((state) => ({
          stats: { ...state.stats, ...stats },
        })),
      
      logout: () =>
        set({
          user: null,
          isAuthenticated: false,
          records: [],
          currentRecord: null,
          tastingFlowData: {},
          isLoading: false,
          error: null,
          stats: {
            totalRecords: 0,
            cafeRecords: 0,
            homecafeRecords: 0,
            averageRating: 0,
            totalAchievements: 0,
          },
        }),
    }),
    {
      name: 'cupnote-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        records: state.records,
        stats: state.stats,
        tastingFlowData: state.tastingFlowData,
      }),
    }
  )
);

export default useStore;