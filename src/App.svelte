<script lang="ts">
  import GameBoard from './lib/components/GameBoard.svelte';
  import './app.css';
</script>

<div class="app-container">
  <GameBoard />
</div>

<style>
  .app-container {
    width: 100%;
    min-height: 100vh;
    background-color: var(--color-bg-primary);
  }
</style>
