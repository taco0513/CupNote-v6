# 📚 Document System (문서 시스템)

## 개요
CupNote v6 프로젝트의 **문서 자체**를 관리하는 메타 시스템입니다.  
앱 디자인 시스템(`07-design-system/`)과는 별개로, 문서 작성 규칙과 구조를 정의합니다.

---

## 📁 폴더 구조

```
00-document-system/
├── README.md                 # 현재 파일
├── DOCUMENT-TOKENS.md        # 문서 작성 규칙 및 토큰
├── DEPENDENCY-MAP.md         # 문서 간 의존성 맵
└── DOCUMENT-REVIEW.md        # 문서 검토 보고서
```

---

## 🎯 목적

### 1. 문서 시스템 (Document System)
- **대상**: 프로젝트 문서들
- **목적**: 일관된 문서 작성 및 관리
- **내용**: 
  - 문서 작성 규칙
  - 마크다운 스타일 가이드
  - 문서 간 관계 정의
  - 메타데이터 관리

### 2. 앱 디자인 시스템 (App Design System) 
- **대상**: 실제 앱 UI/UX
- **위치**: `07-design-system/`
- **내용**:
  - 컬러 팔레트
  - 타이포그래피
  - 컴포넌트 디자인
  - 앱 인터랙션 패턴

---

## 📋 문서 작성 규칙

### 문서 헤더 템플릿
```markdown
# [문서 제목]

## 문서 정보
- **작성일**: YYYY-MM-DD
- **수정일**: YYYY-MM-DD
- **상태**: Draft | Review | Final
- **담당자**: [이름]
```

### 섹션 구조
```markdown
## 개요
[간략한 설명]

## 상세 내용
[본문]

## 관련 문서
- [링크1]
- [링크2]
```

### 파일명 규칙
- **화면 문서**: `[번호]-[화면명].md` (예: `01-coffee-info.md`)
- **개요 문서**: `[기능명]-overview.md` (예: `tasting-flow-overview.md`)
- **시스템 문서**: `[시스템명]-system.md` (예: `achievement-system.md`)

---

## 🔗 문서 분류 체계

### Level 1: Foundation (기초)
- `01-product-overview/`: 제품 비전, 핵심 기능
- `02-user-personas/`: 사용자 정의

### Level 2: Structure (구조)
- `03-user-journey/`: 사용자 여정
- `04-information-architecture/`: 정보 구조

### Level 3: Features (기능)
- `05-features/`: 상세 기능 명세
  - `tasting-flow/`: 핵심 기능
  - `my-records/`: 기록 관리
  - `achievements/`: 성취 시스템

### Level 4: Design (디자인)
- `07-design-system/`: 앱 UI 디자인 시스템
- `08-ux-patterns/`: UX 패턴

### Level 5: Implementation (구현)
- `10-development-roadmap/`: 개발 로드맵
- `11-data-privacy/`: 데이터 및 보안

### Meta Level (메타)
- `00-document-system/`: 문서 시스템 (현재 폴더)
- `archive/`: 구버전 및 미사용 문서

---

## 📊 문서 상태 관리

### 문서 상태 정의
- **Draft**: 초안 작성 중
- **Review**: 검토 중
- **Final**: 최종 확정
- **Deprecated**: 사용 중단 (archive로 이동)

### 버전 관리
- **Major**: 구조 변경 (v1.0.0 → v2.0.0)
- **Minor**: 기능 추가 (v1.0.0 → v1.1.0)
- **Patch**: 오타 수정 (v1.0.0 → v1.0.1)

---

## 🚀 Quick Links

### 핵심 문서
- [제품 비전](../01-product-overview/product-vision.md)
- [TastingFlow 개요](../05-features/tasting-flow/tasting-flow-overview.md)
- [MVP 요약](../MVP-SUMMARY.md)

### 시스템 문서
- [문서 토큰](./DOCUMENT-TOKENS.md)
- [의존성 맵](./DEPENDENCY-MAP.md)
- [문서 검토 보고서](./DOCUMENT-REVIEW.md)

---

## 📝 변경 이력

### 2025-08-08
- 문서 시스템과 앱 디자인 시스템 분리
- `00-document-system/` 폴더 생성
- 문서 메타데이터 시스템 구축

---

*이 문서는 CupNote v6 프로젝트의 문서 관리 시스템을 정의합니다.*