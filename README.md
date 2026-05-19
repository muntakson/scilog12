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

## 추후 작업

- 실제 STL 생성 파이프라인 (AI → OpenSCAD → STL 렌더). 버튼과 저장 로직은 이미 연결되어 있고 렌더러만 스텁 상태입니다.
- 메인넷 봉인 (현재는 Base Sepolia 테스트넷).
- 교사 / 학교 대시보드.
- 연구노트 섹션 내부 이미지 업로드 (마크다운 이미지 URL 은 동작, multipart 업로드는 미구현).

## 테스트

이제 막 만들어진 코드베이스라 아직 테스트 스위트는 없습니다. `npm run build` 가 18개 라우트에 대해 TypeScript 타입 체크를 실행하며 현재 통과 상태입니다.
