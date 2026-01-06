<script lang="ts">
  export let result: any;

  const { typeTags, mainDam, subDams } = result;

  function handleShare() {
    // Enrich the share text with tags to capture the "characteristics"
    const tagsStr = typeTags.map((t: string) => `#${t}`).join(" ");
    // Example: "My DamBTI is Kurobe Dam! Features: #Huge #Discharge"
    const text = `私のダムBTI診断結果は...『${mainDam.name_ja}』タイプでした！\n\n【特徴】\n${tagsStr}\n\n全国のダムからあなたの性格を診断\n`;
    const url = window.location.href;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}&hashtags=ダムBTI,ダムタイプ診断`;
    window.open(shareUrl, "_blank");
  }
</script>

<div class="result-container">
  <header>
    <h1>あなたのダムBTI</h1>
    <div class="tags">
      {#each typeTags as tag}
        <span class="tag">{tag}</span>
      {/each}
    </div>
  </header>

  <section class="main-dam">
    <h2>似ているダム：{mainDam.name_ja}</h2>
    {#if mainDam.imageUrl}
      <div class="img-wrapper">
        <img src={mainDam.imageUrl} alt={mainDam.name_ja} />
      </div>
    {/if}
    <div class="info">
      <p>所在地: {mainDam.prefecture}</p>
      {#if mainDam.dam_type}<p>形式: {mainDam.dam_type}</p>{/if}

      <!-- Basic Stats -->
      <div class="stats">
        <div class="stat">
          <label>堤高</label>
          <span>{mainDam.height_m}m</span>
        </div>
        <div class="stat">
          <label>総貯水</label>
          <span>{(mainDam.total_storage_m3 / 10000).toLocaleString()}万m³</span>
        </div>
      </div>

      <!-- Real-time Status (Only if available) -->
      <div class="realtime-status">
        <h3>現在のダムの様子</h3>
        {#if mainDam.realtime && (mainDam.realtime.storagePercent !== undefined || mainDam.realtime.inflow !== undefined || mainDam.realtime.outflow !== undefined)}
          <div class="status-grid">
            {#if mainDam.realtime.storagePercent !== undefined}
            <div class="status-item">
              <label>貯水率</label>
              <span class="value">{mainDam.realtime.storagePercent}%</span>
            </div>
            {/if}
            {#if mainDam.realtime.inflow !== undefined}
            <div class="status-item">
              <label>流入量</label>
              <span class="value">{mainDam.realtime.inflow} m³/s</span>
            </div>
            {/if}
            {#if mainDam.realtime.outflow !== undefined}
            <div class="status-item">
              <label>放流量</label>
              <span class="value">{mainDam.realtime.outflow} m³/s</span>
            </div>
            {/if}
          </div>
          {#if mainDam.realtime.time}
          <p class="timestamp">更新: {mainDam.realtime.time}</p>
          {/if}
        {:else}
          <div class="no-data">
            <p>現在、リアルタイム情報は取得できません。</p>
            <p class="sub-text">（国土交通省の観測所コードが未連携のため）</p>
          </div>
        {/if}
      </div>
    </div>
  </section>

  <section class="sub-dams">
    <h3>他にも似ているダム</h3>
    <ul>
      {#each subDams as dam}
        <li>{dam.name_ja} ({dam.prefecture})</li>
      {/each}
    </ul>
  </section>

  <div class="actions">
    <button class="share" on:click={handleShare}>Xで共有する</button>
    <button class="retry" on:click={() => location.reload()}
      >もう一度ととのう</button
    >
  </div>
</div>

<style>
  .result-container {
    padding: 2rem;
    overflow-y: auto;
  }
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
  }
  .tag {
    background: var(--color-primary);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.9rem;
  }

  .result-container {
    padding: 2rem;
    overflow-y: auto;
    color: #333; /* Force dark text for the whole result container */
  }
  header {
    text-align: center;
    margin-bottom: 2rem;
  }
  h1 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--color-primary);
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.5rem;
    color: #333; /* Ensure tags text is readable if outside */
  }
  .tag {
    background: var(--color-primary);
    color: white; /* Tag text itself is white on blue */
    padding: 0.25rem 0.75rem;
    border-radius: 100px;
    font-size: 0.9rem;
  }

  .main-dam {
    background: #f8f9fa;
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 2rem;
    text-align: center;
    color: #333; /* Strictly dark text on white bg */
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3); /* Add shadow for depth in dark mode */
  }

  .img-wrapper {
    width: 100%;
    height: 200px;
    overflow: hidden;
    border-radius: 8px;
    margin: 1rem 0;
    background: #ccc;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .stats {
    display: flex;
    justify-content: space-around;
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    padding-top: 1rem;
  }
  .stat {
    display: flex;
    flex-direction: column;
  }
  .stat label {
    font-size: 0.8rem;
    color: #666;
  }
  .stat span {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .sub-dams {
    font-size: 0.9rem;
    color: #555;
    margin-bottom: 2rem;
  }
  ul {
    list-style: none;
    padding: 0;
  }
  li {
    background: white;
    padding: 0.5rem;
    border-bottom: 1px solid #eee;
  }

  .actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  button {
    width: 100%;
    padding: 1rem;
    border: none;
    border-radius: 8px;
    font-weight: bold;
  }
  .share {
    background: black;
    color: white;
  }
  .retry {
    background: white;
    border: 1px solid #ccc;
    color: #666;
  }
</style>
