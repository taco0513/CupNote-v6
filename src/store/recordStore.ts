import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { 
  TastingRecord, 
  RecordMode, 
  TastingFlowDraft,
  CoffeeInfoData,
  BrewSetupData,
  FlavorSelectionData,
  SensoryExpressionData,
  SensoryMouthFeelData,
  PersonalNotesData,
  TastingFlowStackParamList
} from '../types';
import { records, drafts } from '../lib/supabase';
import { ErrorHandler, createStorageError, createNetworkError } from '../utils/errorHandler';

interface RecordState {
  // Records
  records: TastingRecord[];
  currentRecord: TastingFlowDraft | null;
  mode: RecordMode | null;
  
  // Drafts
  draftsList: TastingFlowDraft[];
  
  // Loading states
  isLoading: boolean;
  isSaving: boolean;
  isLoadingRecords: boolean;
  
  // Pagination
  currentPage: number;
  hasMore: boolean;
  totalRecords: number;
  
  // Filters
  filterMode: 'all' | RecordMode;
  searchQuery: string;
  sortBy: 'created_at' | 'rating' | 'updated_at';
  sortOrder: 'asc' | 'desc';
  
  // Error handling
  error: string | null;
  lastSyncAt: Date | null;
  
  // Actions - Records Management
  loadRecords: (refresh?: boolean) => Promise<void>;
  loadMoreRecords: () => Promise<void>;
  searchRecords: (query: string) => Promise<void>;
  getRecord: (recordId: string) => Promise<TastingRecord | null>;
  deleteRecord: (recordId: string) => Promise<void>;
  
  // Actions - Current Record (TastingFlow)
  initializeRecord: (mode: RecordMode, draftId?: string) => Promise<void>;
  updateCurrentRecord: (updates: Partial<TastingFlowDraft>) => void;
  saveCurrentRecord: () => Promise<TastingRecord>;
  saveDraft: () => Promise<TastingFlowDraft>;
  loadDraft: (draftId: string) => Promise<void>;
  clearCurrentRecord: () => void;
  
  // Actions - Draft Management
  loadDrafts: () => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
  cleanupExpiredDrafts: () => Promise<void>;
  
  // Actions - Step Data Updates
  updateCoffeeData: (data: Partial<CoffeeInfoData>) => void;
  updateBrewSetupData: (data: Partial<BrewSetupData>) => void;
  updateFlavorData: (data: Partial<FlavorSelectionData>) => void;
  updateSensoryExpressionData: (data: Partial<SensoryExpressionData>) => void;
  updateSensoryMouthFeelData: (data: Partial<SensoryMouthFeelData>) => void;
  updatePersonalNotesData: (data: Partial<PersonalNotesData>) => void;
  updateCurrentStep: (step: keyof TastingFlowStackParamList) => void;
  
  // Actions - Filters & Search
  setFilterMode: (mode: 'all' | RecordMode) => void;
  setSortOrder: (sortBy: 'created_at' | 'rating' | 'updated_at', order: 'asc' | 'desc') => void;
  clearSearch: () => void;
  clearError: () => void;
  
  // Computed
  getFilteredRecords: () => TastingRecord[];
  getDrafts: () => TastingFlowDraft[];
  getCurrentRecordProgress: () => number;
  canSaveCurrentRecord: () => boolean;
}

