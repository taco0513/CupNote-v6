/**
 * RecordsScreen - 기록 목록 화면
 * 
 * Features:
 * - 필터 및 검색 기능 (날짜, 모드, 평점, 커피명)
 * - 무한 스크롤링으로 성능 최적화
 * - 정렬 및 그룹화 옵션
 * - 썸네일 이미지 지원
 * - 빈 상태 처리
 */

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Image
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';

// Foundation Team Assets
import { useRecordStore } from '../../../worktree-foundation/src/store/recordStore';
import type { TastingRecord, RecordMode } from '../../../worktree-foundation/src/types';

// UI Components Team Assets
import {
  Container,
  Card,
  Button,
  TextInput,
  Select,
  Loading,
  EmptyState,
  Header,
  BottomSheet,
  theme,
  colors,
  spacing
} from '../../../worktree-ui-components/src';

// Types
import type { RecordFilter, RecordSort, RecordListItem, ScreenProps } from '../../types';

const { width } = Dimensions.get('window');
const ITEM_HEIGHT = 120;
const IMAGE_SIZE = 80;

interface RecordsScreenProps extends ScreenProps {
  navigation: any;
}

const SORT_OPTIONS = [
  { label: '최신순', value: 'created_at:desc' },
  { label: '오래된순', value: 'created_at:asc' },
  { label: '평점 높은순', value: 'rating:desc' },
  { label: '평점 낮은순', value: 'rating:asc' },
  { label: '이름순', value: 'name:asc' },
];

const MODE_FILTERS = [
  { label: '전체', value: 'all' },
  { label: '카페', value: 'cafe' },
  { label: '홈카페', value: 'homecafe' },
];

