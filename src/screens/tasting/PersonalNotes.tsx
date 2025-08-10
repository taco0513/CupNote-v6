import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Keyboard,
  Dimensions,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography } from '../../styles/theme';
import { Card, Button, ProgressBar, Badge, Chip, Input } from '../../components/common';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp, TastingFlowRouteProp } from '../../types/navigation';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 빠른 표현 데이터
const QUICK_EXPRESSIONS = [
  '아침에 좋을 것 같다',
  '다시 마시고 싶다',
  '친구에게 추천하고 싶다',
  '특별한 날에 어울린다',
  '집중할 때 좋을 것 같다',
  '편안한 느낌이다',
  '새로운 경험이었다',
  '기대보다 좋았다',
];

// 감정 태그 데이터
const EMOTION_TAGS = [
  { emoji: '😊', label: '만족', value: 'satisfied' },
  { emoji: '😍', label: '최고', value: 'amazing' },
  { emoji: '😌', label: '편안함', value: 'comfortable' },
  { emoji: '🤔', label: '흥미로움', value: 'interesting' },
  { emoji: '😋', label: '맛있음', value: 'delicious' },
  { emoji: '✨', label: '특별함', value: 'special' },
  { emoji: '💭', label: '생각나는', value: 'memorable' },
  { emoji: '🎯', label: '집중', value: 'focused' },
  { emoji: '☕', label: '일상', value: 'daily' },
];

// 시간대 판별 함수
const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return 'night';
  if (hour < 12) return 'morning';
  if (hour < 18) return 'afternoon';
  if (hour < 22) return 'evening';
  return 'night';
};

// 디바운스 훅
const useDebounce = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  return debouncedCallback;
};

