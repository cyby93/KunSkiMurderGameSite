import type { Player, KillRecord, WinCondition } from '../types';

/**
 * WinConditionEvaluator
 * 
 * Determines game outcome based on kill records and game duration.
 * Validates Requirements 7.1, 7.2, 7.3
 */
export class WinConditionEvaluator {
  /**
   * Check if the game week (7 days) has ended
   * 
   * @param gameStartTime - When the game started
   * @param currentTime - Current time to check against
   * @returns true if 7 days have passed since game start
   * 
   * Validates Requirement 7.1: Game duration is exactly seven days
   */
  isGameEnded(gameStartTime: Date, currentTime: Date): boolean {
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000; // 168 hours in milliseconds
    const elapsedTime = currentTime.getTime() - gameStartTime.getTime();
    return elapsedTime >= SEVEN_DAYS_MS;
  }

  /**
   * Evaluate win conditions based on current game state
   * 
   * @param players - All players in the game
   * @param killRecords - All kill records (visible or not)
   * @param murdererId - ID of the murderer
   * @returns WinCondition object with game outcome
   * 
   * Validates Requirements 7.2, 7.3:
   * - Murderer wins if all 14 non-murderer players have kill records
   * - Survivors win if at least one non-murderer player has no kill record
   */
  evaluateWinCondition(
    players: Player[],
    killRecords: KillRecord[],
    murdererId: string
  ): WinCondition {
    // Get all non-murderer players
    const nonMurdererPlayers = players.filter(p => p.id !== murdererId);
    
    // Create a set of victim IDs for efficient lookup
    const victimIds = new Set(killRecords.map(kr => kr.victimId));
    
    // Find survivors (non-murderer players without kill records)
    const survivors = nonMurdererPlayers.filter(p => !victimIds.has(p.id));
    
    // Murderer wins if all 14 non-murderer players have been killed
    const murdererWon = survivors.length === 0;
    
    return {
      gameEnded: true, // This method is only called when game has ended
      murdererWon,
      survivors
    };
  }
}
