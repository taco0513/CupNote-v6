# CupNote v6 Database & Infrastructure Setup

**Complete production-ready backend infrastructure for the CupNote mobile application.**

## 🎯 Overview

This document describes the comprehensive database and infrastructure setup for CupNote v6, a specialized coffee recording and community platform. The infrastructure includes:

- **Supabase Database**: PostgreSQL with Row Level Security (RLS)
- **Real-time Subscriptions**: Live data synchronization
- **Offline Support**: Local caching and sync queue
- **Migration System**: Automated schema updates
- **Performance Monitoring**: Query optimization and analytics
- **Security**: GDPR-compliant data handling

## 📊 Database Schema

### Core Tables

| Table | Purpose | Key Features |
|-------|---------|--------------|
| `profiles` | User profile data extending auth.users | Localization, preferences, onboarding |
| `tasting_records` | Main coffee tasting records | Dual-mode support (Cafe/HomeCafe) |
| `achievements` | Gamification system | 30+ badges with progress tracking |
| `coffees` | Coffee master data | Full-text search, verification system |
| `cafes` | Cafe information | Location-based queries, ratings |
| `sensory_expressions` | Korean expressions (44 total) | Usage analytics, recommendation engine |
| `taste_matches` | Community matching | AI-powered taste similarity |
| `user_stats` | Comprehensive user analytics | Real-time calculated statistics |
| `drafts` | Temporary tasting flow data | Auto-expiry, session recovery |

### Advanced Features

- **Full-text Search**: Korean language support with tsvector
- **Geospatial Queries**: PostGIS for cafe location services
- **Vector Similarity**: Taste profile matching algorithms
- **Automated Statistics**: Real-time user progress calculation
- **Security Logs**: GDPR-compliant audit trail

## 🔧 Configuration Files

### Environment Setup

```bash
# Copy environment template
cp .env.example .env.local

# Update with your Supabase credentials
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Configuration Manager

- **`src/lib/supabase-config.ts`**: Centralized configuration with environment-based settings
- **Feature Flags**: Runtime toggle for real-time sync, offline mode, achievements
- **Performance Tuning**: Cache TTL, pagination limits, rate limiting
- **Security Settings**: Session timeout, refresh thresholds

## 🚀 Migration System

### Database Migrations

```sql
-- Located in supabase/migrations/
001_initial_schema.sql     -- Core tables and indexes
002_rls_policies.sql       -- Security policies
003_functions.sql          -- Business logic functions
004_indexes.sql            -- Performance optimization
005_enhanced_functions.sql -- Advanced features
```

### Application Migrations

```typescript
// Managed by src/lib/migration-manager.ts
Version 1: Initial Setup
Version 2: Achievements System
Version 3: Korean Expressions
Version 4: Community Matching
Version 5: Offline Support
Version 6: Enhanced Features (Current)
```

## 📡 Real-time System

### Features

- **Live Data Sync**: Instant updates for achievements, records
- **Connection Management**: Auto-reconnection with exponential backoff
- **Offline Queue**: Persistent action queue for offline operations
- **Event Broadcasting**: Achievement unlocks, community matches

### Usage

```typescript
import { subscriptions } from './src/lib/supabase-realtime';

// Subscribe to user's records
const unsubscribe = subscriptions.subscribeToUserRecords(
  userId,
  (payload) => {
    console.log('Record updated:', payload.new);
  }
);
```

## 💾 Offline Support

### Capabilities

- **Local Cache**: Records, achievements, stats, drafts
- **Sync Queue**: Persistent offline actions with priority
- **Consistency Checks**: Data validation and conflict resolution
- **Storage Management**: Automatic cleanup and optimization

### Architecture

```typescript
// Offline Manager handles local storage
import { offlineManager } from './src/lib/offline-manager';

// Database Sync Manager handles synchronization
import { databaseSyncManager } from './src/lib/database-sync';
```

## 🔒 Security Features

### Row Level Security (RLS)

- **User Isolation**: Users can only access their own data
- **Public Data**: Community features with privacy controls
- **Admin Access**: Service role for system operations
- **Audit Logging**: Security event tracking

### Data Privacy

- **GDPR Compliance**: User data export and deletion
- **Anonymization**: Automated data anonymization on deletion
- **Encryption**: Sensitive data encryption at rest
- **Access Control**: Fine-grained permission system

## 📈 Performance Features

### Database Optimization

- **Strategic Indexing**: Optimized for common query patterns
- **Full-text Search**: Korean language support with GIN indexes
- **Materialized Views**: Pre-computed statistics and leaderboards
- **Query Monitoring**: Performance analytics and bottleneck detection

### Caching Strategy

- **Multi-level Cache**: App-level, network-level, database-level
- **Smart Invalidation**: Event-driven cache invalidation
- **Compression**: Automatic data compression for storage efficiency
- **TTL Management**: Configurable time-to-live settings

## 🛠 Development Setup

### 1. Database Setup

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project (if not already done)
supabase init

# Link to your project
supabase link --project-ref YOUR_PROJECT_REF

# Run migrations
supabase db push
```

