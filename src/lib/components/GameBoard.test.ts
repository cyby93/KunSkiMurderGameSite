import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '../services/DatabaseService';
import { WinConditionEvaluator } from '../services/WinConditionEvaluator';

/**
 * GameBoard Component Tests
 * 
 * These tests verify the GameBoard component's integration with DatabaseService
 * and VisibilityManager. Since GameBoard is a Svelte component, we test the
 * underlying logic and data flow.
 */
describe('GameBoard Component Integration', () => {
  let db: DatabaseService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    db = new DatabaseService();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  /**
   * Validates: Requirements 1.1, 1.2
   * Test that game initialization creates exactly 15 players
   */
  it('should initialize game with exactly 15 players', () => {
    db.initializeGame();
    const players = db.getPlayers();
    
    expect(players).toHaveLength(15);
  });

  /**
   * Validates: Requirements 1.3
   * Test that all players have unique identifiers
   */
  it('should create players with unique IDs', () => {
    db.initializeGame();
    const players = db.getPlayers();
    
    const ids = players.map(p => p.id);
    const uniqueIds = new Set(ids);
    
    expect(uniqueIds.size).toBe(15);
  });

  /**
   * Validates: Requirements 1.4
   * Test that all avatar URLs reference pravatar.cc
   */
  it('should create players with pravatar.cc avatar URLs', () => {
    db.initializeGame();
    const players = db.getPlayers();
    
    players.forEach(player => {
      expect(player.avatarUrl).toContain('pravatar.cc');
    });
  });

  /**
   * Validates: Requirements 4.4
   * Test that game state loads all kill records from database
   */
  it('should load all kill records from database', () => {
    db.initializeGame();
    const players = db.getPlayers();
    
    // Create multiple kill records
    db.createKillRecord({
      victimId: players[0].id,
      location: 'Library',
      killTime: new Date('2024-01-01T10:00:00')
    });
    
    db.createKillRecord({
      victimId: players[1].id,
      location: 'Kitchen',
      killTime: new Date('2024-01-01T14:00:00')
    });
    
    db.createKillRecord({
      victimId: players[2].id,
      location: 'Garden',
      killTime: new Date('2024-01-01T18:00:00')
    });
    
    const killRecords = db.getKillRecords();
    
    expect(killRecords).toHaveLength(3);
    expect(killRecords[0].location).toBe('Library');
    expect(killRecords[1].location).toBe('Kitchen');
    expect(killRecords[2].location).toBe('Garden');
  });

  /**
   * Validates: Requirements 5.3, 6.4
   * Test that visual state can be reconstructed from localStorage
   */
  it('should maintain state across page reloads', () => {
    db.initializeGame();
    const players = db.getPlayers();
    
    // Create a kill record
    db.createKillRecord({
      victimId: players[0].id,
      location: 'Ballroom',
      killTime: new Date('2024-01-01T12:00:00')
    });
    
    // Create new DatabaseService instance (simulates page reload)
    const db2 = new DatabaseService();
    
    // Verify state is preserved
    const reloadedPlayers = db2.getPlayers();
    const reloadedRecords = db2.getKillRecords();
    
    expect(reloadedPlayers).toHaveLength(15);
    expect(reloadedRecords).toHaveLength(1);
    expect(reloadedRecords[0].victimId).toBe(players[0].id);
    expect(reloadedRecords[0].location).toBe('Ballroom');
  });

  /**
   * Validates: Requirements 8.1, 8.2
   * Test that component can render all 15 players in responsive layout
   */
  it('should provide data for rendering 15 player avatars', () => {
    db.initializeGame();
    const players = db.getPlayers();
    
    // Verify we have all data needed for rendering
    expect(players).toHaveLength(15);
    
    players.forEach((player, index) => {
      expect(player.id).toBeTruthy();
      expect(player.name).toBe(`Player ${index + 1}`);
      expect(player.avatarUrl).toBeTruthy();
      expect(typeof player.isMurderer).toBe('boolean');
    });
  });

  /**
   * Validates: Requirements 7.2, 7.3, 7.4
   * Test that win condition is correctly evaluated based on game state
   */
  it('should evaluate win condition correctly', () => {
    db.initializeGame();
    const players = db.getPlayers();
    const gameState = db.getGameState();
    
    expect(gameState).toBeTruthy();
    if (!gameState) return;
    
    // Get non-murderer players
    const nonMurdererPlayers = players.filter(p => p.id !== gameState.murdererId);
    expect(nonMurdererPlayers).toHaveLength(14);
    
    const evaluator = new WinConditionEvaluator();
    
    // Test scenario 1: No kills - survivors should win
    let winCondition = evaluator.evaluateWinCondition(players, [], gameState.murdererId);
    expect(winCondition.murdererWon).toBe(false);
    expect(winCondition.survivors).toHaveLength(14);
    
    // Test scenario 2: Some killed - survivors should win
    const someKilled = nonMurdererPlayers.slice(0, 10);
    someKilled.forEach(player => {
      db.createKillRecord({
        victimId: player.id,
        location: 'Test Location',
        killTime: new Date()
      });
    });
    
    let someRecords = db.getKillRecords();
    winCondition = evaluator.evaluateWinCondition(players, someRecords, gameState.murdererId);
    expect(winCondition.murdererWon).toBe(false);
    expect(winCondition.survivors.length).toBe(4); // 14 non-murderers - 10 killed = 4 survivors
    
    // Test scenario 3: All non-murderers killed - murderer should win
    const remainingNonMurderers = nonMurdererPlayers.slice(10);
    remainingNonMurderers.forEach(player => {
      db.createKillRecord({
        victimId: player.id,
        location: 'Test Location',
        killTime: new Date()
      });
    });
    
    const allRecords = db.getKillRecords();
    winCondition = evaluator.evaluateWinCondition(players, allRecords, gameState.murdererId);
    expect(winCondition.murdererWon).toBe(true);
    expect(winCondition.survivors).toHaveLength(0);
  });
});
