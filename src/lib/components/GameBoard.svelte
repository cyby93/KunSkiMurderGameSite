<script lang="ts">
  import type { Player, KillRecord, KillRecordInput } from '../types';
  import { DatabaseService } from '../services/DatabaseService';
  import { VisibilityManager } from '../services/VisibilityManager';
  import { WinConditionEvaluator } from '../services/WinConditionEvaluator';
  import PlayerAvatar from './PlayerAvatar.svelte';
  import KillFormModal from './KillFormModal.svelte';
  import GameOutcome from './GameOutcome.svelte';

  // Initialize services
  const dbService = new DatabaseService();
  const visibilityManager = new VisibilityManager();
  const winConditionEvaluator = new WinConditionEvaluator();

  // Reactive state using Svelte 5 runes
  let players = $state<Player[]>([]);
  let killRecords = $state<KillRecord[]>([]);
  let currentTime = $state<Date>(new Date());
  let gameStartTime = $state<Date | null>(null);
  let murdererId = $state<string | null>(null);

  // Modal state
  let isModalOpen = $state(false);
  let selectedPlayerId = $state<string | null>(null);

  // Derived state for visible kill records based on VisibilityManager
  let visibleKillRecords = $derived(
    visibilityManager.getVisibleRecords(killRecords, currentTime)
  );

  // Derived state for win condition
  let winCondition = $derived.by(() => {
    if (!gameStartTime || !murdererId) {
      return { gameEnded: false, murdererWon: false, survivors: [] };
    }

    const gameEnded = winConditionEvaluator.isGameEnded(gameStartTime, currentTime);
    
    if (!gameEnded) {
      return { gameEnded: false, murdererWon: false, survivors: [] };
    }

    return winConditionEvaluator.evaluateWinCondition(players, killRecords, murdererId);
  });

  // Effect to load game state on mount
  $effect(() => {
    loadGameState();
  });

  /**
   * Load game state from DatabaseService
   * Initializes game if it doesn't exist, then loads players and kill records
   */
  function loadGameState(): void {
    // Initialize game if it doesn't exist
    dbService.initializeGame();

    // Load game state (start time and murderer)
    const gameState = dbService.getGameState();
    if (gameState) {
      gameStartTime = gameState.startTime;
      murdererId = gameState.murdererId;
    }

    // Load players
    players = dbService.getPlayers();

    // Load kill records
    killRecords = dbService.getKillRecords();

    // Update current time
    currentTime = new Date();
  }

  /**
   * Recalculate visible records by updating current time
   * This triggers the $derived reactive statement
   */
  function refreshVisibility(): void {
    currentTime = new Date();
  }

  /**
   * Open kill form modal for a specific player
   */
  function openKillForm(playerId: string): void {
    selectedPlayerId = playerId;
    isModalOpen = true;
  }

  /**
   * Close kill form modal
   */
  function closeKillForm(): void {
    isModalOpen = false;
    selectedPlayerId = null;
  }

  /**
   * Handle kill record submission
   */
  function handleKillSubmit(record: KillRecordInput): void {
    // Save to database
    dbService.createKillRecord(record);

    // Reload game state
    loadGameState();

    // Close modal
    closeKillForm();
  }

  /**
   * Get kill record for a specific player from visible records
   */
  function getKillRecordForPlayer(playerId: string): KillRecord | null {
    return visibleKillRecords.find(record => record.victimId === playerId) || null;
  }
</script>

<div class="game-board">
  <div class="game-header">
    <h1>Murder Mystery Game</h1>
    <button class="refresh-btn" onclick={refreshVisibility}>
      Refresh Visibility
    </button>
  </div>

  <div class="players-grid">
    {#each players as player (player.id)}
      <PlayerAvatar
        player={player}
        killRecord={getKillRecordForPlayer(player.id)}
        onRecordKill={() => openKillForm(player.id)}
      />
    {/each}
  </div>

  <KillFormModal
    isOpen={isModalOpen}
    players={players}
    onSubmit={handleKillSubmit}
    onClose={closeKillForm}
  />

  <GameOutcome
    gameEnded={winCondition.gameEnded}
    murdererWon={winCondition.murdererWon}
    murdererName={players.find(p => p.id === murdererId)?.name || 'Unknown'}
    survivors={winCondition.survivors}
  />
</div>

<style>
  .game-board {
    min-height: 100vh;
    background: #0f0f1e;
    color: #fff;
    padding: 2rem;
  }

  .game-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
  }

  .game-header h1 {
    margin: 0;
    color: #d4af37;
    font-size: 2rem;
    font-weight: 600;
  }

  .refresh-btn {
    padding: 0.75rem 1.5rem;
    background: #4a1a4a;
    color: #fff;
    border: 1px solid #6a2a6a;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s ease;
  }

  .refresh-btn:hover {
    background: #5a2a5a;
  }

  .refresh-btn:active {
    background: #3a0a3a;
  }

  .players-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
  }

  /* Responsive layout adjustments */
  @media (max-width: 768px) {
    .game-board {
      padding: 1rem;
    }

    .game-header h1 {
      font-size: 1.5rem;
    }

    .players-grid {
      gap: 1.5rem;
    }
  }

  @media (max-width: 480px) {
    .game-header {
      flex-direction: column;
      align-items: stretch;
    }

    .refresh-btn {
      width: 100%;
    }

    .players-grid {
      gap: 1rem;
    }
  }
</style>
