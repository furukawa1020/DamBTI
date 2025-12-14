import { TraitVector, BASE_TRAITS, Question, Choice, DiagnosisResult, DamData } from './types';
import { QUESTIONS } from './questions';

export function computeUserTraits(answers: { questionId: string, choiceKey: string }[]): TraitVector {
    const current: TraitVector = { ...BASE_TRAITS };

    for (const ans of answers) {
        const q = QUESTIONS.find(q => q.id === ans.questionId);
        if (!q) continue;
        const choice = q.choices.find(c => c.key === ans.choiceKey);
        if (!choice || !choice.effects) continue;

        // Add effects
        (Object.keys(choice.effects) as (keyof TraitVector)[]).forEach(k => {
            const effect = choice.effects[k];
            if (typeof effect === 'number') {
                current[k] += effect;
            }
        });
    }

    // Clamp 0-100? or keep raw? Let's clamp for safety.
    (Object.keys(current) as (keyof TraitVector)[]).forEach(k => {
        if (current[k] < 0) current[k] = 0;
        if (current[k] > 100) current[k] = 100;
    });

    return current;
}

// -----------------------------------------------------
// Matching Logic
// -----------------------------------------------------

function cosineSimilarity(a: TraitVector, b: TraitVector): number {
    const keys = Object.keys(a) as (keyof TraitVector)[];
    const va = keys.map(k => a[k]);
    const vb = keys.map(k => b[k]);

    const dot = va.reduce((sum, v, i) => sum + v * vb[i], 0);
    const magA = Math.sqrt(va.reduce((sum, v) => sum + v * v, 0));
    const magB = Math.sqrt(vb.reduce((sum, v) => sum + v * v, 0));

    if (magA === 0 || magB === 0) return 0;
    return dot / (magA * magB);
}

export function findMatchingDams(userVec: TraitVector, allDams: DamData[]): { main: DamData, subs: DamData[] } {
    // Calculate similarity for all
    const scored = allDams.map(d => ({
        dam: d,
        score: cosineSimilarity(userVec, d.traits)
    }));

    // Sort descending
    scored.sort((a, b) => b.score - a.score);

    return {
        main: scored[0].dam,
        subs: scored.slice(1, 3).map(s => s.dam)
    };
}

// -----------------------------------------------------
// Tag Generation
// -----------------------------------------------------
export function generateTypeTags(vec: TraitVector): string[] {
    const tags: string[] = [];

    // 1. Storage/Stability
    if (vec.storage > 60) tags.push('貯め込み型');
    else if (vec.storage < 40) tags.push('流れやすい');
    else tags.push('調整型');

    if (vec.stability > 60) tags.push('安定志向');
    else if (vec.stability < 40) tags.push('変動派');
    else tags.push('柔軟性あり');

    // 2. Purpose
    if (vec.purpose > 60) tags.push('多目的ハイブリッド');
    else if (vec.purpose < 40) tags.push('単機能職人');
    else tags.push('バランス調整役');

    // 3. Scale
    if (vec.scale > 60) tags.push('広域・長期担当');
    else if (vec.scale < 40) tags.push('現場・短期集中');

    return tags.slice(0, 3); // Return top 3 representative tags
}
