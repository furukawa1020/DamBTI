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

            const traits = {
                storage: Math.min(100, Math.max(0, (volume / 100000000) * 100)), // 100M m3 = 100
                release: 50, // Default
                input: 50,
                purpose: 50,
                scale: Math.min(100, Math.max(0, height / 2)), // 200m = 100
                stability: 50
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
