/**
 * RecordDetailScreen - 기록 상세 보기 화면
 * 
 * Features:
 * - TastingFlow에서 입력한 모든 정보 표시
 * - RadarChart로 맛 프로필 시각화
 * - 사진 갤러리 (스와이프 가능)
 * - 상호작용 기능 (좋아요, 공유, 수정)
 * - 커뮤니티 매치 스코어 표시
 * - 비슷한 취향 사용자 매칭
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
  Share,
  Alert
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';

// Foundation Team Assets
import { useRecordStore } from '../../../worktree-foundation/src/store/recordStore';
import type { TastingRecord } from '../../../worktree-foundation/src/types';

// UI Components Team Assets
import {
  Container,
  Card,
  Button,
  Loading,
  EmptyState,
  Header,
  RadarChart,
  theme,
  colors,
  spacing
} from '../../../worktree-ui-components/src';

// Types
import type { ScreenProps } from '../../types';

const { width } = Dimensions.get('window');
const PHOTO_SIZE = width - (spacing.md * 2);

interface RecordDetailScreenProps extends ScreenProps {
  navigation: any;
  route: {
    params: {
      recordId: string;
    };
  };
}

export const RecordDetailScreen: React.FC<RecordDetailScreenProps> = ({
  navigation,
  route
}) => {
  const insets = useSafeAreaInsets();
  const { recordId } = route.params;

  // Foundation Store
  const { getRecord, deleteRecord } = useRecordStore();

  // Local State
  const [record, setRecord] = useState<TastingRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [liked, setLiked] = useState(false);

  // Navigation
  const goBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleEdit = useCallback(() => {
    if (record) {
      navigation.navigate('TastingFlow', {
        screen: 'CoffeeInfo',
        params: { 
          mode: record.mode,
          recordId: record.id,
          editMode: true
        }
      });
    }
  }, [navigation, record]);

  const handleShare = useCallback(async () => {
    if (!record) return;

    try {
      const message = `${record.coffee.name} - ${record.rating}/5점\n${record.coffee.roastery ? `${record.coffee.roastery} | ` : ''}${new Date(record.createdAt).toLocaleDateString()}\n\n#CupNote #커피기록`;
      
      await Share.share({
        message,
        title: '커피 기록 공유',
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [record]);

  const handleDelete = useCallback(() => {
    if (!record) return;

    Alert.alert(
      '기록 삭제',
      '이 기록을 정말 삭제하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        {
          text: '삭제',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecord(record.id);
              navigation.goBack();
            } catch (error) {
              Alert.alert('오류', '삭제 중 오류가 발생했습니다.');
            }
          }
        }
      ]
    );
  }, [record, deleteRecord, navigation]);

  const handleLike = useCallback(() => {
    setLiked(!liked);
    // TODO: Implement like functionality with backend
  }, [liked]);

  // Data Loading
  const loadRecord = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const recordData = await getRecord(recordId);
      if (recordData) {
        setRecord(recordData);
      } else {
        setError('기록을 찾을 수 없습니다.');
      }
    } catch (err) {
      setError('기록을 불러오는 중 오류가 발생했습니다.');
      console.error('Failed to load record:', err);
    } finally {
      setLoading(false);
    }
  }, [recordId, getRecord]);

  // Effects
  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  // Render Functions
  const renderPhotos = useCallback(() => {
    if (!record?.photos || record.photos.length === 0) return null;

    return (
      <View style={styles.photosSection}>
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / PHOTO_SIZE);
            setCurrentPhotoIndex(index);
          }}
        >
          {record.photos.map((photo, index) => (
            <Image
              key={index}
              source={{ uri: photo }}
              style={styles.photo}
              resizeMode="cover"
            />
          ))}
        </ScrollView>
        
        {record.photos.length > 1 && (
          <View style={styles.photoIndicators}>
            {record.photos.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.photoIndicator,
                  index === currentPhotoIndex && styles.activePhotoIndicator
                ]}
              />
            ))}
          </View>
        )}
      </View>
    );
  }, [record?.photos, currentPhotoIndex]);

  const renderCoffeeInfo = useCallback(() => {
    if (!record) return null;

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>커피 정보</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>이름</Text>
            <Text style={styles.infoValue}>{record.coffee.name}</Text>
          </View>
          
          {record.coffee.roastery && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>로스터리</Text>
              <Text style={styles.infoValue}>{record.coffee.roastery}</Text>
            </View>
          )}
          
          {record.coffee.origin && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>원산지</Text>
              <Text style={styles.infoValue}>{record.coffee.origin}</Text>
            </View>
          )}
          
          {record.coffee.roastLevel && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>로스팅 정도</Text>
              <Text style={styles.infoValue}>{record.coffee.roastLevel}</Text>
            </View>
          )}
          
          {record.coffee.processingMethod && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>가공 방법</Text>
              <Text style={styles.infoValue}>{record.coffee.processingMethod}</Text>
            </View>
          )}
        </View>
      </Card>
    );
  }, [record]);

  const renderBrewInfo = useCallback(() => {
    if (!record?.brew || record.mode !== 'homecafe') return null;

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>추출 정보</Text>
        
        <View style={styles.infoGrid}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>추출 방법</Text>
            <Text style={styles.infoValue}>{record.brew.method}</Text>
          </View>
          
          {record.brew.grindSize && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>그라인딩</Text>
              <Text style={styles.infoValue}>{record.brew.grindSize}</Text>
            </View>
          )}
          
          {record.brew.waterTemp && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>물 온도</Text>
              <Text style={styles.infoValue}>{record.brew.waterTemp}°C</Text>
            </View>
          )}
          
          {record.brew.coffeeAmount && record.brew.waterAmount && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>비율</Text>
              <Text style={styles.infoValue}>
                1:{Math.round(record.brew.waterAmount / record.brew.coffeeAmount)}
              </Text>
            </View>
          )}
          
          {record.brew.extractionTime && (
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>추출 시간</Text>
              <Text style={styles.infoValue}>
                {Math.floor(record.brew.extractionTime / 60)}분 {record.brew.extractionTime % 60}초
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  }, [record]);

  const renderTasteProfile = useCallback(() => {
    if (!record?.taste) return null;

    const radarData = [
      { label: '산미', value: record.taste.acidity },
      { label: '단맛', value: record.taste.sweetness },
      { label: '쓴맛', value: record.taste.bitterness },
      { label: '바디감', value: record.taste.body },
      { label: '밸런스', value: record.taste.balance },
      { label: '깔끔함', value: record.taste.cleanness },
      { label: '여운', value: record.taste.aftertaste },
    ];

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>맛 프로필</Text>
        
        <View style={styles.chartContainer}>
          <RadarChart
            data={radarData}
            size={250}
            strokeColor={colors.primary.main}
            fillColor={colors.primary.light}
            strokeWidth={2}
            maxValue={5}
          />
        </View>
      </Card>
    );
  }, [record]);

  const renderFlavors = useCallback(() => {
    if (!record?.flavors || record.flavors.length === 0) return null;

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>맛 표현</Text>
        
        <View style={styles.flavorsContainer}>
          {record.flavors.map((flavor, index) => (
            <View key={index} style={styles.flavorTag}>
              <Text style={styles.flavorText}>{flavor}</Text>
            </View>
          ))}
        </View>
        
        {record.flavor_intensity && (
          <View style={styles.intensityContainer}>
            <Text style={styles.intensityLabel}>맛의 강도</Text>
            <View style={styles.intensityBar}>
              <View 
                style={[
                  styles.intensityFill,
                  { width: `${(record.flavor_intensity / 10) * 100}%` }
                ]}
              />
            </View>
            <Text style={styles.intensityValue}>{record.flavor_intensity}/10</Text>
          </View>
        )}
      </Card>
    );
  }, [record]);

  const renderNotes = useCallback(() => {
    if (!record?.notes && !record?.mood && !record?.context) return null;

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>개인 노트</Text>
        
        {record?.notes && (
          <Text style={styles.notesText}>{record.notes}</Text>
        )}
        
        <View style={styles.metaInfo}>
          {record?.mood && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>기분: </Text>
              <Text style={styles.metaValue}>{record.mood}</Text>
            </View>
          )}
          
          {record?.context && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>상황: </Text>
              <Text style={styles.metaValue}>{record.context}</Text>
            </View>
          )}
          
          {record?.repurchase_intent !== undefined && (
            <View style={styles.metaItem}>
              <Text style={styles.metaLabel}>재구매 의향: </Text>
              <Text style={styles.metaValue}>
                {record.repurchase_intent ? '있음' : '없음'}
              </Text>
            </View>
          )}
        </View>
      </Card>
    );
  }, [record]);

  const renderCommunityInfo = useCallback(() => {
    if (!record?.share_with_community) return null;

    return (
      <Card style={styles.section}>
        <Text style={styles.sectionTitle}>커뮤니티</Text>
        
        <Text style={styles.communityText}>
          이 기록이 커뮤니티와 공유되었습니다. 
          비슷한 취향을 가진 사용자들과 매칭될 수 있습니다.
        </Text>
        
        {/* TODO: Add community match score */}
        <View style={styles.matchScoreContainer}>
          <Text style={styles.matchScoreLabel}>매치 스코어</Text>
          <Text style={styles.matchScoreValue}>85%</Text>
        </View>
      </Card>
    );
  }, [record]);

  // Error State
  if (error) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="기록 상세" onBackPress={goBack} />
        <EmptyState
          title="오류가 발생했습니다"
          description={error}
          icon="⚠️"
          actionText="다시 시도"
          onAction={loadRecord}
        />
      </Container>
    );
  }

  // Loading State
  if (loading || !record) {
    return (
      <Container style={[styles.container, { paddingTop: insets.top }]}>
        <Header title="기록 상세" onBackPress={goBack} />
        <Loading message="기록을 불러오는 중..." />
      </Container>
    );
  }

  return (
    <Container style={[styles.container, { paddingTop: insets.top }]}>
      <Header
        title="기록 상세"
        onBackPress={goBack}
        right={() => (
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
              <Text style={styles.headerActionIcon}>📤</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleEdit} style={styles.headerAction}>
              <Text style={styles.headerActionIcon}>✏️</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.headerAction}>
              <Text style={styles.headerActionIcon}>🗑️</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 사진들 */}
        {renderPhotos()}

        {/* 기본 정보 */}
        <Card style={styles.section}>
          <View style={styles.basicInfo}>
            <View style={styles.basicInfoHeader}>
              <Text style={styles.recordTitle}>{record.coffee.name}</Text>
              <View style={styles.modeIndicator}>
                <Text style={styles.modeText}>
                  {record.mode === 'cafe' ? '🏪 카페' : '🏠 홈카페'}
                </Text>
              </View>
            </View>
            
            {record.coffee.roastery && (
              <Text style={styles.roasteryName}>{record.coffee.roastery}</Text>
            )}
            
            <View style={styles.ratingContainer}>
              <View style={styles.rating}>
                {Array.from({ length: 5 }, (_, i) => (
                  <Text
                    key={i}
                    style={[
                      styles.star,
                      { color: i < record.rating ? colors.warning.main : colors.border.main }
                    ]}
                  >
                    ★
                  </Text>
                ))}
              </View>
              <Text style={styles.ratingText}>{record.rating}/5</Text>
            </View>
            
            <Text style={styles.recordDate}>
              {new Date(record.createdAt).toLocaleString('ko-KR')}
            </Text>
            
            <View style={styles.actionButtons}>
              <TouchableOpacity
                style={[styles.actionButton, liked && styles.likedButton]}
                onPress={handleLike}
              >
                <Text style={styles.actionButtonText}>
                  {liked ? '❤️' : '🤍'} 좋아요
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </Card>

        {/* 커피 정보 */}
        {renderCoffeeInfo()}

        {/* 추출 정보 (홈카페 모드만) */}
        {renderBrewInfo()}

        {/* 맛 프로필 */}
        {renderTasteProfile()}

        {/* 맛 표현 */}
        {renderFlavors()}

        {/* 개인 노트 */}
        {renderNotes()}

        {/* 커뮤니티 정보 */}
        {renderCommunityInfo()}

        {/* 태그 */}
        {record.tags && record.tags.length > 0 && (
          <Card style={[styles.section, styles.lastSection]}>
            <Text style={styles.sectionTitle}>태그</Text>
            <View style={styles.tagsContainer}>
              {record.tags.map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </Card>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.main,
  },
  scrollView: {
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: spacing.sm,
    marginLeft: spacing.xs,
  },
  headerActionIcon: {
    fontSize: 18,
  },
  photosSection: {
    marginBottom: spacing.md,
  },
  photo: {
    width: PHOTO_SIZE,
    height: PHOTO_SIZE * 0.75,
    marginHorizontal: spacing.md,
  },
  photoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  photoIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border.main,
    marginHorizontal: 4,
  },
  activePhotoIndicator: {
    backgroundColor: colors.primary.main,
  },
  section: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  lastSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  basicInfo: {
    alignItems: 'flex-start',
  },
  basicInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: spacing.sm,
  },
  recordTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text.primary,
    flex: 1,
    marginRight: spacing.sm,
  },
  modeIndicator: {
    backgroundColor: colors.primary.light,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  modeText: {
    fontSize: 12,
    color: colors.primary.dark,
    fontWeight: '600',
  },
  roasteryName: {
    fontSize: 16,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  rating: {
    flexDirection: 'row',
    marginRight: spacing.sm,
  },
  star: {
    fontSize: 20,
    marginRight: 2,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  recordDate: {
    fontSize: 14,
    color: colors.text.tertiary,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionButton: {
    borderWidth: 1,
    borderColor: colors.border.main,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    marginRight: spacing.md,
  },
  likedButton: {
    backgroundColor: colors.error.light,
    borderColor: colors.error.main,
  },
  actionButtonText: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  infoItem: {
    width: '48%',
    marginBottom: spacing.md,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 16,
    color: colors.text.primary,
    fontWeight: '500',
  },
  chartContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  flavorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  flavorTag: {
    backgroundColor: colors.secondary.light,
    borderRadius: theme.borderRadius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  flavorText: {
    fontSize: 14,
    color: colors.secondary.dark,
    fontWeight: '500',
  },
  intensityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  intensityLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    marginRight: spacing.md,
    width: 60,
  },
  intensityBar: {
    flex: 1,
    height: 6,
    backgroundColor: colors.background.light,
    borderRadius: 3,
    marginRight: spacing.md,
  },
  intensityFill: {
    height: '100%',
    backgroundColor: colors.primary.main,
    borderRadius: 3,
  },
  intensityValue: {
    fontSize: 14,
    color: colors.text.primary,
    fontWeight: '600',
    width: 30,
    textAlign: 'right',
  },
  notesText: {
    fontSize: 16,
    color: colors.text.primary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  metaInfo: {
    borderTopWidth: 1,
    borderTopColor: colors.border.light,
    paddingTop: spacing.lg,
  },
  metaItem: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  metaLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  communityText: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  matchScoreContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.background.light,
    borderRadius: theme.borderRadius.md,
    padding: spacing.md,
  },
  matchScoreLabel: {
    fontSize: 14,
    color: colors.text.secondary,
    fontWeight: '600',
  },
  matchScoreValue: {
    fontSize: 18,
    color: colors.primary.main,
    fontWeight: '700',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: colors.accent.light,
    borderRadius: theme.borderRadius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagText: {
    fontSize: 12,
    color: colors.accent.dark,
    fontWeight: '600',
  },
});

export default RecordDetailScreen;