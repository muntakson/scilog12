# scilog12

중학교 1학년 ~ 고등학교 3학년 학생이 AI 도움을 받아 과학 프로젝트를 기획·기록하고, 부품을 구매하며, 연구노트를 공개 블록체인에 봉인하여 대학 입시 면접에 활용할 수 있도록 만든 웹 포털입니다.

**라이브 데모:** https://scilog12.iotok.org

Copyright © 2026 사단법인 나눔과기술 (Engineers and Scientists for Sharing). GNU General Public License v3.0 라이선스로 배포됩니다 — [LICENSE](LICENSE) 및 [COPYRIGHT](COPYRIGHT) 참조.

English: [README.en.md](README.en.md)

## 구성 요소

| 영역 | 위치 |
|---|---|
| AI 워크벤치 (Claude, Gemini, GROQ, DeepSeek) — 모든 프롬프트와 응답 저장 | `src/lib/ai.ts`, `src/app/api/ai/*`, `src/components/ChatPanel.tsx` |
| 실험 연구노트 (8개 섹션 템플릿 + 자동 저장 + 마크다운) | `src/components/LogbookEditor.tsx`, `src/app/api/logbook/*` |
| 3D STL 스텁 (프롬프트 저장; OpenSCAD 파이프라인은 추후 작업) | `src/components/StlPanel.tsx`, `src/app/api/stl/*` |
| 부품 쇼핑몰 + Stripe 결제 + 주문 추적 | `src/app/shop`, `src/app/cart`, `src/app/checkout`, `src/app/orders`, `src/app/admin` |
| 블록체인 봉인 (Base Sepolia) | `contracts/ScilogNotary.sol`, `src/lib/notary.ts`, `src/app/api/projects/submit` |
| 공개 검증 페이지 + 면접관 링크 | `src/app/verify/[hash]`, `src/app/interview/[token]` |

## 로컬 실행

```bash
# 1. Postgres (setup 스크립트로 이미 생성됨):
#    user=scilog  pwd=scilog_dev  db=scilog12
#    (`prisma migrate` 실행에는 CREATEDB 권한 필요)

# 2. 의존성 설치 + 스키마 동기화 + 시드 데이터
npm install
npx prisma db push --skip-generate
npx tsx prisma/seed.ts

# 3. 실행
npm run dev            # http://localhost:3032

# 데모 계정: don@example.com / password123
# 관리자:    admin@scilog12.org / admin123
```

## 연결 가능한 API 키

`.env` 파일에서 편집하세요:

