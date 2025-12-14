import { QUESTIONS } from '../src/domain/questions';
import { computeUserTraits, findMatchingDams } from '../src/domain/traits';
import { loadDams } from '../src/data/dam_loader';

// Simulate a user who is "High Scale" and "High Release" (Big and Aggressive)
// We pick choices that give +Scale and +Release
const answers = [
    { questionId: 'Q5', choiceKey: 'A' }, // Release +15
    { questionId: 'Q7', choiceKey: 'B' }, // Release +15
    { questionId: 'Q16', choiceKey: 'C' }, // Scale +15
    { questionId: 'Q2', choiceKey: 'C' }, // Input +10, Release +5
];

console.log("--- Simulating User: Aggressive & Big Thinker ---");

// 1. Compute Traits
const userTraits = computeUserTraits(answers);
console.log("User Traits:", userTraits);

// 2. Load Dams
const dams = loadDams();
console.log(`Loaded ${dams.length} dams.`);

// 3. Find Match
const { main, subs } = findMatchingDams(userTraits, dams);

console.log("\n--- Diagnosis Result ---");
console.log(`Main Match: ${main.name_ja} (${main.prefecture})`);
console.log("Traits:", main.traits);
console.log(`Similarity: ${main.matchRate}%`);

console.log("\nSub Matches:");
subs.forEach(d => console.log(`- ${d.name_ja}: ${d.matchRate}%`));
