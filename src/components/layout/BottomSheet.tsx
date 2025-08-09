import React, { useRef, useEffect } from 'react';
import {
  View,
  Modal,
  Dimensions,
  TouchableOpacity,
  PanResponder,
  BackHandler,
  Platform,
  ViewStyle,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolate,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export interface BottomSheetProps {
  /** 자식 요소 */
  children: React.ReactNode;
  
  /** 모달 표시 여부 */
  visible: boolean;
  
  /** 모달 닫기 핸들러 */
  onClose: () => void;
  
  /** 초기 높이 비율 (0-1) */
  initialSnapPoint?: number;
  
  /** 스냅 포인트들 (높이 비율 배열) */
  snapPoints?: number[];
  
  /** 최대 높이 비율 */
  maxHeight?: number;
  
  /** 최소 높이 비율 */
  minHeight?: number;
  
  /** 드래그로 닫기 가능 여부 */
  dismissOnDrag?: boolean;
  
  /** 백드롭 터치로 닫기 가능 여부 */
  dismissOnBackdrop?: boolean;
  
  /** 백 버튼으로 닫기 가능 여부 (Android) */
  dismissOnBackButton?: boolean;
  
  /** 핸들 표시 여부 */
  showHandle?: boolean;
  
  /** 백드롭 표시 여부 */
  showBackdrop?: boolean;
  
  /** 백드롭 불투명도 */
  backdropOpacity?: number;
  
  /** 애니메이션 지속 시간 */
  animationDuration?: number;
  
  /** 스프링 애니메이션 설정 */
  springConfig?: {
    damping?: number;
    stiffness?: number;
  };
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 컨텐츠 스타일 */
  contentStyle?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
  
  /** 접근성 라벨 */
  accessibilityLabel?: string;
}

/**
 * CupNote v6 Korean UX 최적화 BottomSheet 컴포넌트
 * 
 * Features:
 * - React Native Reanimated 기반 부드러운 애니메이션
 * - 다중 스냅 포인트 지원
 * - 드래그 제스처로 높이 조절
 * - SafeArea 자동 대응
 * - iOS/Android 일관성
 * - 접근성 지원
 * - 한국형 UX 패턴
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({
  children,
  visible,
  onClose,
  initialSnapPoint = 0.5,
  snapPoints = [0.25, 0.5, 0.9],
  maxHeight = 0.9,
  minHeight = 0.1,
  dismissOnDrag = true,
  dismissOnBackdrop = true,
  dismissOnBackButton = true,
  showHandle = true,
  showBackdrop = true,
  backdropOpacity = 0.5,
  animationDuration = 300,
  springConfig = { damping: 15, stiffness: 150 },
  containerStyle,
  contentStyle,
  testID,
  accessibilityLabel,
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(SCREEN_HEIGHT);
  const backdropOpacityValue = useSharedValue(0);
  
  // 스냅 포인트 높이 계산
  const snapPointHeights = snapPoints.map(point => 
    SCREEN_HEIGHT * (1 - Math.min(Math.max(point, minHeight), maxHeight))
  );
  
  const currentSnapIndex = useRef(
    Math.max(0, snapPoints.findIndex(point => point >= initialSnapPoint))
  );

  // PanResponder 설정
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 20;
      },
      onPanResponderGrant: () => {
        // 제스처 시작 시 애니메이션 중단
      },
      onPanResponderMove: (_, gestureState) => {
        const newTranslateY = Math.max(
          snapPointHeights[snapPointHeights.length - 1],
          snapPointHeights[currentSnapIndex.current] + gestureState.dy
        );
        translateY.value = newTranslateY;
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vy;
        const currentY = translateY.value;
        
        // 빠른 스와이프로 닫기
        if (velocity > 0.5 && dismissOnDrag) {
          closeSheet();
          return;
        }
        
        // 가장 가까운 스냅 포인트 찾기
        let closestSnapIndex = 0;
        let minDistance = Math.abs(currentY - snapPointHeights[0]);
        
        snapPointHeights.forEach((snapHeight, index) => {
          const distance = Math.abs(currentY - snapHeight);
          if (distance < minDistance) {
            minDistance = distance;
            closestSnapIndex = index;
          }
        });
        
        // 최소 높이보다 작으면 닫기
        if (closestSnapIndex === 0 && currentY > snapPointHeights[0] + 50 && dismissOnDrag) {
          closeSheet();
        } else {
          snapToPoint(closestSnapIndex);
        }
      },
    })
  ).current;

  // 스냅 포인트로 이동
  const snapToPoint = (index: number) => {
    currentSnapIndex.current = index;
    translateY.value = withSpring(snapPointHeights[index], springConfig);
  };

  // 시트 열기
  const openSheet = () => {
    const initialSnapIndex = Math.max(0, snapPoints.findIndex(point => point >= initialSnapPoint));
    currentSnapIndex.current = initialSnapIndex;
    
    translateY.value = withSpring(snapPointHeights[initialSnapIndex], springConfig);
    backdropOpacityValue.value = withTiming(backdropOpacity, { 
      duration: animationDuration 
    });
  };

  // 시트 닫기
  const closeSheet = () => {
    translateY.value = withTiming(SCREEN_HEIGHT, { duration: animationDuration });
    backdropOpacityValue.value = withTiming(0, { duration: animationDuration });
    
    setTimeout(() => {
      runOnJS(onClose)();
    }, animationDuration);
  };

  // visible 상태 변경 감지
  useEffect(() => {
    if (visible) {
      openSheet();
    } else {
      translateY.value = SCREEN_HEIGHT;
      backdropOpacityValue.value = 0;
    }
  }, [visible]);

  // Android 백 버튼 처리
  useEffect(() => {
    if (Platform.OS === 'android' && dismissOnBackButton && visible) {
      const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
        closeSheet();
        return true;
      });

      return () => backHandler.remove();
    }
  }, [visible, dismissOnBackButton]);

  // 시트 애니메이션 스타일
  const sheetAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
    };
  });

  // 백드롭 애니메이션 스타일
  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: backdropOpacityValue.value,
    };
  });

  // 핸들 스타일
  const getHandleStyle = (): ViewStyle => ({
    width: 40,
    height: 4,
    backgroundColor: theme.colors.warm[300],
    borderRadius: 2,
    alignSelf: 'center',
    marginVertical: theme.spacing[3],
  });

  // 컨테이너 스타일
  const getContainerStyle = (): ViewStyle => ({
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    paddingBottom: insets.bottom,
    ...theme.shadows.xl,
  });

  // 컨텐츠 스타일
  const getContentStyle = (): ViewStyle => ({
    flex: 1,
    paddingHorizontal: theme.spacing[4],
  });

  if (!visible) {
    return null;
  }

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={dismissOnBackButton ? closeSheet : undefined}
    >
      <View style={{ flex: 1 }}>
        {/* 백드롭 */}
        {showBackdrop && (
          <TouchableOpacity
            style={{ flex: 1 }}
            activeOpacity={1}
            onPress={dismissOnBackdrop ? closeSheet : undefined}
          >
            <Animated.View
              style={[
                {
                  flex: 1,
                  backgroundColor: 'rgba(0, 0, 0, 1)',
                },
                backdropAnimatedStyle,
              ]}
            />
          </TouchableOpacity>
        )}

        {/* 바텀시트 */}
        <Animated.View
          style={[
            {
              position: 'absolute',
              left: 0,
              right: 0,
              top: 0,
              height: SCREEN_HEIGHT,
            },
            sheetAnimatedStyle,
          ]}
          {...panResponder.panHandlers}
        >
          <View
            style={[getContainerStyle(), containerStyle]}
            testID={testID}
            accessible
            accessibilityLabel={accessibilityLabel || '바텀시트'}
            accessibilityRole="dialog"
            accessibilityViewIsModal
          >
            {/* 핸들 */}
            {showHandle && <View style={getHandleStyle()} />}
            
            {/* 컨텐츠 */}
            <View style={[getContentStyle(), contentStyle]}>
              {children}
            </View>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default BottomSheet;