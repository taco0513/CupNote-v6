# CupNote Mobile Application

A React Native mobile application for specialty coffee enthusiasts, providing a comprehensive coffee tasting experience with two distinct recording modes and community features.

## 🎯 Overview

CupNote is designed for coffee lovers who want to systematically record, analyze, and share their coffee tasting experiences. The app features two specialized modes:

- **☕ Cafe Mode**: Quick 5-7 minute recording for cafe experiences
- **🏠 HomeCafe Mode**: Detailed 8-12 minute recording for home brewing

## 🏗️ Architecture

### Technology Stack
- **React Native**: 0.75.4 with TypeScript
- **Navigation**: React Navigation v6 with type-safe routing
- **State Management**: Zustand for global state with persist middleware
- **Backend**: Supabase (PostgreSQL, Auth, Realtime)
- **Styling**: Custom design system with theme tokens
- **Development**: Metro bundler with TypeScript strict mode

### Project Structure
```
src/
├── components/           # Reusable UI components
│   └── common/          # Design system components
├── screens/             # Application screens
│   ├── tasting/        # TastingFlow screens (7-8 screens)
│   └── Home.tsx        # Main application screens
├── navigation/         # Navigation configuration and types
├── store/             # Zustand state management
├── styles/            # Theme tokens and design system
├── utils/             # Utility functions and helpers
├── types/             # TypeScript type definitions
├── lib/               # External integrations (Supabase)
└── config/            # App configuration and environment
```

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- React Native CLI
- iOS: Xcode 12+ (for iOS development)
- Android: Android Studio with API 28+ (for Android development)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd CupNoteClean

# Install dependencies
npm install

# iOS setup (macOS only)
cd ios && pod install && cd ..

# Start Metro bundler
npx react-native start

# Run on iOS (separate terminal)
npx react-native run-ios

# Run on Android (separate terminal)
npx react-native run-android
```

### Development Commands
```bash
# Start with cache reset (recommended for component issues)
npx react-native start --reset-cache

# TypeScript type checking
npx tsc --noEmit

# Linting
npm run lint
```

## 🎨 Design System

### Components
The application uses a comprehensive component library:

- **Button**: Primary, secondary, outline, ghost variants
- **Input**: Text input with autocomplete support
- **Badge**: Status indicators and labels
- **Chip**: Selectable tags and filters
- **Slider**: Touch-responsive value selection
- **ProgressBar**: Step-by-step progress indication
- **SegmentedControl**: Toggle between options

### Theme Tokens
```typescript
// Colors
colors.primary: '#8B4513'        // Coffee brown
colors.gray[500]: '#737373'      // Accessible gray text
colors.text.primary: '#3E1F0A'   // Dark brown text

// Typography
typography.fontSize.md: 16       // Base font size
typography.fontWeight.medium: '500'

// Spacing
spacing.md: 12                   // Base spacing unit
```

## ✨ Key Features

### TastingFlow System
Multi-step coffee recording workflow with two optimized paths:

#### Cafe Mode (7 steps)
1. **Mode Selection**: Choose recording mode
2. **Coffee Info**: Basic coffee and cafe details
3. **Flavor Selection**: Primary taste characteristics
4. **Sensory Expression**: Descriptive taste notes
5. **Sensory MouthFeel**: Texture and body evaluation
6. **Personal Notes**: Free-form thoughts and memories
7. **Result**: Summary and sharing options

#### HomeCafe Mode (8 steps)
1. **Mode Selection**: Choose recording mode
2. **Coffee Info**: Detailed coffee specifications
3. **Brew Setup**: Equipment and recipe parameters
4. **Flavor Selection**: Primary taste characteristics
5. **Sensory Expression**: Descriptive taste notes
6. **Sensory MouthFeel**: Texture and body evaluation
7. **Personal Notes**: Free-form thoughts and memories
8. **Result**: Summary and sharing options

### Authentication System
- **Supabase Auth**: Email/password authentication with secure sessions
- **Auth Screens**: Login, Signup, and Password Reset flows
- **Session Management**: Persistent login with secure token refresh
- **Email Verification**: Optional email confirmation for enhanced security

### State Management
- **Zustand Store**: Global application state with AsyncStorage persistence
- **Persistent Data**: TastingFlow data preservation across screens
- **Draft Management**: Auto-save functionality for user inputs
- **Offline Support**: Local-first architecture with sync capabilities

### Navigation
- **Type-Safe Routing**: Full TypeScript support for navigation parameters
- **Auth Flow**: Conditional navigation based on authentication state
- **Consistent UX**: Standardized headers and back navigation
- **Deep Linking**: Support for direct screen access

## 🔧 Recent Fixes & Improvements

### Latest Updates (2025-08-10) ✅
1. **Authentication System**: Complete Supabase authentication integration
2. **Auth Screens**: Login, Signup, and Password Reset screens implemented
3. **Environment Configuration**: Hardcoded env config for development stability
4. **Database Integration**: Connected to Supabase with 8 tables ready

### Previous Fixes ✅
1. **Badge Component**: Fixed prop interface mismatches causing empty displays
2. **Slider Component**: Complete rewrite fixing NaN values and drag functionality
3. **Navigation**: Added missing back buttons for consistent user experience
4. **Color Accessibility**: Updated all colors to meet WCAG 2.1 AA standards (4.5:1 contrast)

### Technical Improvements ✅
- Supabase client configuration with proper validation
- Authentication flow with email verification support
- TypeScript strict mode compliance across all new code
- Enhanced component reliability with safe defaults
- Improved accessibility compliance across all screens
- Optimized touch interactions and gesture handling

See [docs/COMPONENT_FIXES.md](docs/COMPONENT_FIXES.md) for detailed technical information.

## 🧪 Testing

### Component Testing
All components are tested for:
- ✅ Proper prop interface compatibility
- ✅ Touch interaction responsiveness
- ✅ Accessibility compliance
- ✅ Cross-platform compatibility

### Development Testing
```bash
# Reset Metro cache for component issues
npx react-native start --reset-cache

# Type checking
npx tsc --noEmit

# Platform testing
npx react-native run-ios
npx react-native run-android
```

## 📱 Platform Compatibility

- **iOS**: 12.0+ (iPhone 6s and newer)
- **Android**: API Level 28+ (Android 9.0+)
- **TypeScript**: Strict mode enabled
- **Accessibility**: WCAG 2.1 AA compliant

## 🎯 Development Guidelines

### Component Development
- Use TypeScript strict mode with proper interfaces
- Follow design system patterns and theme tokens
- Ensure accessibility compliance (4.5:1 contrast minimum)
- Add proper error handling and safe defaults

### Code Quality
- All components must pass TypeScript strict checks
- Follow established prop interface patterns
- Maintain consistent styling with theme tokens
- Test across iOS and Android platforms

### Performance
- Optimize component re-renders with proper memoization
- Use efficient state management patterns
- Handle touch interactions with proper debouncing
- Minimize bundle size with proper imports

## 📚 Documentation

- [Component Fixes](docs/COMPONENT_FIXES.md) - Detailed fix documentation
- [Changelog](docs/CHANGELOG.md) - Version history and changes
- [Claude Guide](CLAUDE.md) - AI development assistant configuration

## 🤝 Contributing

1. Ensure all TypeScript errors are resolved
2. Test components on both iOS and Android
3. Verify accessibility compliance
4. Follow established code patterns and conventions
5. Update documentation for significant changes

## 📄 License

This project is private and proprietary. All rights reserved.

---

**Built with ❤️ for coffee enthusiasts**
