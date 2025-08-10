/**
 * Foundation Layer Validation
 * Validates that all required interfaces and implementations are in place
 * for the RecordStore and integration with existing components
 */

import { useRecordStore } from './recordStore';
import { useAuthStore } from './authStore';
import type { 
  TastingRecord, 
  RecordFilter, 
  RecordSort, 
  RecordListItem,
  RecordDraft,
  HomeStats,
  DashboardCard,
  RecentActivity 
} from '../types';

export interface FoundationValidationResult {
  success: boolean;
  errors: string[];
  warnings: string[];
  missingFeatures: string[];
  integrationIssues: string[];
}

/**
 * Validates that the Foundation Layer is properly implemented
 */
export function validateFoundationLayer(): FoundationValidationResult {
  const result: FoundationValidationResult = {
    success: false,
    errors: [],
    warnings: [],
    missingFeatures: [],
    integrationIssues: [],
  };

  try {
    // 1. Validate RecordStore exists and has required methods
    const recordStore = useRecordStore.getState();
    
    const requiredRecordMethods = [
      'loadRecords',
      'saveRecord', 
      'updateRecord',
      'deleteRecord',
      'getRecord',
      'searchRecords',
      'setFilterMode',
      'setSortOrder',
      'clearSearch',
      'clearError',
      'setCurrentRecord',
      'getRecordsByMode',
      'getRecentRecords',
      'getRecordStats',
    ];

    for (const method of requiredRecordMethods) {
      if (typeof recordStore[method as keyof typeof recordStore] !== 'function') {
        result.errors.push(`RecordStore missing required method: ${method}`);
      }
    }

    // 2. Validate RecordStore state structure
    const requiredRecordState = [
      'records',
      'currentRecord',
      'totalRecords',
      'isLoadingRecords',
      'searchQuery',
      'filterMode',
      'error',
      'lastSyncAt',
    ];

    for (const prop of requiredRecordState) {
      if (!(prop in recordStore)) {
        result.errors.push(`RecordStore missing required state property: ${prop}`);
      }
    }

    // 3. Validate AuthStore exists and has required methods
    const authStore = useAuthStore.getState();
    
    const requiredAuthMethods = [
      'initialize',
      'login',
      'logout',
      'signup',
      'updateProfile',
      'refreshUser',
      'clearError',
    ];

    for (const method of requiredAuthMethods) {
      if (typeof authStore[method as keyof typeof authStore] !== 'function') {
        result.errors.push(`AuthStore missing required method: ${method}`);
      }
    }

    // 4. Validate type interfaces exist (TypeScript compilation check)
    try {
      // These should compile without errors if types are properly defined
      const mockRecord: TastingRecord = {
        id: 'test',
        userId: 'user1',
        mode: 'cafe',
        status: 'completed',
        coffee: { id: 'coffee1', name: 'Test Coffee' },
        taste: {
          acidity: 3, sweetness: 3, bitterness: 3,
          body: 3, balance: 3, cleanness: 3, aftertaste: 3
        },
        flavors: [],
        rating: 3,
        shareWithCommunity: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFilter: RecordFilter = {
        mode: 'all',
        rating: { min: 1, max: 5 }
      };

      const mockSort: RecordSort = {
        field: 'created_at',
        order: 'desc'
      };

      const mockListItem: RecordListItem = {
        id: 'test',
        name: 'Test Coffee',
        rating: 4,
        mode: 'cafe',
        recordedAt: new Date(),
        tags: []
      };

      const mockDraft: RecordDraft = {
        id: 'draft1',
        mode: 'cafe',
        currentStep: 'coffee-info',
        data: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
      };

      const mockHomeStats: HomeStats = {
        totalRecords: 10,
        monthlyRecords: 3,
        averageRating: 4.2,
        uniqueOrigins: 5,
      };

      const mockDashboardCard: DashboardCard = {
        title: 'Total Records',
        value: 25,
        subtitle: 'This month'
      };

      const mockActivity: RecentActivity = {
        id: 'activity1',
        type: 'record',
        title: 'Recorded new coffee',
        timestamp: new Date()
      };

      // If we got here, all types compiled successfully
      result.warnings.push('All type interfaces are properly defined and compile successfully');
      
    } catch (error) {
      result.errors.push(`Type validation failed: ${error}`);
    }

    // 5. Validate integration points with existing components
    
    // Check if Result.tsx saveRecord integration would work
    try {
      const saveRecordMethod = recordStore.saveRecord;
      if (typeof saveRecordMethod === 'function') {
        result.warnings.push('Result.tsx integration: saveRecord method is available');
      } else {
        result.integrationIssues.push('Result.tsx integration: saveRecord method not available');
      }
    } catch (error) {
      result.integrationIssues.push(`Result.tsx integration check failed: ${error}`);
    }

    // Check if RecordsScreen integration would work
    try {
      const requiredForRecordsScreen = [
        'loadRecords',
        'searchRecords', 
        'setFilterMode',
        'setSortOrder',
        'clearSearch',
        'records',
        'isLoadingRecords',
        'searchQuery',
        'filterMode',
      ];

      let recordsScreenIntegration = true;
      for (const item of requiredForRecordsScreen) {
        if (!(item in recordStore)) {
          recordsScreenIntegration = false;
          result.integrationIssues.push(`RecordsScreen integration: missing ${item}`);
        }
      }

      if (recordsScreenIntegration) {
        result.warnings.push('RecordsScreen integration: all required methods and state are available');
      }
    } catch (error) {
      result.integrationIssues.push(`RecordsScreen integration check failed: ${error}`);
    }

    // Check if HomeScreen integration would work
    try {
      const getRecordStats = recordStore.getRecordStats;
      const getRecentRecords = recordStore.getRecentRecords;
      
      if (typeof getRecordStats === 'function' && typeof getRecentRecords === 'function') {
        result.warnings.push('HomeScreen integration: stats and recent records methods are available');
      } else {
        result.integrationIssues.push('HomeScreen integration: missing stats or recent records methods');
      }
    } catch (error) {
      result.integrationIssues.push(`HomeScreen integration check failed: ${error}`);
    }

    // 6. Final success determination
    result.success = result.errors.length === 0 && result.integrationIssues.length === 0;

    return result;

  } catch (error) {
    result.errors.push(`Foundation validation failed: ${error}`);
    result.success = false;
    return result;
  }
}

/**
 * Pretty print validation results
 */
export function printValidationResults(result: FoundationValidationResult): void {
  console.log('\n🏗️  Foundation Layer Validation Results');
  console.log('=====================================');
  
  if (result.success) {
    console.log('✅ VALIDATION PASSED - Foundation Layer is ready!');
  } else {
    console.log('❌ VALIDATION FAILED - Issues found in Foundation Layer');
  }

  if (result.errors.length > 0) {
    console.log('\n🚨 ERRORS (must fix):');
    result.errors.forEach(error => console.log(`   • ${error}`));
  }

  if (result.integrationIssues.length > 0) {
    console.log('\n⚠️  INTEGRATION ISSUES (blocking other teams):');
    result.integrationIssues.forEach(issue => console.log(`   • ${issue}`));
  }

  if (result.missingFeatures.length > 0) {
    console.log('\n📋 MISSING FEATURES:');
    result.missingFeatures.forEach(feature => console.log(`   • ${feature}`));
  }

  if (result.warnings.length > 0) {
    console.log('\n💡 INFO:');
    result.warnings.forEach(warning => console.log(`   • ${warning}`));
  }

  console.log('\n');
}

// Run validation if this file is executed directly
if (require.main === module) {
  const result = validateFoundationLayer();
  printValidationResults(result);
  process.exit(result.success ? 0 : 1);
}