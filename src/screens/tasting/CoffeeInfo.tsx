import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, spacing, typography, borderRadius } from '../../styles/theme';
import { Card, Button, ProgressBar, SegmentedControl, Badge } from '../../components/common';
import useStore from '../../store/useStore';
import type { TastingFlowNavigationProp, TastingFlowRouteProp } from '../../types/navigation';

// Sample database (실제로는 Supabase나 Realm에서 가져옴)
const SAMPLE_DATA = {
  cafes: [
    { id: '1', name: '블루보틀 성수', district: '성수동' },
    { id: '2', name: '앤트러사이트 한남', district: '한남동' },
    { id: '3', name: '센터커피 연남', district: '연남동' },
    { id: '4', name: '프릳츠 청담', district: '청담동' },
  ],
  roasters: [
    { id: '1', name: '프릳츠 컴퍼니', cafeIds: ['4'] },
    { id: '2', name: '블루보틀', cafeIds: ['1'] },
    { id: '3', name: '앤트러사이트', cafeIds: ['2'] },
    { id: '4', name: '센터커피', cafeIds: ['3'] },
    { id: '5', name: '테라로사', cafeIds: [] },
  ],
  coffees: [
    { 
      id: '1', 
      name: '에티오피아 예가체프', 
      roasterId: '1',
      origin: '에티오피아',
      variety: 'Heirloom',
      processing: 'Washed',
      altitude: 2200
    },
    { 
      id: '2', 
      name: '콜롬비아 게이샤', 
      roasterId: '1',
      origin: '콜롬비아',
      variety: 'Geisha',
      processing: 'Natural',
      altitude: 1800
    },
    { 
      id: '3', 
      name: '브라이트 블렌드', 
      roasterId: '2',
      origin: '블렌드',
      processing: 'Mixed'
    },
  ]
};

interface CoffeeInfoData {
  mode: 'cafe' | 'homecafe';
  cafe_name?: string;
  roaster_name: string;
  coffee_name: string;
  temperature: 'hot' | 'iced';
  optional_info?: {
    origin?: string;
    variety?: string;
    processing?: string;
    roast_level?: string;
    altitude?: number;
  };
  is_new_coffee?: boolean;
  auto_filled?: boolean;
}

