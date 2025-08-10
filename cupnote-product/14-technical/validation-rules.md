# TastingFlow 데이터 검증 규칙

## 개요
TastingFlow의 모든 입력 필드에 대한 검증 규칙과 에러 메시지 정의

---

## 1. CoffeeInfo 검증 규칙

### Cafe Mode

```typescript
interface CafeModeCoffeeInfoValidation {
  // 카페명 (필수)
  cafeName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    pattern: /^[가-힣a-zA-Z0-9\s\-\_\.\&]+$/,
    trim: true,
    errorMessages: {
      required: "카페 이름을 입력해주세요",
      minLength: "카페 이름은 최소 2자 이상이어야 합니다",
      maxLength: "카페 이름은 50자를 초과할 수 없습니다",
      pattern: "특수문자는 - _ . & 만 사용 가능합니다"
    }
  },
  
  // 로스터명 (필수)
  roasteryName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    autocompleteMatch: false, // 새로운 로스터 추가 가능
    trim: true,
    errorMessages: {
      required: "로스터리 이름을 입력해주세요",
      minLength: "로스터리 이름은 최소 2자 이상이어야 합니다",
      maxLength: "로스터리 이름은 50자를 초과할 수 없습니다"
    }
  },
  
  // 커피명 (필수)
  coffeeName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    trim: true,
    errorMessages: {
      required: "커피 이름을 입력해주세요",
      minLength: "커피 이름은 최소 2자 이상이어야 합니다",
      maxLength: "커피 이름은 100자를 초과할 수 없습니다"
    }
  },
  
  // 온도 (필수)
  temperature: {
    required: true,
    enum: ['hot', 'iced'],
    errorMessages: {
      required: "온도를 선택해주세요",
      enum: "Hot 또는 Iced 중 선택해주세요"
    }
  },
  
  // 선택 정보
  origin: {
    required: false,
    maxLength: 50,
    pattern: /^[가-힣a-zA-Z\s\,]+$/,
    errorMessages: {
      maxLength: "원산지는 50자를 초과할 수 없습니다",
      pattern: "원산지는 한글, 영문, 쉼표만 입력 가능합니다"
    }
  },
  
  variety: {
    required: false,
    maxLength: 50,
    pattern: /^[a-zA-Z0-9\s\-]+$/,
    errorMessages: {
      maxLength: "품종은 50자를 초과할 수 없습니다",
      pattern: "품종은 영문, 숫자, 하이픈만 입력 가능합니다"
    }
  },
  
  processingMethod: {
    required: false,
    enum: ['natural', 'washed', 'honey', 'anaerobic', 'other'],
    errorMessages: {
      enum: "올바른 가공방식을 선택해주세요"
    }
  },
  
  roastLevel: {
    required: false,
    enum: ['light', 'medium', 'dark'],
    errorMessages: {
      enum: "Light, Medium, Dark 중 선택해주세요"
    }
  },
  
  altitude: {
    required: false,
    type: 'number',
    min: 0,
    max: 4000,
    errorMessages: {
      type: "고도는 숫자로 입력해주세요",
      min: "고도는 0 이상이어야 합니다",
      max: "고도는 4000m를 초과할 수 없습니다"
    }
  }
}
```

### HomeCafe Mode

```typescript
interface HomeCafeModeCoffeeInfoValidation {
  // 로스터명 (필수) - 카페명 없음
  roasteryName: {
    required: true,
    minLength: 2,
    maxLength: 50,
    autocompleteMatch: false,
    trim: true,
    errorMessages: {
      required: "로스터리 이름을 입력해주세요",
      minLength: "로스터리 이름은 최소 2자 이상이어야 합니다",
      maxLength: "로스터리 이름은 50자를 초과할 수 없습니다"
    }
  },
  
  // 커피명, 온도, 선택정보는 Cafe Mode와 동일
  // ... (위와 동일한 규칙 적용)
}
```

---

## 2. BrewSetup 검증 규칙 (HomeCafe Mode 전용)

