/**
 * FAB Container Component
 * Manages FAB visibility and navigation logic
 */

import React from 'react';
import { useNavigation, useNavigationState } from '@react-navigation/native';
import { FAB } from './FAB';

export const FABContainer: React.FC = () => {
  const navigation = useNavigation();

  // Hide FAB when in TastingFlow modal
  const isVisible = useNavigationState(state => {
    if (!state) return true;
    
    // Check if we're currently in the TastingFlow modal
    const currentRoute = state.routes[state.index];
    return currentRoute?.name !== 'TastingFlow';
  });

  const handleFABPress = () => {
    // Navigate to TastingFlow
    (navigation as any).navigate('TastingFlow');
  };

  return (
    <FAB 
      onPress={handleFABPress} 
      isVisible={isVisible} 
    />
  );
};

export default FABContainer;