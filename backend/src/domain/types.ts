export type TraitVector = {
    storage: number;        // 貯め込み傾向
    release: number;        // 放流傾向
    input: number;          // 外部入力反応
    purpose: number;        // 多目的度
    scale: number;          // スケール
    stability: number;      // 安定性
};

// Initial neutral state (50)
export const BASE_TRAITS: TraitVector = {
    storage: 50,
    release: 50,
    input: 50,
    purpose: 50,
    scale: 50,
    stability: 50
};

export type Choice = {
    key: string;
    text: string;
    effects: Partial<TraitVector>;
};

export type Question = {
    id: string;
    category: 'A' | 'B' | 'C' | 'D' | 'E';
    text: string;
    choices: Choice[];
};

export type DamData = {
    id: string;
    name_ja: string;
    name_en?: string;
    river_name?: string;
    prefecture?: string;
    purposes: string[]; // ['F', 'N', 'A', 'P', 'I', 'W'] etc.
    dam_type?: string;
    total_storage_m3?: number;
    effective_storage_m3?: number;
    height_m?: number;
    imageUrl?: string;

    // Computed traits for this dam
    traits: TraitVector;
};

export type DiagnosisResult = {
    userTraits: TraitVector;
    typeTags: string[];
    mainDam: DamData;
    subDams: DamData[];
};
