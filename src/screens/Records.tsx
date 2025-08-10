/**
 * RecordsScreen - Record List and Management
 * 
 * Features:
 * - Search functionality
 * - Filter by mode, date, rating
 * - Sort options (date, rating, name)
 * - Infinite scroll pagination
 * - Record preview cards
 * - Navigation to record details
 * - Pull-to-refresh
 * - Empty states
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  SafeAreaView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, typography, spacing, borderRadius, shadows } from '../styles/theme';
import { useRecordStore } from '../store';
import type { TastingRecord, RecordMode } from '../types';

const { width } = Dimensions.get('window');

// Filter modal component (simple implementation)
const FilterModal = ({ 
  visible, 
  onClose, 
  filterMode, 
  sortBy, 
  sortOrder, 
  onApplyFilter 
}: {
  visible: boolean;
  onClose: () => void;
  filterMode: 'all' | RecordMode;
  sortBy: 'created_at' | 'rating' | 'name';
  sortOrder: 'asc' | 'desc';
  onApplyFilter: (filterMode: 'all' | RecordMode, sortBy: string, sortOrder: 'asc' | 'desc') => void;
}) => {
  const [localFilterMode, setLocalFilterMode] = useState(filterMode);
  const [localSortBy, setLocalSortBy] = useState(sortBy);
  const [localSortOrder, setLocalSortOrder] = useState(sortOrder);

  if (!visible) return null;

  const handleApply = () => {
    onApplyFilter(localFilterMode, localSortBy, localSortOrder);
    onClose();
  };

  return (
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>필터 및 정렬</Text>
        
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>모드</Text>
          <View style={styles.filterOptions}>
            {(['all', 'cafe', 'homecafe'] as const).map((mode) => (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterOption,
                  localFilterMode === mode && styles.filterOptionActive
                ]}
                onPress={() => setLocalFilterMode(mode)}
              >
                <Text style={[
                  styles.filterOptionText,
                  localFilterMode === mode && styles.filterOptionTextActive
                ]}>
                  {mode === 'all' ? '전체' : mode === 'cafe' ? '카페' : '홈카페'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>정렬</Text>
          <View style={styles.filterOptions}>
            {[
              { key: 'created_at', label: '날짜' },
              { key: 'rating', label: '평점' },
              { key: 'name', label: '이름' }
            ].map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterOption,
                  localSortBy === option.key && styles.filterOptionActive
                ]}
                onPress={() => setLocalSortBy(option.key as any)}
              >
                <Text style={[
                  styles.filterOptionText,
                  localSortBy === option.key && styles.filterOptionTextActive
                ]}>
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>순서</Text>
          <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                styles.filterOption,
                localSortOrder === 'desc' && styles.filterOptionActive
              ]}
              onPress={() => setLocalSortOrder('desc')}
            >
              <Text style={[
                styles.filterOptionText,
                localSortOrder === 'desc' && styles.filterOptionTextActive
              ]}>
                내림차순
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterOption,
                localSortOrder === 'asc' && styles.filterOptionActive
              ]}
              onPress={() => setLocalSortOrder('asc')}
            >
              <Text style={[
                styles.filterOptionText,
                localSortOrder === 'asc' && styles.filterOptionTextActive
              ]}>
                오름차순
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modalButtons}>
          <TouchableOpacity style={styles.modalButtonCancel} onPress={onClose}>
            <Text style={styles.modalButtonCancelText}>취소</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalButtonApply} onPress={handleApply}>
            <Text style={styles.modalButtonApplyText}>적용</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default function RecordsScreen() {
  const navigation = useNavigation<any>();
  
  // Foundation stores
  const { 
    records, 
    isLoadingRecords,
    isLoadingMore,
    hasMore,
    error,
    searchQuery,
    filterMode,
    sortBy,
    sortOrder,
    loadRecords,
    loadMoreRecords,
    searchRecords,
    setFilterMode,
    setSortOrder,
    clearSearch,
    clearFilters
  } = useRecordStore();
  
  // Local state
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [refreshing, setRefreshing] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  
  // Data loading
  const loadData = useCallback(async (force = false) => {
    try {
      await loadRecords(force);
    } catch (error) {
      console.error('Failed to load records:', error);
    }
  }, [loadRecords]);
  
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadData(true);
    setRefreshing(false);
  }, [loadData]);
  
  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      loadMoreRecords();
    }
  }, [isLoadingMore, hasMore, loadMoreRecords]);
  
  // Search handling
  const handleSearch = useCallback(async (query: string) => {
    setLocalSearchQuery(query);
    await searchRecords(query);
  }, [searchRecords]);
  
  const handleClearSearch = useCallback(() => {
    setLocalSearchQuery('');
    clearSearch();
  }, [clearSearch]);
  
  // Filter handling
  const handleApplyFilter = useCallback(async (
    mode: 'all' | RecordMode,
    sortField: string,
    order: 'asc' | 'desc'
  ) => {
    setFilterMode(mode);
    setSortOrder(sortField as any, order);
  }, [setFilterMode, setSortOrder]);
  
  const handleClearFilters = useCallback(() => {
    setLocalSearchQuery('');
    clearFilters();
  }, [clearFilters]);
  
  // Navigation
  const handleRecordPress = useCallback((record: TastingRecord) => {
    // Navigate to record detail (to be implemented)
    console.log('Record pressed:', record.id);
  }, []);
  
  // Effects
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );
  
  // Record item component
  const RecordItem = ({ item }: { item: TastingRecord }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() => handleRecordPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.recordHeader}>
        <View style={styles.recordInfo}>
          <Text style={styles.recordTitle} numberOfLines={1}>
            {item.coffee.name}
          </Text>
          <Text style={styles.recordSubtitle} numberOfLines={1}>
            {item.cafe?.name || item.coffee.roastery || '로스터리'}
          </Text>
        </View>
        <View style={styles.recordMeta}>
          <View style={[
            styles.modeBadge,
            { backgroundColor: item.mode === 'cafe' ? colors.primary : colors.info }
          ]}>
            <Text style={styles.modeBadgeText}>
              {item.mode === 'cafe' ? '카페' : '홈카페'}
            </Text>
          </View>
          <View style={styles.ratingContainer}>
            <Text style={styles.ratingText}>⭐ {item.rating.toFixed(1)}</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.recordFooter}>
        <Text style={styles.recordDate}>
          {new Date(item.createdAt).toLocaleDateString('ko-KR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          })}
        </Text>
        
        {item.flavors && item.flavors.length > 0 && (
          <View style={styles.flavorsContainer}>
            {item.flavors.slice(0, 3).map((flavor, index) => (
              <View key={index} style={styles.flavorTag}>
                <Text style={styles.flavorText}>{flavor}</Text>
              </View>
            ))}
            {item.flavors.length > 3 && (
              <Text style={styles.moreText}>+{item.flavors.length - 3}</Text>
            )}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
  
  // Empty state
  const EmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>☕</Text>
      <Text style={styles.emptyTitle}>
        {searchQuery ? '검색 결과가 없습니다' : '아직 기록이 없습니다'}
      </Text>
      <Text style={styles.emptyMessage}>
        {searchQuery 
          ? '다른 키워드로 검색해보세요'
          : '첫 번째 커피를 기록해보세요!'
        }
      </Text>
      {!searchQuery && (
        <TouchableOpacity
          style={styles.emptyButton}
          onPress={() => navigation.navigate('TastingFlow')}
        >
          <Text style={styles.emptyButtonText}>기록 시작하기</Text>
        </TouchableOpacity>
      )}
    </View>
  );
  
  // Error state
  if (error && records.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>데이터를 불러올 수 없습니다</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => loadData(true)}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header with search and filter */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>기록</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setFilterModalVisible(true)}
          >
            <Text style={styles.filterButtonText}>🔍 필터</Text>
          </TouchableOpacity>
          {(searchQuery || filterMode !== 'all') && (
            <TouchableOpacity
              style={styles.clearButton}
              onPress={handleClearFilters}
            >
              <Text style={styles.clearButtonText}>초기화</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      {/* Search bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="커피명, 카페명으로 검색..."
          value={localSearchQuery}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {localSearchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.searchClear}
            onPress={handleClearSearch}
          >
            <Text style={styles.searchClearText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
      
      {/* Records list */}
      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={RecordItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={!isLoadingRecords ? EmptyState : null}
        ListFooterComponent={() => 
          isLoadingMore ? (
            <View style={styles.loadingFooter}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={styles.loadingText}>더 불러오는 중...</Text>
            </View>
          ) : null
        }
      />
      
      {/* Filter modal */}
      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        filterMode={filterMode}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onApplyFilter={handleApplyFilter}
      />
      
      {/* Loading overlay */}
      {isLoadingRecords && records.length === 0 && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>기록을 불러오는 중...</Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.primaryLight,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  filterButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  clearButtonText: {
    color: colors.primary,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    height: 40,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.gray[100],
    borderRadius: borderRadius.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  searchClear: {
    marginLeft: spacing.sm,
    padding: spacing.sm,
  },
  searchClearText: {
    color: colors.text.secondary,
    fontSize: typography.fontSize.md,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.huge,
  },
  recordItem: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    ...shadows.sm,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  recordInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  recordTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  recordSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  recordMeta: {
    alignItems: 'flex-end',
  },
  modeBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  modeBadgeText: {
    fontSize: typography.fontSize.xs,
    color: colors.white,
    fontWeight: typography.fontWeight.medium,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordDate: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  flavorsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  flavorTag: {
    backgroundColor: colors.gray[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    marginLeft: spacing.xs,
  },
  flavorText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.secondary,
  },
  moreText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxxl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.5,
  },
  emptyButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: borderRadius.md,
  },
  emptyButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  errorTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
  },
  retryButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  
  // Filter Modal Styles
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: width * 0.9,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xl,
    textAlign: 'center',
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  filterOptionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterOptionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  filterOptionTextActive: {
    color: colors.white,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xl,
  },
  modalButtonCancel: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border.medium,
    marginRight: spacing.sm,
  },
  modalButtonCancelText: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  modalButtonApply: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    marginLeft: spacing.sm,
  },
  modalButtonApplyText: {
    fontSize: typography.fontSize.md,
    color: colors.white,
    fontWeight: typography.fontWeight.semibold,
  },
});