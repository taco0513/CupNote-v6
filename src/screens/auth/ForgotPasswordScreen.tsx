/**
 * Forgot Password Screen
 * Password reset via email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Card, Button, Input, HeaderBar } from '../../components/common';
import { colors, typography, spacing, borderRadius } from '../../styles/theme';
import { AuthService } from '../../lib/supabase';
import type { AuthStackScreenProps } from '../../navigation/types';

interface ForgotPasswordScreenProps extends AuthStackScreenProps<'ForgotPassword'> {}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    general?: string;
  }>({});

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password reset
  const handleResetPassword = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      await AuthService.resetPasswordForEmail(email.toLowerCase().trim());
      
      setIsEmailSent(true);
      
      Alert.alert(
        '이메일 전송 완료',
        '비밀번호 재설정 링크가 이메일로 전송되었습니다.\n이메일을 확인하여 비밀번호를 재설정해주세요.',
        [{ text: '확인' }]
      );
    } catch (error: any) {
      console.error('Password reset error:', error);
      
      let errorMessage = '비밀번호 재설정 요청에 실패했습니다';
      
      // Handle specific errors
      if (error.message?.includes('Invalid email')) {
        errorMessage = '유효하지 않은 이메일 주소입니다';
      } else if (error.message?.includes('Email not found')) {
        errorMessage = '등록되지 않은 이메일 주소입니다';
      } else if (error.message?.includes('Too many requests')) {
        errorMessage = '너무 많은 요청이 있었습니다. 잠시 후 다시 시도해주세요';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle resend email
  const handleResendEmail = async () => {
    if (!email.trim() || !validateEmail(email)) {
      setErrors({ email: '올바른 이메일을 입력해주세요' });
      return;
    }
    
    try {
      await AuthService.resetPasswordForEmail(email.toLowerCase().trim());
      
      Alert.alert(
        '재전송 완료',
        '비밀번호 재설정 이메일이 다시 전송되었습니다.',
        [{ text: '확인' }]
      );
    } catch (error: any) {
      console.error('Resend email error:', error);
      
      Alert.alert(
        '재전송 실패',
        '이메일 재전송에 실패했습니다. 잠시 후 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    }
  };

  // Navigate back to login
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="비밀번호 찾기"
        onBack={() => navigation.goBack()}
      />
      
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.emoji}>🔑</Text>
            <Text style={styles.title}>
              {isEmailSent ? '이메일을 확인해주세요' : '비밀번호를 잊으셨나요?'}
            </Text>
            <Text style={styles.subtitle}>
              {isEmailSent 
                ? '비밀번호 재설정 링크를 이메일로 보내드렸습니다'
                : '등록된 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다'
              }
            </Text>
          </View>

          {/* Reset Form */}
          <Card variant="elevated" style={styles.formCard}>
            {/* General Error */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {!isEmailSent ? (
              <>
                {/* Email Input */}
                <Input
                  label="이메일"
                  placeholder="example@coffee.com"
                  value={email}
                  onChangeText={setEmail}
                  error={errors.email}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoComplete="email"
                  leftIcon="✉️"
                  required
                />

                {/* Reset Button */}
                <Button
                  title="재설정 링크 보내기"
                  onPress={handleResetPassword}
                  loading={isLoading}
                  variant="primary"
                  size="large"
                  style={styles.resetButton}
                />
              </>
            ) : (
              <>
                {/* Success State */}
                <View style={styles.successContainer}>
                  <View style={styles.successIconContainer}>
                    <Text style={styles.successIcon}>📧</Text>
                  </View>
                  <Text style={styles.emailSentTitle}>이메일이 전송되었습니다</Text>
                  <Text style={styles.emailSentDescription}>
                    <Text style={styles.emailText}>{email}</Text>로{'\n'}
                    비밀번호 재설정 링크를 보내드렸습니다.
                  </Text>
                  
                  {/* Instructions */}
                  <View style={styles.instructionsContainer}>
                    <Text style={styles.instructionsTitle}>다음 단계:</Text>
                    <Text style={styles.instructionText}>1. 이메일 앱을 열어주세요</Text>
                    <Text style={styles.instructionText}>2. CupNote에서 온 이메일을 찾아주세요</Text>
                    <Text style={styles.instructionText}>3. '비밀번호 재설정' 링크를 클릭해주세요</Text>
                    <Text style={styles.instructionText}>4. 새로운 비밀번호를 설정해주세요</Text>
                  </View>

                  {/* Resend Button */}
                  <View style={styles.resendSection}>
                    <Text style={styles.resendText}>이메일이 오지 않았나요?</Text>
                    <TouchableOpacity onPress={handleResendEmail} activeOpacity={0.7}>
                      <Text style={styles.resendLink}>다시 보내기</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}
          </Card>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>
              {isEmailSent ? '비밀번호를 재설정하셨나요?' : '비밀번호가 기억나셨나요?'}
            </Text>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>로그인 화면으로</Text>
            </TouchableOpacity>
          </View>

          {/* Help Section */}
          <Card style={styles.helpCard}>
            <Text style={styles.helpTitle}>💡 도움말</Text>
            <Text style={styles.helpText}>
              이메일이 도착하지 않는다면 스팸함을 확인해보세요.{'\n'}
              여전히 문제가 있다면 고객센터로 문의해주세요.
            </Text>
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxxl,
  },
  headerSection: {
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  emoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: typography.fontSize.xxl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
  },
  formCard: {
    marginHorizontal: spacing.lg,
    padding: spacing.xl,
    backgroundColor: colors.white,
  },
  errorContainer: {
    backgroundColor: colors.error + '10',
    borderWidth: 1,
    borderColor: colors.error + '30',
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
    textAlign: 'center',
  },
  resetButton: {
    marginTop: spacing.sm,
  },
  successContainer: {
    alignItems: 'center',
  },
  successIconContainer: {
    width: 80,
    height: 80,
    backgroundColor: colors.success + '10',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  successIcon: {
    fontSize: 32,
  },
  emailSentTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  emailSentDescription: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: typography.fontSize.md * typography.lineHeight.relaxed,
    marginBottom: spacing.xxl,
  },
  emailText: {
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  instructionsContainer: {
    width: '100%',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
  },
  instructionsTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  instructionText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
    marginBottom: spacing.sm,
  },
  resendSection: {
    alignItems: 'center',
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  resendLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  loginSection: {
    alignItems: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
  },
  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  loginLink: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  helpCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    backgroundColor: colors.secondaryLight,
    borderWidth: 0,
  },
  helpTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  helpText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.relaxed,
  },
});

export default ForgotPasswordScreen;