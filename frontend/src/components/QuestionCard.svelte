<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let question: { id: string, text: string, category: string, choices: { key: string, text: string }[] };
  export let currentNum: number;
  export let totalNum: number;

  const dispatch = createEventDispatcher();
  let selectedKey: string | null = null;

  function select(key: string) {
    selectedKey = key;
    setTimeout(() => {
      dispatch('answer', { questionId: question.id, choiceKey: key });
      selectedKey = null; // Reset for next
    }, 400);
  }
</script>

<div class="card">
  <div class="progress">
    Q{currentNum} / {totalNum}
    <div class="bar" style="width: {(currentNum / totalNum) * 100}%"></div>
  </div>

  <h2 class="question-text">{question.text}</h2>

  <div class="choices">
    {#each question.choices as choice}
      <button 
        class:selected={selectedKey === choice.key}
        on:click={() => select(choice.key)}
      >
        <span class="key">{choice.key}</span>
        <span class="text">{choice.text}</span>
      </button>
    {/each}
  </div>
</div>

<style>
  .card {
    padding: 2rem;
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .progress {
    font-size: 0.8rem;
    color: #888;
    margin-bottom: 2rem;
    position: relative;
    padding-bottom: 0.5rem;
  }
  .bar {
    position: absolute;
    bottom: 0;
    left: 0;
    height: 2px;
    background: var(--color-primary);
    transition: width 0.3s ease;
  }

  .question-text {
    font-size: 1.25rem;
    line-height: 1.6;
    margin-bottom: 2.5rem;
    min-height: 4em; /* avoid layout jump */
  }

  .choices {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  button {
    background: white;
    border: 1px solid var(--color-concrete);
    padding: 1rem;
    border-radius: 8px;
    text-align: left;
    display: flex;
    align-items: center;
    transition: all 0.2s;
  }

  button:hover {
    background: #f8f9fa;
    border-color: var(--color-primary);
  }

  button.selected {
    background: var(--color-primary);
    color: white;
    border-color: var(--color-primary);
    transform: scale(1.02);
  }

  .key {
    font-weight: bold;
    margin-right: 1rem;
    opacity: 0.6;
  }
</style>
