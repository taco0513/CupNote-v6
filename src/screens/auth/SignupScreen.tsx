/**
 * Sign Up Screen
 * User registration with email, password, and name
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
import { AuthService, UsersService } from '../../lib/supabase';
import type { AuthStackScreenProps } from '../../navigation/types';

interface SignupScreenProps extends AuthStackScreenProps<'SignUp'> {}

export const SignupScreen: React.FC<SignupScreenProps> = ({ navigation }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});

  // Email validation
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Password strength validation
  const validatePasswordStrength = (password: string): string | null => {
    if (password.length < 8) {
      return '비밀번호는 8자 이상이어야 합니다';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return '소문자를 포함해야 합니다';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return '대문자를 포함해야 합니다';
    }
    if (!/(?=.*\d)/.test(password)) {
      return '숫자를 포함해야 합니다';
    }
    return null;
  };

  // Form validation
  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    
    if (!name.trim()) {
      newErrors.name = '이름을 입력해주세요';
    } else if (name.trim().length < 2) {
      newErrors.name = '이름은 2자 이상이어야 합니다';
    }
    
    if (!email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!validateEmail(email)) {
      newErrors.email = '올바른 이메일 형식이 아닙니다';
    }
    
    if (!password.trim()) {
      newErrors.password = '비밀번호를 입력해주세요';
    } else {
      const passwordError = validatePasswordStrength(password);
      if (passwordError) {
        newErrors.password = passwordError;
      }
    }
    
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = '비밀번호를 다시 입력해주세요';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }
    
    if (!acceptTerms) {
      newErrors.terms = '이용약관과 개인정보처리방침에 동의해주세요';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle sign up
  const handleSignUp = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      // Sign up with Supabase
      const { user } = await AuthService.signUp(
        email.toLowerCase().trim(),
        password,
        name.trim()
      );
      
      if (user) {
        // Create user profile in the database
        try {
          await UsersService.createProfile({
            id: user.id,
            email: user.email!,
            name: name.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        } catch (profileError) {
          console.warn('Profile creation failed:', profileError);
          // Don't fail the signup if profile creation fails
        }
      }
      
      // Show success message
      Alert.alert(
        '가입 완료!',
        '이메일로 인증 링크가 전송되었습니다.\n이메일을 확인하여 계정을 활성화해주세요.',
        [
          {
            text: '확인',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error: any) {
      console.error('Sign up error:', error);
      
      let errorMessage = '회원가입에 실패했습니다';
      
      // Handle specific Supabase auth errors
      if (error.message?.includes('User already registered')) {
        errorMessage = '이미 가입된 이메일입니다';
      } else if (error.message?.includes('Password should be at least')) {
        errorMessage = '비밀번호가 보안 요구사항을 만족하지 않습니다';
      } else if (error.message?.includes('Unable to validate email')) {
        errorMessage = '이메일 형식이 올바르지 않습니다';
      }
      
      setErrors({ general: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Handle navigation
  const navigateToLogin = () => {
    navigation.navigate('Login');
  };

  const navigateToTerms = () => {
    // TODO: Navigate to terms screen when implemented
    Alert.alert('이용약관', '이용약관 화면은 준비 중입니다.');
  };

  const navigateToPrivacy = () => {
    // TODO: Navigate to privacy screen when implemented
    Alert.alert('개인정보처리방침', '개인정보처리방침 화면은 준비 중입니다.');
  };

  // Get password strength indicator
  const getPasswordStrengthIndicator = () => {
    if (!password) return { strength: 0, text: '', color: colors.gray[400] };
    
    let strength = 0;
    let checks = [];
    
    if (password.length >= 8) {
      strength++;
      checks.push('길이 ✓');
    } else {
      checks.push('길이');
    }
    
    if (/(?=.*[a-z])/.test(password)) {
      strength++;
      checks.push('소문자 ✓');
    } else {
      checks.push('소문자');
    }
    
    if (/(?=.*[A-Z])/.test(password)) {
      strength++;
      checks.push('대문자 ✓');
    } else {
      checks.push('대문자');
    }
    
    if (/(?=.*\d)/.test(password)) {
      strength++;
      checks.push('숫자 ✓');
    } else {
      checks.push('숫자');
    }
    
    const strengthText = ['약함', '보통', '좋음', '강함'][strength - 1] || '약함';
    const strengthColor = [colors.error, colors.warning, colors.info, colors.success][strength - 1] || colors.gray[400];
    
    return {
      strength: strength / 4,
      text: strengthText,
      color: strengthColor,
      checks: checks.join(' • '),
    };
  };

  const passwordStrength = getPasswordStrengthIndicator();

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <HeaderBar
        title="회원가입"
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
            <Text style={styles.emoji}>☕</Text>
            <Text style={styles.title}>CupNote에 오신 것을 환영합니다!</Text>
            <Text style={styles.subtitle}>
              새로운 계정을 만들어 커피 여정을 시작하세요
            </Text>
          </View>

          {/* Sign Up Form */}
          <Card variant="elevated" style={styles.formCard}>
            {/* General Error */}
            {errors.general && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{errors.general}</Text>
              </View>
            )}

            {/* Name Input */}
            <Input
              label="이름"
              placeholder="실명 또는 닉네임"
              value={name}
              onChangeText={setName}
              error={errors.name}
              autoCapitalize="words"
              leftIcon="👤"
              required
            />

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

            {/* Password Input */}
            <Input
              label="비밀번호"
              placeholder="안전한 비밀번호를 입력하세요"
              value={password}
              onChangeText={setPassword}
              error={errors.password}
              secureTextEntry={!showPassword}
              leftIcon="🔒"
              rightIcon={showPassword ? "👁️" : "👁️‍🗨️"}
              onRightIconPress={() => setShowPassword(!showPassword)}
              required
            />

            {/* Password Strength Indicator */}
            {password.length > 0 && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View 
                    style={[
                      styles.passwordStrengthFill,
                      { 
                        width: `${passwordStrength.strength * 100}%`,
                        backgroundColor: passwordStrength.color 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.passwordStrengthText, { color: passwordStrength.color }]}>
                  {passwordStrength.text}
                </Text>
                <Text style={styles.passwordChecks}>
                  {passwordStrength.checks}
                </Text>
              </View>
            )}

            {/* Confirm Password Input */}
            <Input
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              error={errors.confirmPassword}
              secureTextEntry={!showConfirmPassword}
              leftIcon="🔒"
              rightIcon={showConfirmPassword ? "👁️" : "👁️‍🗨️"}
              onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              required
            />

            {/* Terms Agreement */}
            <View style={styles.termsContainer}>
              <TouchableOpacity
                style={styles.termsCheckboxContainer}
                onPress={() => setAcceptTerms(!acceptTerms)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkbox, acceptTerms && styles.checkboxChecked]}>
                  {acceptTerms && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <View style={styles.termsTextContainer}>
                  <Text style={styles.termsText}>
                    <Text style={styles.termsLink} onPress={navigateToTerms}>이용약관</Text>
                    <Text> 및 </Text>
                    <Text style={styles.termsLink} onPress={navigateToPrivacy}>개인정보처리방침</Text>
                    <Text>에 동의합니다</Text>
                  </Text>
                </View>
              </TouchableOpacity>
              {errors.terms && (
                <Text style={styles.termsError}>{errors.terms}</Text>
              )}
            </View>

            {/* Sign Up Button */}
            <Button
              title="계정 만들기"
              onPress={handleSignUp}
              loading={isLoading}
              variant="primary"
              size="large"
              style={styles.signUpButton}
            />
          </Card>

          {/* Login Link */}
          <View style={styles.loginSection}>
            <Text style={styles.loginText}>이미 계정이 있으신가요?</Text>
            <TouchableOpacity onPress={navigateToLogin} activeOpacity={0.7}>
              <Text style={styles.loginLink}>로그인</Text>
            </TouchableOpacity>
          </View>
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
  passwordStrengthContainer: {
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: colors.gray[200],
    borderRadius: 2,
    marginBottom: spacing.xs,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
  },
  passwordStrengthText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.xs,
  },
  passwordChecks: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  termsContainer: {
    marginBottom: spacing.xl,
  },
  termsCheckboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border.medium,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  checkmark: {
    fontSize: 12,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
    textDecorationLine: 'underline',
  },
  termsError: {
    fontSize: typography.fontSize.xs,
    color: colors.error,
    marginTop: spacing.xs,
    marginLeft: 28, // Align with text
  },
  signUpButton: {
    marginTop: spacing.sm,
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
});

export default SignupScreen;