# scilog12 — 홍보 / Promotion Playbook

> Korean-first promotion plan for `muntakson/scilog12`. Goal: rank on **Naver + Google.co.kr** for 학생 연구노트 / AI 과학 프로젝트 / 블록체인 봉인, and on **GitHub trending / Google global** for `science-logbook` / `blockchain-notary`.

---

## 1. Verify the basics first (one-time, ~15 min)

Run these before doing any outreach — they make all downstream traffic worth more.

- [ ] **Google Search Console** — add property `https://scilog12.iotok.org`, verify via DNS TXT (Cloudflare zone), submit `sitemap.xml`.
- [ ] **Naver Search Advisor** (`searchadvisor.naver.com`) — add site, verify via meta tag (paste the `naver-site-verification` token into `verification` of `metadata` in `src/app/layout.tsx`), submit `sitemap.xml`.
- [ ] **Bing Webmaster** — import from Google Search Console (1 click). Covers DuckDuckGo / Yahoo by extension.
- [ ] **GitHub social preview image** — upload a 1280×640 PNG via `Settings → Social preview`. Should show the logo + "AI 과학 프로젝트 · 학생 연구노트 · 블록체인 봉인". Without this, link previews on Twitter/HN are blank.
- [ ] **Favicon + apple-touch-icon** — drop into `src/app/icon.png` and `src/app/apple-icon.png` (Next.js convention).
- [ ] **Open Graph image** — `src/app/opengraph-image.png` (1200×630). Same visual as GitHub social preview is fine.

---

## 2. Korean-language posts (highest leverage)

### 2a. Naver 블로그 / 카페

Naver has its own ecosystem; Google won't carry you there. Pick **one** of these accounts you already have, post weekly for ~3 weeks:

- **블로그 제목 후보**:
  - "AI 로 중·고등학생 과학 프로젝트 기획하기 — Claude + Gemini 워크벤치 무료 공개"
  - "학생 연구노트를 블록체인에 봉인하면 입시 면접에서 어떻게 쓰이나"
  - "Base 블록체인에 SHA-256 으로 연구노트 봉인하는 오픈소스 — scilog12"
- **카페 타겟**:
  - 오르비 (입시 카페) — `/verify/[hash]` 데모 링크 강조
  - 디시인사이드 자연과학 갤러리
  - 네이버 카페 "공학도 모임"

키워드 밀도 가이드(본문 ~1500자 기준): `학생 연구노트` ×6, `AI 과학 프로젝트` ×4, `블록체인 봉인` ×3, `대입 면접` ×3, `자기소개서` ×2.

### 2b. 클리앙 / 뽀빠이 / 긱뉴스

- **클리앙 모두의 공원**: "오픈소스 만들었습니다 — 학생용 AI 과학 포털" 톤. 코드 링크 + 데모 링크. **자가홍보 표시 필수**.
- **GeekNews (news.hada.io)**: submit URL `https://github.com/muntakson/scilog12`. Korean dev community; Hacker-News-style. High signal on GitHub stars.

### 2c. 페이스북 그룹 / 카카오 오픈채팅

- "과학교사 모임", "영재학교 학부모", "Maker Faire Korea" 그룹들. 데모 링크 + 시드 계정 (`don@example.com / password123`) 안내.

---

## 3. English-language posts

### 3a. Hacker News (Show HN)

Best window: **Tuesday-Thursday 06:00-09:00 PT** (Korea 22:00-01:00). One shot only.

```
Show HN: scilog12 – AI science portal for students with blockchain-anchored logbooks

A web portal for year 7-12 students. Plan a science project with Claude/Gemini/GROQ/
DeepSeek side-by-side, buy parts via Stripe, and anchor your logbook + every AI
conversation to Base Sepolia (one mapping, one event, no admin keys).

Demo: https://scilog12.iotok.org  (login don@example.com / password123)
Repo: https://github.com/muntakson/scilog12  (GPLv3, Next.js + Prisma + Hardhat)

Built for Korean university admissions interviews, where students get asked "show me
what you actually did." The notarization gives a tamper-evident timeline.

Known caveats in README's TODO list — sealing-hash determinism bug, XSS sanitization
for the interviewer page, no test suite yet. Feedback welcome.
```

