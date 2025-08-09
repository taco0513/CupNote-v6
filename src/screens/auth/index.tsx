/**
 * Auth Screens Export
 * 
 * 인증 관련 스크린들 - Placeholder 컴포넌트들
 * 실제 구현은 Screen Team이 담당
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';

// =====================================
// Placeholder Screen Component
// =====================================

const createAuthScreenPlaceholder = (screenName: string) => {
  return function AuthScreenPlaceholder(props: AuthStackScreenProps<any>) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{screenName}</Text>
          <Text style={styles.subtitle}>Screen Team 구현 예정</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            이 화면은 Navigation Team에서 생성한 Placeholder입니다.{'\n'}
            실제 UI는 Screen Team에서 구현합니다.
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
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log(`${screenName} - 기본 액션 실행됨`);
              // 실제로는 인증 로직 등이 실행됨
            }}
          >
            <Text style={styles.buttonText}>기본 액션</Text>
          </TouchableOpacity>
          
          {props.navigation.canGoBack() && (
            <TouchableOpacity
              style={[styles.button, styles.secondaryButton]}
              onPress={() => props.navigation.goBack()}
            >
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                뒤로 가기
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };
};

// =====================================
// Auth Screen Components
// =====================================

export const LoginScreen = createAuthScreenPlaceholder('로그인');
export const SignUpScreen = createAuthScreenPlaceholder('회원가입');
export const ForgotPasswordScreen = createAuthScreenPlaceholder('비밀번호 찾기');
export const ResetPasswordScreen = createAuthScreenPlaceholder('비밀번호 재설정');

// =====================================
// Styles
// =====================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
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
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  description: {
    fontSize: 16,
    color: '#333333',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  routeInfo: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    marginBottom: 32,
  },
  routeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  routeText: {
    fontSize: 14,
    color: '#666666',
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  actions: {
    paddingBottom: 40,
  },
  button: {
    height: 56,
    backgroundColor: '#8B4513',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#e1e5e9',
  },
  secondaryButtonText: {
    color: '#8B4513',
  },
});