export const PersonalNotes: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const route = useRoute<TastingFlowRouteProp<'PersonalNotes'>>();
  const { setTastingFlowData } = useStore();

  // 상태 관리
  const [commentText, setCommentText] = useState('');
  const [selectedExpressions, setSelectedExpressions] = useState<string[]>([]);
  const [selectedEmotions, setSelectedEmotions] = useState<string[]>([]);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'saving' | 'saved' | 'error'>('saved');
  const [autoSaveCount, setAutoSaveCount] = useState(0);
  const [startTime] = useState(Date.now());
  const [showQuickTools, setShowQuickTools] = useState(true);
  const [showEmotionTags, setShowEmotionTags] = useState(true);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

  // 글자 수 계산
  const characterCount = useMemo(() => commentText.length, [commentText]);
  const isOverLimit = characterCount > 200;

  // 자동 저장 함수
  const saveDraft = useCallback(async (text: string) => {
    try {
      setAutoSaveStatus('saving');
      const draftData = {
        commentText: text,
        selectedExpressions,
        selectedEmotions,
        timestamp: new Date().toISOString(),
      };
      await AsyncStorage.setItem('@personal_notes_draft', JSON.stringify(draftData));
      setAutoSaveStatus('saved');
      setLastSavedAt(new Date());
      setAutoSaveCount(prev => prev + 1);
    } catch (error) {
      console.error('Failed to save draft:', error);
      setAutoSaveStatus('error');
    }
  }, [selectedExpressions, selectedEmotions]);

  // 디바운스된 자동 저장
  const debouncedAutoSave = useDebounce(saveDraft, 10000); // 10초

  // 드래프트 불러오기
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draftString = await AsyncStorage.getItem('@personal_notes_draft');
        if (draftString) {
          const draft = JSON.parse(draftString);
          setCommentText(draft.commentText || '');
          setSelectedExpressions(draft.selectedExpressions || []);
          setSelectedEmotions(draft.selectedEmotions || []);
        }
      } catch (error) {
        console.error('Failed to load draft:', error);
      }
    };
    loadDraft();
  }, []);

  // 텍스트 변경 핸들러
  const handleTextChange = useCallback((text: string) => {
    if (text.length <= 200) {
      setCommentText(text);
      debouncedAutoSave(text);
    }
  }, [debouncedAutoSave]);

  // 빠른 표현 선택 핸들러
  const toggleExpression = useCallback((expression: string) => {
    setSelectedExpressions(prev => {
      const newExpressions = prev.includes(expression)
        ? prev.filter(e => e !== expression)
        : [...prev, expression];
      
      // 텍스트에 자동 추가
      if (!prev.includes(expression)) {
        const separator = commentText.trim() ? ' ' : '';
        const newText = `${commentText}${separator}${expression}`;
        if (newText.length <= 200) {
          setCommentText(newText);
        }
      }
      
      return newExpressions;
    });
  }, [commentText]);

  // 감정 태그 선택 핸들러
  const toggleEmotion = useCallback((emotionValue: string) => {
    setSelectedEmotions(prev =>
      prev.includes(emotionValue)
        ? prev.filter(e => e !== emotionValue)
        : [...prev, emotionValue]
    );
  }, []);

  // 다음 버튼 핸들러
  const handleNext = useCallback(async () => {
    // 드래프트 삭제
    try {
      await AsyncStorage.removeItem('@personal_notes_draft');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }

    // Zustand store에 데이터 저장
    setTastingFlowData({ 
      personalNotes: {
        notes: commentText.trim(),
        overallRating: 4.5, // TODO: Get from rating component
        shareToCommnity: false, // TODO: Get from user preference
      }
    });

    // 다음 화면으로 이동 (파라미터 없이)
    navigation.navigate('Result', route.params);
  }, [commentText, selectedExpressions, selectedEmotions, startTime, characterCount, autoSaveCount, navigation, route.params, setTastingFlowData]);

  // 자동 저장 상태 표시 텍스트
  const getAutoSaveText = () => {
    if (autoSaveStatus === 'saving') return '저장 중...';
    if (autoSaveStatus === 'error') return '저장 실패';
    if (lastSavedAt) {
      const seconds = Math.floor((Date.now() - lastSavedAt.getTime()) / 1000);
      if (seconds < 60) return `${seconds}초 전 자동 저장됨`;
      const minutes = Math.floor(seconds / 60);
      return `${minutes}분 전 자동 저장됨`;
    }
    return '자동 저장 대기 중';
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        {/* Navigation Header */}
        <View style={styles.navHeader}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Text style={styles.backButtonText}>‹</Text>
          </TouchableOpacity>
          <Text style={styles.navTitle}>개인 노트</Text>
          <View style={styles.navSpacer} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <ProgressBar 
              progress={route.params.mode === 'cafe' ? 1.0 : 1.0} 
              style={styles.progressBar} 
            />
            <View style={styles.headerContent}>
              <Text style={styles.title}>개인 노트</Text>
              <Badge 
                text={route.params.mode === 'cafe' ? '☕ 카페 모드' : '🏠 홈카페 모드'}
                variant={route.params.mode === 'cafe' ? 'primary' : 'info'}
              />
            </View>
          </View>

          {/* 안내 메시지 */}
          <Card style={styles.guideSection}>
            <Text style={styles.guideTitle}>
              이 커피에 대한 개인적인 생각을 자유롭게 적어보세요
            </Text>
            <Text style={styles.guideSubtitle}>
              특별한 순간이나 느낌을 기록해두면 좋은 추억이 됩니다
            </Text>
          </Card>

          {/* 메인 입력 영역 */}
          <Card style={styles.inputSection}>
            <TextInput
              style={[
                styles.textArea,
                isOverLimit && styles.textAreaError
              ]}
              value={commentText}
              onChangeText={handleTextChange}
              placeholder="예) 아침에 마시기 좋은 부드러운 맛이었다..."
              placeholderTextColor={colors.gray[500]}
              multiline
              maxLength={200}
              textAlignVertical="top"
            />
            <View style={styles.textAreaFooter}>
              <Text style={[
                styles.characterCount,
                isOverLimit && styles.characterCountError
              ]}>
                {characterCount}/200
              </Text>
              <Badge 
                text={getAutoSaveText()}
                variant={autoSaveStatus === 'saved' ? 'success' : 
                         autoSaveStatus === 'saving' ? 'warning' : 'error'}
                size="small"
              />
            </View>
          </Card>

          {/* 빠른 입력 도구 */}
          <Card style={styles.quickToolsSection}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowQuickTools(!showQuickTools)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>💬 자주 사용하는 표현</Text>
              <Text style={styles.toggleIcon}>
                {showQuickTools ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>
            
            {showQuickTools && (
              <View style={styles.expressionGrid}>
                {QUICK_EXPRESSIONS.map(expression => (
                  <Chip
                    key={expression}
                    label={expression}
                    selected={selectedExpressions.includes(expression)}
                    onPress={() => toggleExpression(expression)}
                    style={styles.expressionChip}
                  />
                ))}
              </View>
            )}
          </Card>

          {/* 감정 태그 */}
          <Card style={styles.emotionSection}>
            <TouchableOpacity
              style={styles.sectionHeader}
              onPress={() => setShowEmotionTags(!showEmotionTags)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>감정 태그</Text>
              <Text style={styles.toggleIcon}>
                {showEmotionTags ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showEmotionTags && (
              <View style={styles.emotionGrid}>
                {EMOTION_TAGS.map(emotion => (
                  <TouchableOpacity
                    key={emotion.value}
                    style={[
                      styles.emotionTag,
                      selectedEmotions.includes(emotion.value) && styles.emotionTagSelected
                    ]}
                    onPress={() => toggleEmotion(emotion.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.emotionEmoji}>{emotion.emoji}</Text>
                    <Text style={[
                      styles.emotionLabel,
                      selectedEmotions.includes(emotion.value) && styles.emotionLabelSelected
                    ]}>
                      {emotion.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </Card>

          {/* 컨텍스트 정보 */}
          <Card style={styles.contextInfo} variant="outlined">
            <View style={styles.contextCard}>
              <Text style={styles.contextIcon}>⏰</Text>
              <Text style={styles.contextText}>
                작성 시간: {new Date().toLocaleTimeString('ko-KR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </Text>
            </View>
          </Card>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <Button
            title="완료"
            onPress={handleNext}
            variant="primary"
            size="large"
            fullWidth
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  navHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  navTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'center',
  },
  navSpacer: {
    width: 44,
    height: 44,
  },
  scrollContent: {
    paddingBottom: spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  progressBar: {
    marginBottom: spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  guideSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  guideTitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  guideSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  inputSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    lineHeight: 24,
  },
  textAreaError: {
    borderColor: colors.error,
  },
  textAreaFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
  characterCount: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  characterCountError: {
    color: colors.error,
  },
  quickToolsSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
  },
  toggleIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  expressionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  expressionChip: {
    marginBottom: spacing.xs,
  },
  emotionSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  emotionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs / 2,
  },
  emotionTag: {
    width: (SCREEN_WIDTH - spacing.lg * 2 - spacing.lg * 2 - spacing.xs * 2) / 3,
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.sm,
    margin: spacing.xs / 2,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  emotionTagSelected: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
    borderWidth: 2,
  },
  emotionEmoji: {
    fontSize: 24,
    marginBottom: spacing.xs,
  },
  emotionLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[700],
  },
  emotionLabelSelected: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  contextInfo: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contextIcon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  contextText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
});

export default PersonalNotes;