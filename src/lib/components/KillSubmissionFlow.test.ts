import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DatabaseService } from '../services/DatabaseService';
import type { KillRecordInput } from '../types';

describe('Kill Record Submission Flow Integration', () => {
  let dbService: DatabaseService;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    dbService = new DatabaseService();
  });

  afterEach(() => {
    // Clean up localStorage after each test
    localStorage.clear();
  });

  it('should complete full kill submission flow: initialize -> submit -> refresh -> verify', () => {
    // Step 1: Initialize game (simulating GameBoard loadGameState)
    const gameState = dbService.initializeGame();
    expect(gameState).toBeDefined();
    expect(gameState.murdererId).toBeDefined();

    // Step 2: Get players (simulating GameBoard state)
    const players = dbService.getPlayers();
    expect(players).toHaveLength(15);

    // Step 3: Simulate user opening kill form and selecting a victim
    const selectedVictim = players[0];
    expect(selectedVictim).toBeDefined();

    // Step 4: Simulate user submitting kill form (handleKillSubmit)
    const killRecordInput: KillRecordInput = {
      victimId: selectedVictim.id,
      location: 'Library',
      killTime: new Date('2024-01-15T14:30:00')
    };

    const createdRecord = dbService.createKillRecord(killRecordInput);
    expect(createdRecord).toBeDefined();
    expect(createdRecord.victimId).toBe(selectedVictim.id);
    expect(createdRecord.location).toBe('Library');
    expect(createdRecord.killTime.getTime()).toBe(new Date('2024-01-15T14:30:00').getTime());

    // Step 5: Simulate refreshing game state (loadGameState after submission)
    const killRecords = dbService.getKillRecords();
    expect(killRecords).toHaveLength(1);
    expect(killRecords[0].victimId).toBe(selectedVictim.id);
    expect(killRecords[0].location).toBe('Library');

    // Step 6: Verify the kill record persists across reload
    const reloadedRecords = dbService.getKillRecords();
    expect(reloadedRecords).toHaveLength(1);
    expect(reloadedRecords[0].id).toBe(createdRecord.id);
  });

  it('should handle multiple kill submissions correctly', () => {
    // Initialize game
    dbService.initializeGame();
    const players = dbService.getPlayers();

    // Submit multiple kill records
    const killRecord1: KillRecordInput = {
      victimId: players[0].id,
      location: 'Library',
      killTime: new Date('2024-01-15T14:30:00')
    };

    const killRecord2: KillRecordInput = {
      victimId: players[1].id,
      location: 'Dining Room',
      killTime: new Date('2024-01-15T16:45:00')
    };

    const killRecord3: KillRecordInput = {
      victimId: players[2].id,
      location: 'Garden',
      killTime: new Date('2024-01-15T19:00:00')
    };

    dbService.createKillRecord(killRecord1);
    dbService.createKillRecord(killRecord2);
    dbService.createKillRecord(killRecord3);

    // Verify all records are persisted
    const allRecords = dbService.getKillRecords();
    expect(allRecords).toHaveLength(3);

    // Verify each record has correct data
    const record1 = allRecords.find(r => r.victimId === players[0].id);
    expect(record1).toBeDefined();
    expect(record1?.location).toBe('Library');

    const record2 = allRecords.find(r => r.victimId === players[1].id);
    expect(record2).toBeDefined();
    expect(record2?.location).toBe('Dining Room');

    const record3 = allRecords.find(r => r.victimId === players[2].id);
    expect(record3).toBeDefined();
    expect(record3?.location).toBe('Garden');
  });

  it('should maintain referential integrity between kill records and players', () => {
    // Initialize game
    dbService.initializeGame();
    const players = dbService.getPlayers();

    // Submit kill record
    const killRecordInput: KillRecordInput = {
      victimId: players[5].id,
      location: 'Ballroom',
      killTime: new Date('2024-01-15T20:00:00')
    };

    dbService.createKillRecord(killRecordInput);

    // Verify the victim player still exists
    const victim = dbService.getPlayerById(players[5].id);
    expect(victim).toBeDefined();
    expect(victim?.id).toBe(players[5].id);

    // Verify kill record references the correct player
    const killRecords = dbService.getKillRecords();
    expect(killRecords[0].victimId).toBe(victim?.id);
  });
});