### 2. Environment Configuration

```bash
# Copy environment template
cp .env.example .env.local

# Update with your actual values
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Seed Database

```bash
# Run seed files
supabase db reset --linked
```

## 🧪 Testing

### Database Testing

```bash
# Run migration tests
supabase test db

# Test RLS policies
npm run test:rls

# Performance tests
npm run test:performance
```

### Integration Testing

```typescript
// Test sync functionality
import { databaseSyncManager } from './src/lib/database-sync';

describe('Database Sync', () => {
  it('should sync offline changes', async () => {
    const result = await databaseSyncManager.forceSyncNow();
    expect(result).toBe(true);
  });
});
```

## 📊 Monitoring & Analytics

### Built-in Analytics

- **User Statistics**: Real-time progress tracking
- **Performance Metrics**: Query performance analysis
- **Usage Analytics**: Feature adoption tracking
- **Error Monitoring**: Comprehensive error logging

### Database Monitoring

```sql
-- Query performance analysis
SELECT * FROM public.analyze_query_performance();

-- Index usage recommendations
SELECT * FROM public.recommend_index_maintenance();

-- RLS policy testing
SELECT * FROM public.test_rls_policies();
```

## 🚨 Production Checklist

### Pre-deployment

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] RLS policies tested
- [ ] Performance indexes created
- [ ] Seed data loaded
- [ ] Backup strategy configured

### Security Audit

- [ ] RLS policies validated
- [ ] User permissions tested
- [ ] Data encryption verified
- [ ] Audit logging enabled
- [ ] Security monitoring configured

### Performance Optimization

- [ ] Query performance analyzed
- [ ] Indexes optimized
- [ ] Cache configuration tuned
- [ ] Connection pooling configured
- [ ] Monitoring dashboards setup

## 🔧 Troubleshooting

### Common Issues

**1. Migration Fails**
```bash
# Check migration status
supabase migration list

# Reset database (development only)
supabase db reset --linked
```

**2. RLS Policy Issues**
```sql
-- Test policy access
SELECT public.check_user_permission('USER_ID', 'profile_view');

-- Verify user context
SELECT auth.uid();
```

**3. Performance Issues**
```sql
-- Analyze slow queries
SELECT * FROM public.analyze_query_performance();

-- Check index usage
SELECT * FROM public.identify_unused_indexes();
```

### Debug Mode

```typescript
// Enable debug logging
const config = {
  ...supabaseConfig,
  features: {
    ...supabaseConfig.features,
    debugMode: true
  }
};
```

## 📚 API Reference

### Core Services

```typescript
// Authentication
import { auth } from './src/lib/supabase';
await auth.signIn(email, password);

// Records Management
import { records } from './src/lib/supabase';
await records.createRecord(recordData);

// Achievements
import { achievements } from './src/lib/supabase';
await achievements.checkAndUnlockAchievements(userId);

// Real-time Subscriptions
import { subscriptions } from './src/lib/supabase-realtime';
subscriptions.subscribeToUserRecords(userId, callback);
```

### Database Functions

```sql
-- User statistics
SELECT * FROM public.update_user_stats(user_id);

-- Achievement checking
SELECT * FROM public.check_achievement_progress(user_id, 'record_created');

-- Community matching
SELECT * FROM public.find_taste_matches(user_id, coffee_id);

-- Korean expressions
SELECT * FROM public.get_recommended_expressions(taste_scores);
```

## 🔮 Future Enhancements

### Planned Features

- **Machine Learning**: Enhanced recommendation algorithms
- **Multi-language Support**: Beyond Korean expressions
- **Advanced Analytics**: Predictive modeling
- **Social Features**: Enhanced community interaction
- **Mobile Optimization**: Further performance improvements

### Scalability Considerations

- **Read Replicas**: For high-traffic scenarios
- **Connection Pooling**: Enhanced connection management
- **Caching Layer**: Redis integration for heavy loads
- **Data Archiving**: Historical data management
- **Microservices**: Service decomposition for scale

## 📄 License & Credits

This database infrastructure is part of the CupNote v6 project. Built with Supabase, PostgreSQL, and React Native.

**Key Technologies:**
- Supabase (Backend-as-a-Service)
- PostgreSQL (Database)
- Row Level Security (Security)
- PostGIS (Geospatial)
- TypeScript (Type Safety)

---

## 🆘 Support

For technical support or questions about the database infrastructure:

1. Check the troubleshooting section above
2. Review the Supabase documentation
3. Check the project's issue tracker
4. Contact the development team

**Remember**: This is a production-ready infrastructure designed for scale, security, and performance. Follow the deployment checklist carefully before going live.