<script lang="ts">
    import { onMount } from "svelte";

    let dams: any[] = [];
    let filteredDams: any[] = [];
    let displayedDams: any[] = [];
    let searchQuery = "";
    let loading = true;
    let page = 1;
    const ITEMS_PER_PAGE = 50;

    onMount(async () => {
        try {
            const apiUrl =
                import.meta.env.PUBLIC_API_URL || "http://localhost:3000";
            const res = await fetch(`${apiUrl}/api/dams`);
            dams = await res.json();
            filterDams();
            loading = false;
        } catch (e) {
            console.error(e);
            loading = false;
        }
    });

    function filterDams() {
        if (!searchQuery) {
            filteredDams = dams;
        } else {
            const lowerQ = searchQuery.toLowerCase();
            filteredDams = dams.filter(
                (d) =>
                    d.name_ja.includes(searchQuery) ||
                    d.prefecture.includes(searchQuery) ||
                    (d.dam_type && d.dam_type.toLowerCase().includes(lowerQ)),
            );
        }
        page = 1;
        updateDisplayed();
    }

    function updateDisplayed() {
        displayedDams = filteredDams.slice(0, page * ITEMS_PER_PAGE);
    }

    function loadMore() {
        page++;
        updateDisplayed();
    }

    $: (searchQuery, filterDams());
</script>

<div class="list-container">
    <header>
        <h1>全ダムデータベース</h1>
        <p>収録数: {dams.length}基</p>
        <div class="search-box">
            <input
                type="text"
                placeholder="名前、県名、形式で検索..."
                bind:value={searchQuery}
            />
        </div>
    </header>

    {#if loading}
        <div class="loading">データを読み込んでいます...</div>
    {:else}
        <div class="grid">
            {#each displayedDams as dam}
                <div class="dam-card">
                    {#if dam.imageUrl}
                        <img
                            src={dam.imageUrl}
                            alt={dam.name_ja}
                            loading="lazy"
                        />
                    {:else}
                        <div class="no-image">No Image</div>
                    {/if}
                    <div class="info">
                        <h2>{dam.name_ja}</h2>
                        <p class="pref">{dam.prefecture}</p>
                        <p class="type">{dam.dam_type || "不明"}</p>
                        <div class="stats">
                            <span>H: {dam.height_m}m</span>
                            <span
                                >V: {(
                                    dam.total_storage_m3 / 1000
                                ).toLocaleString()}千m³</span
                            >
                        </div>
                    </div>
                </div>
            {/each}
        </div>

        {#if displayedDams.length < filteredDams.length}
            <div class="load-more">
                <button on:click={loadMore}>もっと見る</button>
            </div>
        {/if}

        {#if filteredDams.length === 0}
            <p class="zero">見つかりませんでした。</p>
        {/if}
    {/if}
</div>

<style>
    .list-container {
        padding: 2rem;
        max-width: 1200px;
        margin: 0 auto;
        color: #333;
    }
    header {
        text-align: center;
        margin-bottom: 2rem;
    }
    h1 {
        font-size: 2rem;
        margin-bottom: 0.5rem;
        color: #2b2b2b;
    }

    .search-box input {
        width: 100%;
        max-width: 400px;
        padding: 1rem;
        font-size: 1rem;
        border: 2px solid #ccc;
        border-radius: 8px;
    }

    .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
    }

    .dam-card {
        background: white;
        border-radius: 12px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        border: 1px solid #eee;
        transition: transform 0.2s;
    }
    .dam-card:hover {
        transform: translateY(-3px);
    }

    .dam-card img {
        width: 100%;
        height: 180px;
        object-fit: cover;
    }
    .no-image {
        width: 100%;
        height: 180px;
        background: #eee;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #aaa;
    }

    .info {
        padding: 1rem;
    }
    h2 {
        margin: 0 0 0.5rem 0;
        font-size: 1.2rem;
    }
    .pref {
        color: #666;
        font-size: 0.9rem;
        margin: 0;
    }
    .type {
        display: inline-block;
        background: #eee;
        padding: 0.2rem 0.5rem;
        border-radius: 4px;
        font-size: 0.8rem;
        margin-top: 0.5rem;
    }
    .stats {
        margin-top: 0.5rem;
        font-size: 0.8rem;
        color: #888;
        display: flex;
        gap: 1rem;
    }

    .load-more {
        text-align: center;
        margin-top: 3rem;
    }
    button {
        padding: 1rem 3rem;
        background: #2b2b2b;
        color: white;
        border-radius: 50px;
        border: none;
        cursor: pointer;
        font-weight: bold;
    }

    .loading,
    .zero {
        text-align: center;
        margin-top: 3rem;
        color: #666;
    }
</style>