```typescript
interface BrewSetupValidation {
  // 드리퍼 선택 (필수)
  dripper: {
    required: true,
    enum: ['v60', 'kalita', 'origami', 'april'],
    errorMessages: {
      required: "드리퍼를 선택해주세요",
      enum: "제공된 드리퍼 중 선택해주세요"
    }
  },
  
  // 비율 (필수)
  ratio: {
    required: true,
    enum: ['1:15', '1:15.5', '1:16', '1:16.5', '1:17', '1:17.5', '1:18'],
    errorMessages: {
      required: "커피:물 비율을 선택해주세요",
      enum: "제공된 비율 중 선택해주세요"
    }
  },
  
  // 원두량 (필수)
  coffeeAmount: {
    required: true,
    type: 'number',
    min: 10,
    max: 50,
    errorMessages: {
      required: "원두량을 입력해주세요",
      type: "원두량은 숫자로 입력해주세요",
      min: "원두량은 최소 10g 이상이어야 합니다",
      max: "원두량은 50g을 초과할 수 없습니다"
    }
  },
  
  // 물량 (자동 계산)
  waterAmount: {
    calculated: true, // ratio와 coffeeAmount로 자동 계산
    readonly: true
  },
  
  // 물 온도 (필수)
  waterTemperature: {
    required: true,
    type: 'number',
    min: 80,
    max: 100,
    errorMessages: {
      required: "물 온도를 입력해주세요",
      type: "온도는 숫자로 입력해주세요",
      min: "온도는 80°C 이상이어야 합니다",
      max: "온도는 100°C를 초과할 수 없습니다"
    }
  },
  
  // 분쇄도 (선택)
  grindSize: {
    required: false,
    maxLength: 100,
    pattern: /^[가-힣a-zA-Z0-9\s\,\.\-]+$/,
    placeholder: "예: 코만단테 C40 MK4, 25클릭",
    errorMessages: {
      maxLength: "분쇄도 설명은 100자를 초과할 수 없습니다",
      pattern: "특수문자는 , . - 만 사용 가능합니다"
    }
  },
  
  // 블룸 시간 (선택)
  bloomTime: {
    required: false,
    type: 'number',
    min: 0,
    max: 60,
    default: 30,
    errorMessages: {
      type: "시간은 초 단위로 입력해주세요",
      min: "블룸 시간은 0초 이상이어야 합니다",
      max: "블룸 시간은 60초를 초과할 수 없습니다"
    }
  },
  
  // 총 추출 시간 (선택)
  totalTime: {
    required: false,
    type: 'string',
    pattern: /^([0-5]?[0-9]):([0-5][0-9])$/,
    placeholder: "MM:SS",
    errorMessages: {
      pattern: "시간 형식은 MM:SS 입니다 (예: 2:30)"
    }
  },
  
  // 간단 메모 (선택)
  brewNote: {
    required: false,
    maxLength: 200,
    errorMessages: {
      maxLength: "메모는 200자를 초과할 수 없습니다"
    }
  }
}
```

---

## 3. FlavorSelection 검증 규칙

```typescript
interface FlavorSelectionValidation {
  flavors: {
    required: true,
    type: 'array',
    minItems: 1,
    maxItems: 10,
    uniqueItems: true,
    allowedValues: FLAVOR_WHEEL_OPTIONS, // 85개 향미 리스트
    errorMessages: {
      required: "최소 1개 이상의 향미를 선택해주세요",
      minItems: "최소 1개 이상의 향미를 선택해주세요",
      maxItems: "최대 10개까지 선택 가능합니다",
      uniqueItems: "중복된 향미는 선택할 수 없습니다",
      allowedValues: "올바른 향미를 선택해주세요"
    }
  }
}
```

---

## 4. SensoryExpression 검증 규칙

```typescript
interface SensoryExpressionValidation {
  expressions: {
    required: false, // 선택사항
    type: 'object',
    properties: {
      acidity: {
        type: 'array',
        maxItems: 3,
        allowedValues: ACIDITY_EXPRESSIONS // 7개 표현
      },
      sweetness: {
        type: 'array',
        maxItems: 3,
        allowedValues: SWEETNESS_EXPRESSIONS
      },
      bitterness: {
        type: 'array',
        maxItems: 3,
        allowedValues: BITTERNESS_EXPRESSIONS
      },
      body: {
        type: 'array',
        maxItems: 3,
        allowedValues: BODY_EXPRESSIONS
      },
      aftertaste: {
        type: 'array',
        maxItems: 3,
        allowedValues: AFTERTASTE_EXPRESSIONS
      },
      balance: {
        type: 'array',
        maxItems: 3,
        allowedValues: BALANCE_EXPRESSIONS
      }
    },
    errorMessages: {
      maxItems: "각 카테고리별로 최대 3개까지 선택 가능합니다"
    }
  }
}
```

---

## 5. SensoryMouthFeel 검증 규칙

