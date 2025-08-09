import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { theme } from '../../theme';
import { Button } from '../form/Button';
import { EmptyState } from './EmptyState';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorId?: string;
}

export interface ErrorBoundaryProps {
  /** 자식 요소 */
  children: ReactNode;
  
  /** 에러 발생 시 콜백 */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  
  /** 재시도 버튼 핸들러 */
  onRetry?: () => void;
  
  /** 커스텀 에러 UI */
  fallback?: (error: Error, retry: () => void) => ReactNode;
  
  /** 에러 UI 변형 */
  variant?: 'default' | 'minimal' | 'detailed';
  
  /** 개발 모드에서 에러 세부정보 표시 */
  showErrorDetails?: boolean;
  
  /** 에러 리포팅 활성화 */
  enableErrorReporting?: boolean;
  
  /** 컨테이너 스타일 */
  containerStyle?: ViewStyle;
  
  /** 테스트 ID */
  testID?: string;
}

/**
 * CupNote v6 Korean UX 최적화 ErrorBoundary 컴포넌트
 * 
 * Features:
 * - React Error Boundary 표준 구현
 * - 한국어 에러 메시지
 * - 다양한 에러 UI 변형
 * - 에러 복구 메커니즘
 * - 개발/프로덕션 모드 대응
 * - 접근성 지원
 * - 에러 리포팅 준비
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 에러가 발생했을 때 state를 업데이트
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 에러 정보를 state에 저장
    this.setState({
      error,
      errorInfo,
    });

    // 에러 콜백 실행
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // 에러 리포팅 (선택적)
    if (this.props.enableErrorReporting) {
      this.reportError(error, errorInfo);
    }

    // 콘솔에 에러 정보 출력 (개발 모드)
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
  }

  // 에러 리포팅 (실제 구현 시 analytics 서비스 연동)
  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // TODO: 에러 리포팅 서비스 (Sentry, Crashlytics 등) 연동
    console.warn('Error reported:', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
    });
  };

  // 에러 상태 재설정
  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: undefined,
      errorInfo: undefined,
      errorId: undefined,
    });

    // 재시도 콜백 실행
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  // 에러 메시지 생성
  private getErrorMessage = (): { title: string; description: string } => {
    const { error } = this.state;
    
    if (!error) {
      return {
        title: '알 수 없는 오류',
        description: '예상치 못한 오류가 발생했습니다.',
      };
    }

    // 일반적인 에러 메시지 매핑
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('network')) {
      return {
        title: '네트워크 오류',
        description: '인터넷 연결을 확인하고 다시 시도해주세요.',
      };
    }
    
    if (errorMessage.includes('timeout')) {
      return {
        title: '시간 초과',
        description: '요청 시간이 초과되었습니다. 다시 시도해주세요.',
      };
    }
    
    if (errorMessage.includes('permission')) {
      return {
        title: '권한 오류',
        description: '필요한 권한이 없습니다. 설정을 확인해주세요.',
      };
    }

    return {
      title: '오류가 발생했습니다',
      description: '잠시 후 다시 시도해주세요.',
    };
  };

  // 최소 에러 UI 렌더링
  private renderMinimalError = (): ReactNode => {
    return (
      <View style={this.getMinimalContainerStyle()}>
        <Text style={this.getMinimalTextStyle()}>
          오류가 발생했습니다
        </Text>
        <Button
          title="다시 시도"
          onPress={this.handleRetry}
          variant="outline"
          size="small"
          style={{ marginTop: theme.spacing[3] }}
        />
      </View>
    );
  };

  // 상세 에러 UI 렌더링
  private renderDetailedError = (): ReactNode => {
    const { error, errorInfo } = this.state;
    const { showErrorDetails = __DEV__ } = this.props;

    return (
      <View style={this.getDetailedContainerStyle()}>
        <Text style={this.getDetailedTitleStyle()}>
          개발 모드 - 에러 상세정보
        </Text>
        
        {error && (
          <View style={this.getErrorDetailStyle()}>
            <Text style={this.getDetailLabelStyle()}>에러:</Text>
            <Text style={this.getDetailValueStyle()}>
              {error.message}
            </Text>
          </View>
        )}
        
        {showErrorDetails && error?.stack && (
          <View style={this.getErrorDetailStyle()}>
            <Text style={this.getDetailLabelStyle()}>스택 트레이스:</Text>
            <Text style={this.getDetailValueStyle()}>
              {error.stack}
            </Text>
          </View>
        )}
        
        {showErrorDetails && errorInfo?.componentStack && (
          <View style={this.getErrorDetailStyle()}>
            <Text style={this.getDetailLabelStyle()}>컴포넌트 스택:</Text>
            <Text style={this.getDetailValueStyle()}>
              {errorInfo.componentStack}
            </Text>
          </View>
        )}
        
        <Button
          title="다시 시도"
          onPress={this.handleRetry}
          variant="primary"
          style={{ marginTop: theme.spacing[6] }}
        />
      </View>
    );
  };

  // 기본 에러 UI 렌더링
  private renderDefaultError = (): ReactNode => {
    const { title, description } = this.getErrorMessage();
    
    return (
      <EmptyState
        title={title}
        description={description}
        variant="error"
        icon="⚠️"
        action={{
          label: '다시 시도',
          onPress: this.handleRetry,
        }}
        testID={`${this.props.testID}-error`}
      />
    );
  };

  // 스타일 메서드들
  private getMinimalContainerStyle = (): ViewStyle => ({
    padding: theme.spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.status.error.light,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing[4],
  });

  private getMinimalTextStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.status.error.default,
    fontFamily: theme.typography.fontFamily.medium,
    textAlign: 'center',
  });

  private getDetailedContainerStyle = (): ViewStyle => ({
    flex: 1,
    padding: theme.spacing[4],
    backgroundColor: theme.colors.background,
  });

  private getDetailedTitleStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.lg,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.status.error.default,
    marginBottom: theme.spacing[4],
  });

  private getErrorDetailStyle = (): ViewStyle => ({
    marginBottom: theme.spacing[4],
  });

  private getDetailLabelStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.sm,
    fontFamily: theme.typography.fontFamily.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing[1],
  });

  private getDetailValueStyle = (): TextStyle => ({
    fontSize: theme.typography.fontSize.xs,
    fontFamily: theme.typography.fontFamily.mono,
    color: theme.colors.text.secondary,
    backgroundColor: theme.colors.warm[100],
    padding: theme.spacing[2],
    borderRadius: theme.borderRadius.sm,
  });

  render() {
    const { hasError } = this.state;
    const { 
      children, 
      fallback, 
      variant = 'default',
      containerStyle,
      testID,
    } = this.props;

    // 에러가 없으면 자식 요소 렌더링
    if (!hasError) {
      return children;
    }

    // 커스텀 fallback이 있으면 사용
    if (fallback && this.state.error) {
      return (
        <View style={containerStyle} testID={testID}>
          {fallback(this.state.error, this.handleRetry)}
        </View>
      );
    }

    // 변형에 따른 에러 UI 렌더링
    let errorUI: ReactNode;
    
    switch (variant) {
      case 'minimal':
        errorUI = this.renderMinimalError();
        break;
      case 'detailed':
        errorUI = this.renderDetailedError();
        break;
      case 'default':
      default:
        errorUI = this.renderDefaultError();
        break;
    }

    return (
      <View 
        style={containerStyle} 
        testID={testID}
        accessible
        accessibilityLabel="오류가 발생했습니다"
        accessibilityRole="alert"
      >
        {errorUI}
      </View>
    );
  }
}

export default ErrorBoundary;