// 자동완성 컴포넌트
const AutocompleteInput: React.FC<{
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  onSelect: (item: any) => void;
  suggestions: any[];
  placeholder: string;
  loading?: boolean;
  disabled?: boolean;
}> = ({ 
  label, 
  value, 
  onChangeText, 
  onSelect, 
  suggestions, 
  placeholder,
  loading = false,
  disabled = false 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleSelect = (item: any) => {
    onSelect(item);
    setShowSuggestions(false);
    setIsFocused(false);
  };

  return (
    <View style={styles.inputContainer}>
      <Text style={styles.inputLabel}>{label}</Text>
      <View style={[
        styles.inputWrapper,
        isFocused && styles.inputWrapperFocused,
        disabled && styles.inputWrapperDisabled
      ]}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            setShowSuggestions(true);
          }}
          onFocus={() => {
            setIsFocused(true);
            setShowSuggestions(true);
          }}
          onBlur={() => {
            setIsFocused(false);
            setTimeout(() => setShowSuggestions(false), 200);
          }}
          placeholder={placeholder}
          placeholderTextColor={colors.gray[500]}
          editable={!disabled}
        />
        {loading && <ActivityIndicator size="small" color={colors.primary} />}
      </View>
      
      {showSuggestions && suggestions.length > 0 && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((item, index) => (
            <TouchableOpacity
              key={item.id || index}
              style={styles.suggestionItem}
              onPress={() => handleSelect(item)}
              activeOpacity={0.7}
            >
              <Text style={styles.suggestionText}>{item.name}</Text>
              {item.district && (
                <Text style={styles.suggestionSubtext}>{item.district}</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export const CoffeeInfo: React.FC = () => {
  const navigation = useNavigation<TastingFlowNavigationProp>();
  const route = useRoute<TastingFlowRouteProp<'CoffeeInfo'>>();
  const { mode } = route.params;
  const { setTastingFlowData } = useStore();

  // 기본 상태
  const [selectedCafe, setSelectedCafe] = useState<any>(null);
  const [selectedRoaster, setSelectedRoaster] = useState<any>(null);
  const [selectedCoffee, setSelectedCoffee] = useState<any>(null);
  
  const [cafeInput, setCafeInput] = useState('');
  const [roasterInput, setRoasterInput] = useState('');
  const [coffeeInput, setCoffeeInput] = useState('');
  
  const [temperature, setTemperature] = useState<'hot' | 'iced'>('hot');
  const [showOptionalInfo, setShowOptionalInfo] = useState(false);
  
  // 선택 정보
  const [origin, setOrigin] = useState('');
  const [variety, setVariety] = useState('');
  const [processing, setProcessing] = useState('');
  const [roastLevel, setRoastLevel] = useState('');
  const [altitude, setAltitude] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Cascade 자동완성 로직
  const cafeSuggestions = useMemo(() => {
    if (!cafeInput || mode !== 'cafe') return [];
    return SAMPLE_DATA.cafes.filter(cafe => 
      cafe.name.toLowerCase().includes(cafeInput.toLowerCase())
    );
  }, [cafeInput, mode]);

  const roasterSuggestions = useMemo(() => {
    if (!roasterInput) return [];
    
    let roasters = SAMPLE_DATA.roasters;
    
    // Cafe 모드에서 카페가 선택된 경우, 해당 카페의 로스터만 필터링
    if (mode === 'cafe' && selectedCafe) {
      roasters = roasters.filter(r => r.cafeIds.includes(selectedCafe.id));
    }
    
    return roasters.filter(r => 
      r.name.toLowerCase().includes(roasterInput.toLowerCase())
    );
  }, [roasterInput, selectedCafe, mode]);

  const coffeeSuggestions = useMemo(() => {
    if (!coffeeInput) return [];
    
    // 로스터가 선택된 경우에만 필터링
    if (selectedRoaster) {
      return SAMPLE_DATA.coffees
        .filter(c => c.roasterId === selectedRoaster.id)
        .filter(c => c.name.toLowerCase().includes(coffeeInput.toLowerCase()));
    }
    
    // 로스터가 선택되지 않은 경우 전체 커피에서 검색
    return SAMPLE_DATA.coffees
      .filter(c => c.name.toLowerCase().includes(coffeeInput.toLowerCase()));
  }, [coffeeInput, selectedRoaster]);

  // 카페 선택 핸들러
  const handleCafeSelect = useCallback((cafe: any) => {
    setSelectedCafe(cafe);
    setCafeInput(cafe.name);
    // 카페 선택 시 로스터 초기화
    setSelectedRoaster(null);
    setRoasterInput('');
    setSelectedCoffee(null);
    setCoffeeInput('');
  }, []);

  // 로스터 선택 핸들러
  const handleRoasterSelect = useCallback((roaster: any) => {
    setSelectedRoaster(roaster);
    setRoasterInput(roaster.name);
    // 로스터 선택 시 커피 초기화
    setSelectedCoffee(null);
    setCoffeeInput('');
  }, []);

  // 커피 선택 핸들러
  const handleCoffeeSelect = useCallback((coffee: any) => {
    setSelectedCoffee(coffee);
    setCoffeeInput(coffee.name);
    
    // 선택정보 자동 입력
    if (coffee.origin || coffee.variety || coffee.processing || coffee.altitude) {
      setShowOptionalInfo(true);
      setOrigin(coffee.origin || '');
      setVariety(coffee.variety || '');
      setProcessing(coffee.processing || '');
      setAltitude(coffee.altitude?.toString() || '');
      
      Alert.alert(
        '정보 자동입력',
        '데이터베이스에서 커피 정보를 자동으로 가져왔습니다.',
        [{ text: '확인' }]
      );
    }
  }, []);

  // 다음 버튼 핸들러
  const handleNext = useCallback(() => {
    // 유효성 검사
    if (!roasterInput) {
      Alert.alert('입력 오류', '로스터명을 입력해주세요.');
      return;
    }
    if (!coffeeInput) {
      Alert.alert('입력 오류', '커피명을 입력해주세요.');
      return;
    }

    // 데이터 저장
    const coffeeInfoData: CoffeeInfoData = {
      mode,
      cafe_name: mode === 'cafe' ? cafeInput : undefined,
      roaster_name: roasterInput,
      coffee_name: coffeeInput,
      temperature,
      optional_info: showOptionalInfo ? {
        origin: origin || undefined,
        variety: variety || undefined,
        processing: processing || undefined,
        roast_level: roastLevel || undefined,
        altitude: altitude ? parseInt(altitude) : undefined,
      } : undefined,
      is_new_coffee: !selectedCoffee,
      auto_filled: !!selectedCoffee,
    };

    setTastingFlowData({ coffeeInfo: {
      coffeeName: coffeeInfoData.coffee_name,
      cafeName: coffeeInfoData.cafe_name,
      roastery: coffeeInfoData.roaster_name,
    }});

    // 새로운 커피인 경우 DB에 추가 (실제로는 API 호출)
    if (!selectedCoffee) {
      console.log('새로운 커피 추가:', coffeeInfoData);
      // await addNewCoffeeToDatabase(coffeeInfoData);
    }

    // 다음 화면으로 이동
    if (mode === 'homecafe') {
      navigation.navigate('BrewSetup', { 
        mode, 
        coffeeData: coffeeInfoData 
      });
    } else {
      navigation.navigate('FlavorSelection', { 
        mode, 
        coffeeData: coffeeInfoData 
      });
    }
  }, [mode, cafeInput, roasterInput, coffeeInput, temperature, 
      showOptionalInfo, origin, variety, processing, roastLevel, 
      altitude, selectedCoffee, navigation, setTastingFlowData]);

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
            <ProgressBar progress={0.29} style={styles.progressBar} />
            <View style={styles.headerContent}>
              <Text style={styles.title}>커피 정보</Text>
              <Badge 
                text={mode === 'cafe' ? '☕ 카페 모드' : '🏠 홈카페 모드'}
                variant={mode === 'cafe' ? 'primary' : 'info'}
              />
            </View>
          </View>

          {/* 필수 정보 섹션 */}
          <Card style={styles.section}>
            <Text style={styles.sectionTitle}>필수 정보</Text>
            
            {/* 카페명 (Cafe 모드만 - 선택사항) */}
            {mode === 'cafe' && (
              <AutocompleteInput
                label="카페명 (선택)"
                value={cafeInput}
                onChangeText={setCafeInput}
                onSelect={handleCafeSelect}
                suggestions={cafeSuggestions}
                placeholder="예: 블루보틀 성수 (선택사항)"
              />
            )}

            {/* 로스터명 */}
            <AutocompleteInput
              label="로스터명 *"
              value={roasterInput}
              onChangeText={setRoasterInput}
              onSelect={handleRoasterSelect}
              suggestions={roasterSuggestions}
              placeholder="예: 프릳츠 컴퍼니"
            />

            {/* 커피명 */}
            <AutocompleteInput
              label="커피명 *"
              value={coffeeInput}
              onChangeText={setCoffeeInput}
              onSelect={handleCoffeeSelect}
              suggestions={coffeeSuggestions}
              placeholder="예: 에티오피아 예가체프"
            />

            {/* 온도 선택 */}
            <View style={styles.temperatureContainer}>
              <Text style={styles.inputLabel}>온도 *</Text>
              <SegmentedControl
                options={[
                  { value: 'hot', label: 'HOT', icon: '☕' },
                  { value: 'iced', label: 'ICED', icon: '🧊' }
                ]}
                value={temperature}
                onValueChange={setTemperature}
                fullWidth
              />
            </View>
          </Card>

          {/* 선택 정보 섹션 (Progressive Disclosure) */}
          <Card style={styles.section}>
            <TouchableOpacity
              style={styles.optionalHeader}
              onPress={() => setShowOptionalInfo(!showOptionalInfo)}
              activeOpacity={0.7}
            >
              <Text style={styles.sectionTitle}>추가 정보 (선택)</Text>
              <Text style={styles.toggleIcon}>
                {showOptionalInfo ? '▼' : '▶'}
              </Text>
            </TouchableOpacity>

            {showOptionalInfo && (
              <View style={styles.optionalContent}>
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>원산지</Text>
                  <TextInput
                    style={styles.simpleInput}
                    value={origin}
                    onChangeText={setOrigin}
                    placeholder="예: 에티오피아"
                    placeholderTextColor={colors.gray[500]}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>품종</Text>
                  <TextInput
                    style={styles.simpleInput}
                    value={variety}
                    onChangeText={setVariety}
                    placeholder="예: Heirloom"
                    placeholderTextColor={colors.gray[500]}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>가공방식</Text>
                  <TextInput
                    style={styles.simpleInput}
                    value={processing}
                    onChangeText={setProcessing}
                    placeholder="예: Washed"
                    placeholderTextColor={colors.gray[500]}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>로스팅 레벨</Text>
                  <TextInput
                    style={styles.simpleInput}
                    value={roastLevel}
                    onChangeText={setRoastLevel}
                    placeholder="예: Medium"
                    placeholderTextColor={colors.gray[500]}
                  />
                </View>

                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>고도 (m)</Text>
                  <TextInput
                    style={styles.simpleInput}
                    value={altitude}
                    onChangeText={setAltitude}
                    placeholder="예: 2200"
                    placeholderTextColor={colors.gray[500]}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            )}
          </Card>

          {/* 안내 메시지 */}
          {!selectedCoffee && coffeeInput && (
            <Card style={styles.infoBox} variant="outlined">
              <View style={styles.infoContent}>
                <Text style={styles.infoIcon}>ℹ️</Text>
                <Text style={styles.infoText}>
                  새로운 커피를 추가하고 있습니다. 추가 정보를 입력하면 다른 사용자에게 도움이 됩니다.
                </Text>
              </View>
            </Card>
          )}
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
  },
  section: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold as any,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  inputLabel: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[700],
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.medium as any,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: spacing.md,
    height: 48,
  },
  inputWrapperFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  inputWrapperDisabled: {
    backgroundColor: colors.gray[100],
    opacity: 0.6,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  simpleInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[300],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: 72,
    left: 0,
    right: 0,
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    maxHeight: 200,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    zIndex: 1000,
  },
  suggestionItem: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray[100],
  },
  suggestionText: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  suggestionSubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[500],
    marginTop: 2,
  },
  temperatureContainer: {
    marginBottom: spacing.md,
  },
  optionalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  toggleIcon: {
    fontSize: typography.fontSize.sm,
    color: colors.gray[600],
  },
  optionalContent: {
    backgroundColor: colors.gray[50],
    borderRadius: 8,
    padding: spacing.md,
  },
  infoBox: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
    backgroundColor: colors.secondaryLight,
    borderColor: colors.primary,
  },
  infoContent: {
    flexDirection: 'row',
  },
  infoIcon: {
    fontSize: typography.fontSize.md,
    marginRight: spacing.sm,
  },
  infoText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  footer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.gray[100],
  },
});

export default CoffeeInfo;