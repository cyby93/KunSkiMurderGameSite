# Requirements Document

## Introduction

The Murder Mystery Game is a web-based social deduction game where 15 players participate in a week-long murder mystery scenario. One randomly selected player becomes the murderer who must eliminate other players by being alone with them. Players can report kill details daily, and the game concludes at week's end with either the murderer winning (all players eliminated) or the survivors winning (at least one player remains).

## Glossary

- **Game_System**: The web application managing game state, player data, and kill records
- **Player**: A participant in the murder mystery game (one of 15 people)
- **Murderer**: The randomly selected player whose goal is to eliminate all other players
- **Kill_Record**: A data entry containing victim name, kill location, and kill time
- **Avatar**: Visual representation of a player displayed in the game interface
- **Daily_Update**: The 8pm daily event when kill records become visible to all players
- **Game_Week**: The seven-day duration of a single game session
- **Kill_Form**: User interface for submitting kill location and time information
- **Database**: Lightweight persistent storage for game state and kill records

## Requirements

### Requirement 1: Player Management

**User Story:** As a game administrator, I want the system to manage exactly 15 players, so that the game maintains its designed player count.

#### Acceptance Criteria

1. THE Game_System SHALL support exactly 15 Players per game session
2. THE Game_System SHALL display all 15 Player Avatars in a responsive flex layout
3. THE Game_System SHALL assign unique identifiers to each Player
4. THE Game_System SHALL retrieve Player Avatar images from https://pravatar.cc/

### Requirement 2: Murderer Selection

**User Story:** As a player, I want the murderer to be randomly selected at game start, so that the game is fair and unpredictable.

#### Acceptance Criteria

1. WHEN a new game session starts, THE Game_System SHALL randomly select one Player as the Murderer
2. THE Game_System SHALL store the Murderer identity in the Database
3. THE Game_System SHALL NOT visually distinguish the Murderer from other Players in the interface

### Requirement 3: Kill Record Submission

**User Story:** As any player, I want to record a kill with location and time details, so that other players can deduce the murderer's identity.

#### Acceptance Criteria

1. THE Game_System SHALL provide a "record kill" button for each Player Avatar
2. WHEN a "record kill" button is clicked, THE Game_System SHALL display the Kill_Form
3. THE Kill_Form SHALL allow selection of a victim name from the 15 Players
4. THE Kill_Form SHALL require input of kill location as text
5. THE Kill_Form SHALL require input of kill time as a timestamp
6. WHEN the Kill_Form is submitted, THE Game_System SHALL save the Kill_Record to the Database
7. THE Game_System SHALL allow any user to submit a Kill_Record at any time

### Requirement 4: Kill Record Persistence

**User Story:** As a player, I want kill records to be saved permanently, so that game state is preserved across sessions.

#### Acceptance Criteria

1. WHEN a Kill_Record is submitted, THE Game_System SHALL persist it to the Database
2. THE Game_System SHALL associate each Kill_Record with the victim Player identifier
3. THE Game_System SHALL store kill location, kill time, and submission timestamp in each Kill_Record
4. WHEN the Game_System loads, THE Game_System SHALL retrieve all Kill_Records from the Database

### Requirement 5: Daily Kill Visibility Update

**User Story:** As a player, I want kill information to be revealed only at 8pm daily, so that the game maintains suspense and daily rhythm.

#### Acceptance Criteria

1. WHEN the current time reaches 8pm, THE Game_System SHALL update the display to show new Kill_Records
2. THE Game_System SHALL NOT display Kill_Records submitted after the most recent Daily_Update until the next Daily_Update
3. THE Game_System SHALL check for Daily_Update conditions when the page is loaded or refreshed
4. WHILE a Player has an associated Kill_Record visible after Daily_Update, THE Game_System SHALL display that Player's Avatar in grayscale
5. WHILE a Player has an associated Kill_Record visible after Daily_Update, THE Game_System SHALL display a box showing kill time and location on that Player's Avatar

### Requirement 6: Visual Player State

**User Story:** As a player, I want to see which players have been killed, so that I can track game progress and make deductions.

#### Acceptance Criteria

1. WHILE a Player has no visible Kill_Record, THE Game_System SHALL display that Player's Avatar in full color
2. WHEN a Player has a visible Kill_Record after Daily_Update, THE Game_System SHALL apply grayscale filter to that Player's Avatar
3. WHEN a Player has a visible Kill_Record after Daily_Update, THE Game_System SHALL overlay kill time and location information on that Player's Avatar
4. THE Game_System SHALL maintain Avatar visual state across page refreshes by reading from the Database

### Requirement 7: Game Duration and Win Conditions

**User Story:** As a player, I want clear game duration and win conditions, so that I know when the game ends and who wins.

#### Acceptance Criteria

1. THE Game_System SHALL track the Game_Week duration of seven days from game start
2. WHEN the Game_Week ends AND all 14 non-Murderer Players have Kill_Records, THE Game_System SHALL declare the Murderer as winner
3. WHEN the Game_Week ends AND at least one non-Murderer Player has no Kill_Record, THE Game_System SHALL declare the survivors as winners
4. THE Game_System SHALL display the game outcome when win conditions are evaluated

### Requirement 8: Responsive User Interface

**User Story:** As a player on any device, I want the interface to adapt to my screen size, so that I can play on mobile, tablet, or desktop.

#### Acceptance Criteria

1. THE Game_System SHALL implement a responsive flex layout for Player Avatars
2. THE Game_System SHALL adjust Avatar size and spacing based on viewport dimensions
3. THE Game_System SHALL ensure the Kill_Form is usable on mobile devices with minimum width of 320px
4. THE Game_System SHALL maintain readability of kill information overlays on all screen sizes

### Requirement 9: Dark Mystical Theme

**User Story:** As a player, I want a dark and mystical visual theme, so that the game atmosphere matches a Sherlock Holmes murder mystery.

#### Acceptance Criteria

1. THE Game_System SHALL use a dark color palette as the primary theme
2. THE Game_System SHALL incorporate mystical design elements reminiscent of Victorian-era detective fiction
3. THE Game_System SHALL ensure text contrast meets accessibility standards against dark backgrounds
4. THE Game_System SHALL apply consistent theming to all interface elements including buttons, forms, and overlays

### Requirement 10: Technology Stack Implementation

**User Story:** As a developer, I want to use modern web technologies, so that the application is maintainable and performant.

#### Acceptance Criteria

1. THE Game_System SHALL be implemented using Svelte 5 framework
2. THE Game_System SHALL use TypeScript for type safety
3. THE Game_System SHALL use npm for package management
4. THE Game_System SHALL use a lightweight database solution for data persistence
5. THE Game_System SHALL be delivered as a single-page application