export const RecordsScreen: React.FC<RecordsScreenProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const isFocused = useIsFocused();
  
  // Foundation Store
  const {
    records,
    isLoadingRecords,
    hasMore,
    currentPage,
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
    clearError
  } = useRecordStore();

  // Local State
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [selectedSort, setSelectedSort] = useState(`${sortBy}:${sortOrder}`);

  // Navigation
  const handleRecordPress = useCallback((recordId: string) => {
    navigation.navigate('RecordDetail', { recordId });
  }, [navigation]);

  const handleNewRecordPress = useCallback(() => {
    navigation.navigate('TastingFlow', { 
      screen: 'ModeSelect',
      params: { mode: null } 
    });
  }, [navigation]);

  // Data Processing
  const recordItems: RecordListItem[] = useMemo(() => {
    return records.map(record => ({
      id: record.id,
      name: record.coffee?.name || '이름 없음',
      roastery: record.coffee?.roastery,
      rating: record.rating || 0,
      mode: record.mode,
      recordedAt: new Date(record.createdAt),
      thumbnail: record.photos?.[0],
      tags: record.tags || []
    }));
  }, [records]);

  // Data Loading
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadRecords(true);
    } catch (error) {
      console.error('Failed to refresh records:', error);
    } finally {
      setRefreshing(false);
    }
  }, [loadRecords]);

  const onLoadMore = useCallback(() => {
    if (!isLoadingRecords && hasMore) {
      loadMoreRecords();
    }
  }, [isLoadingRecords, hasMore, loadMoreRecords]);

  // Search Handling
  const handleSearchSubmit = useCallback(async () => {
    if (localSearchQuery.trim() !== searchQuery) {
      try {
        await searchRecords(localSearchQuery.trim());
      } catch (error) {
        console.error('Search failed:', error);
      }
    }
  }, [localSearchQuery, searchQuery, searchRecords]);

  const handleSearchClear = useCallback(() => {
    setLocalSearchQuery('');
    clearSearch();
  }, [clearSearch]);

  // Filter Handling
  const handleModeFilterChange = useCallback((mode: 'all' | RecordMode) => {
    setFilterMode(mode);
  }, [setFilterMode]);

  const handleSortChange = useCallback((sortValue: string) => {
    const [field, order] = sortValue.split(':') as [
      'created_at' | 'rating' | 'name' | 'updated_at',
      'asc' | 'desc'
    ];
    setSelectedSort(sortValue);
    setSortOrder(field, order);
  }, [setSortOrder]);

  // Effects
  useEffect(() => {
    if (isFocused && records.length === 0) {
      loadRecords(true);
    }
  }, [isFocused, records.length, loadRecords]);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Render Functions
  const renderRecordItem = useCallback(({ item }: { item: RecordListItem }) => (
    <TouchableOpacity
      style={styles.recordItem}
      onPress={() => handleRecordPress(item.id)}
      activeOpacity={0.8}
    >
      <Card style={styles.recordCard}>
        <View style={styles.recordContent}>
          {/* 썸네일 */}
          <View style={styles.thumbnailContainer}>
            {item.thumbnail ? (
              <Image 
                source={{ uri: item.thumbnail }} 
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.thumbnail, styles.placeholderThumbnail]}>
                <Text style={styles.placeholderIcon}>☕</Text>
              </View>
            )}
          </View>

          {/* 기록 정보 */}
          <View style={styles.recordInfo}>
            <View style={styles.recordHeader}>
              <Text style={styles.recordName} numberOfLines={1}>
                {item.name}
              </Text>
              <View style={styles.modeIndicator}>
                <Text style={styles.modeText}>
                  {item.mode === 'cafe' ? '🏪' : '🏠'}
                </Text>
              </View>
            </View>

            {item.roastery && (
              <Text style={styles.recordRoastery} numberOfLines={1}>
                {item.roastery}
              </Text>
            )}

            <View style={styles.recordMeta}>
              {/* 평점 */}
              <View style={styles.rating}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.star,
                      { color: i < item.rating ? colors.warning.main : colors.border.main }
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>

              {/* 날짜 */}
              <Text style={styles.recordDate}>
                {item.recordedAt.toLocaleDateString('ko-KR')}
              </Text>
            </View>

            {/* 태그 */}
            {item.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>#{tag}</Text>
                  </View>
                ))}
                {item.tags.length > 2 && (
                  <Text style={styles.moreTags}>+{item.tags.length - 2}</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  ), [handleRecordPress]);

  const renderEmpty = useCallback(() => (
    <EmptyState
      title="기록이 없습니다"
      description={searchQuery ? '검색 결과가 없습니다' : '첫 번째 커피를 기록해보세요!'}
      icon="☕"
      actionText="기록하기"
      onAction={handleNewRecordPress}
    />
  ), [searchQuery, handleNewRecordPress]);

  const renderFooter = useCallback(() => {
    if (!isLoadingRecords) return null;
    
    return (
      <View style={styles.loadingFooter}>
        <Loading message="더 많은 기록을 불러오는 중..." />
      </View>
    );
  }, [isLoadingRecords]);

  const renderFilters = useCallback(() => (
    <BottomSheet
      isVisible={showFilters}
      onClose={() => setShowFilters(false)}
      title="필터 및 정렬"
    >
      <View style={styles.filtersContent}>
        {/* 모드 필터 */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>모드</Text>
          <View style={styles.filterOptions}>
            {MODE_FILTERS.map((option) => (
              <TouchableOpacity
                key={option.value}
                style={[
                  styles.filterOption,
                  filterMode === option.value && styles.selectedFilterOption
                ]}
                onPress={() => handleModeFilterChange(option.value as any)}
              >
                <Text
                  style={[
                    styles.filterOptionText,
                    filterMode === option.value && styles.selectedFilterOptionText
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 정렬 */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>정렬</Text>
          <Select
            value={selectedSort}
            options={SORT_OPTIONS}
            onValueChange={handleSortChange}
            placeholder="정렬 방법을 선택하세요"
          />
        </View>

        {/* 액션 버튼들 */}
        <View style={styles.filterActions}>
          <Button
            title="닫기"
            variant="outline"
            onPress={() => setShowFilters(false)}
            style={styles.filterButton}
          />
        </View>
      </View>
    </BottomSheet>
  ), [showFilters, filterMode, selectedSort, handleModeFilterChange, handleSortChange]);

  // Error State
  if (error) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="기록" />
        <EmptyState
          title="오류가 발생했습니다"
          description={error}
          icon="⚠️"
          actionText="다시 시도"
          onAction={() => {
            clearError();
            loadRecords(true);
          }}
        />
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { paddingTop: insets.top }]}>
      <Header 
        title="기록"
        right={() => (
          <TouchableOpacity 
            onPress={() => setShowFilters(true)}
            style={styles.filterButton}
          >
            <Text style={styles.filterIcon}>⚙️</Text>
          </TouchableOpacity>
        )}
      />

      {/* 검색 바 */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
          onSubmitEditing={handleSearchSubmit}
          placeholder="커피명, 로스터리, 카페명으로 검색"
          clearButtonMode="while-editing"
          returnKeyType="search"
        />
        {localSearchQuery !== searchQuery && (
          <Button
            title="검색"
            onPress={handleSearchSubmit}
            size="sm"
            style={styles.searchButton}
          />
        )}
        {searchQuery && (
          <Button
            title="초기화"
            variant="outline"
            onPress={handleSearchClear}
            size="sm"
            style={styles.clearButton}
          />
        )}
      </View>

      {/* 현재 필터 표시 */}
      {(filterMode !== 'all' || searchQuery) && (
        <View style={styles.activeFilters}>
          {filterMode !== 'all' && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>
                {filterMode === 'cafe' ? '카페' : '홈카페'}
              </Text>
              <TouchableOpacity onPress={() => handleModeFilterChange('all')}>
                <Text style={styles.removeFilter}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          {searchQuery && (
            <View style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>"{searchQuery}"</Text>
              <TouchableOpacity onPress={handleSearchClear}>
                <Text style={styles.removeFilter}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* 기록 목록 */}
      <FlatList
        data={recordItems}
        renderItem={renderRecordItem}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.8}
        showsVerticalScrollIndicator={false}
        style={styles.list}
        contentContainerStyle={recordItems.length === 0 ? styles.emptyList : undefined}
        getItemLayout={(data, index) => ({
          length: ITEM_HEIGHT + spacing.md,
          offset: (ITEM_HEIGHT + spacing.md) * index,
          index
        })}
      />

      {/* 필터 모달 */}
      {renderFilters()}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleNewRecordPress}
        activeOpacity={0.8}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  searchContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.surface.main,
    borderBottomWidth: 1,
    borderBottomColor: colors.border.light,
  },
  searchInput: {
    flex: 1,
    marginRight: spacing.sm,
  },
  searchButton: {
    paddingHorizontal: spacing.lg,
    marginLeft: spacing.sm,
  },
  clearButton: {
    paddingHorizontal: spacing.md,
    marginLeft: spacing.sm,
  },
  activeFilters: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background.light,
    flexWrap: 'wrap',
  },
  activeFilter: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary.light,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    marginRight: spacing.sm,
    marginBottom: spacing.xs,
  },
  activeFilterText: {
    fontSize: 12,
    color: colors.primary.dark,
    marginRight: spacing.xs,
  },
  removeFilter: {
    fontSize: 12,
    color: colors.primary.dark,
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  recordItem: {
    marginHorizontal: spacing.md,
    marginVertical: spacing.sm,
  },
  recordCard: {
    padding: 0,
    overflow: 'hidden',
  },
  recordContent: {
    flexDirection: 'row',
    padding: spacing.lg,
  },
  thumbnailContainer: {
    marginRight: spacing.md,
  },
  thumbnail: {
    width: IMAGE_SIZE,
    height: IMAGE_SIZE,
    borderRadius: theme.borderRadius.md,
  },
  placeholderThumbnail: {
    backgroundColor: colors.background.light,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 32,
    color: colors.text.tertiary,
  },
  recordInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
  },
  recordName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  modeIndicator: {
    backgroundColor: colors.background.light,
    borderRadius: theme.borderRadius.sm,
    padding: spacing.xs,
  },
  modeText: {
    fontSize: 12,
  },
  recordRoastery: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  recordMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  rating: {
    flexDirection: 'row',
  },
  star: {
    fontSize: 12,
    marginRight: 1,
  },
  recordDate: {
    fontSize: 12,
    color: colors.text.tertiary,
  },
  tagsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.primary.light,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    marginRight: spacing.xs,
  },
  tagText: {
    fontSize: 10,
    color: colors.primary.dark,
    fontWeight: '600',
  },
  moreTags: {
    fontSize: 10,
    color: colors.text.tertiary,
    marginLeft: spacing.xs,
  },
  loadingFooter: {
    padding: spacing.lg,
  },
  filterButton: {
    padding: spacing.sm,
  },
  filterIcon: {
    fontSize: 18,
  },
  filtersContent: {
    padding: spacing.lg,
  },
  filterSection: {
    marginBottom: spacing.xl,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  filterOption: {
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  selectedFilterOption: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  filterOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  selectedFilterOptionText: {
    color: colors.surface.main,
    fontWeight: '600',
  },
  filterActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  fab: {
    position: 'absolute',
    bottom: spacing.xl,
    right: spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    ...theme.shadows.lg,
    elevation: 8,
  },
  fabIcon: {
    fontSize: 24,
    color: colors.surface.main,
    fontWeight: '300',
  },
});

export default RecordsScreen;