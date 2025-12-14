<script lang="ts">
  import { onMount } from 'svelte';
  import QuestionCard from './QuestionCard.svelte';
  import DamResult from './DamResult.svelte'; // We'll make this next

  let questions: any[] = [];
  let answers: { questionId: string, choiceKey: string }[] = [];
  let currentIdx = 0;
  let loading = true;
  let resultData: any = null;

  onMount(async () => {
    try {
      const res = await fetch('http://localhost:3000/api/questions');
      questions = await res.json();
      loading = false;
    } catch (e) {
      console.error(e);
      // Fallback or error state
    }
  });

  async function handleAnswer(event: CustomEvent) {
    const { questionId, choiceKey } = event.detail;
    answers = [...answers, { questionId, choiceKey }];
    
    if (currentIdx < questions.length - 1) {
      currentIdx++;
    } else {
      loading = true;
      await submitDiagnosis();
    }
  }

  async function submitDiagnosis() {
    try {
      const res = await fetch('http://localhost:3000/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });
      resultData = await res.json();
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="container">
  {#if loading && !resultData}
    <div class="loading">
      <div class="ripple"></div>
      <p>ダムを探しています...</p>
    </div>
  {:else if resultData}
    <DamResult result={resultData} />
  {:else if questions.length > 0}
    <QuestionCard 
      question={questions[currentIdx]} 
      currentNum={currentIdx + 1}
      totalNum={questions.length}
      on:answer={handleAnswer}
    />
  {/if}
</div>

<style>
  .container {
    height: 100%;
    display: flex;
    flex-direction: column;
  }
  .loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--color-primary);
  }
  
  /* Simple Ripple Animation */
  .ripple {
    width: 60px;
    height: 60px;
    border: 4px solid var(--color-primary);
    border-radius: 50%;
    animation: ripple 1.5s infinite;
    margin-bottom: 1rem;
  }

  @keyframes ripple {
    0% { transform: scale(0.8); opacity: 1; }
    100% { transform: scale(1.5); opacity: 0; }
  }
</style>
