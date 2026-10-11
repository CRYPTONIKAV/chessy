# Chessy — Full Audit (2026-10-11)

How this was checked:

- **[RUN]**: reproduced by running the app (production build, headless Chromium) or the toolchain.
- **[CODE]**: found by reading the code, with the reasoning given. Not reproduced at runtime.

Toolchain state: `tsc --noEmit` passes and `next build` passes. `eslint src` reports **17 errors and 37 warnings**. `npm audit` reports **6 vulnerabilities (1 critical)**. There are **no tests**.

Bottom line: the app looks finished, but the core training loop is wrong. Move grades, the eval bar, difficulty levels and "silent/advanced" feedback rules do not work the way the README says they do.

---

## P0: Core features are wrong or the game breaks

### 1. Every evaluation has the wrong sign half the time [RUN]
Stockfish reports scores **from the side to move's point of view**. I ran the same position with White to move and then Black to move: `+6095` and `-6086`. The app treats every score as "positive = White is better".
- `src/logic/classifyMove.ts:56-64`: the eval delta compares a score from the mover's view with a score from the opponent's view. That makes **move grades wrong**, and the error grows as the position gets unbalanced. When you are winning, your best moves get graded as blunders. When you are losing, bad moves get graded "good".
- `EvaluationBar`, the sidebar eval, the review page and PGN `[%eval]` all flip sign every ply.
- **Fix:** in `src/engine/evaluateMove.ts`, convert every score to White's view (negate it when Black is to move). Compute centipawn loss from the mover's view: `loss = before_mover - after_mover`.

### 2. Difficulty levels barely change engine strength [RUN]
`Skill Level` only changes the engine's final `bestmove X` token. The app ignores that token and plays `pv[0]` from the `info` lines instead (`evaluateMove.ts:200-210`). In my test, Skill Level 0 printed `bestmove e2e3`, but the PV move was `d2d4`, and the app would play `d2d4`. `errorProbability` in `LEVELS` is never used. The only real difference between levels is search depth.
- **Fix:** parse the `bestmove` token for the engine's own move. Run analysis (full strength, for grading) and play (weakened) as separate searches, or add your own weakening based on `errorProbability`.

### 3. The engine is far too slow on the higher levels [RUN]
A depth-18 search took **~14.6 s** in headless Chromium. Advanced uses depth 15, and Master/Silent force depth **25** (`useChessEngine.ts:38,53`), so expect very long waits per move. The README's "Engine evaluation < 100ms ✅ Achieved" is false. The bundled engine is Stockfish 10, single-threaded.
- **Fix:** use `go movetime …` or depth caps per level. Consider a modern Stockfish WASM build (multithreaded needs COOP/COEP headers in `next.config.ts`). Show a "thinking…" state.

### 4. The engine can stop responding [CODE]
- `useChessEngine.ts:45` returns early if `isAnalyzing` is true, and the effect only re-runs when the FEN changes. Say you move while the engine is still analysing the previous position (this happens easily at higher depths). The effect for your new position bails out, nothing re-triggers it, and **the computer never replies**.
- `evaluateMove.ts:226-240`: `evaluate()` sends `stop` and then installs the new callback. The `bestmove` from the *old* search then resolves the *new* promise with stale or empty data, and the old promise never resolves.
- **Fix:** build a proper request queue or ID system in the engine service (wait for the old `bestmove` before starting a new search). Don't gate on a stale `isAnalyzing` closure.

### 5. You can move the engine's pieces and move "in the past" [CODE]
- `onDrop` and `makeMove` (`play/page.tsx:95`, `gameStore.ts:189`) never check whose turn it is against `orientation`, and react-chessboard lets you drag both colours. You can move the engine's pieces, and the engine's queued `setTimeout` move then fights with yours.
- While browsing history (`currentMoveIndex !== -1`), the board shows an old position but moves are applied to the live game.
- **Fix:** only allow moves when `turn === orientation[0]`, no engine move is pending, and the board is showing the live position. Use the board's piece-drag permission option.

