# Project: @lngmtri/react-table-craft

## Overview

A production-ready, framework-agnostic React data table system built on TanStack Table. This is a personal fork of [react-table-craft](https://github.com/Ahmed-Elkhdrawy/table-craft) with customizations for personal projects.

**Key Characteristics:**
- Fully typed with TypeScript (strict mode)
- Tree-shakeable (ESM + CJS dual output, `sideEffects: false`)
- Built on TanStack Table v8
- Feature-rich: pagination, filtering, sorting, column visibility, row selection, CSV export, RTL support
- Radix UI components + Tailwind CSS styling
- Changeset-based versioning and releases

## Development Setup

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Getting Started
```bash
npm install
npm run typecheck    # Verify TypeScript compilation
npm run dev          # Start tsup in watch mode
npm test             # Run vitest suite
```

## Project Structure

```
src/
├── components/          # React components
│   ├── ui/             # Radix UI-based primitive components (button, checkbox, etc.)
│   ├── advanced/       # Advanced table components (filters, toolbars)
│   ├── client-side-table/  # ClientSideTable wrapper component
│   ├── data-table.tsx  # Main DataTable component
│   └── ...other table components
├── config/             # Configuration system
│   ├── context.ts      # React context for table config
│   ├── create-config.ts # Config creation and merging
│   ├── defaults.ts     # Default config values
│   └── ...config utilities
├── hooks/              # Custom React hooks
├── lib/                # Utilities (CSV export, string utils, etc.)
├── types/              # TypeScript type definitions
├── serializers/        # Filter serialization for URL params
├── __tests__/          # Unit tests (Vitest)
└── index.ts            # Package entry point
```

## Architecture & Design Principles

### 4-Layer Configuration System
The table supports configuration at multiple levels (in priority order):
1. **Defaults** — Global defaults from `config/defaults.ts`
2. **Provider** — App-level config via `<TableConfigProvider>`
3. **Instance** — Component-level `config` prop
4. **Plugins** — Plugin-based extensions with priority system

### Component Philosophy
- UI components are minimal, unstyled primitives (Radix UI)
- Table components wrap these with business logic and Tailwind styling
- Favor composition over configuration where possible
- Keep components focused and single-responsibility

### Type Safety
- All public APIs are fully typed with TypeScript generics
- Type exports for column definitions, filters, pagination, etc.
- Strict `tsconfig.json` settings enforced

## Build & Release

### Build
```bash
npm run build       # Compile with tsup (produces dist/index.{js,cjs,d.ts})
npm run clean       # Remove dist/
```

### Versioning Strategy
Use [Changesets](https://github.com/changesets/changesets) for versioning:
- **Major**: Breaking API changes, major feature overhauls, dependency upgrades that break the public API
- **Minor**: New features, non-breaking enhancements, new public APIs
- **Patch**: Bug fixes, internal optimizations, doc updates

Always update `CHANGELOG.md` when merging changes.

### Publishing
```bash
npm run changeset        # Create a changeset (interactive)
npm run version-packages # Bump versions based on changesets
npm run release          # Build and publish to npm
```

## Key Dependencies

- **@tanstack/react-table** (v8) — Table primitives and headless logic
- **@radix-ui/** — Unstyled, accessible UI components
- **tailwind-merge** — Merge Tailwind classes without conflicts
- **clsx** — Conditional class composition
- **class-variance-authority** — Variant-based class generation
- **date-fns** — Date utilities for filtering
- **export-to-csv** — CSV export functionality
- **lucide-react** — Icon library
- **cmdk** — Command/search palette component
- **vaul** — Drawer component

## Testing

```bash
npm test          # Run vitest once
npm run test:watch # Run vitest in watch mode
```

Tests use:
- **Vitest** — Unit test framework
- **@testing-library/react** — Component testing utilities
- **jsdom** — DOM simulation for Node.js

Test files live in `src/__tests__/` alongside their modules.

## Documentation

- `README.md` — Feature overview, installation, quick start, API reference
- `CONTRIBUTING.md` — Contribution guidelines, PR process, RFC requirements
- `rfcs/` — RFC directory for major features/changes
- `CHANGELOG.md` — Release notes and version history

## Common Commands

| Command | Purpose |
|---------|---------|
| `npm run typecheck` | Verify TypeScript (no emit) |
| `npm run dev` | Start tsup in watch mode |
| `npm run build` | Compile to dist/ |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run changeset` | Create changeset for release |
| `npm run release` | Publish to npm |

## For Contributors

Read `CONTRIBUTING.md` for:
- Branching conventions (`fix/`, `feat/`, `docs/`)
- When to open an issue vs. PR
- When to write an RFC (major features)
- Code style and linting expectations