Trigger comment within 5 min of posting: paste the README's "TODO" list verbatim. HN rewards honesty about flaws.

### 3b. Reddit

- `/r/SideProject` — Sunday best. Same text as HN, drop the "for Korean admissions" framing (US audience).
- `/r/learnpython` and `/r/Arduino` — only if you do a *tutorial* post ("how we use Claude to generate OpenSCAD for student physics projects"). Pure promo gets removed.
- `/r/ethereum` — focus on the notary contract (`contracts/ScilogNotary.sol` — 1 mapping, 1 event, no admin). r/ethereum likes minimal contracts.

### 3c. dev.to / Hashnode

Long-form tutorial post — Google indexes these well:

- "Anchoring a student's research notebook on a public blockchain with Next.js + Prisma + Hardhat"
- Cross-post to your own blog if you have one; canonical link to the dev.to version.

### 3d. Awesome-list PRs

Open PRs to:
- `sindresorhus/awesome` → not directly, but to one of its children: `awesome-nextjs`, `awesome-ethereum`, `awesome-blockchain-app`.
- `topics/education` on GitHub — already covered by your topic tags.

---

## 4. Inbound link engineering

Inbound links are the single biggest SEO lever for a small site. Aim for **5–10 do-follow links** from:

- **University Maker labs / 영재학교 동아리 사이트** — email a 3-sentence pitch + free signup. They often have a "tools we use" page.
- **STEM 교사 블로그** — Korean teachers blog on Tistory; a single Tistory link is worth more than 50 social shares.
- **GitHub READMEs of related projects** — find Korean STEM repos, comment with a useful issue/PR. Reciprocal mentions follow.

---

## 5. GitHub-specific tactics

- [ ] **Pin scilog12** to your GitHub profile (`muntakson`).
- [ ] **Star + watch** from any alt accounts you legitimately own. Cold-zero-star repos look dead; the first 10 stars matter most. **Do not buy stars** — GitHub Trust & Safety will deindex.
- [ ] **Open 3 "good-first-issue" issues** from the README's TODO list. New repos with `good-first-issue` get surfaced on GitHub Explore.
- [ ] **GitHub Discussions** — enable; seed with 1 Q&A in Korean and 1 in English.
- [ ] **Releases** — tag `v0.1.0` with release notes. Releases show up in feeds; vague "main branch" does not.

---

## 6. Content cadence (8 weeks)

| Week | Action | Channel |
|---|---|---|
| 1 | Search Console + Naver verification, social preview image, releases v0.1.0 | infra |
| 2 | Show HN post | HN |
| 3 | Long-form Korean blog "학생 연구노트 블록체인 봉인" | Naver / Tistory |
| 4 | dev.to tutorial post (English) | dev.to |
| 5 | Reddit /r/SideProject | Reddit |
| 6 | Awesome-list PRs (3 of them) | GitHub |
| 7 | Email outreach to 10 STEM teachers / 영재학교 동아리 | email |
| 8 | Recap post on GitHub Discussions with metrics, ask for feedback | GitHub |

Measure at week 8 via Search Console: which queries actually drove impressions, then double down.

---

## 7. What NOT to do

- **No paid star services** — instant deindex by GitHub. Confirmed multiple times in their abuse policy.
- **No keyword stuffing in README** — Google's spam detection picks it up fast. Density above ~3% for any term flags it.
- **No reposting the exact same text to multiple subreddits** — Reddit shadowbans cross-posted promo.
- **No `dofollow` link begging** — universities will not link in exchange for a request. Provide value first (free educator account, dataset, tutorial).
