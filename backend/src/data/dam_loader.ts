import fs from 'fs';
import path from 'path';
import { DamData } from '../domain/types';

const DAMS_FILE = path.join(__dirname, 'dams.json');

let cachedDams: DamData[] = [];

export function loadDams(): DamData[] {
    if (cachedDams.length > 0) return cachedDams;

    try {
        const data = fs.readFileSync(DAMS_FILE, 'utf-8');
        cachedDams = JSON.parse(data);
        return cachedDams;
    } catch (err) {
        console.error('Failed to load dams.json', err);
        return [];
    }
}

export function getDamById(id: string): DamData | undefined {
    return loadDams().find(d => d.id === id);
}
