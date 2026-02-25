# Design Document: Murder Mystery Game

## Overview

The Murder Mystery Game is a web-based social deduction application built with Svelte 5, TypeScript, and a lightweight embedded database. The system manages a week-long game session for exactly 15 players, where one randomly selected murderer attempts to eliminate all other players while maintaining secrecy.

The application features a responsive dark-themed interface displaying player avatars in a flex layout. Players can submit kill records containing victim, location, and time information. These records become visible to all players at daily 8pm updates, triggering visual changes (grayscale filter and information overlay) for eliminated players. The game concludes after seven days with either the murderer winning (all players eliminated) or survivors winning (at least one player remains).

Key technical characteristics:
- Single-page application with client-side state management
- Embedded SQLite database for persistence (via better-sqlite3)
- Time-based visibility logic for kill records
- Responsive flex layout adapting to all device sizes
- Avatar images fetched from pravatar.cc API
- Dark mystical Victorian detective theme

## Architecture

### High-Level Architecture

The application follows a layered architecture pattern:

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer (Svelte)           │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Game Board   │  │  Kill Form Modal         │ │
│  │ Component    │  │  Component               │ │
│  └──────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│          Application Logic Layer                │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Game State   │  │  Visibility Manager      │ │
│  │ Manager      │  │  (8pm update logic)      │ │
│  └──────────────┘  └──────────────────────────┘ │
│  ┌──────────────┐  ┌──────────────────────────┐ │
│  │ Player       │  │  Win Condition           │ │
│  │ Manager      │  │  Evaluator               │ │
│  └──────────────┘  └──────────────────────────┘ │
└─────────────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────┐
│            Data Access Layer                    │
│  ┌──────────────────────────────────────────┐   │
│  │   Database Service (better-sqlite3)      │   │
│  │   - Players table                        │   │
│  │   - KillRecords table                    │   │
│  │   - GameState table                      │   │
│  └──────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

### Component Interaction Flow

1. **Game Initialization**: On application load, the system checks if a game exists in the database. If not, it creates 15 players with unique IDs, assigns avatars from pravatar.cc, randomly selects a murderer, and persists to database.

2. **Kill Record Submission**: User clicks "record kill" button → Kill Form Modal opens → User selects victim, enters location and time → Form submits → Data persists to database → UI updates to reflect new record (if past 8pm).

3. **Daily Visibility Update**: On page load or at 8pm, the Visibility Manager calculates which kill records should be visible based on submission time and current time. Only records submitted before the most recent 8pm are displayed.

4. **Visual State Rendering**: For each player, the system checks if they have a visible kill record. If yes, apply grayscale filter and overlay kill information. If no, display in full color.

5. **Win Condition Check**: At game end (7 days from start), evaluate if all 14 non-murderer players have kill records (murderer wins) or if at least one survivor remains (survivors win).

### Technology Decisions

**Frontend Framework**: Svelte 5
- Reactive state management with runes ($state, $derived, $effect)
- Minimal bundle size for fast loading
- Built-in transitions for smooth UI updates

**Type Safety**: TypeScript
- Compile-time type checking for data models
- Enhanced IDE support and refactoring safety
- Explicit interfaces for all data structures

**Database**: better-sqlite3
- Embedded SQLite database (no separate server needed)
- Synchronous API suitable for single-user application
- ACID compliance for data integrity
- File-based persistence

**Styling**: CSS with CSS Variables
- Dark theme implemented via CSS custom properties
- Responsive flex layout with media queries
- Grayscale filter applied via CSS filter property

**Build Tool**: Vite (standard with Svelte)
- Fast development server with HMR
- Optimized production builds
- TypeScript support out of the box

## Components and Interfaces

### Core Components

#### 1. GameBoard Component
**Responsibility**: Main container displaying all 15 player avatars in responsive grid

**Props**: None (reads from global game state)

**State**:
- `players`: Array of Player objects
- `visibleKillRecords`: Array of KillRecord objects visible after most recent 8pm update
- `currentTime`: Reactive timestamp for visibility calculations

**Methods**:
- `loadGameState()`: Fetches players and kill records from database
- `refreshVisibility()`: Recalculates which kill records should be visible
- `openKillForm(playerId: string)`: Opens kill form modal for specific player

**Rendering Logic**:
- Iterate through 15 players
- For each player, check if they have a visible kill record
- Apply grayscale filter and overlay if killed
- Display full color avatar if alive

#### 2. PlayerAvatar Component
**Responsibility**: Displays individual player avatar with conditional styling and kill information

**Props**:
```typescript
interface PlayerAvatarProps {
  player: Player;
  killRecord: KillRecord | null;
  onRecordKill: () => void;
}
```

**Rendering**:
- Avatar image from pravatar.cc
- Conditional grayscale filter based on killRecord presence
- Overlay box with kill time and location if killed
- "Record Kill" button (visible to all users)

