/**
 * Navigation type definitions for CupNote TastingFlow
 */

import { NavigationProp, RouteProp } from '@react-navigation/native';

// TastingFlow Stack Parameters
export type TastingFlowStackParamList = {
  ModeSelect: undefined;
  CoffeeInfo: {
    mode: 'cafe' | 'homecafe';
  };
  BrewSetup: {
    mode: 'cafe' | 'homecafe';
    coffeeData: any;
  };
  FlavorSelection: {
    mode: 'cafe' | 'homecafe';
    coffeeData: any;
    brewData?: any;
  };
  SensoryExpression: {
    mode: 'cafe' | 'homecafe';
    coffeeData: any;
    brewData?: any;
    flavors: string[];
  };
  SensoryMouthFeel: {
    mode: 'cafe' | 'homecafe';
    coffeeData: any;
    brewData?: any;
    flavors: string[];
    expressions: string[];
  };
  PersonalNotes: {
    mode: 'cafe' | 'homecafe';
    coffeeData: any;
    brewData?: any;
    flavors: string[];
    expressions: string[];
    mouthFeel?: any;
  };
  Result: {
    mode: 'cafe' | 'homecafe';
    coffeeData: any;
    brewData?: any;
    flavors: string[];
    expressions: string[];
    mouthFeel?: any;
    personalNotes: any;
  };
};

// Navigation Prop Types
export type TastingFlowNavigationProp = NavigationProp<TastingFlowStackParamList>;

// Route Prop Types
export type TastingFlowRouteProp<T extends keyof TastingFlowStackParamList> = 
  RouteProp<TastingFlowStackParamList, T>;