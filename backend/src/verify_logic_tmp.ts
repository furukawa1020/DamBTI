import { computeUserTraits, findMatchingDams } from './domain/traits';
import fs from 'fs';
import path from 'path';
import { computeUserTraits, findMatchingDams } from './domain/traits';

// Mock loadDams to avoid ts-node import issues with JSON
function loadDams() {
    const p = path.join(__dirname, 'data/dams_full.json');
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
}

// Simulate a user who is "High Scale" and "High Release" (Big and Aggressive type)
const answers = [
    { questionId: 'Q5', choiceKey: 'A' }, // Release +15
    { questionId: 'Q7', choiceKey: 'B' }, // Release +15
    { questionId: 'Q16', choiceKey: 'C' }, // Scale +15
    { questionId: 'Q2', choiceKey: 'C' }, // Input +10, Release +5
];

async function run() {
    console.log("--- Simulating User: Aggressive (High Release) & Big (High Scale) ---");

    // 1. Compute Traits
    const userTraits = computeUserTraits(answers);
    console.log("User Traits:", JSON.stringify(userTraits, null, 2));

    // 2. Load Dams
    const dams = loadDams();
    console.log(`Loaded ${dams.length} dams.`);

    // 3. Find Match
    const { main, subs } = findMatchingDams(userTraits, dams);

    console.log("\n--- Diagnosis Result ---");
    console.log(`Main Match: ${main.name_ja} (${main.prefecture})`);
    console.log("Dam Traits:", JSON.stringify(main.traits, null, 2));
    console.log(`Similarity: ${main.matchRate}%`);

    console.log("\nSub Matches:");
    subs.forEach(d => console.log(`- ${d.name_ja}: ${d.matchRate}%`));
}

run();
