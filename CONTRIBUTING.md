# Contributing to Chessy

Thanks for your interest in Chessy! It's built on the philosophy of **speed, clarity, and respect for the player's intelligence**. Contributions of every size are welcome, from fixing a typo to building multiplayer.

---

## Table of Contents

1. [Your First Contribution](#your-first-contribution)
2. [Philosophy](#philosophy)
3. [Getting Started](#getting-started)
4. [Development Workflow](#development-workflow)
5. [Code Standards](#code-standards)
6. [What to Contribute](#what-to-contribute)
7. [What NOT to Contribute](#what-not-to-contribute)
8. [Architecture Guidelines](#architecture-guidelines)
9. [Testing](#testing)
10. [Getting Help](#getting-help)

---

## Your First Contribution

1. **Pick an issue.** The [roadmap issue #104](https://github.com/youneedgreg/chessy/issues/104) lists everything planned, grouped by area. For a first PR, look at [good first issues](https://github.com/youneedgreg/chessy/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22).
2. **Claim it.** Comment "I'd like to work on this" so nobody duplicates the work. If you go quiet for two weeks, the issue may be reassigned.
3. **Read the issue.** Every issue has a problem statement, the files involved, a suggested fix and "Done when" criteria.
4. **Open a PR** using the template, and link the issue with `Closes #123`.

### Labels

| Label | Meaning |
| --- | --- |
| `good first issue` | Small, well-defined, and little context needed |
| `help wanted` | Contributions especially welcome |
| `difficulty: easy / medium / hard` | Rough size of the work |
| `area: engine / training / ui / review / multiplayer / infra` | Which part of the app it touches |
| `revamp` | Part of the frontend revamp (#133–#139); build these in order |

---

## Philosophy

This project has strong opinions about how chess should be taught:

- **No gamification:** no points, badges, streaks, or vanity metrics.
- **No social noise:** no chat, profiles, followers, or leaderboards. Playing a friend through a shared link (#140) is welcome; it adds no accounts or chat.
- **No friction:** no accounts, no paywalls, no tracking.
- **Honest feedback:** grades and explanations must be correct, or not shown at all.
- **Performance first:** fast feedback beats clever features.

If a proposed feature violates these principles, it won't be merged, regardless of code quality.

Everyone taking part is expected to follow the [Code of Conduct](./CODE_OF_CONDUCT.md). Report security problems privately as described in [SECURITY.md](./SECURITY.md).

---

## Getting Started

### Prerequisites

- **Node.js 20+** and npm
- **Git**
- Basic understanding of TypeScript, React and Next.js
- Familiarity with chess terminology (you don't need to be a strong player)

### Setup

```bash
# Fork the repository on GitHub, then:
git clone https://github.com/YOUR_USERNAME/chessy.git
cd chessy

npm install
npm run dev          # http://localhost:3000
```

### Useful scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build (also type-checks) |
| `npm run lint` | ESLint |
| `npm run type-check` | TypeScript without emitting |
| `npm run format` | Prettier |
| `npm test` | Unit tests (Vitest) |

> The other core unit tests (`classifyMove`, store `undo`/`redo`/`resign`) are still [#125](https://github.com/youneedgreg/chessy/issues/125), a great first contribution.

---

## Development Workflow

### 1. Find or create an issue

- Check [existing issues](https://github.com/youneedgreg/chessy/issues) first.
- Bugs: use the bug report template (steps, level, moves/PGN, browser).
- Features: explain how the idea fits the philosophy.
- **Wait for a maintainer to confirm** before starting large features.

### 2. Create a branch

```bash
git checkout -b fix/arrow-orientation
```

Prefixes: `feat/`, `fix/`, `refactor/`, `docs/`, `test/`, `chore/`.

### 3. Make changes

- Keep PRs focused: one issue per PR.
- Write clear commit messages ("Fix arrows pointing at mirrored squares as Black").
- Follow the code standards below.

### 4. Check locally

```bash
npm test
npm run lint
npm run type-check
npm run build
npm run dev   # play through the flow you changed
```

If your change touches gameplay or feedback, test it at **all five levels** (Beginner, Intermediate, Advanced, Master, Silent) and **as both White and Black**.

### 5. Open a pull request

The PR template asks for:
- what changed and why;
- how you tested it;
- screenshots for UI changes (desktop and mobile).

---

## Code Standards

### TypeScript

- **Strict mode is on.** Avoid `any`; if it's unavoidable, explain why.
- Use descriptive names, and add JSDoc for anything non-obvious.

```typescript
// ✅ Good
interface MoveAnalysis {
  playerMove: string;
  engineBestMove: string;
  evalDelta: number;
}

// ❌ Bad
type MA = { pm: string; ebm: string; ed: number };
```

### React components

- Use function components with hooks.
- Keep components focused and composable, with clearly typed props.
- Use `memo` only where profiling shows it helps.

### Performance

- Never block the main thread with heavy work: the engine runs in a Web Worker.
- Lazy-load anything not needed for the first interaction.
- The engine's thinking time is capped per level (see `LEVELS` in `src/store/types.ts`). Don't add uncapped searches.

### Styling

- Use **Tailwind CSS** with the design tokens in `src/styles/globals.css`.
- Dark mode first.
- Only use classes that exist. Animation helpers like `animate-in` need a plugin ([#113](https://github.com/youneedgreg/chessy/issues/113)).
- Keep animations subtle and respect `prefers-reduced-motion`.

```tsx
// ✅ Good: semantic, uses tokens
<div className="bg-bg-secondary text-foreground rounded-lg p-4 transition-opacity duration-150">

// ❌ Bad: arbitrary values, hard-coded colours
<div className="bg-[#242424] text-[#e8e8e8] rounded-[8px] p-[16px]">
```

### File organisation

```
src/app/          # routes (landing, play, review)
src/components/   # React components
src/engine/       # Stockfish service (Web Worker wrapper)
src/hooks/        # React hooks (engine loop, keyboard shortcuts)
src/logic/        # pure chess logic: grading, tactics, explanations, export (no React)
src/store/        # Zustand store and level configuration
```

---

## What to Contribute

### 🎯 High priority

- **Training correctness:** grading, explanations, tactics (#107–#112).
- **Bugs:** best-move arrows (#105), keyboard shortcuts (#116).
- **Tests and CI** (#125, #130).
- **Accessibility and mobile** (#139).

### ✅ Welcome

- Opening content for the Beginner guided openings (#106).
- New tactical patterns, with tests.
- The frontend revamp (#133–#139).
- Multiplayer (#140).
- Documentation improvements.

### 💡 Discuss first

- New training levels
- New dependencies
- Architecture changes
- AI/ML features

---

## What NOT to Contribute

### ❌ Won't be merged

- **User accounts or authentication**
- **Social features** (chat, friends lists, profiles, leaderboards)
- **Gamification** (points, badges, streaks, XP)
- **Ads or tracking** (any analytics must be privacy-focused and opt-in)
- **Paywalls or subscriptions**
- **Heavy animations or flashy effects**
- Features that slow down the first interaction
- Dependencies that significantly increase bundle size without a clear payoff

---

## Architecture Guidelines

### State management

- **Zustand** holds the global game state (`src/store/gameStore.ts`).
- The game is saved in the browser (zustand `persist`); the board is rebuilt from the move list on load.
- Keep state minimal; derive what you can.

### Engine integration

- `engineService` (`src/engine/evaluateMove.ts`) runs one search at a time; newer requests supersede older ones.
- Scores are always from **White's point of view**.
- `bestMove` is the strongest move (used for analysis). `engineMove` is the move the engine chooses to play at the current Skill Level.
- Every search is capped by depth **and** time (`moveTimeMs`).

### Level system

Each level in `LEVELS` defines the engine settings and whether undo is allowed. Feedback rules per level live in `src/app/play/page.tsx`. Prefer config over scattered `if (level === …)` checks.

### Explanation system

Rule-based and deterministic: it maps `(position, move, evaluation, tactics)` to a short explanation. Any future AI explanations must be optional, asynchronous, and fall back to the rule-based version.

---

## Testing

Unit tests run with Vitest: `npm test`. Every pure function in `src/logic` should have
unit tests, especially grading edge cases (mate scores, both colours), tactics detection,
and PGN export. The remaining core suites (`classifyMove`, store `undo`/`redo`/`resign`)
are tracked in [#125](https://github.com/youneedgreg/chessy/issues/125).

Also run `npm run lint`, `npm run type-check` and `npm run build`, and play the affected
flow by hand at every level and as both colours.

---

## Getting Help

- **Questions?** Ask on the issue you're working on, or open a discussion.
- **Found a bug?** Open an issue with the bug template.
- **Security problem?** See [SECURITY.md](./SECURITY.md). Please don't open a public issue.

## Recognition

Every contributor appears in the GitHub contributors list and in the README. Significant contributions are called out in the release notes.

---

This project prioritises **correctness over cleverness** and **speed over features**. Thanks for helping build something that respects both the game and the player.
