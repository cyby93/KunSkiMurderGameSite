import { describe, it, expect } from 'vitest';
import { VisibilityManager } from './VisibilityManager';
import type { KillRecord } from '../types';
import * as fc from 'fast-check';

describe('VisibilityManager', () => {
  const manager = new VisibilityManager();

  describe('getMostRecent8pm', () => {
    it('returns 8pm today when current time is after 8pm', () => {
      const currentTime = new Date('2024-01-15T21:30:00'); // 9:30 PM
      const result = manager.getMostRecent8pm(currentTime);
      
      expect(result.getHours()).toBe(20);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(15); // Same day
    });

    it('returns 8pm yesterday when current time is before 8pm', () => {
      const currentTime = new Date('2024-01-15T14:30:00'); // 2:30 PM
      const result = manager.getMostRecent8pm(currentTime);
      
      expect(result.getHours()).toBe(20);
      expect(result.getMinutes()).toBe(0);
      expect(result.getSeconds()).toBe(0);
      expect(result.getMilliseconds()).toBe(0);
      expect(result.getDate()).toBe(14); // Previous day
    });

    it('returns 8pm today when current time is exactly 8pm', () => {
      const currentTime = new Date('2024-01-15T20:00:00'); // Exactly 8:00 PM
      const result = manager.getMostRecent8pm(currentTime);
      
      expect(result.getHours()).toBe(20);
      expect(result.getDate()).toBe(15); // Same day
      expect(result.getTime()).toBe(currentTime.getTime());
    });

    it('handles midnight correctly', () => {
      const currentTime = new Date('2024-01-15T00:00:00'); // Midnight
      const result = manager.getMostRecent8pm(currentTime);
      
      expect(result.getHours()).toBe(20);
      expect(result.getDate()).toBe(14); // Previous day
    });

    it('handles month boundaries', () => {
      const currentTime = new Date('2024-02-01T10:00:00'); // Feb 1, 10 AM
      const result = manager.getMostRecent8pm(currentTime);
      
      expect(result.getHours()).toBe(20);
      expect(result.getDate()).toBe(31); // Jan 31
      expect(result.getMonth()).toBe(0); // January (0-indexed)
    });
  });

  describe('isRecordVisible', () => {
    it('returns true for record submitted before most recent 8pm', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      const record: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T19:00:00') // 7 PM (before 8 PM)
      };
      
      expect(manager.isRecordVisible(record, currentTime)).toBe(true);
    });

    it('returns false for record submitted after most recent 8pm', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      const record: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T20:30:00') // 8:30 PM (after 8 PM)
      };
      
      expect(manager.isRecordVisible(record, currentTime)).toBe(false);
    });

    it('returns false for record submitted exactly at 8pm', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      const record: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T20:00:00') // Exactly 8 PM
      };
      
      // Record submitted AT 8pm should not be visible until next 8pm
      expect(manager.isRecordVisible(record, currentTime)).toBe(false);
    });

    it('handles record submitted at 7:59pm (visible)', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      const record: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T19:59:00') // 7:59 PM
      };
      
      expect(manager.isRecordVisible(record, currentTime)).toBe(true);
    });

    it('handles record submitted at 8:01pm (not visible)', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      const record: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T20:01:00') // 8:01 PM
      };
      
      expect(manager.isRecordVisible(record, currentTime)).toBe(false);
    });

    it('handles records from multiple days', () => {
      const currentTime = new Date('2024-01-17T21:00:00'); // Jan 17, 9 PM
      
      const oldRecord: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T19:00:00') // Jan 15, 7 PM
      };
      
      const recentRecord: KillRecord = {
        id: '2',
        victimId: 'victim2',
        location: 'Garden',
        killTime: new Date('2024-01-17T15:00:00'),
        submittedAt: new Date('2024-01-17T19:00:00') // Jan 17, 7 PM
      };
      
      expect(manager.isRecordVisible(oldRecord, currentTime)).toBe(true);
      expect(manager.isRecordVisible(recentRecord, currentTime)).toBe(true);
    });

    it('handles current time before 8pm with record from yesterday', () => {
      const currentTime = new Date('2024-01-16T14:00:00'); // Jan 16, 2 PM
      const record: KillRecord = {
        id: '1',
        victimId: 'victim1',
        location: 'Library',
        killTime: new Date('2024-01-15T15:00:00'),
        submittedAt: new Date('2024-01-15T19:00:00') // Jan 15, 7 PM
      };
      
      // Most recent 8pm is Jan 15 at 8pm, record was submitted at 7pm, so visible
      expect(manager.isRecordVisible(record, currentTime)).toBe(true);
    });
  });

  describe('getVisibleRecords', () => {
    it('filters records correctly based on visibility', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      
      const records: KillRecord[] = [
        {
          id: '1',
          victimId: 'victim1',
          location: 'Library',
          killTime: new Date('2024-01-15T15:00:00'),
          submittedAt: new Date('2024-01-15T19:00:00') // 7 PM - visible
        },
        {
          id: '2',
          victimId: 'victim2',
          location: 'Garden',
          killTime: new Date('2024-01-15T16:00:00'),
          submittedAt: new Date('2024-01-15T20:30:00') // 8:30 PM - not visible
        },
        {
          id: '3',
          victimId: 'victim3',
          location: 'Kitchen',
          killTime: new Date('2024-01-15T14:00:00'),
          submittedAt: new Date('2024-01-15T18:00:00') // 6 PM - visible
        }
      ];
      
      const visible = manager.getVisibleRecords(records, currentTime);
      
      expect(visible).toHaveLength(2);
      expect(visible.map(r => r.id)).toEqual(['1', '3']);
    });

    it('returns empty array when no records are visible', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      
      const records: KillRecord[] = [
        {
          id: '1',
          victimId: 'victim1',
          location: 'Library',
          killTime: new Date('2024-01-15T15:00:00'),
          submittedAt: new Date('2024-01-15T20:30:00') // After 8 PM
        }
      ];
      
      const visible = manager.getVisibleRecords(records, currentTime);
      
      expect(visible).toHaveLength(0);
    });

    it('returns all records when all are visible', () => {
      const currentTime = new Date('2024-01-15T21:00:00'); // 9 PM
      
      const records: KillRecord[] = [
        {
          id: '1',
          victimId: 'victim1',
          location: 'Library',
          killTime: new Date('2024-01-15T15:00:00'),
          submittedAt: new Date('2024-01-15T19:00:00')
        },
        {
          id: '2',
          victimId: 'victim2',
          location: 'Garden',
          killTime: new Date('2024-01-15T16:00:00'),
          submittedAt: new Date('2024-01-15T18:00:00')
        }
      ];
      
      const visible = manager.getVisibleRecords(records, currentTime);
      
      expect(visible).toHaveLength(2);
    });

    it('handles empty array', () => {
      const currentTime = new Date('2024-01-15T21:00:00');
      const visible = manager.getVisibleRecords([], currentTime);
      
      expect(visible).toHaveLength(0);
    });
  });
});

  describe('Property-Based Tests', () => {
    /**
     * Feature: murder-mystery-game, Property 16: Visibility cutoff at most recent 8pm
     * **Validates: Requirements 5.1, 5.2**
     * 
     * For any kill record and current time, the record should be visible if and only if
     * it was submitted before the most recent 8pm relative to the current time.
     */
    it('property: visibility cutoff at most recent 8pm', () => {
      fc.assert(
        fc.property(
          // Generate random current time (within reasonable range)
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          // Generate random submission time (within reasonable range)
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          // Generate random kill record data
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.date({ min: new Date('2024-01-01'), max: new Date('2025-12-31') }),
          (currentTime, submittedAt, victimId, location, killTime) => {
            const manager = new VisibilityManager();
            
            // Create a kill record with the generated submission time
            const record: KillRecord = {
              id: 'test-id',
              victimId,
              location,
              killTime,
              submittedAt
            };
            
            // Calculate the most recent 8pm
            const mostRecent8pm = manager.getMostRecent8pm(currentTime);
            
            // Check visibility
            const isVisible = manager.isRecordVisible(record, currentTime);
            
            // Property: Record is visible if and only if submitted before most recent 8pm
            const expectedVisibility = submittedAt < mostRecent8pm;
            
            return isVisible === expectedVisibility;
          }
        ),
        { numRuns: 100 }
      );
    });
  });
