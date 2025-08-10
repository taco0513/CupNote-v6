import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { Card, Button, ProgressBar, SegmentedControl, Badge, Input, Stepper, Chip } from '../../components/common';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp, TastingFlowRouteProp } from '../../types/navigation';

// 드리퍼 종류 (4개로 확정)
enum PouroverDripper {
  V60 = 'V60',
  KALITA_WAVE = 'Kalita Wave',
  ORIGAMI = 'Origami',
  APRIL = 'April'
}

interface BrewSetupData {
  dripper: PouroverDripper;
  recipe: {
    coffee_amount: number;
    water_amount: number;
    ratio: number;
    water_temp?: number;
    grind_setting?: string;
    brew_times: {
      first_pour_time?: number;
      total_time?: number;
      lap_times?: number[];
    };
  };
  quick_note?: string;
  saved_recipe?: {
    name: string;
    coffee_amount: number;
    water_amount: number;
    ratio: number;
    grind_setting?: string;
  };
}

const SAVED_RECIPE_KEY = 'homecafe_my_coffee_recipe';

// 비율 프리셋 (7개 세분화)
const RATIO_PRESETS = [
  { value: 15, label: '1:15', description: '진한 맛' },
  { value: 15.5, label: '1:15.5', description: '진한 맛' },
  { value: 16, label: '1:16', description: '균형' },
  { value: 16.5, label: '1:16.5', description: '균형' },
  { value: 17, label: '1:17', description: '순한 맛' },
  { value: 17.5, label: '1:17.5', description: '순한 맛' },
  { value: 18, label: '1:18', description: '가벼운 맛' },
];

const KEYPAD_NUMBERS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
  ['⌫', 0, '✓']
];