- `ANTHROPIC_API_KEY` — Claude (코드 / OpenSCAD / 펌웨어에 최적)
- `GEMINI_API_KEY`
- `GROQ_API_KEY`
- `DEEPSEEK_API_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — 테스트 키. 미설정 시 결제는 데모 흐름으로 주문이 PAID 처리됩니다.
- `NOTARY_PRIVATE_KEY` / `NOTARY_CONTRACT_ADDRESS` — 미설정 시 제출은 SHA-256 해시를 계산·저장하지만 체인 브로드캐스트는 하지 않습니다.

## 블록체인 봉인

프로젝트를 제출하면 연구노트 + 모든 AI 대화를 정규화하여 SHA-256 해시를 계산하고, Base Sepolia 네트워크의 `ScilogNotary.anchor(bytes32)` 함수를 호출합니다.

```bash
# Base Sepolia 잔액이 있는 지갑을 준비한 뒤:
export NOTARY_PRIVATE_KEY=0x...
npx hardhat run scripts/deploy-notary.ts --network baseSepolia
# 출력된 주소를 .env의 NOTARY_CONTRACT_ADDRESS 에 넣고 재시작합니다.
```

컨트랙트는 매우 작습니다 — 매핑 하나, 이벤트 하나, 관리자 키 없음. 같은 해시를 다시 봉인하면 트랜잭션이 revert 됩니다 (해시는 제출마다 유일해야 함).

## 돈(Don)의 brachistochrone 예제

시드 데이터에는 Don이 Claude에게 OpenSCAD 슬라이드와 Arduino 스케치를 요청하는 실제 대화 기록이 포함된 프로젝트가 들어 있습니다. Don 계정으로 로그인한 뒤 비어 있는 연구노트 섹션을 채우고 **Submit & anchor** 를 누르면 봉인이 진행됩니다.

## TODO / 작업 목록

코드베이스 자체 점검 결과입니다. 우선순위 순으로 정리했으며, 항목 옆에 관련 파일을 표기했습니다.

### 🔥 즉시 수정 (정확성 · 보안 핵심 결함)

- [ ] **봉인 해시 재생산 불가 버그** — 제출 시 `submittedAt: new Date().toISOString()` 을 해시 입력에 넣은 뒤(`src/app/api/projects/submit/route.ts:26`), DB 에는 별도의 `new Date()` 를 저장(`:40`). 두 값이 ms 단위로 어긋나 검증자가 동일 해시를 재계산할 수 없음. 한 변수로 통일 필요.
- [ ] **XSS 위험** — `interview/[token]/page.tsx:50` 에서 `marked.parse(...)` 결과를 `dangerouslySetInnerHTML` 로 출력. `marked` 는 기본적으로 sanitize 하지 않으므로 학생이 `<script>` 를 연구노트에 삽입하면 면접관 브라우저에서 실행됨. DOMPurify 또는 `rehype-sanitize` 적용 필요. 로그북 에디터 프리뷰도 동일 점검.
- [ ] **체인 봉인 실패 시 SUBMITTED 처리** — `submit/route.ts:37-49` 에서 `anchorOnChain` 실패를 catch 하고 그대로 SUBMITTED 마킹. 검증 페이지는 "제출됨" 인데 `txHash` 가 없는 모순 상태. 정책 결정 후 (재시도 큐 vs DRAFT 유지) 구현.
- [ ] **로그인 페이지에 데모 자격증명 하드코딩** — `login/page.tsx:27-28,33` 에 `don@example.com / password123` 가 form `defaultValue` 와 안내 문구로 박혀 있음. `NEXT_PUBLIC_DEMO=1` 등의 플래그 뒤로 분리.
- [ ] **`SESSION_SECRET` 누락 시 fallback** — `lib/session.ts:13` 이 약한 상수로 폴백. 프로덕션에서는 부팅 시 fail-fast 로 변경.

### 🔒 보안

- [ ] AI 채팅(`api/ai/chat`), 로그인, 회원가입에 레이트 리밋 (Upstash Redis 등). 현재는 학생 한 명이 무한히 API 키를 소비 가능.
- [ ] 인터뷰 토큰 만료시간 강제 — `interview-tokens/route.ts` 에서 `expiresAt` 미설정. 기본 30일 등.
- [ ] 모든 API 라우트에 zod 검증 통일 — 현재 chat 만 zod, submit/STL/interview-tokens 는 원시 `req.json()`.
- [ ] 로그북 섹션 `content` 길이 상한 (`api/logbook/sections/[id]`) — 현재 무제한 → DB 폭발 가능.
- [ ] Stripe 웹훅 멱등성 — `webhooks/stripe/route.ts` 가 동일 이벤트 재처리 시 카트 재삭제 / 주문 갱신. `event.id` 기반 dedupe.
- [ ] bcrypt cost factor 12 로 상향 (현재 10).
- [ ] `next.config.js` 에 CSP / HSTS / Referrer-Policy 헤더 추가.
- [ ] AI 프로바이더 에러 메시지를 클라이언트로 그대로 노출하지 않도록 마스킹 (`api/ai/chat/route.ts:47-49`).

### 🐛 정확성 / UX

- [ ] AI 응답 스트리밍 (SSE) — 현재는 완전 응답 후 일괄 표시.
- [ ] 결제 통화 설정 가능화 — `checkout/action.ts:51` 이 `usd` 고정인데 배송 기본은 `AU`. 환경변수화.
- [ ] 주문 추적 — 운송사 / 추적 URL 필드 추가 (현재 번호 텍스트뿐).
- [ ] 대화 이름 변경 / 삭제 기능.
- [ ] 비밀번호 재설정 · 이메일 인증.
- [ ] 메일 알림 (주문 생성 · 배송 · 프로젝트 제출).

### 🧪 테스트 / 운영

- [ ] 테스트 스위트 0개 → Vitest (단위) + Playwright (E2E) 도입. 최소: 봉인 해시 결정성, 권한 분리, Stripe 웹훅 멱등성.
- [ ] GitHub Actions CI — typecheck · lint · build · test.
- [ ] `prisma migrate` 기반 마이그레이션 히스토리로 전환 (현재 README 가 `db push` 안내).
- [ ] env 변수 zod 검증 (`src/lib/env.ts`) — 부팅 시 fail-fast.
- [ ] Dockerfile + `docker-compose.yml` (Postgres 포함) — 신규 기여자 온보딩.
- [ ] 구조화된 로깅 (pino 등) — 현재 `console.error` 1곳.

### ✨ 기능 (알려진 미완성)

- [ ] 실제 STL 생성 파이프라인 (AI → OpenSCAD → STL 렌더). 버튼·저장은 연결됨, 렌더러만 스텁.
- [ ] 연구노트 섹션 내부 이미지 업로드 (multipart). 마크다운 외부 URL 은 동작.
- [ ] 교사 / 학교 대시보드.
- [ ] 메인넷 봉인 (현재 Base Sepolia 테스트넷).

## 테스트

위 TODO 의 첫 항목으로 도입 예정. 현재는 `npm run build` 의 TypeScript 타입 체크가 18개 라우트에 대해 통과하는 것이 유일한 안전망입니다.
