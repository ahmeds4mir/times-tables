# Chapter Mini-Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a shared mini-game kit and assign a different game to every lesson level across all 10 chapters without changing math generators.

**Architecture:** `js/minigames.js` registers plug-ins (`mount`/`destroy`). `Adventure` in `js/engine.js` mounts the level’s game into `#mgHost` for choice questions; column questions keep the keypad. Chapters 1–2 call the same kit from their battle/play screens. Themes are CSS classes on the play section.

**Tech Stack:** Vanilla JS IIFE modules, existing `css/engine.css` patterns, service worker cache bump.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-10-18-chapter-minigames-design.md`
- Portrait phone only; no overflow at 360×640
- No mid-level game over; timers only on `pop` / soft rival on `race`
- Column/`type:'column'` questions keep digit pad
- Arabic + English via `api.tx` / `Profile.strings`
- Never edit UTF-8 with PowerShell Set-Content
- Commit only when asked (unless this plan’s commit steps are being executed by the user-approved build)

---

## File map

| File | Role |
|---|---|
| `js/minigames.js` | Kit: `MiniGames.mount`, `destroy`, game registry |
| `css/minigames.css` | Layouts for all 10 games + theme tokens |
| `js/engine.js` | Resolve `level.game`, mount host, level state for connect/reveal |
| `js/chapter1.js` | Per-level `game` + mount in battle |
| `js/chapter2.js` | Per-level `game` + mount in play |
| `js/chapters/ch3.js`…`ch10.js` | Add `game` string per lesson level |
| `index.html` | Link CSS + script before engine |
| `sw.js` | CACHE v8 + new files in APP_FILES |

---

### Task 1: MiniGames shell + choice / pop / door

**Files:**
- Create: `js/minigames.js`, `css/minigames.css`
- Modify: `index.html` (link both), `sw.js` (list files; bump later in Task 5)

**Interfaces:**
- Produces: `window.MiniGames = { mount(host, id, q, api), destroy(), labels }`
- `api` must include: `{ lang, N, tx, label(q,v), answer(value), locked(), choices }` where `answer(v)` calls engine resolve

- [ ] **Step 1:** Create `css/minigames.css` with `.mg-host`, `.mg-chip`, `.mg-pop`, `.mg-door`, `.mg-balloon`, basic animations
- [ ] **Step 2:** Create `js/minigames.js` IIFE with `choice`, `pop`, `door` plug-ins
- [ ] **Step 3:** Add script/link to `index.html` before `engine.js`
- [ ] **Step 4:** Manual check: open ch3 in browser, temporarily hardcode `game:'pop'` in engine path after Task 2

**choice:** same 4 buttons as today.  
**pop:** 4 floating balloons with choice values; tap correct → `api.answer(v)`; wrong balloons shake.  
**door:** 3 doors; values hidden or shown as small labels; pick door → answer.

---

### Task 2: Wire Adventure engine

**Files:**
- Modify: `js/engine.js` (`renderPlay`, `resolve`, `startLevel`, `next`)

**Interfaces:**
- Consumes: `MiniGames.mount` / `destroy`
- Level field: `L.game` string; mixed level: `api.pick(L.games || [L.game])` stored on `st.game`

- [ ] **Step 1:** In `startLevel`, set `st.game` from level (`mixed` → random from `L.games` array or chapter games list)
- [ ] **Step 2:** In `renderPlay`, if `q.type==='column'` keep keypad; else create `<div id="mgHost" class="mg-host">` and `MiniGames.mount(...)`
- [ ] **Step 3:** Show chip with game label in `.adv-top`
- [ ] **Step 4:** On `next` / leave play, `MiniGames.destroy()`
- [ ] **Step 5:** Pass `api.answer = (v) => resolve(v===q.answer)` and disable double-taps via `st.locked`

---

### Task 3: Remaining games (memory, connect, reveal, lucky, sort, duel, race)

**Files:**
- Modify: `js/minigames.js`, `css/minigames.css`
- Modify: `js/engine.js` — `st.mg` persistent object per level for connect grid + reveal tiles

**Game behavior (implement exactly):**

| id | Behavior |
|---|---|
| memory | 3 pairs (current fact+answer + 2 related from choices); match current pair → correct; other pairs clear; mismatch flip back |
| connect | 4×4 / 5-col slot board in `st.mg.grid`; correct drops player token; wrong drops rival ghost; visual only across Qs |
| reveal | 3×3 tile cover over theme emoji in `st.mg.revealed`; each correct removes 1–2 tiles |
| lucky | 3 boxes; pick one (sets flavor), then show choices; correct applies flavor text (stars/turbo/oops) |
| sort | Two buckets (✓ / ✗); drag or tap a choice then tap bucket; only correct value in ✓ succeeds |
| duel | Hero/rival meters; choices as attack buttons; correct hits rival; wrong hits hero (visual only) |
| race | Choices + slim rival bar that creeps; correct boosts hero (reuse race mech numbers if present) |

- [ ] **Step 1:** Implement memory + CSS
- [ ] **Step 2:** Implement connect + reveal with `st.mg` via `api.mg`
- [ ] **Step 3:** Implement lucky, sort, duel, race
- [ ] **Step 4:** Browser-smoke each id with a forced `st.game`

---

### Task 4: Assign games on all chapters

**Files:**
- Modify each chapter per spec table:

| Ch | games on levels |
|---|---|
| ch1 | duel, memory, pop, connect, reveal, lucky, duel(boss) |
| ch2 | door, sort, pop, memory |
| ch3 | pop, sort, memory, lucky + `games:[...]` on mixed |
| ch4 | door, connect, memory, reveal |
| ch5 | sort, pop, door, connect |
| ch6 | reveal, memory, sort, race |
| ch7 | race, pop, door, duel |
| ch8 | sort, door, pop, lucky |
| ch9 | reveal, memory, door, race |
| ch10 | sort, connect, memory, duel |

- [ ] **Step 1:** Add `game:` to each lesson in `ch3`…`ch10`; engine auto-mixed appends level with `games: [...]` from those four
- [ ] **Step 2:** Chapter1 LEVELS array + `renderBattle` uses MiniGames
- [ ] **Step 3:** Chapter2 levels + play screen uses MiniGames (clock UI stays for set-clock missions; use game when answering choice missions)

**Ch2 note:** When mission `mode==='set'` (drag clock hands), keep clock UI (no mini-game). When mission is multiple-choice time, mount the level’s game.

---

### Task 5: Cache, test, commit

**Files:**
- Modify: `sw.js` → `CACHE = 'times-tables-v8'`, add `css/minigames.css`, `js/minigames.js`

- [ ] **Step 1:** Bump SW
- [ ] **Step 2:** Test ch1, ch2, ch3, ch7, ch10 at 360×640 ar+en — no overflow, no console errors
- [ ] **Step 3:** Commit + push + download APK when user wants install

---

## Spec coverage check

- Kit of 10 games → Tasks 1 + 3  
- Per-level mix all chapters → Task 4  
- Column exception → Task 2  
- Themes/skins → CSS theme class `theme-{cfg.id}` in Task 2  
- Fairness (no hard fail) → all games only call `answer`, never end level early  
- SW bump → Task 5