export const useRecordStore = create<RecordState>()(
  persist(
    (set, get) => ({
      // Initial State
      records: [],
      currentRecord: null,
      mode: null,
      draftsList: [],
      
      // Loading states
      isLoading: false,
      isSaving: false,
      isLoadingRecords: false,
      
      // Pagination
      currentPage: 1,
      hasMore: true,
      totalRecords: 0,
      
      // Filters
      filterMode: 'all',
      searchQuery: '',
      sortBy: 'created_at',
      sortOrder: 'desc',
      
      // Error handling
      error: null,
      lastSyncAt: null,

      // Load records with pagination
      loadRecords: async (refresh = false) => {
        const { isLoadingRecords, filterMode, sortBy, sortOrder } = get();
        if (isLoadingRecords && !refresh) return;

        set({ 
          isLoadingRecords: true, 
          error: null,
          ...(refresh && { records: [], currentPage: 1, hasMore: true })
        });

        try {
          // Get current user ID from auth store (would need to import)
          // For now, using a placeholder - this should be injected or retrieved
          const userId = 'current-user'; // TODO: Get from auth store
          
          const page = refresh ? 1 : get().currentPage;
          const { records: loadedRecords, total } = await records.getRecords(userId, {
            page,
            limit: 20,
            mode: filterMode === 'all' ? undefined : filterMode,
            sortBy,
            sortOrder,
          });

          set(state => ({
            records: refresh ? loadedRecords : [...state.records, ...loadedRecords],
            totalRecords: total,
            currentPage: page,
            hasMore: (page * 20) < total,
            isLoadingRecords: false,
            lastSyncAt: new Date(),
          }));

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load records');
          set({ 
            isLoadingRecords: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          
          if (appError.type === 'NETWORK') {
            throw createNetworkError('기록을 불러오는 중 네트워크 오류가 발생했습니다.');
          }
          throw error;
        }
      },

      // Load more records for pagination
      loadMoreRecords: async () => {
        const { hasMore, isLoadingRecords } = get();
        if (!hasMore || isLoadingRecords) return;

        set(state => ({ currentPage: state.currentPage + 1 }));
        await get().loadRecords(false);
      },

      // Search records
      searchRecords: async (query) => {
        set({ isLoadingRecords: true, error: null, searchQuery: query });

        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const searchResults = await records.searchRecords(userId, query, { limit: 50 });

          set({ 
            records: searchResults,
            isLoadingRecords: false,
            hasMore: false, // Search results don't paginate
            currentPage: 1,
          });

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Search records');
          set({ 
            isLoadingRecords: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
        }
      },

      // Get a specific record
      getRecord: async (recordId) => {
        try {
          const record = await records.getRecord(recordId);
          return record;
        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Get record');
          set({ error: appError.message });
          ErrorHandler.logError(appError);
          return null;
        }
      },

      // Delete a record
      deleteRecord: async (recordId) => {
        set({ isLoading: true, error: null });

        try {
          await records.deleteRecord(recordId);
          
          set(state => ({
            records: state.records.filter(r => r.id !== recordId),
            isLoading: false,
          }));

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Delete record');
          set({ 
            isLoading: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Initialize a new tasting flow record
      initializeRecord: async (mode, draftId) => {
        set({ isLoading: true, error: null });

        try {
          if (draftId) {
            // Load existing draft
            const draft = await drafts.getDraft(draftId);
            if (draft) {
              set({ 
                currentRecord: draft, 
                mode,
                isLoading: false,
              });
              return;
            }
          }

          // Create new draft
          const now = new Date();
          const expiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
          
          const newDraft: TastingFlowDraft = {
            id: `draft-${Date.now()}`,
            userId: 'current-user', // TODO: Get from auth store
            mode,
            currentStep: 'ModeSelect',
            createdAt: now,
            updatedAt: now,
            expiresAt,
            version: 1,
          };

          set({ 
            currentRecord: newDraft, 
            mode,
            isLoading: false,
          });

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Initialize record');
          set({ 
            isLoading: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Update current record
      updateCurrentRecord: (updates) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? { ...state.currentRecord, ...updates, updatedAt: new Date() }
            : null,
        })),

      // Update specific step data
      updateCoffeeData: (data) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                coffeeData: { ...state.currentRecord.coffeeData, ...data },
                updatedAt: new Date(),
              }
            : null,
        })),

      updateBrewSetupData: (data) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                brewSetupData: { ...state.currentRecord.brewSetupData, ...data },
                updatedAt: new Date(),
              }
            : null,
        })),

      updateFlavorData: (data) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                flavorData: { ...state.currentRecord.flavorData, ...data },
                updatedAt: new Date(),
              }
            : null,
        })),

      updateSensoryExpressionData: (data) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                sensoryExpressionData: { ...state.currentRecord.sensoryExpressionData, ...data },
                updatedAt: new Date(),
              }
            : null,
        })),

      updateSensoryMouthFeelData: (data) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                sensoryMouthFeelData: { 
                  acidity: 3,
                  sweetness: 3,
                  bitterness: 3,
                  body: 3,
                  balance: 3,
                  cleanness: 3,
                  aftertaste: 3,
                  ...state.currentRecord.sensoryMouthFeelData, 
                  ...data 
                },
                updatedAt: new Date(),
              }
            : null,
        })),

      updatePersonalNotesData: (data) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                personalNotesData: { 
                  rating: 3,
                  shareWithCommunity: false,
                  ...state.currentRecord.personalNotesData, 
                  ...data 
                },
                updatedAt: new Date(),
              }
            : null,
        })),

      updateCurrentStep: (step) =>
        set(state => ({
          currentRecord: state.currentRecord
            ? {
                ...state.currentRecord,
                currentStep: step,
                updatedAt: new Date(),
              }
            : null,
        })),

      // Save current record as completed
      saveCurrentRecord: async () => {
        const { currentRecord } = get();
        
        if (!currentRecord) {
          throw new Error('No current record to save');
        }

        set({ isSaving: true, error: null });

        try {
          // Convert draft to completed record format
          const recordData = {
            user_id: currentRecord.userId,
            mode: currentRecord.mode,
            status: 'completed' as const,
            coffee_data: currentRecord.coffeeData,
            cafe_data: currentRecord.mode === 'cafe' ? currentRecord.coffeeData?.cafe : null,
            brew_data: currentRecord.brewSetupData,
            taste_data: currentRecord.sensoryMouthFeelData || {
              acidity: 3,
              sweetness: 3,
              bitterness: 3,
              body: 3,
              balance: 3,
              cleanness: 3,
              aftertaste: 3,
            },
            flavors: currentRecord.flavorData?.selectedFlavors || [],
            flavor_intensity: currentRecord.flavorData?.flavorIntensity,
            sensory_expression: currentRecord.sensoryExpressionData,
            notes: currentRecord.personalNotesData?.personalNotes,
            rating: currentRecord.personalNotesData?.rating || 3,
            mood: currentRecord.personalNotesData?.mood,
            context: currentRecord.personalNotesData?.context,
            tags: currentRecord.personalNotesData?.tags || [],
            photos: currentRecord.personalNotesData?.photos || [],
            share_with_community: currentRecord.personalNotesData?.shareWithCommunity || false,
            repurchase_intent: currentRecord.personalNotesData?.repurchaseIntent,
          };

          const savedRecord = await records.createRecord(recordData);

          // Remove draft after successful save
          if (currentRecord.id.startsWith('draft-')) {
            try {
              await drafts.deleteDraft(currentRecord.id);
            } catch (draftError) {
              console.warn('Failed to delete draft after saving record:', draftError);
            }
          }

          // Update local state
          set(state => ({
            records: [savedRecord, ...state.records],
            currentRecord: null,
            mode: null,
            isSaving: false,
            draftsList: state.draftsList.filter(d => d.id !== currentRecord.id),
          }));

          return savedRecord;

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Save record');
          set({ 
            isSaving: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          
          if (appError.type === 'STORAGE') {
            throw createStorageError('기록 저장 중 오류가 발생했습니다.');
          }
          throw error;
        }
      },

      // Save as draft
      saveDraft: async () => {
        const { currentRecord } = get();
        
        if (!currentRecord) {
          throw new Error('No current record to save as draft');
        }

        set({ isSaving: true, error: null });

        try {
          const updatedDraft = {
            ...currentRecord,
            updatedAt: new Date(),
          };

          const savedDraft = await drafts.saveDraft(updatedDraft);

          set(state => ({
            currentRecord: savedDraft,
            draftsList: state.draftsList.some(d => d.id === savedDraft.id)
              ? state.draftsList.map(d => d.id === savedDraft.id ? savedDraft : d)
              : [...state.draftsList, savedDraft],
            isSaving: false,
          }));

          return savedDraft;

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Save draft');
          set({ 
            isSaving: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Load a specific draft
      loadDraft: async (draftId) => {
        set({ isLoading: true, error: null });

        try {
          const draft = await drafts.getDraft(draftId);
          
          if (!draft) {
            throw new Error('Draft not found or expired');
          }

          set({ 
            currentRecord: draft,
            mode: draft.mode,
            isLoading: false,
          });

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load draft');
          set({ 
            isLoading: false, 
            error: appError.message,
          });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Load all drafts
      loadDrafts: async () => {
        try {
          const userId = 'current-user'; // TODO: Get from auth store
          const userDrafts = await drafts.getDrafts(userId);
          
          set({ draftsList: userDrafts });

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Load drafts');
          set({ error: appError.message });
          ErrorHandler.logError(appError);
        }
      },

      // Delete a draft
      deleteDraft: async (draftId) => {
        try {
          await drafts.deleteDraft(draftId);
          
          set(state => ({
            draftsList: state.draftsList.filter(d => d.id !== draftId),
            currentRecord: state.currentRecord?.id === draftId ? null : state.currentRecord,
            mode: state.currentRecord?.id === draftId ? null : state.mode,
          }));

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Delete draft');
          set({ error: appError.message });
          ErrorHandler.logError(appError);
          throw error;
        }
      },

      // Clean up expired drafts
      cleanupExpiredDrafts: async () => {
        try {
          const userId = 'current-user'; // TODO: Get from auth store
          await drafts.cleanupExpiredDrafts(userId);
          
          // Reload drafts to update local state
          await get().loadDrafts();

        } catch (error) {
          const appError = ErrorHandler.handle(error, 'Cleanup drafts');
          ErrorHandler.logError(appError);
        }
      },

      // Clear current record
      clearCurrentRecord: () => set({ currentRecord: null, mode: null }),

      // Filter and search actions
      setFilterMode: (mode) => {
        set({ filterMode: mode });
        get().loadRecords(true); // Reload with new filter
      },

      setSortOrder: (sortBy, order) => {
        set({ sortBy, sortOrder: order });
        get().loadRecords(true); // Reload with new sort
      },

      clearSearch: () => {
        set({ searchQuery: '' });
        get().loadRecords(true); // Reload all records
      },

      clearError: () => set({ error: null }),

      // Computed methods
      getFilteredRecords: () => {
        const { records, filterMode, searchQuery } = get();

        let filtered = [...records];

        // Filter by mode
        if (filterMode !== 'all') {
          filtered = filtered.filter(record => record.mode === filterMode);
        }

        // Filter by search query
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filtered = filtered.filter(record =>
            record.coffee.name?.toLowerCase().includes(query) ||
            record.coffee.roastery?.toLowerCase().includes(query) ||
            record.coffee.origin?.toLowerCase().includes(query) ||
            record.notes?.toLowerCase().includes(query) ||
            record.tags?.some(tag => tag.toLowerCase().includes(query))
          );
        }

        return filtered;
      },

      getDrafts: () => {
        const { draftsList } = get();
        const now = new Date();
        
        // Filter out expired drafts
        const validDrafts = draftsList.filter(draft => new Date(draft.expiresAt) > now);
        
        // Update store if we found expired drafts
        if (validDrafts.length !== draftsList.length) {
          set({ draftsList: validDrafts });
        }
        
        return validDrafts.sort((a, b) => 
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
      },

      // Get current record completion progress (0-100)
      getCurrentRecordProgress: () => {
        const { currentRecord, mode } = get();
        if (!currentRecord || !mode) return 0;

        const steps = ['CoffeeInfo', 'FlavorSelection', 'SensoryExpression', 'PersonalNotes'];
        if (mode === 'homecafe') {
          steps.splice(1, 0, 'BrewSetup'); // Add BrewSetup after CoffeeInfo
        }

        let completed = 0;
        if (currentRecord.coffeeData) completed++;
        if (mode === 'homecafe' && currentRecord.brewSetupData) completed++;
        if (currentRecord.flavorData) completed++;
        if (currentRecord.sensoryExpressionData) completed++;
        if (currentRecord.personalNotesData) completed++;

        return Math.round((completed / steps.length) * 100);
      },

      // Check if current record can be saved
      canSaveCurrentRecord: () => {
        const { currentRecord } = get();
        if (!currentRecord) return false;

        // Minimum requirements: coffee info, flavor data, and rating
        return !!(
          currentRecord.coffeeData?.name &&
          currentRecord.flavorData?.selectedFlavors?.length &&
          currentRecord.personalNotesData?.rating
        );
      },
    }),
    {
      name: 'record-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        records: state.records.slice(0, 50), // Limit stored records
        draftsList: state.draftsList,
        filterMode: state.filterMode,
        sortBy: state.sortBy,
        sortOrder: state.sortOrder,
        lastSyncAt: state.lastSyncAt,
      }),
      // Handle Date object rehydration
      onRehydrateStorage: () => (state) => {
        if (state?.records) {
          state.records = state.records.map(record => ({
            ...record,
            createdAt: new Date(record.createdAt),
            updatedAt: new Date(record.updatedAt),
          }));
        }
        if (state?.draftsList) {
          state.draftsList = state.draftsList.map(draft => ({
            ...draft,
            createdAt: new Date(draft.createdAt),
            updatedAt: new Date(draft.updatedAt),
            expiresAt: new Date(draft.expiresAt),
          }));
        }
        if (state?.lastSyncAt) {
          state.lastSyncAt = new Date(state.lastSyncAt);
        }
      },
    }
  )
);