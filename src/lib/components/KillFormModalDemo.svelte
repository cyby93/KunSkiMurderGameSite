<script lang="ts">
  import KillFormModal from './KillFormModal.svelte';
  import type { Player, KillRecordInput } from '../types';

  // Create mock players for demo
  const mockPlayers: Player[] = Array.from({ length: 15 }, (_, i) => ({
    id: `player-${i + 1}`,
    name: `Player ${i + 1}`,
    avatarUrl: `https://i.pravatar.cc/150`,
    isMurderer: i === 0
  }));

  let isModalOpen = $state(false);
  let lastSubmission = $state<KillRecordInput | null>(null);

  function openModal() {
    isModalOpen = true;
  }

  function closeModal() {
    isModalOpen = false;
  }

  function handleSubmit(record: KillRecordInput) {
    lastSubmission = record;
    console.log('Kill record submitted:', record);
    closeModal();
  }
</script>

<div class="demo-container">
  <h2>KillFormModal Demo</h2>
  
  <button onclick={openModal} class="demo-btn">
    Open Kill Form Modal
  </button>

  {#if lastSubmission}
    <div class="submission-info">
      <h3>Last Submission:</h3>
      <p><strong>Victim ID:</strong> {lastSubmission.victimId}</p>
      <p><strong>Location:</strong> {lastSubmission.location}</p>
      <p><strong>Kill Time:</strong> {lastSubmission.killTime.toLocaleString()}</p>
    </div>
  {/if}

  <KillFormModal 
    isOpen={isModalOpen}
    players={mockPlayers}
    onSubmit={handleSubmit}
    onClose={closeModal}
  />
</div>

<style>
  .demo-container {
    padding: 2rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .demo-btn {
    padding: 1rem 2rem;
    background: #4a1a4a;
    color: #fff;
    border: 1px solid #6a2a6a;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background 0.2s ease;
  }

  .demo-btn:hover {
    background: #5a2a5a;
  }

  .submission-info {
    margin-top: 2rem;
    padding: 1rem;
    background: #1a1a2e;
    border: 1px solid #4a1a4a;
    border-radius: 4px;
  }

  .submission-info h3 {
    margin-top: 0;
    color: #d4af37;
  }

  .submission-info p {
    margin: 0.5rem 0;
  }
</style>
