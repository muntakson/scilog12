# scilog12

A web portal for year 7–12 students to plan and document science projects with AI assistance, buy parts, and lock their logbook on a public blockchain — ready for university admissions interviews.

**Live demo:** https://scilog12.iotok.org

한국어: [README.md](README.md)

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
