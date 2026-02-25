<script lang="ts">
  import type { Player, KillRecordInput } from '../types';

  interface Props {
    isOpen: boolean;
    players: Player[];
    onSubmit: (record: KillRecordInput) => void;
    onClose: () => void;
  }

  let { isOpen, players, onSubmit, onClose }: Props = $props();

  let victimId = $state('');
  let location = $state('');
  let killTime = $state('');
  let errors = $state<{ victimId?: string; location?: string; killTime?: string }>({});

  function validateForm(): boolean {
    const newErrors: typeof errors = {};
    
    if (!victimId) {
      newErrors.victimId = 'Please select a victim';
    }
    
    if (!location || location.trim() === '') {
      newErrors.location = 'Location is required';
    }
    
    if (!killTime) {
      newErrors.killTime = 'Kill time is required';
    }
    
    errors = newErrors;
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const record: KillRecordInput = {
      victimId,
      location: location.trim(),
      killTime: new Date(killTime)
    };

    onSubmit(record);
    resetForm();
  }

  function handleClose() {
    resetForm();
    onClose();
  }

  function resetForm() {
    victimId = '';
    location = '';
    killTime = '';
    errors = {};
  }

  function handleBackdropClick(e: MouseEvent) {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  }

  function handleBackdropKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      handleClose();
    }
  }
</script>

{#if isOpen}
  <div 
    class="modal-backdrop" 
    onclick={handleBackdropClick}
    onkeydown={handleBackdropKeydown}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    tabindex="-1"
  >
    <div class="modal-container">
      <div class="modal-header">
        <h2 id="modal-title">Record Kill</h2>
        <button class="close-btn" onclick={handleClose} aria-label="Close">×</button>
      </div>

      <form onsubmit={handleSubmit}>
        <div class="form-group">
          <label for="victim">Victim</label>
          <select 
            id="victim" 
            bind:value={victimId}
            class:error={errors.victimId}
          >
            <option value="">Select a victim...</option>
            {#each players as player}
              <option value={player.id}>{player.name}</option>
            {/each}
          </select>
          {#if errors.victimId}
            <span class="error-message">{errors.victimId}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="location">Location</label>
          <input 
            type="text" 
            id="location" 
            bind:value={location}
            placeholder="Enter kill location"
            class:error={errors.location}
          />
          {#if errors.location}
            <span class="error-message">{errors.location}</span>
          {/if}
        </div>

        <div class="form-group">
          <label for="killTime">Kill Time</label>
          <input 
            type="datetime-local" 
            id="killTime" 
            bind:value={killTime}
            class:error={errors.killTime}
          />
          {#if errors.killTime}
            <span class="error-message">{errors.killTime}</span>
          {/if}
        </div>

        <div class="form-actions">
          <button type="button" class="btn-secondary" onclick={handleClose}>
            Cancel
          </button>
          <button type="submit" class="btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .modal-container {
    background: #1a1a2e;
    border: 1px solid #4a1a4a;
    border-radius: 8px;
    width: 100%;
    max-width: 500px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.5);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-bottom: 1px solid #4a1a4a;
  }

  .modal-header h2 {
    margin: 0;
    color: #d4af37;
    font-size: 1.5rem;
    font-weight: 600;
  }

  .close-btn {
    background: none;
    border: none;
    color: #d4af37;
    font-size: 2rem;
    cursor: pointer;
    padding: 0;
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;
  }

  .close-btn:hover {
    color: #fff;
  }

  form {
    padding: 1.5rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  label {
    display: block;
    margin-bottom: 0.5rem;
    color: #d4af37;
    font-weight: 500;
    font-size: 0.875rem;
  }

  input,
  select {
    width: 100%;
    padding: 0.75rem;
    background: #0f0f1e;
    border: 1px solid #4a1a4a;
    border-radius: 4px;
    color: #fff;
    font-size: 1rem;
    transition: border-color 0.2s ease;
  }

  input:focus,
  select:focus {
    outline: none;
    border-color: #6a2a6a;
  }

  input.error,
  select.error {
    border-color: #d32f2f;
  }

  .error-message {
    display: block;
    margin-top: 0.25rem;
    color: #d32f2f;
    font-size: 0.75rem;
  }

  select {
    cursor: pointer;
  }

  select option {
    background: #0f0f1e;
    color: #fff;
  }

  .form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
    margin-top: 2rem;
  }

  .btn-primary,
  .btn-secondary {
    padding: 0.75rem 1.5rem;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    border: none;
  }

  .btn-primary {
    background: #4a1a4a;
    color: #fff;
    border: 1px solid #6a2a6a;
  }

  .btn-primary:hover {
    background: #5a2a5a;
  }

  .btn-primary:active {
    background: #3a0a3a;
  }

  .btn-secondary {
    background: transparent;
    color: #d4af37;
    border: 1px solid #4a1a4a;
  }

  .btn-secondary:hover {
    background: rgba(74, 26, 74, 0.2);
  }

  .btn-secondary:active {
    background: rgba(74, 26, 74, 0.4);
  }

  /* Responsive design for mobile */
  @media (max-width: 320px) {
    .modal-container {
      max-width: 100%;
    }

    .modal-header {
      padding: 1rem;
    }

    form {
      padding: 1rem;
    }

    .form-actions {
      flex-direction: column;
    }

    .btn-primary,
    .btn-secondary {
      width: 100%;
    }
  }
</style>
