# Implementation Plan: Murder Mystery Game

## Overview

This plan implements a web-based murder mystery game using Svelte 5, TypeScript, Vite, and better-sqlite3. The implementation follows a bottom-up approach: database layer first, then core services, then UI components, and finally styling and integration. Property-based tests using fast-check are included as optional sub-tasks to validate universal correctness properties.

## Tasks

- [x] 1. Project setup and dependencies
  - Initialize Svelte 5 + TypeScript + Vite project
  - Install dependencies: better-sqlite3, fast-check, vitest, @testing-library/svelte
  - Configure TypeScript with strict mode
  - Set up Vitest configuration for unit and property tests
  - Create project directory structure (src/lib/services, src/lib/components, src/lib/types)
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 2. Define core data models and types
  - [x] 2.1 Create TypeScript interfaces for data models
    - Define Player, KillRecord, GameState, KillRecordInput, PlayerWithKillInfo interfaces
    - Define WinCondition interface
    - Export all types from src/lib/types/index.ts
    - _Requirements: 1.3, 3.4, 3.5, 4.2, 4.3_

- [ ] 3. Implement database service with SQLite
  - [x] 3.1 Create DatabaseService class with schema initialization
    - Implement SQLite connection using better-sqlite3
    - Create tables: players, kill_records, game_state with proper schemas
    - Implement initializeGame() method
    - Implement getGameState() method
    - _Requirements: 4.1, 4.4, 10.4_
  
  - [x] 3.2 Implement player management methods
    - Implement createPlayers(count: number) to generate 15 players with UUIDs
    - Implement getPlayers() to retrieve all players
    - Implement getPlayerById(id: string)
    - Implement setMurderer(playerId: string)
    - Generate avatar URLs using pravatar.cc pattern
    - _Requirements: 1.1, 1.3, 1.4, 2.2_
  
  - [x] 3.3 Write property test for player creation
    - **Property 1: Game initialization creates exactly 15 players**
    - **Validates: Requirements 1.1, 1.3**
  
  - [x] 3.4 Write property test for avatar URLs
    - **Property 2: All avatar URLs reference pravatar.cc**
    - **Validates: Requirements 1.4**
  
  - [x] 3.5 Implement kill record management methods
    - Implement createKillRecord(record: KillRecordInput) with UUID generation
    - Implement getKillRecords() to retrieve all records
    - Implement getKillRecordsByVisibility(cutoffTime: Date)
    - Store timestamps as Unix timestamps (integers)
    - _Requirements: 3.6, 4.1, 4.2, 4.3, 4.4_
  
  - [x] 3.6 Write property test for kill record persistence
    - **Property 12: Kill record persistence round-trip**
    - **Validates: Requirements 3.6, 4.1**
  
  - [x] 3.7 Write property test for kill record foreign key integrity
    - **Property 13: Kill records reference valid players**
    - **Validates: Requirements 4.2**
  
  - [x] 3.8 Write unit tests for database service
    - Test empty database initialization
    - Test multiple kill records for same victim
    - Test database persistence across close/reopen
    - _Requirements: 4.1, 4.4_

- [x] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement VisibilityManager service
  - [x] 5.1 Create VisibilityManager class with 8pm calculation logic
    - Implement getMostRecent8pm(currentTime: Date) to find last 8pm cutoff
    - Implement isRecordVisible(record: KillRecord, currentTime: Date)
    - Implement getVisibleRecords(allRecords: KillRecord[], currentTime: Date)
    - Handle edge cases: records submitted exactly at 8pm, timezone considerations
    - _Requirements: 5.1, 5.2, 5.3_
  
  - [x] 5.2 Write property test for visibility cutoff
    - **Property 16: Visibility cutoff at most recent 8pm**
    - **Validates: Requirements 5.1, 5.2**
  
  - [x] 5.3 Write unit tests for visibility edge cases
    - Test record submitted at 7:59pm vs 8:01pm
    - Test visibility check at exactly 8:00pm
    - Test records from multiple days
    - _Requirements: 5.1, 5.2_

