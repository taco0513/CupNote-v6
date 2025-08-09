import { ValidationRule, ValidationResult } from '../types/tastingFlow';

// Core validation utilities for CupNote app
export class ValidationUtils {
  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  // Validate password strength
  static validatePassword(password: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('비밀번호는 8자 이상이어야 합니다');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('대문자를 포함해야 합니다');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('소문자를 포함해야 합니다');
    }
    
    if (!/\d/.test(password)) {
      errors.push('숫자를 포함해야 합니다');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate range (1-5 rating scale)
  static isInRange(value: number, min: number = 1, max: number = 5): boolean {
    return typeof value === 'number' && value >= min && value <= max && Number.isInteger(value);
  }

  // Validate coffee name
  static isValidCoffeeName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 100;
  }

  // Validate roastery name
  static isValidRoasteryName(name: string): boolean {
    return name.trim().length >= 2 && name.trim().length <= 50;
  }

  // Validate origin
  static isValidOrigin(origin: string): boolean {
    return origin.trim().length >= 2 && origin.trim().length <= 50;
  }

  // Validate brewing parameters
  static validateBrewingParams(params: {
    waterAmount?: number;
    coffeeAmount?: number;
    waterTemperature?: number;
    brewTime?: number;
  }): { isValid: boolean; errors: Record<string, string> } {
    const errors: Record<string, string> = {};

    if (params.waterAmount !== undefined) {
      if (params.waterAmount < 50 || params.waterAmount > 2000) {
        errors.waterAmount = '물 양은 50ml~2000ml 사이여야 합니다';
      }
    }

    if (params.coffeeAmount !== undefined) {
      if (params.coffeeAmount < 5 || params.coffeeAmount > 200) {
        errors.coffeeAmount = '원두 양은 5g~200g 사이여야 합니다';
      }
    }

    if (params.waterTemperature !== undefined) {
      if (params.waterTemperature < 70 || params.waterTemperature > 100) {
        errors.waterTemperature = '물 온도는 70°C~100°C 사이여야 합니다';
      }
    }

    if (params.brewTime !== undefined) {
      if (params.brewTime < 30 || params.brewTime > 1800) { // 30 seconds to 30 minutes
        errors.brewTime = '추출 시간은 30초~30분 사이여야 합니다';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Validate text length
  static validateTextLength(
    text: string,
    minLength: number = 0,
    maxLength: number = 1000
  ): { isValid: boolean; error?: string } {
    const trimmed = text.trim();
    
    if (trimmed.length < minLength) {
      return {
        isValid: false,
        error: `최소 ${minLength}자 이상 입력해주세요`
      };
    }
    
    if (trimmed.length > maxLength) {
      return {
        isValid: false,
        error: `최대 ${maxLength}자까지 입력 가능합니다`
      };
    }
    
    return { isValid: true };
  }

  // Validate array selection
  static validateArraySelection(
    items: any[],
    minSelection: number = 1,
    maxSelection?: number
  ): { isValid: boolean; error?: string } {
    if (items.length < minSelection) {
      return {
        isValid: false,
        error: `최소 ${minSelection}개 이상 선택해주세요`
      };
    }
    
    if (maxSelection && items.length > maxSelection) {
      return {
        isValid: false,
        error: `최대 ${maxSelection}개까지 선택 가능합니다`
      };
    }
    
    return { isValid: true };
  }

  // Generic validation engine
  static validateField(value: any, rules: ValidationRule[]): ValidationResult {
    const errors: Record<string, string> = {};
    const warnings: Record<string, string> = {};
    
    for (const rule of rules) {
      let isValid = true;
      let errorMessage = rule.message;

      // Required validation
      if (rule.required && (value === null || value === undefined || value === '')) {
        isValid = false;
      }

      // String validations
      if (typeof value === 'string' && isValid) {
        if (rule.minLength && value.trim().length < rule.minLength) {
          isValid = false;
          errorMessage = `최소 ${rule.minLength}자 이상 입력해주세요`;
        }
        
        if (rule.maxLength && value.trim().length > rule.maxLength) {
          isValid = false;
          errorMessage = `최대 ${rule.maxLength}자까지 입력 가능합니다`;
        }
        
        if (rule.pattern && !rule.pattern.test(value)) {
          isValid = false;
        }
      }

      // Number validations
      if (typeof value === 'number' && isValid) {
        if (rule.min !== undefined && value < rule.min) {
          isValid = false;
          errorMessage = `최소값은 ${rule.min}입니다`;
        }
        
        if (rule.max !== undefined && value > rule.max) {
          isValid = false;
          errorMessage = `최대값은 ${rule.max}입니다`;
        }
      }

      // Custom validation
      if (rule.custom && isValid) {
        isValid = rule.custom(value);
      }

      // Store error or warning
      if (!isValid) {
        if (rule.severity === 'warning') {
          warnings[rule.field] = errorMessage;
        } else {
          errors[rule.field] = errorMessage;
        }
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      warnings,
    };
  }
}

// TastingFlow specific validation
export class TastingFlowValidation {
  // Validate coffee information step
  static validateCoffeeInfo(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'name',
        required: true,
        minLength: 2,
        maxLength: 100,
        message: '커피 이름을 입력해주세요',
      },
    ];

    // Add cafe validation for cafe mode
    if (data.cafe) {
      rules.push({
        field: 'cafe.name',
        required: true,
        minLength: 2,
        maxLength: 50,
        message: '카페 이름을 입력해주세요',
      });
      
      rules.push({
        field: 'cafe.visitDate',
        required: true,
        custom: (date) => date instanceof Date && !isNaN(date.getTime()),
        message: '방문 날짜를 선택해주세요',
      });
    }

    return this.validateNestedObject(data, rules);
  }

  // Validate brew setup step (HomeCafe mode)
  static validateBrewSetup(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'method',
        required: true,
        message: '추출 방법을 선택해주세요',
      },
      {
        field: 'grindSize',
        required: true,
        message: '그라인드 사이즈를 선택해주세요',
      },
      {
        field: 'waterTemperature',
        required: true,
        min: 70,
        max: 100,
        message: '물 온도를 70°C~100°C 사이로 입력해주세요',
      },
      {
        field: 'waterAmount',
        required: true,
        min: 50,
        max: 2000,
        message: '물 양을 50ml~2000ml 사이로 입력해주세요',
      },
      {
        field: 'coffeeAmount',
        required: true,
        min: 5,
        max: 200,
        message: '원두 양을 5g~200g 사이로 입력해주세요',
      },
    ];

    const result = this.validateNestedObject(data, rules);

    // Calculate and validate ratio
    if (data.waterAmount && data.coffeeAmount) {
      const ratio = data.waterAmount / data.coffeeAmount;
      if (ratio < 10 || ratio > 20) {
        result.errors.ratio = '물:원두 비율이 1:10~1:20 범위를 벗어났습니다';
        result.isValid = false;
      }
    }

    return result;
  }

