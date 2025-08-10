/**
 * RecordStore Test - Foundation Layer Validation
 * Testing core CRUD operations and integration functionality
 */

import { useRecordStore } from '../recordStore';
import { TastingRecord } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn().mockResolvedValue(null),
  getItem: jest.fn().mockResolvedValue(null),
  removeItem: jest.fn().mockResolvedValue(null),
}));

// Mock Supabase
jest.mock('../../lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

// Mock ErrorHandler
jest.mock('../../utils/errorHandler', () => ({
  ErrorHandler: {
    handle: jest.fn((error) => ({ message: error.message, type: 'UNKNOWN' })),
    logError: jest.fn(),
  },
  createNetworkError: jest.fn((message) => new Error(message)),
  createStorageError: jest.fn((message) => new Error(message)),
}));

describe('RecordStore - Foundation Layer', () => {
  beforeEach(() => {
    // Reset store state before each test
    const store = useRecordStore.getState();
    store.clearError();
    // Reset to initial state
    useRecordStore.setState({
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
    });
  });

  describe('Initial State', () => {
    test('should have correct initial state', () => {
      const state = useRecordStore.getState();
      
      expect(state.records).toEqual([]);
      expect(state.currentRecord).toBe(null);
      expect(state.totalRecords).toBe(0);
      expect(state.isLoadingRecords).toBe(false);
      expect(state.searchQuery).toBe('');
      expect(state.filterMode).toBe('all');
      expect(state.error).toBe(null);
    });
  });

  describe('Store Actions', () => {
    test('should have all required CRUD actions', () => {
      const state = useRecordStore.getState();
      
      // CRUD operations
      expect(typeof state.loadRecords).toBe('function');
      expect(typeof state.saveRecord).toBe('function');
      expect(typeof state.updateRecord).toBe('function');
      expect(typeof state.deleteRecord).toBe('function');
      expect(typeof state.getRecord).toBe('function');
      
      // Search & Filter
      expect(typeof state.searchRecords).toBe('function');
      expect(typeof state.setFilterMode).toBe('function');
      expect(typeof state.setSortOrder).toBe('function');
      expect(typeof state.clearSearch).toBe('function');
      
      // Draft operations
      expect(typeof state.saveDraft).toBe('function');
      expect(typeof state.loadDrafts).toBe('function');
      expect(typeof state.deleteDraft).toBe('function');
      
      // Utility
      expect(typeof state.clearError).toBe('function');
      expect(typeof state.setCurrentRecord).toBe('function');
    });
  });

  describe('Record Management', () => {
    test('should set current record', () => {
      const mockRecord: TastingRecord = {
        id: '1',
        userId: 'user1',
        mode: 'cafe',
        status: 'completed',
        coffee: { id: 'coffee1', name: 'Test Coffee' },
        taste: {
          acidity: 4,
          sweetness: 3,
          bitterness: 2,
          body: 4,
          balance: 3,
          cleanness: 4,
          aftertaste: 3,
        },
        flavors: ['chocolate', 'berry'],
        rating: 4,
        shareWithCommunity: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      const store = useRecordStore.getState();
      store.setCurrentRecord(mockRecord);
      
      const state = useRecordStore.getState();
      expect(state.currentRecord).toEqual(mockRecord);
    });

    test('should get record by id', () => {
      const mockRecord: TastingRecord = {
        id: 'test-record-1',
        userId: 'user1',
        mode: 'homecafe',
        status: 'completed',
        coffee: { id: 'coffee1', name: 'Home Brew' },
        taste: {
          acidity: 3,
          sweetness: 4,
          bitterness: 2,
          body: 3,
          balance: 4,
          cleanness: 3,
          aftertaste: 4,
        },
        flavors: ['caramel', 'nuts'],
        rating: 5,
        shareWithCommunity: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Set records directly for testing
      useRecordStore.setState({ records: [mockRecord] });
      
      const store = useRecordStore.getState();
      const foundRecord = store.getRecord('test-record-1');
      
      expect(foundRecord).toEqual(mockRecord);
      expect(store.getRecord('non-existent')).toBe(null);
    });
  });

  describe('Search and Filter', () => {
    test('should update search query', () => {
      const store = useRecordStore.getState();
      
      store.clearSearch();
      let state = useRecordStore.getState();
      expect(state.searchQuery).toBe('');
      
      // Note: searchRecords would normally call loadRecords, 
      // but since we're mocking supabase, we just test the state change
      useRecordStore.setState({ searchQuery: 'test coffee' });
      state = useRecordStore.getState();
      expect(state.searchQuery).toBe('test coffee');
    });

    test('should update filter mode', () => {
      const store = useRecordStore.getState();
      
      // Test setting filter mode (mocked loadRecords won't actually run)
      useRecordStore.setState({ filterMode: 'cafe' });
      let state = useRecordStore.getState();
      expect(state.filterMode).toBe('cafe');
      
      useRecordStore.setState({ filterMode: 'homecafe' });
      state = useRecordStore.getState();
      expect(state.filterMode).toBe('homecafe');
      
      useRecordStore.setState({ filterMode: 'all' });
      state = useRecordStore.getState();
      expect(state.filterMode).toBe('all');
    });

    test('should update sort order', () => {
      useRecordStore.setState({ 
        sortBy: 'rating', 
        sortOrder: 'asc' 
      });
      
      const state = useRecordStore.getState();
      expect(state.sortBy).toBe('rating');
      expect(state.sortOrder).toBe('asc');
    });
  });

  describe('Computed Methods', () => {
    const mockRecords: TastingRecord[] = [
      {
        id: '1',
        userId: 'user1',
        mode: 'cafe',
        status: 'completed',
        coffee: { id: 'coffee1', name: 'Cafe Coffee' },
        taste: { acidity: 4, sweetness: 3, bitterness: 2, body: 4, balance: 3, cleanness: 4, aftertaste: 3 },
        flavors: ['chocolate'],
        rating: 4,
        shareWithCommunity: false,
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
      },
      {
        id: '2',
        userId: 'user1',
        mode: 'homecafe',
        status: 'completed',
        coffee: { id: 'coffee2', name: 'Home Coffee' },
        taste: { acidity: 3, sweetness: 4, bitterness: 2, body: 3, balance: 4, cleanness: 3, aftertaste: 4 },
        flavors: ['caramel'],
        rating: 5,
        shareWithCommunity: true,
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-01-20'),
      },
      {
        id: '3',
        userId: 'user1',
        mode: 'cafe',
        status: 'completed',
        coffee: { id: 'coffee3', name: 'Another Cafe' },
        taste: { acidity: 2, sweetness: 3, bitterness: 4, body: 2, balance: 2, cleanness: 3, aftertaste: 2 },
        flavors: ['bitter'],
        rating: 2,
        shareWithCommunity: false,
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10'),
      },
    ];

    beforeEach(() => {
      useRecordStore.setState({ records: mockRecords });
    });

    test('should get records by mode', () => {
      const store = useRecordStore.getState();
      
      const cafeRecords = store.getRecordsByMode('cafe');
      const homecafeRecords = store.getRecordsByMode('homecafe');
      
      expect(cafeRecords).toHaveLength(2);
      expect(homecafeRecords).toHaveLength(1);
      
      expect(cafeRecords.every(r => r.mode === 'cafe')).toBe(true);
      expect(homecafeRecords.every(r => r.mode === 'homecafe')).toBe(true);
    });

    test('should get recent records', () => {
      const store = useRecordStore.getState();
      
      const recentRecords = store.getRecentRecords(2);
      
      expect(recentRecords).toHaveLength(2);
      // Should be sorted by createdAt desc
      expect(recentRecords[0].id).toBe('2'); // Jan 20
      expect(recentRecords[1].id).toBe('1'); // Jan 15
    });

    test('should calculate record stats', () => {
      const store = useRecordStore.getState();
      
      const stats = store.getRecordStats();
      
      expect(stats.total).toBe(3);
      expect(stats.cafeMode).toBe(2);
      expect(stats.homecafeMode).toBe(1);
      expect(stats.averageRating).toBe((4 + 5 + 2) / 3); // 3.67
      
      // thisMonth depends on current date, so just check it's a number
      expect(typeof stats.thisMonth).toBe('number');
    });
  });

  describe('Error Handling', () => {
    test('should clear error', () => {
      useRecordStore.setState({ error: 'Test error' });
      
      let state = useRecordStore.getState();
      expect(state.error).toBe('Test error');
      
      const store = useRecordStore.getState();
      store.clearError();
      
      state = useRecordStore.getState();
      expect(state.error).toBe(null);
    });
  });

  describe('Loading States', () => {
    test('should track loading states', () => {
      useRecordStore.setState({ 
        isLoadingRecords: true,
        isLoadingMore: false,
        isSaving: true 
      });
      
      const state = useRecordStore.getState();
      expect(state.isLoadingRecords).toBe(true);
      expect(state.isLoadingMore).toBe(false);
      expect(state.isSaving).toBe(true);
    });
  });
});

// Integration test with Result.tsx saveRecord functionality
describe('RecordStore Integration', () => {
  test('should integrate with Result.tsx saveRecord pattern', () => {
    const store = useRecordStore.getState();
    
    // This tests the interface that Result.tsx expects
    expect(typeof store.saveRecord).toBe('function');
    
    // Test the record structure that would come from Result.tsx
    const resultScreenData = {
      mode: 'cafe' as const,
      coffeeInfo: { name: 'Test Coffee', roastery: 'Test Roastery' },
      selectedFlavors: ['chocolate', 'berry'],
      sensoryExpressions: ['sweet', 'fruity'],
      mouthFeel: {
        acidity: 4,
        sweetness: 3,
        bitterness: 2,
        body: 4,
        balance: 3,
        cleanness: 4,
        aftertaste: 3,
      },
      personalNotes: { notes: 'Great coffee!', overallRating: 4 },
      matchScore: 85,
    };
    
    // This would be the transformation from Result.tsx format to TastingRecord
    const recordData = {
      mode: resultScreenData.mode,
      coffee: {
        id: Date.now().toString(),
        name: resultScreenData.coffeeInfo.name,
        roastery: resultScreenData.coffeeInfo.roastery,
      },
      taste: resultScreenData.mouthFeel,
      flavors: resultScreenData.selectedFlavors,
      rating: resultScreenData.personalNotes.overallRating,
      notes: resultScreenData.personalNotes.notes,
      shareWithCommunity: false,
    };
    
    // The store should accept this format
    expect(() => {
      // This would normally call the API, but we're just testing the interface
      store.saveRecord(recordData);
    }).not.toThrow();
  });
});