# Beanz Arcade Leaderboard — Design Spec

## Goal

Add a shared arcade-style leaderboard to Beanz so players can submit their scores with a 3-character name and see how they rank against others. No user accounts — classic "enter your initials" arcade model.

## Constraints

- Backend: Supabase (Postgres + REST API, direct client access, no middleware)
- Client: `@supabase/supabase-js` from the React Native app
- Auth: Supabase anon key only — no user accounts or login
- Platform: Android + web (same as the existing app)
- Score integrity: accepted risk — no server-side validation in v1

## Database

### Table: `scores`

| Column     | Type         | Notes                          |
|------------|--------------|--------------------------------|
| id         | uuid         | Primary key, `gen_random_uuid()` default |
| name       | text         | 3-character player name (e.g. "ZAP") |
| score      | integer      | Final cumulative score         |
| wave       | integer      | Highest wave reached (1–9)     |
| created_at | timestamptz  | Default `now()`                |

### Row-Level Security (RLS)

RLS is enabled on the `scores` table. Policies:

- **SELECT**: `true` — anyone can read all scores
- **INSERT**: `true` — anyone can insert a score
- **UPDATE**: none — scores cannot be modified
- **DELETE**: none — scores cannot be removed

### Constraints

- `name` must be exactly 3 characters: `CHECK (char_length(name) = 3)`
- `score` is an integer (can be negative)
- `wave` must be between 1 and 9: `CHECK (wave >= 1 AND wave <= 9)`

## Supabase Client Setup

A Supabase client is initialized with the project URL and anon key. These values are stored in a config file (`constants/supabase.ts`) and are safe to embed in the client — the anon key is a public key scoped by RLS policies.

```ts
// constants/supabase.ts
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://<project-ref>.supabase.co';
const SUPABASE_ANON_KEY = '<anon-key>';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

The actual URL and key are populated after creating the Supabase project.

## Score Submission Flow

1. Game ends (game-over or victory) → GameOverPanel appears
2. GameOverPanel shows: final score, wave reached, a 3-character name input (default "AAA"), SUBMIT button, and PLAY AGAIN button
3. Player types a name (uppercased, max 3 chars) and taps SUBMIT
4. App inserts a row into `scores`:
   ```ts
   await supabase.from('scores').insert({ name, score, wave });
   ```
5. On success: navigate to `/leaderboard` with the new score's `id` as a param so it can be highlighted
6. On failure: show a brief inline error ("Could not submit score"), do not block — PLAY AGAIN still works
7. Submitting is optional — player can tap PLAY AGAIN without submitting

## Leaderboard Screen

A new route at `app/leaderboard.tsx`.

### Data

Fetches top 50 scores on mount, ordered by score descending:

```ts
const { data } = await supabase
  .from('scores')
  .select('id, name, score, wave, created_at')
  .order('score', { ascending: false })
  .limit(50);
```

### Display

A vertical list showing rank, name, score, and wave for each entry:

```
LEADERBOARD

 #   NAME   SCORE   WAVE
 1   ZAP    485     9
 2   BEE    320     7
 3   AAA    210     5
```

- If the player just submitted a score, that row is highlighted (matched by `id` from the navigation param)
- If the list is empty, show "NO SCORES YET"
- Loading state: show "LOADING..." while the fetch is in progress
- Error state: show "COULD NOT LOAD SCORES" with a RETRY button

### Navigation

The leaderboard is accessible from:

1. **After score submission** — auto-navigated with the score's `id`
2. **Splash screen** — a "LEADERBOARD" button below "PLAY NOW"

A PLAY AGAIN button at the bottom of the leaderboard navigates back to `/game`.

## Files Changed / Created

### New files
- `beanz-app/constants/supabase.ts` — Supabase client init
- `beanz-app/app/leaderboard.tsx` — Leaderboard screen
- `beanz-app/app/__tests__/leaderboard.test.tsx` — Leaderboard screen tests

### Modified files
- `beanz-app/package.json` — add `@supabase/supabase-js` dependency
- `beanz-app/components/GameOverPanel.tsx` — add name input and SUBMIT button
- `beanz-app/components/__tests__/GameOverPanel.test.tsx` — updated tests
- `beanz-app/app/game.tsx` — pass score submission callback and handle navigation
- `beanz-app/app/index.tsx` — add LEADERBOARD button to splash screen
- `beanz-app/app/__tests__/index.test.tsx` — updated tests

## Out of Scope

- User accounts / authentication
- Server-side score validation (accepted cheating risk)
- Realtime leaderboard updates (pull-on-visit is sufficient)
- Pagination beyond top 50
- Weekly/monthly leaderboard resets
- Friend lists or social features