#### 3. KillFormModal Component
**Responsibility**: Modal form for submitting kill records

**Props**:
```typescript
interface KillFormModalProps {
  isOpen: boolean;
  players: Player[];
  onSubmit: (record: KillRecordInput) => void;
  onClose: () => void;
}
```

**Form Fields**:
- Victim selector (dropdown of 15 player names)
- Location input (text field)
- Kill time input (datetime-local input)

**Validation**:
- All fields required
- Kill time must be valid timestamp
- Location must be non-empty string

**Submission**:
- Calls `onSubmit` with form data
- Parent component handles database persistence
- Modal closes on successful submission

#### 4. GameOutcome Component
**Responsibility**: Displays win condition results at game end

**Props**:
```typescript
interface GameOutcomeProps {
  gameEnded: boolean;
  murdererWon: boolean;
  murdererName: string;
  survivors: Player[];
}
```

**Rendering**:
- Only visible when `gameEnded` is true
- Shows murderer identity
- Lists survivors or declares murderer victory
- Styled with dramatic dark theme elements

### Service Layer Interfaces

#### DatabaseService
**Responsibility**: Abstracts all database operations

```typescript
interface DatabaseService {
  // Game initialization
  initializeGame(): GameState;
  getGameState(): GameState | null;
  
  // Player operations
  createPlayers(count: number): Player[];
  getPlayers(): Player[];
  getPlayerById(id: string): Player | null;
  setMurderer(playerId: string): void;
  
  // Kill record operations
  createKillRecord(record: KillRecordInput): KillRecord;
  getKillRecords(): KillRecord[];
  getKillRecordsByVisibility(cutoffTime: Date): KillRecord[];
  
  // Utility
  close(): void;
}
```

#### VisibilityManager
**Responsibility**: Calculates which kill records should be visible based on 8pm daily update rule

```typescript
interface VisibilityManager {
  // Calculate most recent 8pm timestamp
  getMostRecent8pm(currentTime: Date): Date;
  
  // Filter kill records by visibility
  getVisibleRecords(
    allRecords: KillRecord[],
    currentTime: Date
  ): KillRecord[];
  
  // Check if a specific record should be visible
  isRecordVisible(
    record: KillRecord,
    currentTime: Date
  ): boolean;
}
```

#### WinConditionEvaluator
**Responsibility**: Determines game outcome based on kill records and game duration

```typescript
interface WinConditionEvaluator {
  // Check if game week has ended
  isGameEnded(gameStartTime: Date, currentTime: Date): boolean;
  
  // Evaluate win conditions
  evaluateWinCondition(
    players: Player[],
    killRecords: KillRecord[],
    murdererId: string
  ): WinCondition;
}

interface WinCondition {
  gameEnded: boolean;
  murdererWon: boolean;
  survivors: Player[];
}
```

## Data Models

### Player
```typescript
interface Player {
  id: string;              // UUID v4
  name: string;            // Player name (e.g., "Player 1")
  avatarUrl: string;       // pravatar.cc URL
  isMurderer: boolean;     // True for the selected murderer
}
```

**Database Schema**:
```sql
CREATE TABLE players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  is_murderer INTEGER NOT NULL DEFAULT 0
);
```

### KillRecord
```typescript
interface KillRecord {
  id: string;              // UUID v4
  victimId: string;        // Foreign key to Player.id
  location: string;        // Kill location (free text)
  killTime: Date;          // When the kill occurred
  submittedAt: Date;       // When the record was submitted
}
```

**Database Schema**:
```sql
CREATE TABLE kill_records (
  id TEXT PRIMARY KEY,
  victim_id TEXT NOT NULL,
  location TEXT NOT NULL,
  kill_time INTEGER NOT NULL,  -- Unix timestamp
  submitted_at INTEGER NOT NULL, -- Unix timestamp
  FOREIGN KEY (victim_id) REFERENCES players(id)
);
```

### GameState
```typescript
interface GameState {
  id: string;              // Single row with fixed ID
  startTime: Date;         // Game start timestamp
  murdererId: string;      // Foreign key to Player.id
}
```

**Database Schema**:
```sql
CREATE TABLE game_state (
  id TEXT PRIMARY KEY,
  start_time INTEGER NOT NULL,  -- Unix timestamp
  murderer_id TEXT NOT NULL,
  FOREIGN KEY (murderer_id) REFERENCES players(id)
);
```

### Form Input Types
```typescript
interface KillRecordInput {
  victimId: string;
  location: string;
  killTime: Date;
}
```

### Derived State Types
```typescript
interface PlayerWithKillInfo {
  player: Player;
  killRecord: KillRecord | null;
  isVisible: boolean;
}
```


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Game initialization creates exactly 15 players

