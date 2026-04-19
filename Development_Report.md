# 📊 Development Report: Realtime Data Dashboard

## 1. Project Overview
- **Project Name**: Realtime Data Dashboard
- **Objective**: To provide a high-performance, mobile-optimized monitoring interface for hydrological and sensor data stored in Supabase.
- **Key Focus**: Precision data calculation, real-time synchronization, and intuitive UX/UI for field operations.

---

## 2. Technical Stack
- **Framework**: React 18 with TypeScript (Vite)
- **Database/Backend**: Supabase (PostgreSQL + Realtime Engine)
- **Data Visualization**: Recharts (Customized Area Charts)
- **Iconography**: Lucide React
- **Date Handling**: date-fns (Timezone-aware processing)
- **Deployment**: Netlify

---

## 3. System Architecture & Data Flow
1. **Data Ingestion**: External sensors push data to specific tables in Supabase.
2. **Subscription**: The React frontend uses `@supabase/supabase-js` to subscribe to real-time `INSERT` events.
3. **Processing Hook (`useRealtimeData`)**:
   - Fetches historical data (last 24 hours).
   - Applies **Median Calculation** for velocity cells to eliminate noise.
   - Applies **Scale Factors (0.001)** for unit correction.
   - Adjusts **UTC to KST (+9h)** for accurate local time display.
4. **Presentation**: The `Dashboard` component renders the processed data into 2x2 group cards and interactive charts.

---

## 4. Key Implementation Details

### A. Data Quality Control (QC) Logic
- Integrated a configuration-driven threshold system.
- Data points outside the `min`/`max` range in `thresholds.json` are automatically flagged with a semantic `error` color in the UI.

### B. Velocity Calculation Algorithm
- **V1 (Calculated)**: Median of EW/NS velocities from cells 3 to 15.
- **V2 (Calculated)**: Median of EW/NS velocities from cells 5 to 20.
- **Surface Velocity**: Average of V1 and V2.
- *This ensures stability even when individual sensor cells report erratic values.*

### C. UX/UI Design (Premium Aesthetics)
- **Layout**: 2x2 Grid with horizontal 3-column sub-items.
- **Theme**: Deep Charcoal (#0a0a0b) background with Neon Blue (#00d1ff) accents.
- **Responsiveness**: Fully adaptive layout for mobile devices, using Glassmorphism effects for a modern look.

---

## 5. Configuration & Maintenance
The system is designed for "No-Code" maintenance via JSON files in `src/config/`:

- **`stations.json`**: Manage observation sites (Name, ID, DB Table).
- **`thresholds.json`**: Set QC ranges, units, and calibration scale factors.
- **`display_mapping.json`**: Map DB columns to dashboard card titles and items.

---

## 6. Deployment Guide (Netlify)
1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. **Environment Variables**:
   - `VITE_SUPABASE_URL`: Supabase Project URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase API Key
4. **Routing**: `_redirects` and `netlify.toml` ensure SPA routing works after page refresh.

---

## 7. Conclusion
The Realtime Data Dashboard is now fully operational, providing stable and accurate visualization of sensor data. The architecture is scalable, allowing for the addition of new sensors and sites without modifying the core logic.

<br>
<hr>
<br>

# 📊 개발 보고서: 실시간 데이터 대시보드 (국문)

## 1. 프로젝트 개요
- **프로젝트명**: 실시간 데이터 대시보드 (Realtime Data Dashboard)
- **목적**: Supabase에 저장된 수문 및 센서 데이터를 모바일 최적화된 고성능 인터페이스로 실시간 모니터링
- **주요 목표**: 정밀한 데이터 계산, 실시간 동기화, 현장 운영을 위한 직관적인 UX/UI 제공

---

## 2. 기술 스택
- **프레임워크**: React 18 & TypeScript (Vite 기반)
- **데이터베이스/백엔드**: Supabase (PostgreSQL + Realtime 엔진)
- **데이터 시각화**: Recharts (커스텀 영역 차트)
- **아이콘**: Lucide React
- **날짜/시간 처리**: date-fns (타임존 보정 로직 포함)
- **배포**: Netlify

---

## 3. 시스템 아키텍처 및 데이터 흐름
1. **데이터 수집**: 외부 센서가 Supabase의 특정 테이블로 데이터를 전송.
2. **실시간 구독**: React 프론트엔드가 `@supabase/supabase-js`를 사용하여 실시간 `INSERT` 이벤트를 구독.
3. **데이터 처리 Hook (`useRealtimeData`)**:
   - 최근 24시간의 과거 데이터를 호출.
   - 유속 셀 데이터에 **중간값(Median) 계산**을 적용하여 노이즈 제거.
   - 단위 교정을 위해 **보정 계수(0.001)** 적용.
   - 정확한 현지 시간 표시를 위해 **UTC를 KST(+9시간)로 보정**.
4. **표현**: `Dashboard` 컴포넌트가 처리된 데이터를 2x2 그룹 카드와 대화형 차트로 렌더링.

---

## 4. 핵심 구현 상세

### A. 데이터 품질 관리 (QC) 로직
- 설정 파일 기반의 임계치 시스템 통합.
- `thresholds.json`에 정의된 정상 범위(`min`/`max`)를 벗어나는 데이터는 UI에서 자동으로 빨간색(`error` color)으로 강조.

### B. 유속 계산 알고리즘
- **유속계 1번**: 3번~15번 셀 유속의 중간값(Median) 산출.
- **유속계 2번**: 5번~20번 셀 유속의 중간값(Median) 산출.
- **지표유속**: 1번과 2번 유속계의 평균값 산출.
- *이를 통해 개별 센서 셀의 오작동이나 튀는 값에도 안정적인 수치 제공 가능.*

### C. UX/UI 디자인 (프리미엄 에스테틱)
- **레이아웃**: 2x2 그리드 내 가로 3열 항목 배치 (이름-데이터 수직 매칭).
- **테마**: Deep Charcoal (#0a0a0b) 배경과 Neon Blue (#00d1ff) 포인트 컬러.
- **응답성**: 모바일 기기에 완벽하게 적응하는 레이아웃 및 Glassmorphism 효과 적용.

---

## 5. 설정 및 유지보수
`src/config/` 폴더의 JSON 파일을 통해 코드 수정 없는 운영 지원:

- **`stations.json`**: 관측 지점 관리 (이름, ID, DB 테이블).
- **`thresholds.json`**: QC 범위, 단위, 보정 계수 설정.
- **`display_mapping.json`**: DB 컬럼과 대시보드 카드 항목 간의 매핑 관리.

---

## 6. 배포 가이드 (Netlify)
1. **빌드 명령어**: `npm run build`
2. **배포 디렉토리**: `dist`
3. **환경 변수 설정**:
   - `VITE_SUPABASE_URL`: Supabase 프로젝트 URL
   - `VITE_SUPABASE_ANON_KEY`: Supabase API 키
4. **라우팅 설정**: `_redirects` 및 `netlify.toml` 파일을 통해 새로고침 시 라우팅 오류 방지.

---

## 7. 결론
본 실시간 데이터 대시보드는 현재 모든 기능을 정상적으로 수행하며, 센서 데이터의 안정적이고 정확한 시각화를 제공합니다. 확장 가능한 아키텍처를 채택하여 추후 코어 로직 수정 없이도 새로운 센서나 지점을 쉽게 추가할 수 있습니다.

**작성자: Antigravity (Advanced AI Coding Assistant)**
**작성일**: 2026-04-19
