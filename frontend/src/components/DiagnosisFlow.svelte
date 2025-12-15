<script lang="ts">
  import { onMount } from "svelte";
  import QuestionCard from "./QuestionCard.svelte";
  import DamResult from "./DamResult.svelte"; // We'll make this next

  let questions: any[] = [];
  let answers: { questionId: string; choiceKey: string }[] = [];
  let currentIdx = 0;
  let loading = true;
  let resultData: any = null;
  let started = false;

  onMount(async () => {
    try {
      const apiUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/questions`);
      questions = await res.json();
      loading = false;
    } catch (e) {
      console.error(e);
    }
  });

  function startDiagnosis() {
    started = true;
  }

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
      const apiUrl = import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
      const res = await fetch(`${apiUrl}/api/diagnose`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
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
  {#if !started}
    <div class="landing">
      <div class="hero-content">
        <h1>ダムBTI</h1>
        <p class="subtitle">Dam Based Type Indicator</p>
        <p class="description">
          あなたの性格を全国の『ダム』に例えて診断します。<br />
          放流のクセ、堤体の重厚感、貯水容量...<br />
          18の質問から、あなたに最も近いダム構造を科学的に分析。
        </p>
        <button class="start-btn" on:click={startDiagnosis}
          >診断を開始する</button
        >
        <p class="meta">所要時間：約2分 | 完全無料</p>
      </div>
    </div>
  {:else if loading && !resultData}
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
    0% {
      transform: scale(0.8);
      opacity: 1;
    }
    100% {
      transform: scale(1.5);
      opacity: 0;
    }
  }
  /* Landing Styles */
  .landing {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: linear-gradient(to bottom, #f0f4ff, #fff);
  }
  .hero-content h1 {
    font-size: 3rem;
    color: var(--color-primary);
    margin: 0;
    line-height: 1.2;
  }
  .subtitle {
    font-size: 1rem;
    color: #666;
    letter-spacing: 0.1em;
    margin-bottom: 2rem;
    font-weight: bold;
  }
  .description {
    font-size: 1rem;
    color: #444;
    line-height: 1.8;
    margin-bottom: 3rem;
  }
  .start-btn {
    background: var(--color-primary);
    color: white;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 1rem 3rem;
    border: none;
    border-radius: 50px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0, 100, 255, 0.3);
    transition:
      transform 0.2s,
      box-shadow 0.2s;
  }
  .start-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 100, 255, 0.4);
  }
  .meta {
    margin-top: 1.5rem;
    font-size: 0.8rem;
    color: #888;
  }
</style>