### 6. Feedback is shown for the computer's moves [CODE]
Analysis runs after **every** ply (`useChessEngine.ts:69-120`). About 0.7 s after your move is graded, `lastMoveAnalysis` is overwritten with the grade of the **engine's** reply. The sidebar panel, the overlay badge, the mistakes list and the review then show engine moves as "Your Move".
- **Fix:** only grade and store the human player's moves (or tag each move with its colour and filter on it).

### 7. Silent and Advanced modes leak feedback [CODE]
`<MoveFeedbackOverlay />` is rendered unconditionally (`play/page.tsx:292`). It shows an instant grade badge in Silent, Master and Advanced, and even with the "Silent Mode" toggle on. That breaks the "delayed feedback" (Advanced) and "zero feedback" (Silent) promises.

### 8. Undo/redo can crash the game [CODE]
- `makeMove` never clears `redoStack`. After Undo → a new move → Redo, `redoMove` replays a move that is now illegal. chess.js 1.x throws on that, which is an uncaught exception (`gameStore.ts:291-292`).
- `resetGame` doesn't clear `redoStack`, `currentMoveIndex` or `lastEvaluation`.
- In player-vs-engine, Undo removes one ply, so the engine immediately replays its move. Undo should remove a full move pair.

### 9. There is no New Game button [CODE]
`handleReset` exists (`play/page.tsx:127`) but is never rendered. There is no resign, draw offer or "play again" either. When a game ends, the only way to start another is a page reload.

### 10. The review page is broken and unreachable [CODE]
- Nothing links to `/review`.
- State lives only in memory (no persistence), so opening or refreshing `/review` shows an empty game.
- `currentMoveIndex = -1` means "live position" in `/play` but "start position" in `/review`. The two pages share the store, so each one corrupts the other's view.
- `review/page.tsx:166`: Prev can go to index `-2`.
- Ctrl+Z / Ctrl+Y on the review page call `undoMove` / `redoMove` and **change the actual game**.
- "Space = Explanation" is listed in the shortcuts but not implemented.

### 11. The post-game modal traps the user [CODE]
In `PostGameReview.tsx:99`, selecting any move opens `ExplanationDrawer`: fixed position, `z-index: 1000`, white, 400 px wide. Its `onClose` does nothing, so it **cannot be dismissed** and covers the analysis. The modal also isn't scrollable on small screens and uses a white theme unlike the rest of the app.

### 12. Fake data ships in production [CODE]
`GameSummary.tsx` has "Simulate Analysis" and "Load Demo Game" buttons. They **overwrite real analysis with random grades**. It also shows "**Draw Won**" when `result` is `null`.

---

## P1: Broken UI and styling

