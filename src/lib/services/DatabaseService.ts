import type { Player, KillRecord, GameState, KillRecordInput } from '../types';

/**
 * DatabaseService handles all data storage operations for the Murder Mystery Game
 * Uses localStorage for browser-based persistence
 */
export class DatabaseService {
  private readonly STORAGE_KEYS = {
    PLAYERS: 'murder-mystery-players',
    KILL_RECORDS: 'murder-mystery-kill-records',
    GAME_STATE: 'murder-mystery-game-state'
  };

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * Initialize a new game with 15 players and a randomly selected murderer
   * @returns The created game state
   */
  initializeGame(): GameState {
    // Check if game already exists
    const existingGame = this.getGameState();
    if (existingGame) {
      return existingGame;
    }

    // Create 15 players
    const players = this.createPlayers(15);

    // Randomly select a murderer
    const randomIndex = Math.floor(Math.random() * players.length);
    const murdererId = players[randomIndex].id;
    this.setMurderer(murdererId);

    // Create game state
    const gameState: GameState = {
      id: this.generateUUID(),
      startTime: new Date(),
      murdererId
    };

    localStorage.setItem(this.STORAGE_KEYS.GAME_STATE, JSON.stringify(gameState));
    return gameState;
  }

  /**
   * Get the current game state
   * @returns The game state or null if no game exists
   */
  getGameState(): GameState | null {
    const data = localStorage.getItem(this.STORAGE_KEYS.GAME_STATE);
    if (!data) return null;

    const parsed = JSON.parse(data);
    return {
      ...parsed,
      startTime: new Date(parsed.startTime)
    };
  }

  /**
   * Create a specified number of players
   * @param count Number of players to create
   * @returns Array of created players
   */
  createPlayers(count: number): Player[] {
    const players: Player[] = [];

    for (let i = 1; i <= count; i++) {
      players.push({
        id: this.generateUUID(),
        name: `Player ${i}`,
        avatarUrl: `https://i.pravatar.cc/150?img=${i}`,
        isMurderer: false
      });
    }

    localStorage.setItem(this.STORAGE_KEYS.PLAYERS, JSON.stringify(players));
    return players;
  }

  /**
   * Get all players
   * @returns Array of all players
   */
  getPlayers(): Player[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.PLAYERS);
    return data ? JSON.parse(data) : [];
  }

  /**
   * Get a player by ID
   * @param id Player ID
   * @returns The player or null if not found
   */
  getPlayerById(id: string): Player | null {
    const players = this.getPlayers();
    return players.find(p => p.id === id) || null;
  }

  /**
   * Set a player as the murderer
   * @param playerId Player ID to set as murderer
   */
  setMurderer(playerId: string): void {
    const players = this.getPlayers();
    const updatedPlayers = players.map(p => ({
      ...p,
      isMurderer: p.id === playerId
    }));
    localStorage.setItem(this.STORAGE_KEYS.PLAYERS, JSON.stringify(updatedPlayers));
  }

  /**
   * Create a kill record
   * @param record Kill record input
   * @returns The created kill record
   */
  createKillRecord(record: KillRecordInput): KillRecord {
    const killRecord: KillRecord = {
      id: this.generateUUID(),
      victimId: record.victimId,
      location: record.location,
      killTime: record.killTime,
      submittedAt: new Date()
    };

    const records = this.getKillRecords();
    records.push(killRecord);
    localStorage.setItem(this.STORAGE_KEYS.KILL_RECORDS, JSON.stringify(records));

    return killRecord;
  }

  /**
   * Get all kill records
   * @returns Array of all kill records
   */
  getKillRecords(): KillRecord[] {
    const data = localStorage.getItem(this.STORAGE_KEYS.KILL_RECORDS);
    if (!data) return [];

    const parsed = JSON.parse(data);
    return parsed.map((r: any) => ({
      ...r,
      killTime: new Date(r.killTime),
      submittedAt: new Date(r.submittedAt)
    }));
  }

  /**
   * Get kill records that should be visible based on cutoff time
   * @param cutoffTime Only records submitted before this time are visible
   * @returns Array of visible kill records
   */
  getKillRecordsByVisibility(cutoffTime: Date): KillRecord[] {
    const records = this.getKillRecords();
    return records.filter(r => r.submittedAt < cutoffTime);
  }

  /**
   * Close the database connection (no-op for localStorage)
   */
  close(): void {
    // No-op for localStorage
  }
}
