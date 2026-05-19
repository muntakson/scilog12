# Contributing to scilog12

Thank you for your interest in contributing! scilog12 is maintained by
**사단법인 나눔과기술 (Engineers and Scientists for Sharing)** and released
under the GNU General Public License v3.0.

By contributing to this project, you agree that your contributions will be
licensed under the same GPL-3.0 terms — see [LICENSE](LICENSE) and
[COPYRIGHT](COPYRIGHT).

## How to report a bug or request a feature

Open an issue at https://github.com/muntakson/scilog12/issues with:

1. A short, descriptive title.
2. **For bugs:** steps to reproduce, what you expected, what actually
   happened, and the version (commit SHA) you tested on.
3. **For features:** the problem you're trying to solve, not just the
   solution you have in mind. Screenshots / mockups welcome.

Please search existing issues first to avoid duplicates.

## Development setup

See the "Local setup" section in [README.md](README.md). In short:

```bash
npm install
npx prisma db push --skip-generate
npx tsx prisma/seed.ts
npm run dev      # http://localhost:3032
```

The build (`npm run build`) runs TypeScript type-checking across every
route — keep it green.

## Pull request process

1. **Fork** the repo and create a topic branch from `main`:
   `git checkout -b fix/short-description` or `feat/short-description`.
2. **Keep the change focused.** One concern per PR. Refactors and feature
   work in the same diff are hard to review.
3. **Test locally.** Run `npm run build` and exercise the affected pages
   in a browser. If you change API routes, hit them with `curl` or the UI.
4. **Don't commit secrets.** `.env` is in `.gitignore` — keep it that way.
   API keys go in `.env`, never in committed code or tests.
5. **Write clear commit messages.** First line is a short imperative
   ("Add Stripe retry logic on webhook failure"), followed by a blank
   line and a paragraph explaining *why* the change is needed.
6. **Open the PR** against `main` with a description that covers what
   changed, why, and how you tested it. Link related issues.

## Sign-off (DCO)

We follow the [Developer Certificate of Origin](https://developercertificate.org/).
Sign each commit with `git commit -s` — this appends a `Signed-off-by:`
trailer asserting you have the right to submit the contribution under the
project's license.

## Code style

- **TypeScript / React:** match the surrounding code. We don't run a
  formatter in CI; just don't reformat unrelated lines.
- **No new dependencies** without a brief justification in the PR. Each
  package added is a future maintenance and security burden.
- **Comments:** explain *why*, not *what*. Identifiers should be
  self-describing.

## Security issues

Please **do not** open a public issue for security vulnerabilities.
Email the maintainer at mtshon@gmail.com with details. We'll acknowledge
within 7 days and coordinate a fix before public disclosure.

## Code of Conduct

All contributors are expected to follow our
[Code of Conduct](CODE_OF_CONDUCT.md). Report unacceptable behavior to
mtshon@gmail.com.

## Questions?

Open a discussion or an issue. We're happy to help newcomers get oriented.
