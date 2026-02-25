<script lang="ts">
  import type { Player } from '../types';

  interface Props {
    gameEnded: boolean;
    murdererWon: boolean;
    murdererName: string;
    survivors: Player[];
  }

  let { gameEnded, murdererWon, murdererName, survivors }: Props = $props();
</script>

{#if gameEnded}
  <div class="game-outcome">
    <div class="outcome-container">
      <h1 class="outcome-title">Game Over</h1>
      
      <div class="murderer-reveal">
        <h2>The Murderer Was:</h2>
        <p class="murderer-name">{murdererName}</p>
      </div>

      {#if murdererWon}
        <div class="victory-message murderer-victory">
          <h2>🗡️ The Murderer Wins! 🗡️</h2>
          <p>All players have been eliminated. The murderer has successfully completed their dark mission.</p>
        </div>
      {:else}
        <div class="victory-message survivors-victory">
          <h2>🎉 The Survivors Win! 🎉</h2>
          <p>At least one player survived the week-long ordeal!</p>
          
          <div class="survivors-list">
            <h3>Survivors:</h3>
            <ul>
              {#each survivors as survivor}
                <li>{survivor.name}</li>
              {/each}
            </ul>
          </div>
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .game-outcome {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1rem;
  }

  .outcome-container {
    background: linear-gradient(135deg, #1a0a2e 0%, #2d1b4e 100%);
    border: 2px solid #8b7355;
    border-radius: 12px;
    padding: 2rem;
    max-width: 600px;
    width: 100%;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.8);
    text-align: center;
  }

  .outcome-title {
    font-size: 2.5rem;
    color: #d4af37;
    margin: 0 0 1.5rem 0;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
    font-family: 'Georgia', serif;
  }

  .murderer-reveal {
    background: rgba(0, 0, 0, 0.4);
    padding: 1.5rem;
    border-radius: 8px;
    margin-bottom: 2rem;
    border: 1px solid #8b7355;
  }

  .murderer-reveal h2 {
    font-size: 1.5rem;
    color: #c9a961;
    margin: 0 0 0.5rem 0;
    font-family: 'Georgia', serif;
  }

  .murderer-name {
    font-size: 2rem;
    color: #ff6b6b;
    font-weight: bold;
    margin: 0;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  .victory-message {
    padding: 1.5rem;
    border-radius: 8px;
    border: 2px solid;
  }

  .murderer-victory {
    background: rgba(139, 0, 0, 0.2);
    border-color: #8b0000;
  }

  .murderer-victory h2 {
    color: #ff4444;
    font-size: 1.8rem;
    margin: 0 0 1rem 0;
    font-family: 'Georgia', serif;
  }

  .murderer-victory p {
    color: #ffcccc;
    font-size: 1.1rem;
    margin: 0;
  }

  .survivors-victory {
    background: rgba(0, 100, 0, 0.2);
    border-color: #228b22;
  }

  .survivors-victory h2 {
    color: #44ff44;
    font-size: 1.8rem;
    margin: 0 0 1rem 0;
    font-family: 'Georgia', serif;
  }

  .survivors-victory p {
    color: #ccffcc;
    font-size: 1.1rem;
    margin: 0 0 1.5rem 0;
  }

  .survivors-list {
    background: rgba(0, 0, 0, 0.3);
    padding: 1rem;
    border-radius: 6px;
    margin-top: 1rem;
  }

  .survivors-list h3 {
    color: #c9a961;
    font-size: 1.3rem;
    margin: 0 0 0.75rem 0;
    font-family: 'Georgia', serif;
  }

  .survivors-list ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .survivors-list li {
    color: #e0e0e0;
    font-size: 1.1rem;
    padding: 0.5rem;
    border-bottom: 1px solid rgba(139, 115, 85, 0.3);
  }

  .survivors-list li:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    .outcome-container {
      padding: 1.5rem;
    }

    .outcome-title {
      font-size: 2rem;
    }

    .murderer-name {
      font-size: 1.5rem;
    }

    .victory-message h2 {
      font-size: 1.5rem;
    }

    .victory-message p {
      font-size: 1rem;
    }

    .survivors-list h3 {
      font-size: 1.1rem;
    }

    .survivors-list li {
      font-size: 1rem;
    }
  }

  @media (max-width: 480px) {
    .outcome-title {
      font-size: 1.5rem;
    }

    .murderer-reveal h2 {
      font-size: 1.2rem;
    }

    .murderer-name {
      font-size: 1.3rem;
    }

    .victory-message h2 {
      font-size: 1.3rem;
    }
  }
</style>
