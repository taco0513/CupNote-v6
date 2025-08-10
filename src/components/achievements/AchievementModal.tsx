import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
// Note: BlurView requires @react-native-community/blur to be installed
// For now, using regular View with semi-transparent background
// import { BlurView } from '@react-native-community/blur';
import { colors, spacing, typography } from '../../styles/theme';
import { Achievement } from '../../types';

interface AchievementProgress {
  achievementId: string;
  current: number;
  target: number;
  percentage: number;
  isUnlocked: boolean;
  canUnlock: boolean;
  unlockedAt?: Date;
}
import { AchievementBadge } from './AchievementBadge';
import { AchievementProgress as ProgressComponent } from './AchievementProgress';

interface AchievementModalProps {
  visible: boolean;
  achievement: Achievement | null;
  progress?: AchievementProgress;
  onClose: () => void;
  onShare?: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const getCategoryDisplayName = (category: Achievement['category']) => {
  const categoryMap = {
    quantity: '기록 수량',
    quality: '품질 평가',
    variety: '다양성 탐험',
    social: '커뮤니티',
    expertise: '전문성',
    special: '특별 성취',
  };
  return categoryMap[category] || category;
};

const getRequirementText = (requirement: Achievement['requirement']) => {
  switch (requirement.type) {
    case 'count':
      return `${requirement.target}개 달성`;
    case 'streak':
      return `${requirement.target}일 연속`;
    case 'unique':
      const field = requirement.criteria?.field || '';
      const fieldMap: Record<string, string> = {
        roasteries: '로스터리',
        origins: '원산지',
        methods: '추출 방법',
        coffees: '커피'
      };
      return `${requirement.target}개 다른 ${fieldMap[field] || field}`;
    case 'rating':
      return `평점 ${requirement.target / 10}점 이상`;
    case 'social':
      return `커뮤니티 활동 ${requirement.target}회`;
    case 'special':
      return '특별 조건 달성';
    default:
      return `목표: ${requirement.target}`;
  }
};

const getRarityDisplayName = (rarity: Achievement['rarity']) => {
  const rarityMap = {
    common: '일반',
    uncommon: '희귀',
    rare: '레어',
    epic: '에픽',
    legendary: '전설',
  };
  return rarityMap[rarity] || rarity;
};

export const AchievementModal: React.FC<AchievementModalProps> = ({
  visible,
  achievement,
  progress,
  onClose,
  onShare,
}) => {
  if (!achievement) {
    return null;
  }

  const isUnlocked = progress?.isUnlocked || false;
  const canUnlock = progress?.canUnlock || false;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <TouchableOpacity 
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        >
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              activeOpacity={1}
              style={styles.modal}
              onPress={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <View style={styles.header}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                >
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
              >
                {/* Achievement Badge */}
                <View style={styles.badgeContainer}>
                  <AchievementBadge
                    achievement={achievement}
                    progress={progress}
                    size="large"
                    showProgress={!isUnlocked}
                  />
                </View>

                {/* Achievement Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.achievementName}>
                    {achievement.name}
                  </Text>
                  
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>

                  <View style={styles.tagsContainer}>
                    <View style={[styles.tag, styles.categoryTag]}>
                      <Text style={styles.tagText}>
                        {getCategoryDisplayName(achievement.category)}
                      </Text>
                    </View>
                    
                    <View style={[styles.tag, styles.rarityTag]}>
                      <Text style={styles.tagText}>
                        {getRarityDisplayName(achievement.rarity)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Progress Section */}
                {!isUnlocked && progress && (
                  <View style={styles.progressSection}>
                    <Text style={styles.sectionTitle}>진행 상황</Text>
                    <ProgressComponent
                      progress={progress}
                      achievement={achievement}
                      showLabel
                    />
                    
                    <View style={styles.progressDetails}>
                      <Text style={styles.progressText}>
                        {progress.current} / {progress.target}
                      </Text>
                      <Text style={styles.progressPercentage}>
                        {progress.percentage}%
                      </Text>
                    </View>
                  </View>
                )}

                {/* Requirement */}
                <View style={styles.requirementSection}>
                  <Text style={styles.sectionTitle}>달성 조건</Text>
                  <Text style={styles.requirementText}>
                    {getRequirementText(achievement.requirement)}
                  </Text>
                </View>

                {/* Reward */}
                <View style={styles.rewardSection}>
                  <Text style={styles.sectionTitle}>보상</Text>
                  <View style={styles.rewardContainer}>
                    <Text style={styles.rewardPoints}>
                      +{achievement.points} 포인트
                    </Text>
                    {achievement.rarity !== 'common' && (
                      <Text style={styles.rewardBonus}>
                        특별 뱃지 획득
                      </Text>
                    )}
                  </View>
                </View>

                {/* Unlock Date */}
                {isUnlocked && achievement.unlockedAt && (
                  <View style={styles.unlockedSection}>
                    <Text style={styles.sectionTitle}>달성일</Text>
                    <Text style={styles.unlockedDate}>
                      {new Date(achievement.unlockedAt).toLocaleString('ko-KR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                )}

                {/* Can Unlock Message */}
                {canUnlock && !isUnlocked && (
                  <View style={styles.canUnlockMessage}>
                    <Text style={styles.canUnlockText}>
                      🎉 달성 조건을 만족했습니다! 
                      새 기록을 완료하면 자동으로 잠금 해제됩니다.
                    </Text>
                  </View>
                )}
              </ScrollView>

              {/* Action Buttons */}
              {isUnlocked && onShare && (
                <View style={styles.actionButtons}>
                  <TouchableOpacity 
                    style={styles.shareButton}
                    onPress={onShare}
                  >
                    <Text style={styles.shareButtonText}>
                      📱 성취 공유하기
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: SCREEN_WIDTH * 0.9,
    maxHeight: SCREEN_HEIGHT * 0.8,
    maxWidth: 400,
  },
  modal: {
    backgroundColor: colors.white,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[200],
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.gray[100],
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: colors.gray[600],
  },
  scrollContent: {
    padding: spacing.lg,
  },
  badgeContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  infoContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  achievementName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  achievementDescription: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    textAlign: 'center',
    lineHeight: typography.fontSize.md * 1.4,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 16,
  },
  categoryTag: {
    backgroundColor: colors.primaryLight,
  },
  rarityTag: {
    backgroundColor: colors.infoLight,
  },
  tagText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  progressSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  progressDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  progressText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  progressPercentage: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.primary,
  },
  requirementSection: {
    marginBottom: spacing.xl,
  },
  requirementText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    backgroundColor: colors.gray[50],
    padding: spacing.md,
    borderRadius: 8,
  },
  rewardSection: {
    marginBottom: spacing.xl,
  },
  rewardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  rewardPoints: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.primary,
  },
  rewardBonus: {
    fontSize: typography.fontSize.sm,
    color: colors.warning,
  },
  unlockedSection: {
    marginBottom: spacing.xl,
  },
  unlockedDate: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    fontWeight: typography.fontWeight.medium as any,
  },
  canUnlockMessage: {
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  canUnlockText: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    textAlign: 'center',
    fontWeight: typography.fontWeight.medium as any,
  },
  actionButtons: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    color: colors.white,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
  },
});

export default AchievementModal;