```typescript
interface SensoryMouthFeelValidation {
  // 전체가 선택사항 (건너뛰기 가능)
  skip: {
    type: 'boolean',
    default: false
  },
  
  metrics: {
    body: {
      type: 'number',
      min: 1,
      max: 5,
      step: 1,
      default: 3
    },
    acidity: {
      type: 'number',
      min: 1,
      max: 5,
      step: 1,
      default: 3
    },
    sweetness: {
      type: 'number',
      min: 1,
      max: 5,
      step: 1,
      default: 3
    },
    finish: {
      type: 'number',
      min: 1,
      max: 5,
      step: 1,
      default: 3
    },
    bitterness: {
      type: 'number',
      min: 1,
      max: 5,
      step: 1,
      default: 3
    },
    balance: {
      type: 'number',
      min: 1,
      max: 5,
      step: 1,
      default: 3
    }
  }
}
```

---

## 6. PersonalNotes 검증 규칙

```typescript
interface PersonalNotesValidation {
  // 모든 필드가 선택사항
  mainNote: {
    required: false,
    maxLength: 200,
    trim: true,
    errorMessages: {
      maxLength: "메모는 200자를 초과할 수 없습니다"
    }
  },
  
  quickTags: {
    required: false,
    type: 'array',
    maxItems: 5,
    allowedValues: QUICK_TAG_OPTIONS // 8개 빠른 태그
  },
  
  emotionTags: {
    required: false,
    type: 'array',
    maxItems: 3,
    allowedValues: EMOTION_TAG_OPTIONS // 9개 감정 태그
  }
}
```

---

## 7. 공통 검증 함수

```typescript
// 검증 실행 함수
export const validateField = (
  value: any,
  rules: ValidationRule
): ValidationResult => {
  const errors: string[] = [];
  
  // Required 체크
  if (rules.required && !value) {
    errors.push(rules.errorMessages.required);
    return { valid: false, errors };
  }
  
  // Type 체크
  if (rules.type && typeof value !== rules.type) {
    errors.push(rules.errorMessages.type);
  }
  
  // Length 체크
  if (rules.minLength && value.length < rules.minLength) {
    errors.push(rules.errorMessages.minLength);
  }
  if (rules.maxLength && value.length > rules.maxLength) {
    errors.push(rules.errorMessages.maxLength);
  }
  
  // Pattern 체크
  if (rules.pattern && !rules.pattern.test(value)) {
    errors.push(rules.errorMessages.pattern);
  }
  
  // Range 체크
  if (rules.min !== undefined && value < rules.min) {
    errors.push(rules.errorMessages.min);
  }
  if (rules.max !== undefined && value > rules.max) {
    errors.push(rules.errorMessages.max);
  }
  
  // Enum 체크
  if (rules.enum && !rules.enum.includes(value)) {
    errors.push(rules.errorMessages.enum);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

// 전체 폼 검증
export const validateForm = (
  data: any,
  schema: ValidationSchema
): FormValidationResult => {
  const fieldErrors: Record<string, string[]> = {};
  let isValid = true;
  
  Object.keys(schema).forEach(field => {
    const result = validateField(data[field], schema[field]);
    if (!result.valid) {
      fieldErrors[field] = result.errors;
      isValid = false;
    }
  });
  
  return {
    valid: isValid,
    fieldErrors
  };
};
```

---

## 8. 실시간 검증 전략

```typescript
interface ValidationStrategy {
  // 검증 시점
  timing: {
    onBlur: true,      // 포커스 아웃 시
    onChange: false,   // 입력 중에는 하지 않음 (UX)
    onSubmit: true     // 제출 시 전체 검증
  },
  
  // 디바운싱
  debounce: {
    enabled: true,
    delay: 500 // 0.5초 후 검증
  },
  
  // 에러 표시
  errorDisplay: {
    inline: true,      // 필드 아래 표시
    summary: false,    // 상단 요약 표시 안함
    highlight: true,   // 에러 필드 빨간 테두리
    shake: true        // 에러 시 흔들림 애니메이션
  },
  
  // 성공 표시
  successDisplay: {
    checkmark: true,   // 체크 아이콘
    greenBorder: false // 녹색 테두리는 안함 (너무 많은 시각적 피드백 방지)
  }
}
```

---

## 9. 구현 예제

```typescript
// React Hook Form과 함께 사용
import { useForm } from 'react-hook-form';

const CoffeeInfoForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm();
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input
        {...register("coffeeName", {
          required: "커피 이름을 입력해주세요",
          minLength: {
            value: 2,
            message: "커피 이름은 최소 2자 이상이어야 합니다"
          },
          maxLength: {
            value: 100,
            message: "커피 이름은 100자를 초과할 수 없습니다"
          }
        })}
      />
      {errors.coffeeName && (
        <span className="error">{errors.coffeeName.message}</span>
      )}
    </form>
  );
};
```

---

*작성일: 2025-08-08*