- [ ] 6. Implement WinConditionEvaluator service
  - [x] 6.1 Create WinConditionEvaluator class
    - Implement isGameEnded(gameStartTime: Date, currentTime: Date) for 7-day check
    - Implement evaluateWinCondition(players, killRecords, murdererId)
    - Return WinCondition object with gameEnded, murdererWon, survivors
    - _Requirements: 7.1, 7.2, 7.3_
  
  - [x] 6.2 Write property test for game duration
    - **Property 20: Game duration is exactly seven days**
    - **Validates: Requirements 7.1**
  
  - [x] 6.3 Write property test for win condition logic
    - **Property 21: Win condition evaluation**
    - **Validates: Requirements 7.2, 7.3**
  
  - [x] 6.4 Write unit tests for win conditions
    - Test murderer wins (all 14 killed)
    - Test survivors win (at least 1 alive)
    - Test game ending exactly at 7 days
    - _Requirements: 7.2, 7.3_

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 8. Implement PlayerAvatar component
  - [x] 8.1 Create PlayerAvatar.svelte component
    - Accept props: player, killRecord, onRecordKill
    - Render avatar image from player.avatarUrl
    - Apply conditional grayscale filter when killRecord is not null
    - Render kill information overlay (time and location) when killRecord exists
    - Add "Record Kill" button that calls onRecordKill
    - _Requirements: 1.2, 3.1, 5.4, 5.5, 6.1, 6.2, 6.3_
  
  - [ ] 8.2 Write property test for grayscale filter application
    - **Property 17: Grayscale filter applied for visible kill records**
    - **Validates: Requirements 5.4, 6.1, 6.2**
  
  - [ ] 8.3 Write property test for kill information overlay
    - **Property 18: Kill information overlay for visible records**
    - **Validates: Requirements 5.5, 6.3**
  
  - [ ] 8.4 Write unit tests for PlayerAvatar component
    - Test avatar renders with full color when no kill record
    - Test grayscale and overlay when kill record present
    - Test "Record Kill" button click handler
    - _Requirements: 6.1, 6.2, 6.3_

- [ ] 9. Implement KillFormModal component
  - [x] 9.1 Create KillFormModal.svelte component
    - Accept props: isOpen, players, onSubmit, onClose
    - Render modal with victim selector dropdown (15 options)
    - Add location text input with required validation
    - Add kill time datetime-local input with required validation
    - Implement form validation: all fields required, location non-empty
    - Call onSubmit with KillRecordInput on valid submission
    - Call onClose when modal is dismissed
    - _Requirements: 3.2, 3.3, 3.4, 3.5, 8.3_
  
  - [ ] 9.2 Write property test for player options in victim selector
    - **Property 9: Kill form contains all player options**
    - **Validates: Requirements 3.3**
  
  - [ ] 9.3 Write property test for location validation
    - **Property 10: Kill form validates required location**
    - **Validates: Requirements 3.4**
  
  - [ ] 9.4 Write property test for kill time validation
    - **Property 11: Kill form validates required kill time**
    - **Validates: Requirements 3.5**
  
  - [ ] 9.5 Write unit tests for KillFormModal
    - Test form submission with valid data
    - Test form rejection with empty location
    - Test form rejection with missing kill time
    - Test modal close behavior
    - _Requirements: 3.4, 3.5_

- [ ] 10. Implement GameOutcome component
  - [x] 10.1 Create GameOutcome.svelte component
    - Accept props: gameEnded, murdererWon, murdererName, survivors
    - Conditionally render only when gameEnded is true
    - Display murderer identity
    - Show victory message for murderer or survivors
    - List survivor names if survivors win
    - _Requirements: 7.4_
  
  - [ ] 10.2 Write property test for game outcome display
    - **Property 22: Game outcome display on completion**
    - **Validates: Requirements 7.4**

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 12. Implement GameBoard component and game state management
  - [x] 12.1 Create GameBoard.svelte component with reactive state
    - Use Svelte 5 runes: $state for players, killRecords, currentTime
    - Use $derived for visibleKillRecords based on VisibilityManager
    - Use $effect to load game state on mount
    - Implement loadGameState() to fetch from DatabaseService
    - Implement refreshVisibility() to recalculate visible records
    - Render 15 PlayerAvatar components in responsive flex layout
    - Pass appropriate props to each PlayerAvatar
    - _Requirements: 1.2, 4.4, 5.3, 6.4, 8.1, 8.2_
  
  - [x] 12.2 Implement kill record submission flow
    - Add state for kill form modal (isOpen, selectedPlayerId)
    - Implement openKillForm(playerId: string) handler
    - Implement handleKillSubmit(record: KillRecordInput) to persist via DatabaseService
    - Refresh game state after successful submission
    - _Requirements: 3.1, 3.2, 3.6_
  
  - [x] 12.3 Implement game initialization logic
    - Check if game exists in database on load
    - If no game exists, call DatabaseService.initializeGame()
    - Randomly select murderer using Math.random() and setMurderer()
    - _Requirements: 2.1, 2.2_
  
  - [x] 12.4 Integrate WinConditionEvaluator
    - Use $derived to calculate win condition based on current game state
    - Pass win condition data to GameOutcome component
    - _Requirements: 7.2, 7.3, 7.4_
  
  - [ ] 12.5 Write property test for 15 avatar rendering
    - **Property 3: Player rendering produces 15 avatar elements**
    - **Validates: Requirements 1.2**
  
  - [ ] 12.6 Write property test for murderer selection
    - **Property 4: Exactly one murderer is selected**
    - **Validates: Requirements 2.1**
  
  - [ ] 12.7 Write property test for murderer persistence
    - **Property 5: Murderer identity persistence round-trip**
    - **Validates: Requirements 2.2**
  
  - [ ] 12.8 Write property test for visual state persistence
    - **Property 19: Visual state persistence across reloads**
    - **Validates: Requirements 6.4**
  
  - [ ] 12.9 Write unit tests for GameBoard integration
    - Test full flow: initialize → submit kill → verify visibility
    - Test state persistence across reload
    - Test multiple kill submissions
    - _Requirements: 4.4, 6.4_