  // Validate flavor selection step
  static validateFlavorSelection(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'selectedFlavors',
        required: true,
        custom: (flavors) => Array.isArray(flavors) && flavors.length >= 1,
        message: '최소 1개 이상의 향미를 선택해주세요',
      },
      {
        field: 'selectedFlavors',
        custom: (flavors) => !flavors || flavors.length <= 10,
        message: '최대 10개까지 선택 가능합니다',
        severity: 'warning',
      },
      {
        field: 'flavorIntensity',
        required: true,
        min: 1,
        max: 5,
        message: '향미 강도를 1~5 사이로 선택해주세요',
      },
    ];

    return this.validateNestedObject(data, rules);
  }

  // Validate sensory expression step
  static validateSensoryExpression(data: any): ValidationResult {
    const errors: Record<string, string> = {};
    let hasSelection = false;

    // Check if at least one category has selections
    const categories = ['sweetness', 'acidity', 'bitterness', 'body', 'flavor', 'aftertaste', 'overall'];
    
    for (const category of categories) {
      if (data[category] && Array.isArray(data[category]) && data[category].length > 0) {
        hasSelection = true;
        break;
      }
    }

    if (!hasSelection && (!data.customExpression || data.customExpression.trim().length === 0)) {
      errors.selection = '최소 하나의 감각 표현을 선택하거나 직접 입력해주세요';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validate sensory mouth feel step (optional)
  static validateSensoryMouthFeel(data: any): ValidationResult {
    if (data.skipped) {
      return { isValid: true, errors: {} };
    }

    const requiredFields = ['acidity', 'sweetness', 'bitterness', 'body', 'balance', 'cleanness', 'aftertaste'];
    const errors: Record<string, string> = {};

    for (const field of requiredFields) {
      if (data[field] === undefined || !ValidationUtils.isInRange(data[field], 1, 5)) {
        errors[field] = '1~5점 사이로 평가해주세요';
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validate personal notes step
  static validatePersonalNotes(data: any): ValidationResult {
    const rules: ValidationRule[] = [
      {
        field: 'rating',
        required: true,
        min: 1,
        max: 5,
        message: '평점을 1~5점 사이로 선택해주세요',
      },
    ];

    const result = this.validateNestedObject(data, rules);

    // Validate optional fields
    if (data.personalNotes) {
      const notesValidation = ValidationUtils.validateTextLength(data.personalNotes, 0, 2000);
      if (!notesValidation.isValid) {
        result.errors.personalNotes = notesValidation.error!;
        result.isValid = false;
      }
    }

    if (data.repurchaseIntent !== undefined && !ValidationUtils.isInRange(data.repurchaseIntent, 1, 5)) {
      result.errors.repurchaseIntent = '재구매 의도를 1~5점 사이로 선택해주세요';
      result.isValid = false;
    }

    return result;
  }

  // Helper to validate nested objects
  private static validateNestedObject(data: any, rules: ValidationRule[]): ValidationResult {
    const errors: Record<string, string> = {};

    for (const rule of rules) {
      const fieldPath = rule.field.split('.');
      let value = data;
      
      // Navigate to nested field
      for (const key of fieldPath) {
        value = value?.[key];
      }

      const fieldResult = ValidationUtils.validateField(value, [rule]);
      
      if (!fieldResult.isValid) {
        Object.assign(errors, fieldResult.errors);
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Validate entire tasting record before saving
  static validateCompleteRecord(record: any, mode: 'cafe' | 'homecafe'): ValidationResult {
    const errors: Record<string, string> = {};
    let score = 0;
    const maxScore = mode === 'cafe' ? 100 : 120;

    // Coffee info (required) - 30 points
    const coffeeValidation = this.validateCoffeeInfo(record.coffeeData);
    if (!coffeeValidation.isValid) {
      Object.assign(errors, coffeeValidation.errors);
    } else {
      score += 30;
    }

    // Brew setup (HomeCafe only) - 20 points
    if (mode === 'homecafe') {
      const brewValidation = this.validateBrewSetup(record.brewSetupData);
      if (!brewValidation.isValid) {
        Object.assign(errors, brewValidation.errors);
      } else {
        score += 20;
      }
    }

    // Flavor selection (required) - 25 points
    const flavorValidation = this.validateFlavorSelection(record.flavorData);
    if (!flavorValidation.isValid) {
      Object.assign(errors, flavorValidation.errors);
    } else {
      score += 25;
    }

    // Sensory expression (recommended) - 15 points
    const sensoryValidation = this.validateSensoryExpression(record.sensoryExpressionData);
    if (sensoryValidation.isValid) {
      score += 15;
    }

    // Sensory mouth feel (optional) - 10 points
    const mouthFeelValidation = this.validateSensoryMouthFeel(record.sensoryMouthFeelData);
    if (mouthFeelValidation.isValid && !record.sensoryMouthFeelData?.skipped) {
      score += 10;
    }

    // Personal notes (required) - 30 points
    const notesValidation = this.validatePersonalNotes(record.personalNotesData);
    if (!notesValidation.isValid) {
      Object.assign(errors, notesValidation.errors);
    } else {
      score += 30;
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      score: Math.round((score / maxScore) * 100),
    };
  }
}

// User input sanitization
export class SanitizationUtils {
  // Sanitize text input
  static sanitizeText(text: string): string {
    return text
      .trim()
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[<>]/g, '') // Remove HTML brackets for security
      .slice(0, 2000); // Limit length
  }

  // Sanitize number input
  static sanitizeNumber(value: any, min?: number, max?: number): number | null {
    const num = parseFloat(value);
    
    if (isNaN(num)) {
      return null;
    }
    
    if (min !== undefined && num < min) {
      return min;
    }
    
    if (max !== undefined && num > max) {
      return max;
    }
    
    return num;
  }

  // Sanitize array input
  static sanitizeArray<T>(arr: any, validator?: (item: T) => boolean): T[] {
    if (!Array.isArray(arr)) {
      return [];
    }
    
    if (validator) {
      return arr.filter(validator);
    }
    
    return arr;
  }

  // Sanitize email
  static sanitizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }
}