# Chapter Mini-Games Variety — Design Spec

**Date:** 2026-10-18  
**Status:** Ready for file review  
**Goal:** Stop repetitive quiz feel across all 10 chapters by giving every level a distinct mini-game style, while keeping the same Egyptian grade-3 math content.

---

## Decisions (locked)

| Decision | Choice |
|---|---|
| Variety type | Unique world theme **and** signature mini-games |
| Rollout | All 10 chapters in one update |
| Level structure | Mix mini-games **inside** each chapter (different game per level) |
| Architecture | Shared mini-game kit + chapter themes/skins |
| Math content | Unchanged — same generators / lessons / Ask Mom |

---

## Problem

Chapters 3–10 share only five progress scenes (`path`, `fill`, `climb`, `build`, `race`), and three of those are reused. Answering is almost always the same multiple-choice / column pad loop. Kids get bored fast.

## Solution

A shared **mini-game kit** (~10 plug-ins). Each level declares which game to use. Chapters keep their own questions and a theme skin. Progress scenes stay as the world backdrop; the mini-game is how the child answers.

---

## Mini-game kit

| Id | Name | How it works | Pressure |
|---|---|---|---|
| `choice` | Choice | Classic multiple choice (calm baseline) | none |
| `pop` | Pop | Correct-answer balloons float — tap the right one | light timer / float away |
| `door` | Door | 3 doors/paths — only one is safe | none |
| `memory` | Memory | Flip pairs: fact ↔ answer (6–8 cards) | none |
| `connect` | Connect | Correct answer drops a coin; aim for 4-in-a-row | none |
| `reveal` | Reveal | Correct answers peel tiles off a mystery picture | none |
| `lucky` | Lucky | Pick a box → answer → stars / turbo / funny oops | none |
| `sort` | Sort | Drag cards into the correct bucket | none |
| `duel` | Duel | Hero vs silly rival; right answer advances | none |
| `race` | Race | Beat rival progress bar (existing ch7 feel) | soft rival pace |

### Fairness rules (grade 3)

- No mid-level “game over.”
- Timers only where they add fun (`pop`, `race`) — never on `memory`, `sort`, `reveal`, `connect`.
- Memory boards: 6–8 cards max.
- Connect: about 4–5 correct drops fit an ~8-question level.
- Portrait phone, no scrolling; tested at 360×640 and 360×740.
- Arabic + English; Egyptian dialect where the app already uses it.

---

## Chapter map

Level counts today: **Ch1 = 7** (6 lessons + boss), **Ch2 = 4**, **Ch3–10 = 4 lessons + 1 mixed**.  
Each chapter: unique theme + **different game per lesson level** (no two consecutive lessons share a game). Every kit game appears in at least 3 chapters.

| Ch | Theme | Backdrop | Lesson games (in order) | Mixed / boss |
|---|---|---|---|---|
| 1 | Monster arena | battle UI (kept) | duel, memory, pop, connect, reveal, lucky | duel (boss) |
| 2 | Busy day / clocks | day story UI (kept) | door, sort, pop, memory | — |
| 3 | Candy party | `fill` | pop, sort, memory, lucky | random from chapter set |
| 4 | Pirate treasure | `path` | door, connect, memory, reveal | random from chapter set |
| 5 | River builders | `build` | sort, pop, door, connect | random from chapter set |
| 6 | Balloon sky | `climb` | reveal, memory, sort, race | random from chapter set |
| 7 | Fox race track | `race` | race, pop, door, duel | random from chapter set |
| 8 | Delivery trucks | `fill` | sort, door, pop, lucky | random from chapter set |
| 9 | Space climb | `climb` | reveal, memory, door, race | random from chapter set |
| 10 | Robot factory | `build` | sort, connect, memory, duel | random from chapter set |

Mixed / “big challenge” (ch3–10) picks a **random game from that chapter’s four** (not a new 11th style).

---

## Kid experience

1. Chapter map → lesson card (rule + example) → Play.  
2. Play screen shows a chip with the mini-game name/emoji.  
3. World backdrop still reacts to correct answers.  
4. Question is answered through that level’s mini-game.  
5. Wrong → gentle hint / show answer (same tone as today) → continue.  
6. End → stars + praise + next level.

### Unchanged

- Stars, save keys, home, language, sound.  
- Chapter 1 Ask Mom lessons.  
- Question generators and curriculum coverage.

---

## Technical design

### New files

- `js/minigames.js` — kit registry and plug-ins  
- `css/minigames.css` — shared layouts + per-theme tokens  

### Plug-in shape

Each game exposes:

```js
{
  id, label: { ar, en },
  mount(hostEl, question, api),  // draw UI; call api.answer(value) or api.correct()/wrong()
  destroy(),                     // clear timers / listeners
}
```

`api` supplies: `N`, `tx`, `opts`, `onResult(correct)`, sounds, hero/rival helpers, and the current question’s `answer` / `choices` / prompt HTML.

**Column / typed questions** (`type: 'column'` in ch4/ch10): keep the existing digit pad. The level’s mini-game still wraps the *prompt/scene* (chip + themed chrome), but answer input stays the column pad — do not force Memory/Pop onto typed answers. `choice` is the fallback UI when a plug-in cannot represent the question.

### Engine integration

- `js/engine.js`: each level may set `game: '<id>'`. Play screen mounts the plug-in in the answer region; scene strip stays above.  
- `js/chapter1.js` / `js/chapter2.js`: keep special story/battle chrome; rotate kit games for answering.  
- `js/chapters/ch3.js` … `ch10.js`: add `game` on each level; keep existing `gens` / `mech`.  
- `sw.js`: cache bump when shipping.

### Themes

CSS variables / backdrop class per chapter (`mech-*` plus `theme-chN`). Games share layout; emoji and colors come from the chapter theme so Memory in space ≠ Memory at the candy party.

### Build order (single update)

1. Kit shell + `choice` / `pop` / `door` (prove mount/destroy).  
2. `memory`, `connect`, `reveal`, `lucky`, `sort`.  
3. `duel` + `race` polish.  
4. Wire all 10 chapter level maps + themes.  
5. Phone test every chapter (ar/en, 360×640) → commit → APK.

---

## Success criteria

- No two consecutive levels in a chapter use the same `game`.  
- Every kit game used in ≥ 3 chapters.  
- No layout overflow at 360×640.  
- Answers still match current generators (spot-check each chapter).  
- Service worker cache bumped so devices pick up new assets.

## Out of scope

- Multiplayer / online leaderboards.  
- New math topics beyond current chapter generators.  
- Replacing Ask Mom animations.  
- Desktop-only layouts.

---

## Open points (resolved in conversation)

- Variety = scenes + mini-games.  
- Ship all 10 chapters together.  
- Mix games per level inside a chapter.  
- Shared kit architecture (not fully custom per chapter).