- [ ] 13. Implement dark mystical theme styling
  - [x] 13.1 Create global CSS with dark theme variables
    - Define CSS custom properties for dark color palette
    - Set background colors, text colors, accent colors
    - Ensure Victorian-era mystical aesthetic (deep purples, dark grays, gold accents)
    - Apply to body and root elements
    - _Requirements: 9.1, 9.2_
  
  - [ ] 13.2 Style PlayerAvatar component
    - Apply grayscale filter using CSS filter property
    - Style kill information overlay with dark semi-transparent background
    - Style "Record Kill" button with theme colors
    - Add hover effects and transitions
    - _Requirements: 5.4, 5.5, 9.2_
  
  - [ ] 13.3 Style KillFormModal component
    - Style modal backdrop and container with dark theme
    - Style form inputs with dark backgrounds and light text
    - Style submit and cancel buttons
    - Ensure form is usable on mobile (min-width 320px)
    - _Requirements: 8.3, 9.2_
  
  - [ ] 13.4 Style GameOutcome component
    - Apply dramatic styling for victory/defeat messages
    - Use theme colors for emphasis
    - _Requirements: 9.2_
  
  - [ ] 13.5 Verify text contrast meets WCAG AA standards
    - **Property 23: Text contrast meets WCAG standards**
    - **Validates: Requirements 9.3**
    - Use contrast checker tool to verify 4.5:1 ratio for normal text
    - Adjust colors if needed

- [ ] 14. Implement responsive layout
  - [ ] 14.1 Create responsive flex layout for GameBoard
    - Use CSS flexbox with flex-wrap for avatar grid
    - Add media queries for mobile, tablet, desktop breakpoints
    - Adjust avatar size and spacing based on viewport
    - Test on 320px minimum width
    - _Requirements: 1.2, 8.1, 8.2, 8.3_
  
  - [ ] 14.2 Write unit tests for responsive behavior
    - Test layout at 320px, 768px, 1024px, 1920px widths
    - Verify all 15 avatars visible at each breakpoint
    - _Requirements: 8.1, 8.2_

- [x] 15. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 16. Create main App component and wire everything together
  - [x] 16.1 Create App.svelte as root component
    - Import and render GameBoard component
    - Apply global theme styles
    - Set up application container
    - _Requirements: 10.5_
  
  - [x] 16.2 Create main.ts entry point
    - Initialize Svelte app
    - Mount to DOM
    - _Requirements: 10.5_
  
  - [ ] 16.3 Configure Vite for production build
    - Ensure better-sqlite3 is properly bundled
    - Configure asset optimization
    - Test production build
    - _Requirements: 10.5_

- [ ] 17. Final integration testing and validation
  - [ ] 17.1 Run full property test suite
    - Execute all 23 property tests with 100 iterations each
    - Verify all properties pass
    - Document any edge cases discovered
  
  - [ ] 17.2 Run full unit test suite with coverage
    - Execute all unit tests
    - Verify minimum 80% line coverage
    - Verify minimum 75% branch coverage
  
  - [ ] 17.3 Manual end-to-end validation
    - Initialize new game and verify 15 players appear
    - Submit kill record and verify it appears after 8pm
    - Submit multiple kills and verify all display correctly
    - Wait for game end (or simulate) and verify win condition
    - Test on mobile device or emulator
    - _Requirements: All_

- [x] 18. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Implementation uses TypeScript throughout as specified in the design
- Database uses better-sqlite3 for embedded SQLite persistence
- UI framework is Svelte 5 with reactive runes ($state, $derived, $effect)
- Testing uses Vitest for unit tests and fast-check for property-based tests