13. **The theme colours don't exist [RUN].** `globals.css` never defines `primary` or `secondary`. I checked the built CSS: `.bg-primary`, `.text-primary`, `.border-primary`, `.glass`, `.text-gradient` are **not generated**. Visible effects:
    - The "Begin Training" CTA has no background.
    - The selected level card and the selected "Play as" colour are barely distinguishable.
    - The ✓ badge is black on transparent.

    Also undefined: `shadow-glow`, `scale-102` and `text-primary-foreground`. The `animate-in` / `fade-in` / `slide-in-*` / `zoom-in` animation classes (the `tailwindcss-animate` plugin isn't installed) generate nothing either. `bg-accent` exists, but `PostGameReview` and the review page use the undefined ones.
14. **Class names broken by a bad auto-format [RUN].** Examples: `flex - 1 cursor - pointer`, `font - bold`, `toggle - label …`, `width: …% ` (`play/page.tsx:392,431,437,453,462`). The whole `<style jsx global>` block is mangled (`.nav - btn`, `border - radius`, `cursor: not - allowed`), so the nav, undo and redo buttons are unstyled and the scrollbar styling is dead.
15. **Best-move arrow is invisible for straight moves [RUN].** At the start, the suggested `d2d4` showed only the pulsing dot, with no arrow. Cause: `filter="url(#arrow-glow)"` on a vertical or horizontal `<line>` has a zero-width bounding box, so the filter region is empty. Other arrow problems:
    - The arrowhead marker is tiny.
    - The arrow overlay ignores `boardOrientation`, so arrows land on the **wrong squares when playing Black**.
    - Arrows show the live best move even while browsing history, and briefly show the engine's own planned move.
    - **Fix:** react-chessboard v5 supports arrows natively, so drop the custom SVG.
16. **No promotion choice.** Promotions always make a queen (`makeMove` defaults to `'q'`).
17. **Click-to-move:**
    - You can select empty squares and opponent pieces.
    - Clicking another of your own pieces doesn't switch the selection.
    - Legal-move dots appear only on hover, so touch devices get none.
18. **Keyboard hook (`useKeyboardShortcuts.ts`):**
    - It calls `preventDefault` globally on arrow keys and Space. That kills page scrolling, Space-to-press on focused buttons, and keyboard use of the Level `<select>` (SELECT isn't excluded).
    - "Game Start" (↑) goes to after move 1, not the starting position.
19. **Move counter.** It shows `history.length / 2`, which gives values like "0.5 Moves".
20. **Mistake cards (`MistakeCard.tsx`):**
    - "Position Before Move" actually shows the position *after* the move.
    - The best move is shown in UCI (`e2e4`), not SAN.
    - The board is always White-oriented.
    - Each card mounts a full chessboard.
21. **Level mismatch.** The landing page offers 4 levels, the in-game select offers 5 (adds Silent), and the README describes 4 different ones. The level descriptions also disagree across the landing page, `LEVELS` and the README.
22. **Accessibility:**
    - Level cards are `div`s with `onClick`, so they can't be reached by keyboard.
    - The « ‹ › » buttons have no `aria-label`.
    - Emoji-only grade icons.
    - The toggles are styled checkboxes without proper labels.
23. **Mobile:**
    - The sidebar is fixed at `h-[35vh]`.
    - The eval bar is hidden below `md`.
    - Hover-only move hints.
    - The post-game modal uses a fixed `w-80 h-[400px]` panel.

## P1: The training "brain" is mostly placeholder

24. **Explanations are generic noise (`explanations.ts:372-375`).** `matchPrinciples` returns *every* principle for the phase, regardless of the move. Every middlegame move gets the same 43 bullet points. Other problems:
    - The piece is looked up on the from-square *after* the move (`play/page.tsx:204`, `useChessEngine.ts:95`), so it is always empty and the "don't move the queen early" rule never fires.
    - The summary thresholds (±100 cp) disagree with the grade thresholds, so you can see "Blunder" next to "This move was solid".
    - Explanations are generated from the current game, not from the position at that move.
25. **Tactics detection is wrong (`tactics.ts`).** chess.js only generates moves for the side to move. As a result:
    - Defenders are always counted as 0, so *every* attacked piece is flagged "hanging".
    - `double_check` never triggers, and `back_rank` effectively never does.
    - "pin" means "any piece with no legal moves", so it fires constantly in the opening.
    - Fork, skewer and discovered attack are never detected.
    - It is also slow: a new `Chess()` per piece per square, on the main thread.
26. **Grading scheme.**
    - "Brilliant" just means "the engine's top move and +50 cp", which is not what players mean by it.
    - There are no best/excellent/book tiers.
    - Mate scores are ±10000, which makes deltas absurd.
27. **Opening detection.** It matches exact move order only, so transpositions are missed. There are about 33 lines and no ECO codes.
28. **PGN export (`export.ts`):**
    - It writes `[%eval M3]` instead of `[%eval #3]`, and drops the mate sign.
    - Evals flip sign every ply (see #1).
    - It adds `!` (`$1`) to every "good" move.
    - Unfinished games get no `*` terminator, which makes the PGN invalid.

---

## P2: Code health and cleanup

29. **Lint: 17 errors.** These are `any`, `require()` inside components, unescaped quotes, and setState-in-effect. ESLint also lints `public/stockfish.js` (2,628 problems), so add it to `globalIgnores`.
30. **Console spam.** There are `console.log` calls in render and on every move (`play/page.tsx:72,155,157`, `gameStore.ts` throughout, `useChessEngine.ts`).
31. **Missing import.** `play/page.tsx:13` imports `./play.module.css`, which doesn't exist. The build only passes because the import is unused. Remove it.
32. **Dead or duplicate code:**
    - `src/state/levelConfig.ts`: a second, conflicting level system with a "Professional" level.
    - `src/engine/stockfish.worker.ts`: never used.
    - `src/components/Review/ShortcutsModal.tsx`: duplicates `components/ShortcutsModal.tsx`.
    - `createTacticalArrows` and `getOpeningInfo` are unused.
    - `gameMode` 'pvp'/'analysis', `autoQueen` and `showLegalMoves` exist in the store but are never wired up.
    - `mistakes[]` duplicates what is already stored in `history[].analysis`.
    - Stub READMEs sit in `src/lib`, `src/state`, `src/styles` and others.
    - Default Next.js SVGs are still in `public/`.
33. **The debug page is public.** `/test-engine` ships to production.
34. **Store design.** A mutable `Chess` instance is kept in Zustand. Derive it from FEN plus history instead, and persist the game (zustand `persist`) so refresh and the review page work.

## Security and infrastructure

35. **Critical:** `next@16.1.1` has a critical advisory, and postcss, sharp and nanoid have high ones. Upgrade to `next@16.4.0` or later (fix confirmed available via `npm audit`).
36. **Workflow injection: `.github/workflows/summary.yml`.** It puts `${{ steps.inference.outputs.response }}` directly inside a shell `run:` string. Anyone who opens an issue can steer the AI output to break out of the quotes and run commands with an `issues: write` token. Use the already-defined env var instead: `--body "$RESPONSE"`.
37. **`label.yml` fails on every PR.** `actions/labeler` needs a `.github/labeler.yml` file, which doesn't exist.
38. **Docker.** I couldn't test this because Docker isn't available here. `docker-compose.yml` runs `npm run dev` inside the *runner* stage, which was installed with `npm ci --omit=dev`, so TypeScript and `@tailwindcss/postcss` are missing and dev mode will most likely fail. Other problems:
    - The image runs as root.
    - It doesn't use `output: 'standalone'`.
    - The README claims "static export", but that isn't configured.
39. **No CI and no tests.** Add a workflow that runs `lint`, `type-check` and `build`. Add unit tests for `classifyMove`, `tactics`, `export` and `openings`, and one Playwright smoke test that plays a few moves.

## Docs

40. **The README overstates the project.** It says React 18 (the project uses 19). The performance table says "✅ Achieved", and the eval target is false (#3). It mentions static export, and says Intermediate has "limited undo" when it actually has unlimited undo. Features are ticked as done even though they are broken (#1, #6, #7, #10, #15). `task.md` is stale and contradicts the README.

---

## Recommended order of work

1. Engine service rewrite (#1–#4): score normalisation, request queue, `bestmove` parsing, time limits.
2. Game flow (#5–#9, #16): turn guard, grade only the human's moves, overlay respects level, undo/redo/reset fixes, New Game, promotion picker.
3. Theme and styling (#13–#15): define the colour tokens, fix the mangled classes, use native arrows.
4. Review flow (#10–#12, #20, #34): persistence, a link from the game-over screen, a separate review index, remove the fake-data buttons.
5. Training brain (#24–#28): real tactic detection, move-specific explanations, correct PGN.
6. Security and infra (#35–#39), then polish (#17–#23), cleanup (#29–#33) and docs (#40).

## Done in this change

- Renamed "Gala Chess" to "Chessy" on the landing page (`src/app/page.tsx`).
- Changed the browser tab title from "Chess Training Platform" to "Chessy" (`src/app/layout.tsx`).
