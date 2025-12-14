// scripts/fetch_dams.ts
import fs from 'fs';
import path from 'path';

// SPARQL Endpoint
const ENDPOINT = 'https://query.wikidata.org/sparql';

// Query for Dams in Japan
// P31: Instance of -> Q12323 (Dam)
// P17: Country -> Q17 (Japan)
// P2048: Height
// P2234: Volume (Capacity)
// P18: Image
// P131: Admin Entity (Prefecture)
const QUERY = `
SELECT ?dam ?damLabel ?height ?volume ?image ?prefectureLabel ?coords WHERE {
  ?dam wdt:P31/wdt:P279* wd:Q12323;
       wdt:P17 wd:Q17.
  
  OPTIONAL { ?dam wdt:P2048 ?height. }
  OPTIONAL { ?dam wdt:P1083 ?volume. } 
  OPTIONAL { ?dam wdt:P18 ?image. }
  OPTIONAL { ?dam wdt:P131 ?prefecture. }
  OPTIONAL { ?dam wdt:P625 ?coords. }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
LIMIT 3000
`;

async function fetchDams() {
    console.log('Fetching dams from Wikidata...');
    const url = `${ENDPOINT}?query=${encodeURIComponent(QUERY)}&format=json`;

    try {
        const res = await fetch(url, {
            headers: { 'User-Agent': 'DamBTI/1.0 (Contact: user@example.com)' }
        });
        const data = await res.json();
        const bindings = data.results.bindings;

        console.log(`Found ${bindings.length} dams.`);

        // Transform to DamBTI format
        const transformed = bindings.map((b: any) => {
            // Basic traits estimation since Wikidata might lack functional details like "Purpose"
            // We will randomize or estimate based on available metrics
            const height = b.height ? parseFloat(b.height.value) : 50;
            const volume = b.volume ? parseFloat(b.volume.value) : 1000000;

            // Enhanced heuristics for DamBTI
            // 1. Release (Output): High if it has large gates or flood control. 
            //    Since we lack gate data, use Height/Volume ratio (Flashy = High, Stable = Low) or Random hash.
            // 2. Input (Response): High if small catchment or multi-purpose.
            // 3. Stability: High if Volume is huge relative to Height (Gravity/Rockfill-ish).
            // 4. Purpose: High for Multi-purpose, Low for single purpose.

            // Deterministic hash for consistent "Personality" across fetches
            const nameHash = b.damLabel.value.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);

            // Heuristics
            const isHuge = volume > 50000000; // 50M m3
            const isTall = height > 100; // 100m

            const storageScore = Math.min(100, Math.max(0, (volume / 100000000) * 100)); // Volume based
            const scaleScore = Math.min(100, Math.max(0, height)); // Height based (Max 100m+)

            // Release: Taller dams often release more vigorously (Potential energy) + Hash
            let releaseScore = (height / 2) + (nameHash % 40 - 20);

            // Stability: Volume relative to height (Fatness) + Hash
            let stabilityScore = (volume / (height * 10000)) * 10 + 40 + (nameHash % 20 - 10);

            // Input: Smaller dams react faster (Higher Input score)
            let inputScore = 100 - (volume / 2000000) + (nameHash % 30 - 15);

            // Purpose: Purely hash-based if we don't have P31 details, but lets lean on "Huge = Multi"
            let purposeScore = isHuge ? 70 : 40 + (nameHash % 40 - 20);

            const traits = {
                storage: Math.max(0, Math.min(100, storageScore)),
                release: Math.max(0, Math.min(100, releaseScore)),
                input: Math.max(0, Math.min(100, inputScore)),
                purpose: Math.max(0, Math.min(100, purposeScore)),
                scale: Math.max(0, Math.min(100, scaleScore)),
                stability: Math.max(0, Math.min(100, stabilityScore))
            };

            return {
                id: b.dam.value.split('/').pop(),
                name_ja: b.damLabel.value,
                prefecture: b.prefectureLabel ? b.prefectureLabel.value : '日本',
                total_storage_m3: volume,
                height_m: height,
                imageUrl: b.image ? b.image.value : undefined,
                purposes: ['M'], // Unknown from this query, default to Multi
                dam_type: 'Unknown',
                traits
            };
        });

        // Filter broken data (e.g. QIDs as names)
        const valid = transformed.filter((d: any) => !d.name_ja.startsWith('Q'));

        const outPath = path.join(__dirname, '../src/data/dams_full.json');
        fs.writeFileSync(outPath, JSON.stringify(valid, null, 2));
        console.log(`Saved ${valid.length} dams to ${outPath}`);

    } catch (err) {
        console.error('Error fetching data:', err);
    }
}

fetchDams();