For any game initialization, the system should create exactly 15 players with unique identifiers.

**Validates: Requirements 1.1, 1.3**

### Property 2: All avatar URLs reference pravatar.cc

For any player created by the system, the avatar URL should contain "pravatar.cc" as the domain.

**Validates: Requirements 1.4**

### Property 3: Player rendering produces 15 avatar elements

For any game state with 15 players, rendering the game board should produce exactly 15 avatar elements in the output.

**Validates: Requirements 1.2**

### Property 4: Exactly one murderer is selected

For any game initialization, exactly one player should have isMurderer set to true, and all other players should have isMurderer set to false.

**Validates: Requirements 2.1**

### Property 5: Murderer identity persistence round-trip

For any game state, storing the murderer identity to the database and then retrieving it should return the same murderer ID.

**Validates: Requirements 2.2**

### Property 6: Murderer visual indistinguishability

For any player, the rendered avatar structure should be identical regardless of whether the player is the murderer or not (excluding kill record overlays).

**Validates: Requirements 2.3**

### Property 7: Each player has a record kill button

For any game state with 15 players, rendering should produce exactly 15 "record kill" buttons, one associated with each player.

**Validates: Requirements 3.1**

### Property 8: Kill form displays on button interaction

For any player, triggering the "record kill" button handler should result in the kill form modal state changing to open.

**Validates: Requirements 3.2**

### Property 9: Kill form contains all player options

For any game state with 15 players, the kill form victim selector should contain exactly 15 options corresponding to all players.

**Validates: Requirements 3.3**

### Property 10: Kill form validates required location

For any kill form submission with empty or whitespace-only location, the form validation should reject the submission.

**Validates: Requirements 3.4**

### Property 11: Kill form validates required kill time

For any kill form submission without a kill time value, the form validation should reject the submission.

**Validates: Requirements 3.5**

### Property 12: Kill record persistence round-trip

For any valid kill record input, submitting the record and then querying the database should return a kill record with the same victim ID, location, and kill time.

**Validates: Requirements 3.6, 4.1**

### Property 13: Kill records reference valid players

For any kill record in the database, the victim ID should correspond to an existing player ID in the players table.

**Validates: Requirements 4.2**

### Property 14: Kill records contain all required fields

For any kill record persisted to the database, the record should contain non-null values for victim ID, location, kill time, and submission timestamp.

**Validates: Requirements 4.3**

### Property 15: Kill record retrieval completeness

For any set of kill records stored in the database, loading the game state should retrieve all stored kill records without loss.

**Validates: Requirements 4.4**

### Property 16: Visibility cutoff at most recent 8pm

For any kill record and current time, the record should be visible if and only if it was submitted before the most recent 8pm relative to the current time.

**Validates: Requirements 5.1, 5.2**

### Property 17: Grayscale filter applied for visible kill records

For any player, the rendered avatar should have a grayscale filter applied if and only if that player has a visible kill record.

**Validates: Requirements 5.4, 6.1, 6.2**

### Property 18: Kill information overlay for visible records

For any player with a visible kill record, the rendered avatar should include an overlay containing the kill time and kill location from that record.

**Validates: Requirements 5.5, 6.3**

### Property 19: Visual state persistence across reloads

For any game state, the visual state of all player avatars (grayscale and overlays) should be identical before and after a page reload, given the same current time.

**Validates: Requirements 6.4**

### Property 20: Game duration is exactly seven days

For any game start time, the calculated game end time should be exactly 168 hours (7 days × 24 hours) after the start time.

**Validates: Requirements 7.1**

### Property 21: Win condition evaluation

For any game state at game end:
- If all 14 non-murderer players have kill records, the murderer should be declared the winner
- If at least one non-murderer player has no kill record, the survivors should be declared the winners

**Validates: Requirements 7.2, 7.3**

### Property 22: Game outcome display on completion

For any game state where the game has ended, the rendered output should include the game outcome component showing the winner determination.

**Validates: Requirements 7.4**

### Property 23: Text contrast meets WCAG standards

For any text element rendered against a dark background, the contrast ratio should meet WCAG AA standards (minimum 4.5:1 for normal text, 3:1 for large text).

**Validates: Requirements 9.3**

## Error Handling

### Database Errors

**Connection Failures**: If the SQLite database file cannot be opened or created, the application should display a clear error message and prevent game initialization. This is a fatal error requiring user intervention.

**Constraint Violations**: If a kill record references a non-existent player ID (foreign key violation), the database operation should fail and return an error. The UI should display a user-friendly message indicating the submission failed.

**Disk Space Issues**: If the database cannot write due to insufficient disk space, the operation should fail gracefully with an error message. The application should continue to function in read-only mode.

### Form Validation Errors

**Empty Required Fields**: When a user attempts to submit the kill form with missing location or kill time, display inline validation errors next to the affected fields. Prevent form submission until all fields are valid.

