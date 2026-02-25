/**
 * Core data models for the Murder Mystery Game
 */

/**
 * Represents a player in the game
 */
export interface Player {
  id: string;              // UUID v4
  name: string;            // Player name (e.g., "Player 1")
  avatarUrl: string;       // pravatar.cc URL
  isMurderer: boolean;     // True for the selected murderer
}

/**
 * Represents a kill record in the game
 */
export interface KillRecord {
  id: string;              // UUID v4
  victimId: string;        // Foreign key to Player.id
  location: string;        // Kill location (free text)
  killTime: Date;          // When the kill occurred
  submittedAt: Date;       // When the record was submitted
}

/**
 * Represents the overall game state
 */
export interface GameState {
  id: string;              // Single row with fixed ID
  startTime: Date;         // Game start timestamp
  murdererId: string;      // Foreign key to Player.id
}

/**
 * Input type for creating a kill record
 */
export interface KillRecordInput {
  victimId: string;
  location: string;
  killTime: Date;
}

/**
 * Player with associated kill information for rendering
 */
export interface PlayerWithKillInfo {
  player: Player;
  killRecord: KillRecord | null;
  isVisible: boolean;
}

/**
 * Win condition evaluation result
 */
export interface WinCondition {
  gameEnded: boolean;
  murdererWon: boolean;
  survivors: Player[];
}