export const BrewSetup: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const route = useRoute<TastingFlowRouteProp<'BrewSetup'>>();
  const { mode, coffeeData } = route.params;
  const { setTastingFlowData } = useStore();

  // 상태 관리
  const [selectedDripper, setSelectedDripper] = useState<PouroverDripper>(PouroverDripper.V60);
  const [coffeeAmount, setCoffeeAmount] = useState(20); // 기본값 20g
  const [waterAmount, setWaterAmount] = useState(320); // 1:16 비율 기본
  const [selectedRatio, setSelectedRatio] = useState(16);
  const [waterTemp, setWaterTemp] = useState('92');
  const [grindSetting, setGrindSetting] = useState('');
  const [quickNote, setQuickNote] = useState('');
  
  // 키패드 상태
  const [showKeypad, setShowKeypad] = useState(false);
  const [keypadInput, setKeypadInput] = useState('20');
  
  // 타이머 관련
  const [bloomTime, setBloomTime] = useState<number | null>(null);
  const [totalTime, setTotalTime] = useState<number | null>(null);
  const [lapTimes, setLapTimes] = useState<number[]>([]);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerStartTime, setTimerStartTime] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState(0);

  // 저장된 레시피
  const [savedRecipe, setSavedRecipe] = useState<any>(null);

  // 타이머 업데이트
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning && timerStartTime) {
      interval = setInterval(() => {
        setCurrentTime(Math.floor((Date.now() - timerStartTime) / 1000));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerStartTime]);

  // 물량 자동 계산
  useEffect(() => {
    setWaterAmount(Math.round(coffeeAmount * selectedRatio));
  }, [coffeeAmount, selectedRatio]);

  // 저장된 레시피 불러오기
  useEffect(() => {
    loadSavedRecipe();
  }, []);

  const loadSavedRecipe = async () => {
    try {
      const saved = await AsyncStorage.getItem(SAVED_RECIPE_KEY);
      if (saved) {
        setSavedRecipe(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load saved recipe:', error);
    }
  };

  // 드리퍼 선택
  const handleDripperSelect = useCallback((dripper: PouroverDripper) => {
    setSelectedDripper(dripper);
  }, []);

  // 키패드 입력 처리
  const handleKeypadInput = useCallback((value: string | number) => {
    if (value === '⌫') {
      setKeypadInput(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
    } else if (value === '✓') {
      const amount = parseInt(keypadInput) || 20;
      if (amount >= 15 && amount <= 30) {
        setCoffeeAmount(amount);
        setShowKeypad(false);
      } else {
        Alert.alert('입력 오류', '원두량은 15g~30g 사이로 입력해주세요.');
      }
    } else {
      if (keypadInput.length < 2 || (keypadInput === '0' && value !== 0)) {
        const newInput = keypadInput === '0' ? value.toString() : keypadInput + value.toString();
        if (parseInt(newInput) <= 30) {
          setKeypadInput(newInput);
        }
      }
    }
  }, [keypadInput]);

  // 원두량 입력 (키패드 방식)
  const handleCoffeeAmountChange = useCallback((text: string) => {
    const amount = parseInt(text) || 0;
    if (amount >= 0 && amount <= 50) { // 0-50g 범위 제한
      setCoffeeAmount(amount);
    }
  }, []);

  // 비율 선택
  const handleRatioSelect = useCallback((ratio: number) => {
    setSelectedRatio(ratio);
  }, []);

  // 타이머 제어
  const handleTimerStart = useCallback(() => {
    if (!isTimerRunning) {
      setTimerStartTime(Date.now());
      setIsTimerRunning(true);
      setCurrentTime(0);
      setLapTimes([]);
    }
  }, [isTimerRunning]);

  const handleTimerStop = useCallback(() => {
    if (isTimerRunning) {
      setIsTimerRunning(false);
      setTotalTime(currentTime);
    }
  }, [isTimerRunning, currentTime]);

  const handleBloomRecord = useCallback(() => {
    if (isTimerRunning && !bloomTime) {
      setBloomTime(currentTime);
      Alert.alert('블룸 시간 기록', `${currentTime}초에 블룸 완료`);
    }
  }, [isTimerRunning, bloomTime, currentTime]);

  const handleLapTime = useCallback(() => {
    if (isTimerRunning) {
      setLapTimes(prev => [...prev, currentTime]);
    }
  }, [isTimerRunning, currentTime]);

  // 레시피 저장
  const handleSaveRecipe = useCallback(async () => {
    const recipe = {
      name: "나의 커피",
      coffee_amount: coffeeAmount,
      water_amount: waterAmount,
      ratio: selectedRatio,
      grind_setting: grindSetting,
      saved_at: new Date().toISOString()
    };

    try {
      await AsyncStorage.setItem(SAVED_RECIPE_KEY, JSON.stringify(recipe));
      setSavedRecipe(recipe);
      Alert.alert('저장 완료', '레시피가 저장되었습니다.');
    } catch (error) {
      Alert.alert('저장 실패', '레시피 저장에 실패했습니다.');
    }
  }, [coffeeAmount, waterAmount, selectedRatio, grindSetting]);

  // 레시피 불러오기
  const handleLoadRecipe = useCallback(() => {
    if (savedRecipe) {
      setCoffeeAmount(savedRecipe.coffee_amount);
      setSelectedRatio(savedRecipe.ratio);
      setGrindSetting(savedRecipe.grind_setting || '');
      Alert.alert('불러오기 완료', '저장된 레시피를 불러왔습니다.');
    }
  }, [savedRecipe]);

  // 다음 단계
  const handleNext = useCallback(() => {
    const brewData: BrewSetupData = {
      dripper: selectedDripper,
      recipe: {
        coffee_amount: coffeeAmount,
        water_amount: waterAmount,
        ratio: selectedRatio,
        water_temp: waterTemp ? parseFloat(waterTemp) : undefined,
        grind_setting: grindSetting || undefined,
        brew_times: {
          first_pour_time: bloomTime || undefined,
          total_time: totalTime || undefined,
          lap_times: lapTimes.length > 0 ? lapTimes : undefined,
        },
      },
      quick_note: quickNote || undefined,
    };

    setTastingFlowData({ brewSetup: {
      brewMethod: brewData.dripper,
      waterTemp: brewData.recipe.water_temp || 92,
      brewTime: brewData.recipe.brew_times.total_time?.toString() || '',
    }});
    navigation.navigate('FlavorSelection', { mode, coffeeData, brewData });
  }, [
    selectedDripper, coffeeAmount, waterAmount, selectedRatio, waterTemp,
    grindSetting, bloomTime, totalTime, lapTimes, quickNote, 
    navigation, mode, coffeeData, setTastingFlowData
  ]);

  // 타이머 포맷
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoid}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* 헤더 */}
          <View style={styles.header}>
            <ProgressBar progress={0.43} style={styles.progressBar} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>브루잉 설정</Text>
              <Badge 
                text="🏠 홈카페 모드"
                variant="info"
              />
            </View>
          </View>

          {/* 드리퍼 선택 */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>드리퍼 선택</Text>
            <View style={styles.dripperGrid}>
              {Object.values(PouroverDripper).map((dripper) => (
                <TouchableOpacity
                  key={dripper}
                  style={[
                    styles.dripperItem,
                    selectedDripper === dripper && styles.dripperItemActive
                  ]}
                  onPress={() => handleDripperSelect(dripper)}
                  activeOpacity={0.7}
                >
                  <Text style={[
                    styles.dripperIcon,
                    selectedDripper === dripper && styles.dripperIconActive
                  ]}>
                    {dripper === PouroverDripper.V60 && '⏏️'}
                    {dripper === PouroverDripper.KALITA_WAVE && '〽️'}
                    {dripper === PouroverDripper.ORIGAMI && '🔷'}
                    {dripper === PouroverDripper.APRIL && '🌸'}
                  </Text>
                  <Text style={[
                    styles.dripperName,
                    selectedDripper === dripper && styles.dripperNameActive
                  ]}>
                    {dripper}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>

          {/* 레시피 설정 */}
          <Card style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>레시피 설정</Text>
              {savedRecipe && (
                <TouchableOpacity
                  style={styles.loadButton}
                  onPress={handleLoadRecipe}
                  activeOpacity={0.7}
                >
                  <Text style={styles.loadButtonText}>📂 불러오기</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* 비율 프리셋 */}
            <Text style={styles.inputLabel}>비율 선택</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.ratioScroll}
            >
              <View style={styles.ratioButtons}>
                {RATIO_PRESETS.map((preset) => (
                  <TouchableOpacity
                    key={preset.value}
                    style={[
                      styles.ratioButton,
                      selectedRatio === preset.value && styles.ratioButtonActive
                    ]}
                    onPress={() => handleRatioSelect(preset.value)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.ratioButtonText,
                      selectedRatio === preset.value && styles.ratioButtonTextActive
                    ]}>
                      {preset.label}
                    </Text>
                    {preset.description && (
                      <Text style={[
                        styles.ratioDescription,
                        selectedRatio === preset.value && styles.ratioDescriptionActive
                      ]}>
                        {preset.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* 키패드 입력 시스템 */}
            <View style={styles.amountContainer}>
              <View style={styles.amountItem}>
                <Text style={styles.inputLabel}>원두량 (g)</Text>
                <TouchableOpacity 
                  style={styles.keypadTrigger}
                  onPress={() => {
                    setKeypadInput(coffeeAmount.toString());
                    setShowKeypad(true);
                  }}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keypadTriggerText}>{coffeeAmount}g</Text>
                  <Text style={styles.keypadHint}>탭하여 변경</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.amountItem}>
                <Text style={styles.inputLabel}>물량 (ml)</Text>
                <View style={styles.waterAmountDisplay}>
                  <Text style={styles.waterAmountText}>{waterAmount}ml</Text>
                  <Text style={styles.waterAmountSubtext}>자동 계산</Text>
                </View>
              </View>
            </View>

            {/* 키패드 모달 */}
            {showKeypad && (
              <View style={styles.keypadContainer}>
                <View style={styles.keypadHeader}>
                  <Text style={styles.keypadTitle}>원두량 입력 (15-30g)</Text>
                  <Text style={styles.keypadDisplay}>{keypadInput}g</Text>
                </View>
                <View style={styles.keypad}>
                  {KEYPAD_NUMBERS.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.keypadRow}>
                      {row.map((num, numIndex) => (
                        <TouchableOpacity
                          key={numIndex}
                          style={[
                            styles.keypadButton,
                            (num === '⌫' || num === '✓') && styles.keypadButtonAction
                          ]}
                          onPress={() => handleKeypadInput(num)}
                          activeOpacity={0.7}
                        >
                          <Text style={[
                            styles.keypadButtonText,
                            (num === '⌫' || num === '✓') && styles.keypadButtonActionText
                          ]}>
                            {num}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  ))}
                </View>
                <TouchableOpacity
                  style={styles.keypadCancel}
                  onPress={() => setShowKeypad(false)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.keypadCancelText}>취소</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* 물 온도 */}
            <Input
              label="물 온도 (°C)"
              value={waterTemp}
              onChangeText={setWaterTemp}
              keyboardType="numeric"
              placeholder="92"
              variant="outlined"
            />

            {/* 분쇄도 설정 */}
            <Input
              label="분쇄도 설정"
              value={grindSetting}
              onChangeText={setGrindSetting}
              placeholder="예: 코만단테, C40 MK4, 25 클릭"
              variant="outlined"
            />

            {/* 추출 타이머 */}
            <Card style={styles.timerSection} variant="outlined">
              <Text style={styles.inputLabel}>추출 타이머</Text>
              <View style={styles.timerDisplay}>
                <Text style={styles.timerText}>{formatTime(currentTime)}</Text>
                {bloomTime && (
                  <Text style={styles.timerSubtext}>블룸: {bloomTime}초</Text>
                )}
              </View>
              
              <View style={styles.timerButtons}>
                {!isTimerRunning ? (
                  <TouchableOpacity
                    style={styles.timerButton}
                    onPress={handleTimerStart}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.timerButtonText}>▶️ 시작</Text>
                  </TouchableOpacity>
                ) : (
                  <>
                    <TouchableOpacity
                      style={styles.timerButton}
                      onPress={handleTimerStop}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timerButtonText}>⏹ 정지</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.timerButton, bloomTime && styles.timerButtonDisabled]}
                      onPress={handleBloomRecord}
                      activeOpacity={0.7}
                      disabled={!!bloomTime}
                    >
                      <Text style={styles.timerButtonText}>💧 블룸</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.timerButton}
                      onPress={handleLapTime}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.timerButtonText}>⏱ 랩</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>

              {lapTimes.length > 0 && (
                <View style={styles.lapTimesContainer}>
                  <Text style={styles.lapTimesTitle}>랩 타임:</Text>
                  {lapTimes.map((lap, index) => (
                    <Text key={index} style={styles.lapTime}>
                      랩 {index + 1}: {formatTime(lap)}
                    </Text>
                  ))}
                </View>
              )}
            </Card>

            {/* 간단 메모 */}
            <Input
              label="간단 메모"
              value={quickNote}
              onChangeText={setQuickNote}
              placeholder="추출 과정 메모..."
              multiline
              variant="outlined"
            />

            {/* 레시피 저장 */}
            <Button
              title="💾 나의 커피로 저장"
              onPress={handleSaveRecipe}
              variant="secondary"
              size="medium"
              fullWidth
            />
          </Card>
        </ScrollView>

        {/* 하단 버튼 */}
        <View style={styles.footer}>
          <Button
            title="다음"
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
  scrollContent: {
    paddingBottom: spacing.xxl,
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
    marginBottom: spacing.xs,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
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
  loadButton: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  loadButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium as any,
  },
  dripperGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  dripperItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gray[200],
  },
  dripperItemActive: {
    borderColor: colors.secondary,
    backgroundColor: colors.secondaryLight,
  },
  dripperIcon: {
    fontSize: 32,
    marginBottom: spacing.xs,
  },
  dripperIconActive: {
    color: colors.secondary,
  },
  dripperName: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium as any,
  },
  dripperNameActive: {
    color: colors.secondary,
    fontWeight: typography.fontWeight.semibold as any,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium as any,
  },
  ratioScroll: {
    marginBottom: spacing.md,
  },
  ratioButtons: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  ratioButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
    alignItems: 'center',
  },
  ratioButtonActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  ratioButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium as any,
  },
  ratioButtonTextActive: {
    color: colors.white,
  },
  ratioDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  ratioDescriptionActive: {
    color: colors.white,
    opacity: 0.9,
  },
  amountContainer: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  amountItem: {
    flex: 1,
  },
  amountInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    textAlign: 'center',
  },
  waterAmountDisplay: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  waterAmountText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.secondary,
  },
  waterAmountSubtext: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  keypadTrigger: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.secondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  keypadTriggerText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.secondary,
  },
  keypadHint: {
    fontSize: typography.fontSize.xs,
    color: colors.gray[500],
    marginTop: 2,
  },
  keypadContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: spacing.lg,
    marginVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.gray[800],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  keypadHeader: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  keypadTitle: {
    fontSize: typography.fontSize.md,
    color: colors.gray[600],
    marginBottom: spacing.sm,
  },
  keypadDisplay: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.secondary,
  },
  keypad: {
    gap: spacing.sm,
  },
  keypadRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  keypadButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.gray[50],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[200],
  },
  keypadButtonAction: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  keypadButtonText: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.medium as any,
    color: colors.gray[700],
  },
  keypadButtonActionText: {
    color: colors.white,
    fontWeight: typography.fontWeight.semibold as any,
  },
  keypadCancel: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  keypadCancelText: {
    fontSize: typography.fontSize.md,
    color: colors.gray[500],
  },
  timerSection: {
    backgroundColor: colors.gray[50],
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  timerDisplay: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  timerText: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold as any,
    color: colors.text.primary,
  },
  timerSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginTop: spacing.xs,
  },
  timerButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
  },
  timerButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  timerButtonDisabled: {
    opacity: 0.5,
  },
  timerButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    fontWeight: typography.fontWeight.medium as any,
  },
  lapTimesContainer: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray[200],
  },
  lapTimesTitle: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
    marginBottom: spacing.xs,
  },
  lapTime: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginBottom: 2,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
});

export default BrewSetup;