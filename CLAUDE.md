# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

CupNote is a React Native mobile application for specialty coffee enthusiasts. The app provides a comprehensive coffee tasting experience with two distinct recording modes: Cafe Mode for recording experiences at coffee shops, and HomeCafe Mode for home brewing documentation.

## Repository Structure

This is the mobile application codebase with the following structure:

```
src/
├── components/           # Reusable UI components
│   └── common/          # Common components (Button, Input, Slider, etc.)
├── screens/             # Screen components
│   ├── tasting/        # TastingFlow screens
│   └── Home.tsx        # Main screens
├── navigation/         # Navigation configuration
├── store/             # Zustand state management
├── styles/            # Theme and styling
└── utils/             # Utility functions
```

## Key Features

### TastingFlow System
The core feature is a comprehensive coffee tasting workflow with two modes:

1. **Cafe Mode** (7 steps):
   - ModeSelect → CoffeeInfo → FlavorSelection → SensoryExpression → SensoryMouthFeel → PersonalNotes → Result

2. **HomeCafe Mode** (8 steps):
   - ModeSelect → CoffeeInfo → BrewSetup → FlavorSelection → SensoryExpression → SensoryMouthFeel → PersonalNotes → Result

### Components Architecture
- **Common Components**: Reusable UI components following design system
- **Screen Components**: Feature-specific screens with state management
- **Navigation**: React Navigation v6 with type-safe routing
- **State Management**: Zustand for global state

## Recent Major Fixes & Improvements

### Latest Updates (2025-08-10) - Session 2:

#### Authentication System Implementation
- **Complete Auth Flow**: Login, Signup, and Password Reset screens
- **Supabase Integration**: Connected to backend with proper configuration
- **Session Management**: Persistent login with AsyncStorage
- **Email Verification**: Secure account activation flow
- **Environment Config**: Created `/src/config/env.ts` for stable configuration
- **Database Ready**: All 8 tables verified and accessible

### Previous Updates (2025-08-10) - Session 1:

#### HeaderBar Component Enhancement
- **Mode Indicator Repositioned**: Moved subtitle (mode indicator) from center to right side as a badge
- **Visual Improvements**: Mode indicator now displays with primaryLight background and primary text color
- **Consistent Navigation**: All TastingFlow screens now have HeaderBar with back button and progress indicator

#### PersonalNotes Auto-Summary Feature
- **Smart Summary Generation**: Automatically generates summary text from previous selections (flavors, sensory expressions, ratings)
- **Editable Content**: Users can modify or add to the auto-generated summary
- **Context-Aware**: Creates natural sentences based on user's coffee tasting journey
- **UI Cleanup**: Removed unnecessary sections (quick expressions, emotion tags, time display)

#### SafeAreaView Optimization
- **Modal Screens**: Removed top SafeArea padding from all TastingFlow screens (edges=['bottom'] only)
- **Consistent Layout**: All modal screens now have consistent header positioning without extra top padding

### Component Issues Fixed:
1. **Badge Component Props**: Fixed prop mismatches (`label` → `text`, `color` → `variant`)
2. **Slider Component**: Complete rewrite to fix NaN values, drag functionality, and coordinate calculation
3. **Navigation**: Added missing back buttons and proper header navigation
4. **Color Accessibility**: Updated all gray[400] and text.tertiary colors to meet WCAG 4.5:1 contrast requirements
5. **Route Params Safety**: Added fallback values for undefined route.params preventing navigation crashes

### Technical Details:
- **React Native**: 0.75.4 with TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Navigation**: React Navigation v6 with type-safe parameters
- **State Management**: Zustand store pattern with AsyncStorage persistence
- **Component Library**: Custom design system with theme tokens
- **Accessibility**: WCAG 2.1 AA compliant color schemes
- **Authentication**: Email/password with session management

## Development Guidelines

### Component Development
- All components use TypeScript with strict type checking
- Follow the established prop interface patterns
- Use theme tokens from `src/styles/theme.ts`
- Maintain accessibility standards (4.5:1 contrast minimum)

### State Management
- Use Zustand store for global app state
- Local component state with React hooks
- Type-safe state definitions

### Navigation
- Type-safe navigation with proper parameter interfaces
- Consistent header patterns across screens
- Proper back navigation handling

### Styling
- Use design tokens from theme.ts
- Maintain consistent spacing, typography, and colors
- Follow mobile-first responsive patterns

## Testing & Quality Assurance

### Before Committing
1. Ensure all TypeScript errors are resolved
2. Test component functionality across different states
3. Verify accessibility compliance (color contrast, navigation)
4. Check iOS and Android compatibility

### Common Issues
- **Metro Cache**: Use `--reset-cache` flag when encountering component issues
- **Component Props**: Verify prop interfaces match component expectations
- **Color Accessibility**: Use gray[500] instead of gray[400] for text colors
- **Navigation**: Ensure proper back button handling in all screens

## Architecture Decisions

### Component Reusability
- Common components are highly reusable with variant props
- Screen-specific logic kept in screen components
- Shared utilities in utils/ directory

### Performance Considerations
- Optimized slider component with proper PanResponder handling
- Efficient state updates with Zustand
- Proper component memoization where needed

### User Experience
- Consistent interaction patterns
- Accessible color schemes and contrast
- Intuitive navigation flow
- Progress indication throughout TastingFlow

This codebase represents a production-ready React Native application with comprehensive type safety, accessibility compliance, and modern development practices.