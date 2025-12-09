# Contributing to electron-license-kit

Thank you for your interest in contributing! This document explains how to work on electron-license-kit and how to propose changes.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for everyone.

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 8+
- Git

### Setup

```bash
git clone https://github.com/YOUR_USERNAME/electron-license-kit.git
cd electron-license-kit
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Repository Structure

```text
electron-license-kit/
├── packages/
│   └── core/           # Main NPM package (electron-license-kit)
│       └── src/
│           ├── branding/
│           ├── config/
│           ├── crash/
│           ├── license/
│           ├── logger/
│           ├── security/
│           ├── storage/
│           ├── updater/
│           └── window/
├── templates/
│   └── vanilla/        # Vanilla TypeScript template
├── examples/           # Example apps (future)
├── docs/               # Documentation
└── .github/            # GitHub workflows
```

## How to Contribute

### Reporting Bugs

1. Check existing issues to avoid duplicates.
2. Include:
   - Clear description
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment (OS, Node, Electron, Supabase).

### Suggesting Features

1. Open a new issue or discussion.
2. Describe:
   - The problem you want to solve.
   - Your proposed solution.
   - Alternatives you considered.

### Submitting Code

1. **Fork** the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature
   # or
   git checkout -b fix/bug-description
   ```
2. Make your changes.
3. Run the checks:
   ```bash
   pnpm lint
   pnpm typecheck
   pnpm test
   ```
4. Commit using clear messages (Conventional Commits recommended):
   - `feat: add xyz`
   - `fix: handle abc`
   - `docs: update configuration docs`
5. Push and open a Pull Request.

## Coding Standards

- TypeScript strict mode enabled.
- Explicit return types on public functions.
- No `any` unless absolutely necessary (and justified).
- Use existing ESLint + Prettier configuration.

### Useful Scripts

```bash
pnpm build        # Build all packages
pnpm dev          # Watch / dev mode (where applicable)
pnpm lint         # Lint all packages
pnpm lint:fix     # Auto-fix lint issues
pnpm typecheck    # Run TypeScript type checking
pnpm test         # Run tests
pnpm clean        # Remove build artifacts
```

## Release Process

Releases are handled by maintainers and typically follow:

1. Update versions in relevant `package.json` files.
2. Update `CHANGELOG.md`.
3. Tag a release (`vX.Y.Z`).
4. CI builds & publishes to npm / GitHub Releases.

## Questions?

- Open a GitHub Issue or Discussion.

By contributing, you agree that your contributions will be licensed under the MIT License.

