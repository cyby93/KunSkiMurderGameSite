import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { WinConditionEvaluator } from './WinConditionEvaluator';
import type { Player, KillRecord } from '../types';

describe('WinConditionEvaluator', () => {
  const evaluator = new WinConditionEvaluator();

  // Helper function to create a player
  const createPlayer = (id: string, name: string, isMurderer = false): Player => ({
    id,
    name,
    avatarUrl: `https://i.pravatar.cc/150`,
    isMurderer
  });

  // Helper function to create a kill record
  const createKillRecord = (victimId: string, index: number): KillRecord => ({
    id: `kill-${index}`,
    victimId,
    location: `Location ${index}`,
    killTime: new Date('2024-01-01T12:00:00Z'),
    submittedAt: new Date('2024-01-01T13:00:00Z')
  });

  describe('isGameEnded', () => {
    it('should return false when less than 7 days have passed', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const currentTime = new Date('2024-01-07T23:59:59Z'); // 6 days, 23 hours, 59 minutes
      
      expect(evaluator.isGameEnded(startTime, currentTime)).toBe(false);
    });

    it('should return true when exactly 7 days have passed', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const currentTime = new Date('2024-01-08T00:00:00Z'); // Exactly 7 days
      
      expect(evaluator.isGameEnded(startTime, currentTime)).toBe(true);
    });

    it('should return true when more than 7 days have passed', () => {
      const startTime = new Date('2024-01-01T00:00:00Z');
      const currentTime = new Date('2024-01-10T00:00:00Z'); // 9 days
      
      expect(evaluator.isGameEnded(startTime, currentTime)).toBe(true);
    });

    it('should handle game starting at different times of day', () => {
      const startTime = new Date('2024-01-01T14:30:00Z');
      const currentTime = new Date('2024-01-08T14:30:00Z'); // Exactly 7 days later
      
      expect(evaluator.isGameEnded(startTime, currentTime)).toBe(true);
    });

    // **Property 20: Game duration is exactly seven days**
    // **Validates: Requirements 7.1**
    it('should return true if and only if elapsed time >= 7 days', () => {
      fc.assert(
        fc.property(
          fc.date(),
          fc.integer({ min: 0, max: 1000000 }),
          (startTime, minutesElapsed) => {
            const currentTime = new Date(startTime.getTime() + minutesElapsed * 60 * 1000);
            const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
            const elapsedMs = currentTime.getTime() - startTime.getTime();
            
            const result = evaluator.isGameEnded(startTime, currentTime);
            const expected = elapsedMs >= sevenDaysMs;
            
            expect(result).toBe(expected);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('evaluateWinCondition', () => {
    it('should declare murderer wins when all 14 non-murderer players are killed', () => {
      // Create 15 players (1 murderer + 14 others)
      const players: Player[] = [
        createPlayer('murderer', 'Murderer', true),
        ...Array.from({ length: 14 }, (_, i) => 
          createPlayer(`player-${i}`, `Player ${i}`, false)
        )
      ];

      // Create kill records for all 14 non-murderer players
      const killRecords: KillRecord[] = Array.from({ length: 14 }, (_, i) =>
        createKillRecord(`player-${i}`, i)
      );

      const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

      expect(result.gameEnded).toBe(true);
      expect(result.murdererWon).toBe(true);
      expect(result.survivors).toHaveLength(0);
    });

    it('should declare survivors win when at least one non-murderer player is alive', () => {
      // Create 15 players
      const players: Player[] = [
        createPlayer('murderer', 'Murderer', true),
        ...Array.from({ length: 14 }, (_, i) => 
          createPlayer(`player-${i}`, `Player ${i}`, false)
        )
      ];

      // Create kill records for only 13 players (1 survivor)
      const killRecords: KillRecord[] = Array.from({ length: 13 }, (_, i) =>
        createKillRecord(`player-${i}`, i)
      );

      const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

      expect(result.gameEnded).toBe(true);
      expect(result.murdererWon).toBe(false);
      expect(result.survivors).toHaveLength(1);
      expect(result.survivors[0].id).toBe('player-13');
    });

    it('should handle multiple survivors', () => {
      const players: Player[] = [
        createPlayer('murderer', 'Murderer', true),
        ...Array.from({ length: 14 }, (_, i) => 
          createPlayer(`player-${i}`, `Player ${i}`, false)
        )
      ];

      // Only 10 players killed, 4 survivors
      const killRecords: KillRecord[] = Array.from({ length: 10 }, (_, i) =>
        createKillRecord(`player-${i}`, i)
      );

      const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

      expect(result.gameEnded).toBe(true);
      expect(result.murdererWon).toBe(false);
      expect(result.survivors).toHaveLength(4);
      expect(result.survivors.map(s => s.id)).toEqual([
        'player-10', 'player-11', 'player-12', 'player-13'
      ]);
    });

    it('should handle no kills at all', () => {
      const players: Player[] = [
        createPlayer('murderer', 'Murderer', true),
        ...Array.from({ length: 14 }, (_, i) => 
          createPlayer(`player-${i}`, `Player ${i}`, false)
        )
      ];

      const killRecords: KillRecord[] = [];

      const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

      expect(result.gameEnded).toBe(true);
      expect(result.murdererWon).toBe(false);
      expect(result.survivors).toHaveLength(14);
    });

    it('should ignore kill records for the murderer', () => {
      const players: Player[] = [
        createPlayer('murderer', 'Murderer', true),
        ...Array.from({ length: 14 }, (_, i) => 
          createPlayer(`player-${i}`, `Player ${i}`, false)
        )
      ];

      // All 14 non-murderers killed + murderer also has a kill record (false accusation)
      const killRecords: KillRecord[] = [
        ...Array.from({ length: 14 }, (_, i) => createKillRecord(`player-${i}`, i)),
        createKillRecord('murderer', 14) // Kill record for murderer
      ];

      const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

      // Murderer still wins because all non-murderers are dead
      expect(result.gameEnded).toBe(true);
      expect(result.murdererWon).toBe(true);
      expect(result.survivors).toHaveLength(0);
    });

    it('should handle duplicate kill records for same victim', () => {
      const players: Player[] = [
        createPlayer('murderer', 'Murderer', true),
        ...Array.from({ length: 14 }, (_, i) => 
          createPlayer(`player-${i}`, `Player ${i}`, false)
        )
      ];

      // Multiple kill records for same victims
      const killRecords: KillRecord[] = [
        createKillRecord('player-0', 0),
        createKillRecord('player-0', 1), // Duplicate
        createKillRecord('player-1', 2),
        createKillRecord('player-1', 3), // Duplicate
      ];

      const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

      // Only 2 players killed (despite 4 records), 12 survivors
      expect(result.gameEnded).toBe(true);
      expect(result.murdererWon).toBe(false);
      expect(result.survivors).toHaveLength(12);
    });

    // **Property 21: Win condition evaluation**
    // **Validates: Requirements 7.2, 7.3**
    it('should correctly determine winner based on number of kills', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 14 }), // Number of non-murderer players killed
          fc.boolean(), // Whether to include kill record for murderer
          (numKilled, includeMurdererKill) => {
            // Create 15 players
            const players: Player[] = [
              createPlayer('murderer', 'Murderer', true),
              ...Array.from({ length: 14 }, (_, i) => 
                createPlayer(`player-${i}`, `Player ${i}`, false)
              )
            ];

            // Create kill records for numKilled non-murderer players
            const killRecords: KillRecord[] = Array.from({ length: numKilled }, (_, i) =>
              createKillRecord(`player-${i}`, i)
            );

            // Optionally add kill record for murderer
            if (includeMurdererKill) {
              killRecords.push(createKillRecord('murderer', numKilled));
            }

            const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

            // Verify game ended flag
            expect(result.gameEnded).toBe(true);

            // Verify win condition
            if (numKilled === 14) {
              // All non-murderers killed -> murderer wins
              expect(result.murdererWon).toBe(true);
              expect(result.survivors).toHaveLength(0);
            } else {
              // At least one survivor -> survivors win
              expect(result.murdererWon).toBe(false);
              expect(result.survivors).toHaveLength(14 - numKilled);
            }

            // Verify survivors are non-murderers
            result.survivors.forEach(survivor => {
              expect(survivor.id).not.toBe('murderer');
              expect(survivor.isMurderer).toBe(false);
            });

            // Verify survivors don't have kill records
            const victimIds = new Set(killRecords.map(kr => kr.victimId));
            result.survivors.forEach(survivor => {
              expect(victimIds.has(survivor.id)).toBe(false);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    // Additional property test: survivors should always be a subset of non-murderer players
    it('survivors should always be non-murderer players without kill records', () => {
      fc.assert(
        fc.property(
          fc.array(fc.integer({ min: 0, max: 13 }), { minLength: 0, maxLength: 14 }).map(arr => [...new Set(arr)]),
          (killedIndices) => {
            const players: Player[] = [
              createPlayer('murderer', 'Murderer', true),
              ...Array.from({ length: 14 }, (_, i) => 
                createPlayer(`player-${i}`, `Player ${i}`, false)
              )
            ];

            const killRecords: KillRecord[] = killedIndices.map((idx, i) =>
              createKillRecord(`player-${idx}`, i)
            );

            const result = evaluator.evaluateWinCondition(players, killRecords, 'murderer');

            // All survivors should be non-murderer players
            result.survivors.forEach(survivor => {
              expect(survivor.isMurderer).toBe(false);
              expect(survivor.id).not.toBe('murderer');
            });

            // Number of survivors should equal non-murderers minus killed
            const expectedSurvivors = 14 - killedIndices.length;
            expect(result.survivors).toHaveLength(expectedSurvivors);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
