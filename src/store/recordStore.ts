import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TastingRecord, RecordMode, Database } from '../types';
import { ErrorHandler, createNetworkError, createStorageError } from '../utils/errorHandler';
import { supabase } from '../lib/supabase';

export interface RecordFilter {
  mode?: RecordMode | 'all';
  dateRange?: {
    startDate: Date;
    endDate: Date;
  };
  rating?: {
    min: number;
    max: number;
  };
  roastery?: string;
  origin?: string;
  tags?: string[];
}

export interface RecordSort {
  field: 'created_at' | 'updated_at' | 'rating' | 'name';
  order: 'asc' | 'desc';
}

export interface RecordListItem {
  id: string;
  name: string;
  roastery?: string;
  rating: number;
  mode: RecordMode;
  recordedAt: Date;
  thumbnail?: string;
  tags: string[];
}

export interface RecordDraft {
  id: string;
  mode: RecordMode;
  currentStep: string;
  data: any;
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
}

interface RecordState {
  // Records data
  records: TastingRecord[];
  currentRecord: TastingRecord | null;
  totalRecords: number;
  
  // Pagination & Loading
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
  isLoadingRecords: boolean;
  isLoadingMore: boolean;
  
  // Search & Filter
  searchQuery: string;
  activeFilters: RecordFilter;
  sortBy: RecordSort['field'];
  sortOrder: RecordSort['order'];
  filterMode: 'all' | RecordMode;
  
  // Drafts
  draftsList: RecordDraft[];
  currentDraft: RecordDraft | null;
  
  // UI State
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  lastSyncAt: Date | null;
  
  // Actions - Records CRUD
  loadRecords: (force?: boolean) => Promise<void>;
  loadMoreRecords: () => Promise<void>;
  saveRecord: (record: Partial<TastingRecord>) => Promise<TastingRecord>;
  updateRecord: (id: string, updates: Partial<TastingRecord>) => Promise<TastingRecord>;
  deleteRecord: (id: string) => Promise<void>;
  getRecord: (id: string) => TastingRecord | null;
  
  // Actions - Search & Filter
  searchRecords: (query: string) => Promise<void>;
  setFilterMode: (mode: 'all' | RecordMode) => void;
  setSortOrder: (field: RecordSort['field'], order: RecordSort['order']) => void;
  applyFilters: (filters: RecordFilter) => Promise<void>;
  clearSearch: () => void;
  clearFilters: () => void;
  
  // Actions - Drafts
  saveDraft: (draft: Partial<RecordDraft>) => Promise<RecordDraft>;
  loadDrafts: () => Promise<void>;
  loadDraft: (id: string) => Promise<RecordDraft | null>;
  deleteDraft: (id: string) => Promise<void>;
  cleanupExpiredDrafts: () => Promise<void>;
  
  // Actions - Utility
  refreshRecords: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  clearError: () => void;
  setCurrentRecord: (record: TastingRecord | null) => void;
  
  // Computed properties
  getRecordsByMode: (mode: RecordMode) => TastingRecord[];
  getRecentRecords: (limit?: number) => TastingRecord[];
  getRecordStats: () => {
    total: number;
    cafeMode: number;
    homecafeMode: number;
    averageRating: number;
    thisMonth: number;
  };
}

// Helper functions
const transformDbRecordToTastingRecord = (dbRecord: Database['public']['Tables']['tasting_records']['Row']): TastingRecord => {
  return {
    id: dbRecord.id,
    userId: dbRecord.user_id,
    mode: dbRecord.mode,
    status: dbRecord.status,
    coffee: dbRecord.coffee_data,
    cafe: dbRecord.cafe_data,
    brew: dbRecord.brew_data,
    taste: dbRecord.taste_data,
    flavors: dbRecord.flavors || [],
    flavorIntensity: dbRecord.flavor_intensity,
    sensoryExpression: dbRecord.sensory_expression,
    notes: dbRecord.notes,
    rating: dbRecord.rating,
    mood: dbRecord.mood,
    context: dbRecord.context,
    tags: dbRecord.tags || [],
    photos: dbRecord.photos || [],
    shareWithCommunity: dbRecord.share_with_community,
    repurchaseIntent: dbRecord.repurchase_intent,
    createdAt: new Date(dbRecord.created_at),
    updatedAt: new Date(dbRecord.updated_at),
  };
};

