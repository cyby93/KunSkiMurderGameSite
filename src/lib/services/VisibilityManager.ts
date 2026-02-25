import type { KillRecord } from '../types';

/**
 * VisibilityManager handles the logic for determining which kill records
 * should be visible based on the 8pm daily update rule.
 * 
 * Rule: Kill records are only visible if they were submitted before the most recent 8pm.
 */
export class VisibilityManager {
  /**
   * Calculate the most recent 8pm timestamp relative to the current time.
   * 
   * Logic:
   * - If current time is before 8pm today, return 8pm yesterday
   * - If current time is at or after 8pm today, return 8pm today
   * 
   * @param currentTime - The current time to calculate from
   * @returns The most recent 8pm timestamp
   */
  getMostRecent8pm(currentTime: Date): Date {
    const cutoff = new Date(currentTime);
    cutoff.setHours(20, 0, 0, 0); // Set to 8pm (20:00) with zero minutes, seconds, milliseconds
    
    // If current time is before 8pm today, go back to 8pm yesterday
    if (currentTime < cutoff) {
      cutoff.setDate(cutoff.getDate() - 1);
    }
    
    return cutoff;
  }

  /**
   * Check if a specific kill record should be visible based on the current time.
   * 
   * A record is visible if it was submitted before the most recent 8pm.
   * 
   * @param record - The kill record to check
   * @param currentTime - The current time
   * @returns true if the record should be visible, false otherwise
   */
  isRecordVisible(record: KillRecord, currentTime: Date): boolean {
    const cutoff = this.getMostRecent8pm(currentTime);
    return record.submittedAt < cutoff;
  }

  /**
   * Filter an array of kill records to only those that should be visible.
   * 
   * @param allRecords - All kill records
   * @param currentTime - The current time
   * @returns Array of visible kill records
   */
  getVisibleRecords(allRecords: KillRecord[], currentTime: Date): KillRecord[] {
    return allRecords.filter(record => this.isRecordVisible(record, currentTime));
  }
}
