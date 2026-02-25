import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from './DatabaseService';
import * as fc from 'fast-check';

describe('DatabaseService', () => {
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

  describe('Schema Initialization', () => {
    it('should create all required tables', () => {
      // Verify tables exist by querying them
      const players = db.getPlayers();
      const killRecords = db.getKillRecords();
      const gameState = db.getGameState();

      expect(players).toEqual([]);
      expect(killRecords).toEqual([]);
      expect(gameState).toBeNull();
    });
  });

  describe('initializeGame', () => {
    it('should create a new game with 15 players and a murderer', () => {
      const gameState = db.initializeGame();

      expect(gameState).toBeDefined();
      expect(gameState.id).toBeDefined();
      expect(gameState.startTime).toBeInstanceOf(Date);
      expect(gameState.murdererId).toBeDefined();

      const players = db.getPlayers();
      expect(players).toHaveLength(15);

      // Verify exactly one murderer
      const murderers = players.filter(p => p.isMurderer);
      expect(murderers).toHaveLength(1);
      expect(murderers[0].id).toBe(gameState.murdererId);
    });

    it('should return existing game if already initialized', () => {
      const firstGame = db.initializeGame();
      const secondGame = db.initializeGame();

      expect(secondGame.id).toBe(firstGame.id);
      expect(secondGame.murdererId).toBe(firstGame.murdererId);
    });
  });

  describe('getGameState', () => {
    it('should return null when no game exists', () => {
      const gameState = db.getGameState();
      expect(gameState).toBeNull();
    });

    it('should return game state after initialization', () => {
      const created = db.initializeGame();
      const retrieved = db.getGameState();

      expect(retrieved).not.toBeNull();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.murdererId).toBe(created.murdererId);
      expect(retrieved?.startTime.getTime()).toBe(created.startTime.getTime());
    });
  });

  describe('Player Management', () => {
    it('should create players with unique IDs', () => {
      const players = db.createPlayers(15);

      expect(players).toHaveLength(15);
      const ids = players.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(15);
    });

    it('should create players with pravatar.cc URLs', () => {
      const players = db.createPlayers(15);

      players.forEach(player => {
        expect(player.avatarUrl).toContain('pravatar.cc');
      });
    });

    it('should retrieve all players', () => {
      db.createPlayers(15);
      const players = db.getPlayers();

      expect(players).toHaveLength(15);
    });

    it('should retrieve player by ID', () => {
      const created = db.createPlayers(5);
      const player = db.getPlayerById(created[2].id);

      expect(player).not.toBeNull();
      expect(player?.id).toBe(created[2].id);
      expect(player?.name).toBe(created[2].name);
    });

    it('should return null for non-existent player ID', () => {
      const player = db.getPlayerById('non-existent-id');
      expect(player).toBeNull();
    });

    it('should set a player as murderer', () => {
      const players = db.createPlayers(15);
      const targetPlayer = players[5];

      db.setMurderer(targetPlayer.id);

      const updatedPlayer = db.getPlayerById(targetPlayer.id);
      expect(updatedPlayer?.isMurderer).toBe(true);
    });
  });

  describe('Kill Record Management', () => {
    beforeEach(() => {
      db.createPlayers(15);
    });

    it('should create a kill record', () => {
      const players = db.getPlayers();
      const killTime = new Date('2024-01-15T14:30:00');

      const record = db.createKillRecord({
        victimId: players[0].id,
        location: 'Library',
        killTime
      });

      expect(record.id).toBeDefined();
      expect(record.victimId).toBe(players[0].id);
      expect(record.location).toBe('Library');
      expect(record.killTime.getTime()).toBe(killTime.getTime());
      expect(record.submittedAt).toBeInstanceOf(Date);
    });

    it('should retrieve all kill records', () => {
      const players = db.getPlayers();

      db.createKillRecord({
        victimId: players[0].id,
        location: 'Library',
        killTime: new Date()
      });

      db.createKillRecord({
        victimId: players[1].id,
        location: 'Kitchen',
        killTime: new Date()
      });

      const records = db.getKillRecords();
      expect(records).toHaveLength(2);
    });

    it('should filter kill records by visibility cutoff', () => {
      const players = db.getPlayers();
      
      // Set cutoff time to now
      const cutoffTime = new Date();

      // Create first record (will be submitted after cutoff due to execution time)
      db.createKillRecord({
        victimId: players[0].id,
        location: 'Library',
        killTime: new Date()
      });

      // Create second record (also after cutoff)
      db.createKillRecord({
        victimId: players[1].id,
        location: 'Kitchen',
        killTime: new Date()
      });

      // Use a future cutoff time that includes both records
      const futureTime = new Date(Date.now() + 10000);
      const allVisible = db.getKillRecordsByVisibility(futureTime);
      expect(allVisible).toHaveLength(2);

      // Use the original cutoff time - should show no records
      const noneVisible = db.getKillRecordsByVisibility(cutoffTime);
      expect(noneVisible).toHaveLength(0);
    });

    it('should allow multiple kill records for the same victim', () => {
      const players = db.getPlayers();
      const victimId = players[0].id;

      // Create multiple kill records for the same victim
      const record1 = db.createKillRecord({
        victimId,
        location: 'Library',
        killTime: new Date('2024-01-15T14:30:00')
      });

      const record2 = db.createKillRecord({
        victimId,
        location: 'Kitchen',
        killTime: new Date('2024-01-15T16:45:00')
      });

      const record3 = db.createKillRecord({
        victimId,
        location: 'Garden',
        killTime: new Date('2024-01-15T18:00:00')
      });

      // Retrieve all records
      const allRecords = db.getKillRecords();
      expect(allRecords).toHaveLength(3);

      // Verify all records reference the same victim
      const victimRecords = allRecords.filter(r => r.victimId === victimId);
      expect(victimRecords).toHaveLength(3);

      // Verify each record has unique ID and different locations
      const recordIds = new Set(victimRecords.map(r => r.id));
      expect(recordIds.size).toBe(3);

      const locations = victimRecords.map(r => r.location);
      expect(locations).toContain('Library');
      expect(locations).toContain('Kitchen');
      expect(locations).toContain('Garden');
    });
  });

  describe('Database Persistence', () => {
    it('should persist game state in localStorage', () => {
      // Initialize game and create some data
      const gameState = db.initializeGame();
      const players = db.getPlayers();
      
      // Create a kill record
      const killRecord = db.createKillRecord({
        victimId: players[0].id,
        location: 'Library',
        killTime: new Date('2024-01-15T14:30:00')
      });

      // Create a new DatabaseService instance (simulates page reload)
      const db2 = new DatabaseService();

      // Verify game state persisted
      const retrievedGameState = db2.getGameState();
      expect(retrievedGameState).not.toBeNull();
      expect(retrievedGameState?.id).toBe(gameState.id);
      expect(retrievedGameState?.murdererId).toBe(gameState.murdererId);
      expect(retrievedGameState?.startTime.getTime()).toBe(gameState.startTime.getTime());

      // Verify players persisted
      const retrievedPlayers = db2.getPlayers();
      expect(retrievedPlayers).toHaveLength(15);
      expect(retrievedPlayers.map(p => p.id).sort()).toEqual(players.map(p => p.id).sort());

      // Verify kill records persisted
      const retrievedRecords = db2.getKillRecords();
      expect(retrievedRecords).toHaveLength(1);
      expect(retrievedRecords[0].victimId).toBe(killRecord.victimId);
      expect(retrievedRecords[0].location).toBe(killRecord.location);
      expect(retrievedRecords[0].killTime.getTime()).toBe(killRecord.killTime.getTime());
    });

    it('should handle empty database initialization correctly', () => {
      // Database is already initialized in beforeEach, but let's verify empty state
      const gameState = db.getGameState();
      const players = db.getPlayers();
      const killRecords = db.getKillRecords();

      // Should have no game state initially
      expect(gameState).toBeNull();
      
      // Should have no players initially
      expect(players).toEqual([]);
      
      // Should have no kill records initially
      expect(killRecords).toEqual([]);

      // After initialization, should have data
      db.initializeGame();
      
      const newGameState = db.getGameState();
      const newPlayers = db.getPlayers();
      
      expect(newGameState).not.toBeNull();
      expect(newPlayers).toHaveLength(15);
    });
  });

  describe('Property-Based Tests', () => {
    /**
     * Feature: murder-mystery-game, Property 1: Game initialization creates exactly 15 players
     * **Validates: Requirements 1.1, 1.3**
     */
    it('should always create exactly 15 players on game initialization', () => {
      fc.assert(
        fc.property(fc.integer(), (_seed) => {
          // Clear localStorage for each iteration
          localStorage.clear();
          db = new DatabaseService();

          // Initialize game
          db.initializeGame();

          // Verify exactly 15 players were created
          const players = db.getPlayers();
          expect(players).toHaveLength(15);

          // Verify all players have unique IDs
          const uniqueIds = new Set(players.map(p => p.id));
          expect(uniqueIds.size).toBe(15);

          // Return true for fast-check assertion
          return players.length === 15 && uniqueIds.size === 15;
        }),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property-based test with 100 iterations

    /**
     * Feature: murder-mystery-game, Property 2: All avatar URLs reference pravatar.cc
     * **Validates: Requirements 1.4**
     */
    it('should always generate avatar URLs that reference pravatar.cc', () => {
      fc.assert(
        fc.property(fc.integer({ min: 1, max: 20 }), (playerCount) => {
          // Clear localStorage for each iteration
          localStorage.clear();
          db = new DatabaseService();

          // Create players with varying counts
          const players = db.createPlayers(playerCount);

          // Verify all avatar URLs contain pravatar.cc
          const allUrlsValid = players.every(player => 
            player.avatarUrl.includes('pravatar.cc')
          );

          expect(allUrlsValid).toBe(true);

          // Return true for fast-check assertion
          return allUrlsValid;
        }),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property-based test with 100 iterations

    /**
     * Feature: murder-mystery-game, Property 12: Kill record persistence round-trip
     * **Validates: Requirements 3.6, 4.1**
     */
    it('should persist and retrieve kill records with same victim ID, location, and kill time', () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1, maxLength: 100 }), // location
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())), // killTime - filter out invalid dates
          (location, killTime) => {
            // Clear localStorage for each iteration
            localStorage.clear();
            db = new DatabaseService();

            // Create players to have valid victim IDs
            const players = db.createPlayers(15);
            const victimId = players[0].id;

            // Create kill record with generated data
            const createdRecord = db.createKillRecord({
              victimId,
              location,
              killTime
            });

            // Retrieve all kill records
            const retrievedRecords = db.getKillRecords();

            // Should have exactly one record
            expect(retrievedRecords).toHaveLength(1);

            const retrievedRecord = retrievedRecords[0];

            // Verify round-trip: victim ID, location, and kill time should match
            const victimIdMatches = retrievedRecord.victimId === victimId;
            const locationMatches = retrievedRecord.location === location;
            const killTimeMatches = retrievedRecord.killTime.getTime() === killTime.getTime();

            expect(victimIdMatches).toBe(true);
            expect(locationMatches).toBe(true);
            expect(killTimeMatches).toBe(true);

            // Verify the created record also matches
            expect(createdRecord.victimId).toBe(victimId);
            expect(createdRecord.location).toBe(location);
            expect(createdRecord.killTime.getTime()).toBe(killTime.getTime());

            // Return true for fast-check assertion
            return victimIdMatches && locationMatches && killTimeMatches;
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property-based test with 100 iterations

    /**
     * Feature: murder-mystery-game, Property 13: Kill records reference valid players
     * **Validates: Requirements 4.2**
     */
    it('should ensure all kill records reference valid player IDs', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // number of kill records to create
          fc.string({ minLength: 1, maxLength: 100 }), // location
          fc.date({ min: new Date('2020-01-01'), max: new Date('2030-12-31') }).filter(d => !isNaN(d.getTime())), // killTime
          (numKillRecords, location, killTime) => {
            // Clear localStorage for each iteration
            localStorage.clear();
            db = new DatabaseService();

            // Create players to have valid victim IDs
            const players = db.createPlayers(15);
            const playerIds = new Set(players.map(p => p.id));

            // Create multiple kill records with random victims
            for (let i = 0; i < numKillRecords; i++) {
              const randomVictimIndex = Math.floor(Math.random() * players.length);
              const victimId = players[randomVictimIndex].id;

              db.createKillRecord({
                victimId,
                location: `${location} ${i}`,
                killTime
              });
            }

            // Retrieve all kill records
            const killRecords = db.getKillRecords();

            // Verify all kill records reference valid player IDs
            const allReferencesValid = killRecords.every(record => 
              playerIds.has(record.victimId)
            );

            expect(allReferencesValid).toBe(true);
            expect(killRecords).toHaveLength(numKillRecords);

            // Verify each victim ID can be retrieved as a player
            const allVictimsExist = killRecords.every(record => {
              const player = db.getPlayerById(record.victimId);
              return player !== null;
            });

            expect(allVictimsExist).toBe(true);

            // Return true for fast-check assertion
            return allReferencesValid && allVictimsExist;
          }
        ),
        { numRuns: 100 }
      );
    }, 60000); // 60 second timeout for property-based test with 100 iterations
  });
});
