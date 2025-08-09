/**
 * Loading Screen
 * 
 * 앱 초기화 및 로딩을 위한 스크린 - Placeholder
 * 실제 구현은 Screen Team이 담당
 */

import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';

interface LoadingScreenProps {
  error?: string;
  onRetry?: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ error, onRetry }) => {
  useEffect(() => {
    if (error) {
      console.error('Loading screen error:', error);
    }
  }, [error]);

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorTitle}>오류가 발생했습니다</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          
          {onRetry && (
            <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
              <Text style={styles.retryButtonText}>다시 시도</Text>
            </TouchableOpacity>
          )}
          
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>
              이 화면은 Navigation Team에서 생성한 Placeholder입니다.{'\n'}
              실제 로딩 UI는 Screen Team에서 구현합니다.
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.loadingContainer}>
        {/* CupNote 로고 영역 (실제로는 이미지나 애니메이션) */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>☕️</Text>
          <Text style={styles.appName}>CupNote</Text>
        </View>

        {/* 로딩 인디케이터 */}
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#8B4513" />
          <Text style={styles.loadingText}>앱을 준비하고 있습니다...</Text>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>
            이 화면은 Navigation Team에서 생성한 Placeholder입니다.{'\n'}
            실제 로딩 UI는 Screen Team에서 구현합니다.
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingContainer: {
    alignItems: 'center',
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logo: {
    fontSize: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#8B4513',
    letterSpacing: -0.5,
  },
  loadingIndicator: {
    alignItems: 'center',
    marginBottom: 48,
  },
  loadingText: {
    fontSize: 16,
    color: '#666666',
    marginTop: 16,
  },
  
  // Error State
  errorContainer: {
    alignItems: 'center',
    width: '100%',
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e74c3c',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  retryButton: {
    backgroundColor: '#8B4513',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 32,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  
  // Placeholder
  placeholder: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 8,
    width: '100%',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});