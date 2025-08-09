/**
 * Onboarding Screen
 * 
 * 첫 사용자를 위한 온보딩 스크린 - Placeholder
 * 실제 구현은 Screen Team이 담당
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RootStackScreenProps } from '../../navigation/types';

export const OnboardingScreen: React.FC<RootStackScreenProps<'Onboarding'>> = (props) => {
  const handleComplete = () => {
    console.log('온보딩 완료 - 메인 앱으로 이동');
    props.navigation.reset({
      index: 0,
      routes: [{ name: 'Main' }],
    });
  };

  const handleSkip = () => {
    console.log('온보딩 건너뛰기');
    handleComplete();
  };

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>CupNote에 오신 것을{'\n'}환영합니다! ☕️</Text>
          <Text style={styles.subtitle}>당신만의 커피 여정을 시작해보세요</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📝</Text>
            <Text style={styles.featureTitle}>커피 기록</Text>
            <Text style={styles.featureDescription}>
              카페와 홈카페 모드로 간편하게 커피를 기록하고{'\n'}
              향미와 감각을 세밀하게 표현해보세요
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🤝</Text>
            <Text style={styles.featureTitle}>커뮤니티 매치</Text>
            <Text style={styles.featureDescription}>
              같은 커피를 마신 다른 사용자들과{'\n'}
              취향을 비교하고 새로운 발견을 해보세요
            </Text>
          </View>

          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureTitle}>업적 시스템</Text>
            <Text style={styles.featureDescription}>
              다양한 커피를 경험하며 업적을 달성하고{'\n'}
              커피 전문가로 성장해보세요
            </Text>
          </View>

          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              이 화면은 Navigation Team에서 생성한 Placeholder입니다.{'\n'}
              실제 온보딩 UI는 Screen Team에서 구현합니다.
            </Text>
            
            <View style={styles.routeInfo}>
              <Text style={styles.routeTitle}>네비게이션 정보:</Text>
              <Text style={styles.routeText}>Route: {props.route.name}</Text>
              {props.route.params && (
                <Text style={styles.routeText}>
                  Params: {JSON.stringify(props.route.params, null, 2)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.button, styles.skipButton]}
          onPress={handleSkip}
        >
          <Text style={[styles.buttonText, styles.skipButtonText]}>건너뛰기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.button}
          onPress={handleComplete}
        >
          <Text style={styles.buttonText}>시작하기</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  contentContainer: {
    flexGrow: 1,
    padding: 24,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B4513',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  content: {
    flex: 1,
  },
  featureItem: {
    alignItems: 'center',
    marginBottom: 48,
  },
  featureIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 12,
  },
  featureDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
  placeholder: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginTop: 32,
  },
  placeholderText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  routeInfo: {
    backgroundColor: '#ffffff',
    padding: 12,
    borderRadius: 6,
  },
  routeTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 6,
  },
  routeText: {
    fontSize: 11,
    color: '#666666',
    fontFamily: 'monospace',
    lineHeight: 14,
  },
  actions: {
    flexDirection: 'row',
    padding: 24,
    paddingTop: 16,
  },
  button: {
    flex: 1,
    height: 56,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  skipButtonText: {
    color: '#8B4513',
  },
});