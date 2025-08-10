/**
 * Auth Screens Export
 * Complete authentication screens for CupNote
 */

// Export the complete authentication screens
export { default as LoginScreen } from './LoginScreen';
export { default as SignupScreen } from './SignupScreen';
export { default as ForgotPasswordScreen } from './ForgotPasswordScreen';

// For backward compatibility, also export as the original names
export { default as SignUpScreen } from './SignupScreen';

// Placeholder for reset password screen (will be implemented when needed)
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { AuthStackScreenProps } from '../../navigation/types';

const createAuthScreenPlaceholder = (screenName: string) => {
  return function AuthScreenPlaceholder(props: AuthStackScreenProps<any>) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>{screenName}</Text>
          <Text style={styles.subtitle}>곧 출시됩니다</Text>
        </View>
        
        <View style={styles.content}>
          <Text style={styles.description}>
            이 화면은 향후 업데이트에서 제공됩니다.{'\n'}
            현재는 이메일을 통한 비밀번호 재설정을 이용해주세요.
          </Text>
        </View>
        
        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => props.navigation.goBack()}
          >
            <Text style={[styles.buttonText, styles.secondaryButtonText]}>
              뒤로 가기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };
};

export const ResetPasswordScreen = createAuthScreenPlaceholder('비밀번호 재설정');

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