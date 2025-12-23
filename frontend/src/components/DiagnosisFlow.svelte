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
        <h1 class="glitch" data-text="ダムBTI">ダムBTI</h1>
        <p class="subtitle">DAM BASED TYPE INDICATOR</p>

        <div class="warning-box">
          <span class="icon">⚠️</span>
          <span>INTERNAL PRESSURE CRITICAL</span>
          <span class="icon">⚠️</span>
        </div>

        <p class="description">
          <span class="highlight">「あなたの心は何㎥ですか？」</span><br /><br />
          コンクリートの塊に、己の魂を投影せよ。<br />
          放流の轟音、圧倒的質量、静寂なる水面...。<br />
          <br />
          全3000基のデータが、あなたの<span class="danger">「決壊」</span>を待っている。
        </p>
        <button class="start-btn" on:click={startDiagnosis}>
          <span class="btn-text">ゲートを開放する</span>
          <span class="btn-sub">START DIAGNOSIS</span>
        </button>
        <p class="meta">※放流注意 | 水濡れ厳禁</p>

        <div class="db-link">
          <a href="/list">全3000基のダムデータベースを見る &rarr;</a>
        </div>
      </div>
    </div>
  {:else if loading && !resultData}
    <div class="loading">
      <div class="siren"></div>
      <p>
        ダムデータ照合中...<br /><span class="blink"
          >CRITICAL ERROR: TOO MUCH CONCRETE</span
        >
      </p>
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
    background: #2b2b2b; /* Concrete dark */
    color: #f0f0f0;
  }

  /* Loading Madness */
  .loading {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: repeating-linear-gradient(
      45deg,
      #2b2b2b,
      #2b2b2b 10px,
      #333 10px,
      #333 20px
    );
  }
  .siren {
    width: 80px;
    height: 80px;
    border: 5px solid #ffcc00; /* Warning Yellow */
    border-top: 5px solid red;
    border-radius: 50%;
    animation: spin 0.5s linear infinite;
    margin-bottom: 2rem;
    box-shadow: 0 0 20px red;
  }
  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
  .blink {
    animation: blink 0.2s infinite;
    color: red;
    font-weight: bold;
  }
  @keyframes blink {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0;
    }
    100% {
      opacity: 1;
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
    background:
      linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.7)),
      url("https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Kurobe_Dam_Toyama_Japan.jpg/1200px-Kurobe_Dam_Toyama_Japan.jpg");
    background-size: cover;
    background-position: center;
    color: white;
  }

  .glitch {
    font-size: 5rem;
    font-weight: 900;
    color: #fff;
    text-shadow:
      2px 2px 0px #ff0000,
      -2px -2px 0px #00ffff;
    letter-spacing: -5px;
    margin: 0;
  }

  .subtitle {
    font-size: 1.2rem;
    color: #ffcc00; /* Warning Yellow */
    letter-spacing: 0.5em;
    margin-bottom: 2rem;
    font-weight: bold;
    border-bottom: 2px solid #ffcc00;
    padding-bottom: 0.5rem;
  }

  .warning-box {
    background: #ffcc00;
    color: black;
    font-weight: bold;
    padding: 0.5rem 2rem;
    transform: skewX(-10deg);
    margin-bottom: 2rem;
    border: 2px solid black;
    box-shadow: 5px 5px 0px black;
  }

  .description {
    font-size: 1.1rem;
    color: #eee;
    line-height: 2;
    margin-bottom: 3rem;
    font-family: "Noto Sans JP", sans-serif;
  }

  .highlight {
    font-size: 1.5rem;
    font-weight: bold;
    background: white;
    color: black;
    padding: 0.2rem 1rem;
    white-space: nowrap;
  }

  .danger {
    color: #ff3333;
    font-weight: 900;
    font-size: 1.2rem;
  }

  .start-btn {
    background: #ff3333; /* Emergency Red */
    color: white;
    border: 4px solid white;
    padding: 1rem 4rem;
    cursor: pointer;
    box-shadow: 0 0 30px rgba(255, 0, 0, 0.5);
    transition: all 0.1s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .start-btn:hover {
    transform: scale(1.05);
    background: red;
    box-shadow: 0 0 50px rgba(255, 0, 0, 0.8);
  }
  .start-btn:active {
    transform: scale(0.95);
  }

  .btn-text {
    font-size: 1.8rem;
    font-weight: 900;
  }
  .btn-sub {
    font-size: 0.7rem;
    letter-spacing: 0.2em;
    opacity: 0.8;
  }

  .meta {
    margin-top: 2rem;
    font-size: 0.8rem;
    color: #888;
    font-family: monospace;
  }

  .db-link {
    margin-top: 2rem;
  }
  .db-link a {
    color: #ccc;
    text-decoration: none;
    border-bottom: 1px solid #666;
    padding-bottom: 2px;
    font-size: 0.9rem;
    transition: color 0.2s;
  }
  .db-link a:hover {
    color: #ffcc00;
    border-color: #ffcc00;
  }
</style>