const transformTastingRecordToDbRecord = (record: TastingRecord): Database['public']['Tables']['tasting_records']['Insert'] => {
  return {
    user_id: record.userId,
    mode: record.mode,
    status: record.status,
    coffee_data: record.coffee,
    cafe_data: record.cafe,
    brew_data: record.brew,
    taste_data: record.taste,
    flavors: record.flavors,
    flavor_intensity: record.flavorIntensity,
    sensory_expression: record.sensoryExpression,
    notes: record.notes,
    rating: record.rating,
    mood: record.mood,
    context: record.context,
    tags: record.tags,
    photos: record.photos,
    share_with_community: record.shareWithCommunity,
    repurchase_intent: record.repurchaseIntent,
  };
};

export const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      // Initial State
      records: [],
      currentRecord: null,
      totalRecords: 0,
      
      currentPage: 1,
      pageSize: 20,
      hasMore: true,
      isLoadingRecords: false,
      isLoadingMore: false,
      
      searchQuery: '',
      activeFilters: {},
      sortBy: 'created_at',
      sortOrder: 'desc',
      filterMode: 'all',
      
      draftsList: [],
      currentDraft: null,
      
      isLoading: false,
      isSaving: false,
      error: null,
      lastSyncAt: null,

      // Load records from server/local storage
      loadRecords: async (force = false) => {
        const state = get();
        
        if (state.isLoadingRecords && !force) return;
        
        set({ isLoadingRecords: true, error: null });
        
        try {
          // Build query based on current filters and search
          let query = supabase
            .from('tasting_records')
            .select('*')
            .range(0, state.pageSize - 1)
            .order(state.sortBy, { ascending: state.sortOrder === 'asc' });
          
          // Apply search filter
          if (state.searchQuery.trim()) {
            query = query.or(`coffee_data->>name.ilike.%${state.searchQuery}%,coffee_data->>roastery.ilike.%${state.searchQuery}%,cafe_data->>name.ilike.%${state.searchQuery}%`);
          }
          
          // Apply mode filter
          if (state.filterMode !== 'all') {
            query = query.eq('mode', state.filterMode);
          }
          
          const { data, error, count } = await query;
          
          if (error) throw error;
          
          const records = data?.map(transformDbRecordToTastingRecord) || [];
          
          set({
            records,
            totalRecords: count || 0,
            hasMore: records.length === state.pageSize,
            currentPage: 1,
            isLoadingRecords: false,
            lastSyncAt: new Date(),
          });
          
          // Also cache locally for offline access
          try {
            await AsyncStorage.setItem('@tasting_records', JSON.stringify(records));
          } catch (storageError) {
            console.warn('Failed to cache records locally:', storageError);
          }
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load records');
          
          // Try to load from local cache
          try {
            const cachedRecords = await AsyncStorage.getItem('@tasting_records');
            if (cachedRecords) {
              const records = JSON.parse(cachedRecords).map((r: any) => ({
                ...r,
                createdAt: new Date(r.createdAt),
                updatedAt: new Date(r.updatedAt),
              }));
              
              set({
                records,
                totalRecords: records.length,
                hasMore: false,
                isLoadingRecords: false,
                error: 'Showing cached data - ' + appError.message,
              });
              return;
            }
          } catch (cacheError) {
            console.warn('Failed to load cached records:', cacheError);
          }
          
          set({
            isLoadingRecords: false,
            error: appError.message,
          });
          
          ErrorHandler.logError(appError);
          throw error;
        }
      },
      
      // Load more records for pagination
      loadMoreRecords: async () => {
        const state = get();
        
        if (state.isLoadingMore || !state.hasMore) return;
        
        set({ isLoadingMore: true, error: null });
        
        try {
          const startIndex = state.currentPage * state.pageSize;
          
          let query = supabase
            .from('tasting_records')
            .select('*')
            .range(startIndex, startIndex + state.pageSize - 1)
            .order(state.sortBy, { ascending: state.sortOrder === 'asc' });
          
          // Apply current filters
          if (state.searchQuery.trim()) {
            query = query.or(`coffee_data->>name.ilike.%${state.searchQuery}%,coffee_data->>roastery.ilike.%${state.searchQuery}%,cafe_data->>name.ilike.%${state.searchQuery}%`);
          }
          
          if (state.filterMode !== 'all') {
            query = query.eq('mode', state.filterMode);
          }
          
          const { data, error } = await query;
          
          if (error) throw error;
          
          const newRecords = data?.map(transformDbRecordToTastingRecord) || [];
          
          set({
            records: [...state.records, ...newRecords],
            currentPage: state.currentPage + 1,
            hasMore: newRecords.length === state.pageSize,
            isLoadingMore: false,
          });
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load more records');
          set({
            isLoadingMore: false,
            error: appError.message,
          });
          ErrorHandler.logError(appError);
        }
      },

      // Save new record
      saveRecord: async (recordData) => {
        set({ isSaving: true, error: null });
        
        try {
          // Create complete record with required fields
          const newRecord: TastingRecord = {
            id: '', // Will be set by database
            userId: recordData.userId || '',
            mode: recordData.mode || 'cafe',
            status: recordData.status || 'completed',
            coffee: recordData.coffee || { id: '', name: '' },
            taste: recordData.taste || {
              acidity: 3, sweetness: 3, bitterness: 3,
              body: 3, balance: 3, cleanness: 3, aftertaste: 3
            },
            flavors: recordData.flavors || [],
            rating: recordData.rating || 3,
            shareWithCommunity: recordData.shareWithCommunity || false,
            createdAt: new Date(),
            updatedAt: new Date(),
            ...recordData,
          };
          
          const dbRecord = transformTastingRecordToDbRecord(newRecord);
          
          const { data, error } = await supabase
            .from('tasting_records')
            .insert(dbRecord)
            .select()
            .single();
          
          if (error) throw error;
          
          const savedRecord = transformDbRecordToTastingRecord(data);
          
          set(state => ({
            records: [savedRecord, ...state.records],
            totalRecords: state.totalRecords + 1,
            isSaving: false,
          }));
          
          // Update local cache
          try {
            const updatedRecords = [savedRecord, ...get().records];
            await AsyncStorage.setItem('@tasting_records', JSON.stringify(updatedRecords));
          } catch (storageError) {
            console.warn('Failed to update local cache:', storageError);
          }
          
          return savedRecord;
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Save record');
          set({ isSaving: false, error: appError.message });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Update existing record
      updateRecord: async (id, updates) => {
        set({ isSaving: true, error: null });
        
        try {
          const currentRecord = get().records.find(r => r.id === id);
          if (!currentRecord) {
            throw new Error('Record not found');
          }
          
          const updatedRecord = {
            ...currentRecord,
            ...updates,
            updatedAt: new Date(),
          };
          
          const dbUpdates = transformTastingRecordToDbRecord(updatedRecord);
          
          const { data, error } = await supabase
            .from('tasting_records')
            .update(dbUpdates)
            .eq('id', id)
            .select()
            .single();
          
          if (error) throw error;
          
          const savedRecord = transformDbRecordToTastingRecord(data);
          
          set(state => ({
            records: state.records.map(r => r.id === id ? savedRecord : r),
            currentRecord: state.currentRecord?.id === id ? savedRecord : state.currentRecord,
            isSaving: false,
          }));
          
          return savedRecord;
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Update record');
          set({ isSaving: false, error: appError.message });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Delete record
      deleteRecord: async (id) => {
        set({ isLoading: true, error: null });
        
        try {
          const { error } = await supabase
            .from('tasting_records')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set(state => ({
            records: state.records.filter(r => r.id !== id),
            currentRecord: state.currentRecord?.id === id ? null : state.currentRecord,
            totalRecords: state.totalRecords - 1,
            isLoading: false,
          }));
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Delete record');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Get single record
      getRecord: (id) => {
        return get().records.find(r => r.id === id) || null;
      },

      // Search records
      searchRecords: async (query) => {
        set({ searchQuery: query });
        await get().loadRecords(true);
      },

      // Set filter mode
      setFilterMode: (mode) => {
        set({ filterMode: mode });
        get().loadRecords(true);
      },

      // Set sort order
      setSortOrder: (field, order) => {
        set({ sortBy: field, sortOrder: order });
        get().loadRecords(true);
      },

      // Apply complex filters
      applyFilters: async (filters) => {
        set({ activeFilters: filters });
        await get().loadRecords(true);
      },

      // Clear search
      clearSearch: () => {
        set({ searchQuery: '' });
        get().loadRecords(true);
      },

      // Clear filters
      clearFilters: () => {
        set({ 
          activeFilters: {},
          filterMode: 'all',
          searchQuery: '',
        });
        get().loadRecords(true);
      },

      // Draft management
      saveDraft: async (draftData) => {
        set({ isSaving: true, error: null });
        
        try {
          const draft: RecordDraft = {
            id: draftData.id || Date.now().toString(),
            mode: draftData.mode || 'cafe',
            currentStep: draftData.currentStep || 'mode-select',
            data: draftData.data || {},
            createdAt: draftData.id ? (draftData.createdAt || new Date()) : new Date(),
            updatedAt: new Date(),
            expiresAt: draftData.expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          };
          
          // Save to database
          const { data, error } = await supabase
            .from('drafts')
            .upsert({
              id: draft.id,
              user_id: draft.id, // Assuming user ID is available in context
              mode: draft.mode,
              current_step: draft.currentStep,
              data: draft.data,
              expires_at: draft.expiresAt.toISOString(),
            })
            .select()
            .single();
          
          if (error) throw error;
          
          set(state => {
            const existingIndex = state.draftsList.findIndex(d => d.id === draft.id);
            const newDraftsList = existingIndex >= 0 
              ? state.draftsList.map((d, i) => i === existingIndex ? draft : d)
              : [...state.draftsList, draft];
            
            return {
              draftsList: newDraftsList,
              currentDraft: draft,
              isSaving: false,
            };
          });
          
          return draft;
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Save draft');
          set({ isSaving: false, error: appError.message });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Load drafts
      loadDrafts: async () => {
        set({ isLoading: true, error: null });
        
        try {
          const { data, error } = await supabase
            .from('drafts')
            .select('*')
            .gt('expires_at', new Date().toISOString())
            .order('updated_at', { ascending: false });
          
          if (error) throw error;
          
          const drafts: RecordDraft[] = data?.map(d => ({
            id: d.id,
            mode: d.mode,
            currentStep: d.current_step,
            data: d.data,
            createdAt: new Date(d.created_at),
            updatedAt: new Date(d.updated_at),
            expiresAt: new Date(d.expires_at),
          })) || [];
          
          set({
            draftsList: drafts,
            isLoading: false,
          });
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load drafts');
          set({ isLoading: false, error: appError.message });
          ErrorHandler.logError(appError);
        }
      },

      // Load specific draft
      loadDraft: async (id) => {
        const draft = get().draftsList.find(d => d.id === id);
        if (draft) {
          set({ currentDraft: draft });
          return draft;
        }
        
        try {
          const { data, error } = await supabase
            .from('drafts')
            .select('*')
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          const loadedDraft: RecordDraft = {
            id: data.id,
            mode: data.mode,
            currentStep: data.current_step,
            data: data.data,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            expiresAt: new Date(data.expires_at),
          };
          
          set({ currentDraft: loadedDraft });
          return loadedDraft;
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load draft');
          ErrorHandler.logError(appError);
          return null;
        }
      },

      // Delete draft
      deleteDraft: async (id) => {
        try {
          const { error } = await supabase
            .from('drafts')
            .delete()
            .eq('id', id);
          
          if (error) throw error;
          
          set(state => ({
            draftsList: state.draftsList.filter(d => d.id !== id),
            currentDraft: state.currentDraft?.id === id ? null : state.currentDraft,
          }));
          
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Delete draft');
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Cleanup expired drafts
      cleanupExpiredDrafts: async () => {
        try {
          const { error } = await supabase
            .from('drafts')
            .delete()
            .lt('expires_at', new Date().toISOString());
          
          if (error) throw error;
          
          // Refresh local drafts list
          await get().loadDrafts();
          
        } catch (error) {
          console.warn('Failed to cleanup expired drafts:', error);
        }
      },

      // Utility actions
      refreshRecords: async () => {
        await get().loadRecords(true);
      },

      syncWithServer: async () => {
        const state = get();
        try {
          await Promise.all([
            state.loadRecords(true),
            state.loadDrafts(),
            state.cleanupExpiredDrafts(),
          ]);
          set({ lastSyncAt: new Date() });
        } catch (error) {
          console.error('Sync failed:', error);
        }
      },

      clearError: () => set({ error: null }),

      setCurrentRecord: (record) => set({ currentRecord: record }),

      // Computed methods
      getRecordsByMode: (mode) => {
        return get().records.filter(r => r.mode === mode);
      },

      getRecentRecords: (limit = 10) => {
        return get().records
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, limit);
      },

      getRecordStats: () => {
        const records = get().records;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        
        const thisMonthRecords = records.filter(r => r.createdAt >= startOfMonth);
        
        return {
          total: records.length,
          cafeMode: records.filter(r => r.mode === 'cafe').length,
          homecafeMode: records.filter(r => r.mode === 'homecafe').length,
          averageRating: records.length > 0 
            ? records.reduce((sum, r) => sum + r.rating, 0) / records.length
            : 0,
          thisMonth: thisMonthRecords.length,
        };
      },
    }),
    {
      name: 'record-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        records: state.records,
        draftsList: state.draftsList,
        searchQuery: state.searchQuery,
        filterMode: state.filterMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        lastSyncAt: state.lastSyncAt,
      }),
      // Handle Date objects in rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.records) {
          state.records = state.records.map(r => ({
            ...r,
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
          }));
        }
        if (state?.draftsList) {
          state.draftsList = state.draftsList.map(d => ({
            ...d,
            createdAt: new Date(d.createdAt),
            updatedAt: new Date(d.updatedAt),
            expiresAt: new Date(d.expiresAt),
          }));
        }
        if (state?.lastSyncAt) {
          state.lastSyncAt = new Date(state.lastSyncAt);
        }
      },
    }
  )
);