/**
 * Draft Manager for TastingFlow
 * Manages auto-save and recovery of incomplete tasting records
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const DRAFT_KEY = '@tasting_flow_draft';
const DRAFT_METADATA_KEY = '@tasting_flow_draft_metadata';

export interface TastingFlowDraft {
  // Current step
  currentStep: string;
  lastSavedAt: string;
  
  // Data from each step
  mode?: 'cafe' | 'homecafe';
  coffeeInfo?: {
    coffeeName: string;
    cafeName?: string;
    roastery?: string;
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
    notes: string;
    overallRating: number;
    shareToCommnity: boolean;
  };
}

export interface DraftMetadata {
  exists: boolean;
  lastSavedAt: string;
  currentStep: string;
  coffeeName?: string;
  completionPercentage: number;
}

class DraftManager {
  /**
   * Save draft data for a specific step
   */
  async saveDraft(draft: Partial<TastingFlowDraft>): Promise<void> {
    try {
      // Get existing draft
      const existingDraft = await this.getDraft();
      
      // Merge with new data
      const updatedDraft: TastingFlowDraft = {
        ...existingDraft,
        ...draft,
        lastSavedAt: new Date().toISOString(),
      };
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(updatedDraft));
      
      // Update metadata
      await this.updateMetadata(updatedDraft);
      
      console.log('Draft saved successfully:', updatedDraft.currentStep);
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }
  
  /**
   * Get current draft
   */
  async getDraft(): Promise<TastingFlowDraft | null> {
    try {
      const draftString = await AsyncStorage.getItem(DRAFT_KEY);
      if (!draftString) return null;
      
      return JSON.parse(draftString);
    } catch (error) {
      console.error('Failed to get draft:', error);
      return null;
    }
  }
  
  /**
   * Get draft metadata (for showing in UI)
   */
  async getMetadata(): Promise<DraftMetadata> {
    try {
      const draft = await this.getDraft();
      
      if (!draft) {
        return {
          exists: false,
          lastSavedAt: '',
          currentStep: '',
          completionPercentage: 0,
        };
      }
      
      // Calculate completion percentage
      const totalSteps = draft.mode === 'cafe' ? 6 : 7;
      let completedSteps = 0;
      
      if (draft.mode) completedSteps++;
      if (draft.coffeeInfo?.coffeeName) completedSteps++;
      if (draft.brewSetup?.brewMethod) completedSteps++;
      if (draft.flavors && draft.flavors.length > 0) completedSteps++;
      if (draft.sensoryExpressions && draft.sensoryExpressions.length > 0) completedSteps++;
      if (draft.ratings) completedSteps++;
      if (draft.personalNotes?.notes) completedSteps++;
      
      const completionPercentage = Math.round((completedSteps / totalSteps) * 100);
      
      return {
        exists: true,
        lastSavedAt: draft.lastSavedAt,
        currentStep: draft.currentStep || 'ModeSelection',
        coffeeName: draft.coffeeInfo?.coffeeName,
        completionPercentage,
      };
    } catch (error) {
      console.error('Failed to get metadata:', error);
      return {
        exists: false,
        lastSavedAt: '',
        currentStep: '',
        completionPercentage: 0,
      };
    }
  }
  
  /**
   * Update metadata
   */
  private async updateMetadata(draft: TastingFlowDraft): Promise<void> {
    try {
      const metadata = await this.getMetadata();
      await AsyncStorage.setItem(DRAFT_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to update metadata:', error);
    }
  }
  
  /**
   * Clear draft (after successful completion)
   */
  async clearDraft(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([DRAFT_KEY, DRAFT_METADATA_KEY]);
      console.log('Draft cleared successfully');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }
  
  /**
   * Check if draft exists
   */
  async hasDraft(): Promise<boolean> {
    try {
      const draft = await AsyncStorage.getItem(DRAFT_KEY);
      return draft !== null;
    } catch (error) {
      console.error('Failed to check draft:', error);
      return false;
    }
  }
  
  /**
   * Get time since last save (in minutes)
   */
  async getTimeSinceLastSave(): Promise<number> {
    try {
      const draft = await this.getDraft();
      if (!draft || !draft.lastSavedAt) return 0;
      
      const lastSaved = new Date(draft.lastSavedAt);
      const now = new Date();
      const diffMs = now.getTime() - lastSaved.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      return diffMins;
    } catch (error) {
      console.error('Failed to calculate time since last save:', error);
      return 0;
    }
  }
  
  /**
   * Load draft into Zustand store
   */
  async loadDraftToStore(setTastingFlowData: (data: any) => void): Promise<string | null> {
    try {
      const draft = await this.getDraft();
      if (!draft) return null;
      
      // Load all saved data into store
      setTastingFlowData({
        mode: draft.mode,
        coffeeInfo: draft.coffeeInfo,
        brewSetup: draft.brewSetup,
        flavors: draft.flavors,
        sensoryExpressions: draft.sensoryExpressions,
        ratings: draft.ratings,
        personalNotes: draft.personalNotes,
      });
      
      return draft.currentStep || 'ModeSelection';
    } catch (error) {
      console.error('Failed to load draft to store:', error);
      return null;
    }
  }
}

export default new DraftManager();