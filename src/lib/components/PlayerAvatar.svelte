<script lang="ts">
  import type { Player, KillRecord } from '../types';

  interface Props {
    player: Player;
    killRecord: KillRecord | null;
    onRecordKill: () => void;
  }

  let { player, killRecord, onRecordKill }: Props = $props();
</script>

<div class="player-avatar">
  <div class="avatar-container">
    <img 
      src={player.avatarUrl} 
      alt={player.name}
      class:grayscale={killRecord !== null}
    />
    
    {#if killRecord}
      <div class="kill-overlay">
        <div class="kill-info">
          <div class="kill-time">
            {new Date(killRecord.killTime).toLocaleString()}
          </div>
          <div class="kill-location">
            {killRecord.location}
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <div class="player-name">{player.name}</div>
  
  <button class="record-kill-btn" onclick={onRecordKill}>
    Record Kill
  </button>
</div>

<style>
  .player-avatar {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .avatar-container {
    position: relative;
    width: 150px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
  }

  .avatar-container img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: filter 0.3s ease;
  }

  .avatar-container img.grayscale {
    filter: grayscale(100%);
  }

  .kill-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: rgba(0, 0, 0, 0.8);
    padding: 0.5rem;
  }

  .kill-info {
    color: #fff;
    font-size: 0.75rem;
  }

  .kill-time {
    font-weight: bold;
    margin-bottom: 0.25rem;
  }

  .kill-location {
    font-style: italic;
  }

  .player-name {
    font-size: 1rem;
    font-weight: 500;
    text-align: center;
  }

  .record-kill-btn {
    padding: 0.5rem 1rem;
    background: #4a1a4a;
    color: #fff;
    border: 1px solid #6a2a6a;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    transition: background 0.2s ease;
  }

  .record-kill-btn:hover {
    background: #5a2a5a;
  }

  .record-kill-btn:active {
    background: #3a0a3a;
  }
</style>