**Invalid Date/Time**: If the kill time input contains an invalid date or time value, display an error message and prevent submission. The datetime-local input should provide browser-level validation.

**Invalid Victim Selection**: If no victim is selected from the dropdown, prevent form submission and highlight the victim selector field.

### Avatar Loading Errors

**Network Failures**: If pravatar.cc is unreachable or returns an error, display a placeholder avatar image (a default silhouette or initials). Log the error for debugging but do not block the application.

**Timeout**: If avatar image loading takes longer than 5 seconds, display the placeholder and continue. Use lazy loading to avoid blocking the initial render.

### Time Calculation Errors

**Invalid Timestamps**: If a kill record contains an invalid or corrupted timestamp, skip that record when calculating visibility and log a warning. Do not crash the application.

**Clock Skew**: If the system clock is significantly incorrect, visibility calculations may be wrong. Document this limitation and recommend users ensure correct system time.

### Edge Cases

**Duplicate Kill Records**: The system allows multiple kill records for the same victim (anyone can submit). This is by design for the social deduction aspect. No error handling needed.

**Kill Records for Murderer**: The system allows kill records where the victim is the murderer. This is valid gameplay (false accusations). No error handling needed.

**Submissions Before Game Start**: If a kill record is submitted with a kill time before the game start time, accept it but flag it as suspicious in the UI (optional enhancement).

## Testing Strategy

### Dual Testing Approach

The testing strategy employs both unit tests and property-based tests to ensure comprehensive coverage:

**Unit Tests** focus on:
- Specific example scenarios (e.g., "game with 3 killed players displays correctly")
- Edge cases (e.g., empty database, all players killed, game ending exactly at 8pm)
- Error conditions (e.g., invalid form inputs, database connection failures)
- Integration points (e.g., database service initialization, component mounting)

**Property-Based Tests** focus on:
- Universal properties that hold for all inputs (e.g., "for any game state, exactly 15 players exist")
- Comprehensive input coverage through randomization (e.g., random kill times, random victim selections)
- Invariants that must be maintained (e.g., "murderer identity never changes after initialization")
- Round-trip properties (e.g., "store then retrieve returns same data")

Together, unit tests catch concrete bugs in specific scenarios while property-based tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library**: fast-check (JavaScript/TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test (due to randomization)
- Seed-based reproducibility for failed test cases
- Shrinking enabled to find minimal failing examples

**Test Tagging**: Each property test must include a comment referencing the design document property:

```typescript
// Feature: murder-mystery-game, Property 1: Game initialization creates exactly 15 players
test('game initialization always creates 15 players', () => {
  fc.assert(
    fc.property(fc.integer(), (seed) => {
      const game = initializeGame(seed);
      return game.players.length === 15;
    }),
    { numRuns: 100 }
  );
});
```

**Generators**: Custom generators will be created for:
- Random game states (15 players with random murderer)
- Random kill records (random victim, location, time)
- Random timestamps (for visibility testing)
- Random player configurations

### Unit Testing Focus

Unit tests should be selective and focus on:

1. **Specific Examples**:
   - Game with 0 kills, 5 kills, 14 kills (all players killed)
   - Kill record submitted at 7:59pm vs 8:01pm (visibility boundary)
   - Game ending on day 7 with various kill counts

2. **Edge Cases**:
   - Empty database on first load
   - Kill record for non-existent player (should fail)
   - Multiple kill records for same victim
   - Kill time in the future
   - Kill time before game start

3. **Error Conditions**:
   - Form submission with empty location
   - Form submission with no victim selected
   - Database connection failure
   - Avatar image loading failure

4. **Integration Tests**:
   - Full game flow: initialize → submit kill → wait until 8pm → verify visibility
   - Database persistence: create game → close → reopen → verify state
   - Component rendering: mount GameBoard → verify 15 avatars rendered

### Test Coverage Goals

- **Line Coverage**: Minimum 80% for all source files
- **Branch Coverage**: Minimum 75% for conditional logic
- **Property Coverage**: 100% of correctness properties must have corresponding property tests
- **Critical Path Coverage**: 100% coverage of game initialization, kill submission, and win condition evaluation

### Testing Tools

- **Unit Testing**: Vitest (fast, Vite-native test runner)
- **Property Testing**: fast-check (mature PBT library for TypeScript)
- **Component Testing**: @testing-library/svelte (user-centric component tests)
- **Database Testing**: In-memory SQLite for fast, isolated tests
- **Coverage**: c8 (native V8 coverage tool)

### Continuous Integration

All tests must pass before merging code. CI pipeline should:
1. Run unit tests with coverage reporting
2. Run property tests with 100 iterations minimum
3. Fail build if coverage drops below thresholds
4. Generate and archive test reports
