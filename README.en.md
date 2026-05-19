# scilog12 — AI Science Logbook + Blockchain Notary for Students

> **Open-source web portal for year 7–12 students** to plan science projects with multi-AI assistance (Claude · Gemini · GROQ · DeepSeek), buy parts via Stripe, and **anchor their research logbook on a public blockchain** — ready for university admissions interviews.

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6)](https://www.typescriptlang.org)
[![Blockchain](https://img.shields.io/badge/Anchor-Base%20Sepolia-0052ff)](https://sepolia.basescan.org)
[![Live demo](https://img.shields.io/badge/demo-scilog12.iotok.org-22c55e)](https://scilog12.iotok.org)

**Live demo:** https://scilog12.iotok.org
**한국어:** [README.md](README.md)

## What is scilog12?

A single portal where **middle- and high-school students** can:

- **Mentor with multi-AI** — Claude, Gemini, GROQ, DeepSeek side-by-side. Every prompt and reply is auto-saved so the *entire research process* is traceable.
- **Keep a lab logbook** — 8-section template, markdown, autosave. The shape that admissions interviewers actually ask about.
- **Buy STEM parts inline** — Stripe checkout + order tracking for Arduino, 3D-printer filament, sensors, breadboards, etc.
- **Notarize on a public blockchain** — logbook + every AI conversation are canonicalized, hashed with SHA-256, and anchored on the Base Sepolia `ScilogNotary` contract. **Tamper-evident proof** of who built what, when.
- **Interviewer verify-link** — university admissions officers open one token URL to see the student's record + on-chain proof.

**Audience**: Korean science-high-school admissions, US/AU STEM college essays, STEM clubs, teachers and tutors.

Copyright © 2026 사단법인 나눔과기술 (Engineers and Scientists for Sharing). Released under the GNU General Public License v3.0 — see [LICENSE](LICENSE) and [COPYRIGHT](COPYRIGHT).

## What's inside

| Pillar | Where |
|---|---|
| AI workbench (Claude, Gemini, GROQ, DeepSeek) — every prompt + reply saved | `src/lib/ai.ts`, `src/app/api/ai/*`, `src/components/ChatPanel.tsx` |
| Lab logbook (templated 8 sections + autosave + markdown) | `src/components/LogbookEditor.tsx`, `src/app/api/logbook/*` |
| 3D STL stub (saves prompt; OpenSCAD pipeline TBD) | `src/components/StlPanel.tsx`, `src/app/api/stl/*` |
| Parts shop + Stripe checkout + order tracking | `src/app/shop`, `src/app/cart`, `src/app/checkout`, `src/app/orders`, `src/app/admin` |
| Blockchain notarization (Base Sepolia) | `contracts/ScilogNotary.sol`, `src/lib/notary.ts`, `src/app/api/projects/submit` |
| Public verify page + interviewer link | `src/app/verify/[hash]`, `src/app/interview/[token]` |

## Local setup

```bash
# 1. Postgres (already created by setup):
#    user=scilog  pwd=scilog_dev  db=scilog12
#    (CREATEDB role grant required for `prisma migrate`)

# 2. Install + sync schema + seed
npm install
npx prisma db push --skip-generate
npx tsx prisma/seed.ts

# 3. Run
npm run dev            # http://localhost:3032

# Demo account: don@example.com / password123
# Admin:        admin@scilog12.org / admin123
```

## API keys you can plug in

Edit `.env`:

- `ANTHROPIC_API_KEY` — Claude (best for code / OpenSCAD / firmware)
- `GEMINI_API_KEY` — already configured from your global notes
- `GROQ_API_KEY` — already configured
- `DEEPSEEK_API_KEY` — already configured
- `STRIPE_SECRET_KEY` / `STRIPE_PUBLISHABLE_KEY` / `STRIPE_WEBHOOK_SECRET` — test keys; without them, checkout falls back to a demo flow that marks orders PAID
- `NOTARY_PRIVATE_KEY` / `NOTARY_CONTRACT_ADDRESS` — without these, submit still computes + stores the SHA-256 hash but does not broadcast on chain

## Blockchain anchoring

Submitting a project canonicalizes the logbook + every AI conversation, takes SHA-256, and calls `ScilogNotary.anchor(bytes32)` on Base Sepolia.

```bash
# Once you've got a funded Base Sepolia wallet:
export NOTARY_PRIVATE_KEY=0x...
npx hardhat run scripts/deploy-notary.ts --network baseSepolia
# Copy the address into NOTARY_CONTRACT_ADDRESS in .env, restart.
```

The contract is intentionally tiny — one mapping, one event, no admin keys. Re-anchoring the same hash reverts (a hash is unique per submission).

## Don's brachistochrone example

Seed creates a project with a real conversation transcript modeling Don asking Claude for OpenSCAD slides and an Arduino sketch. Open it after signing in as Don, fill in the empty logbook sections, then click **Submit & anchor**.

## What's deferred

- Real STL generation pipeline (AI → OpenSCAD → STL render). The button + storage is already wired; only the renderer is a stub.
- Mainnet anchoring (Base Sepolia testnet for now).
- Teacher / school dashboards.
- Image uploads inside logbook sections (markdown image URLs work; multipart upload TBD).

## Tests

This is a freshly scaffolded codebase — no test suite yet. The build (`npm run build`) does run TypeScript type-checking across all 18 routes and is currently green.
