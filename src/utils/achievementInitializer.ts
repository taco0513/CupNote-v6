import { useAchievementStore } from '../store/achievementStore';

/**
 * Achievement System Initializer
 * Call this when the app starts to ensure achievements are loaded
 */
export const initializeAchievementSystem = () => {
  const achievementStore = useAchievementStore.getState();
  
  // Initialize achievements if not already loaded
  if (achievementStore.allAchievements.length === 0) {
    achievementStore.initializeAchievements();
  }
  
  console.log(`Achievement system initialized with ${achievementStore.allAchievements.length} achievements`);
};

/**
 * Test achievement unlocking with sample data
 * Only for development/testing purposes
 */
export const testAchievementSystem = () => {
  const achievementStore = useAchievementStore.getState();
  
  // Simulate adding a record to trigger achievement check
  const sampleRecords = [
    {
      id: 'test-1',
      mode: 'cafe',
      coffeeName: 'Test Coffee',
      roastery: 'Test Roastery',
      origin: 'Ethiopia',
      brewMethod: 'v60',
      flavors: ['chocolate', 'berry'],
      sensoryExpressions: ['sweet', 'balanced'],
      overallRating: 4,
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];
  
  const newStats = achievementStore.calculateStatsFromRecords(sampleRecords);
  const newAchievements = achievementStore.checkForNewAchievements(newStats);
  
  console.log('Test stats:', newStats);
  console.log('New achievements unlocked:', newAchievements.map(a => a.name));
  
  return newAchievements;
};

export default {
  initializeAchievementSystem,
  testAchievementSystem,
};