// scripts/fetch_dams.ts
import fs from 'fs';
import path from 'path';

// SPARQL Endpoint
const ENDPOINT = 'https://query.wikidata.org/sparql';

// Query for Dams in Japan
const QUERY = `
SELECT ?dam ?damLabel ?height ?volume ?image ?prefectureLabel ?typeLabel WHERE {
  ?dam wdt:P31/wdt:P279* wd:Q12323;
       wdt:P17 wd:Q17.
  
  OPTIONAL { ?dam wdt:P2048 ?height. }
  OPTIONAL { ?dam wdt:P1083 ?volume. } 
  OPTIONAL { ?dam wdt:P18 ?image. }
  OPTIONAL { ?dam wdt:P131 ?prefecture. }
  OPTIONAL { ?dam wdt:P31 ?type. }

  SERVICE wikibase:label { bd:serviceParam wikibase:language "ja,en". }
}
LIMIT 4000
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

        console.log(`Found ${bindings.length} rows.`);

        // Helper to aggregate types by ID
        const damMap = new Map<string, any>();

        bindings.forEach((b: any) => {
            const id = b.dam.value.split('/').pop();
            const typeName = b.typeLabel ? b.typeLabel.value : '不明';

            if (damMap.has(id)) {
                // Aggregate type if new
                const existing = damMap.get(id);
                // If existing is "不明" and we found a real type, overwrite it
                if (existing.dam_type === '不明' && typeName !== 'ダム' && typeName !== '不明') {
                    existing.dam_type = typeName;
                } else if (!existing.dam_type.includes(typeName) && typeName !== 'ダム' && typeName !== '不明') {
                    // Otherwise append unique real types
                    existing.dam_type += `・${typeName}`;
                }
                return;
            }

            // Basic traits estimation since Wikidata might lack functional details like "Purpose"
            // We will randomize or estimate based on available metrics
            const height = b.height ? parseFloat(b.height.value) : 50;
            const volume = b.volume ? parseFloat(b.volume.value) : 1000000;

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

            damMap.set(id, {
                id: id,
                name_ja: b.damLabel.value,
                prefecture: b.prefectureLabel ? b.prefectureLabel.value : '日本',
                total_storage_m3: volume,
                height_m: height,
                imageUrl: b.image ? b.image.value : undefined,
                purposes: ['M'],
                dam_type: (typeName === 'ダム' || !typeName) ? '不明' : typeName,
                traits
            });
        });

        const transformed = Array.from(damMap.values());

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
