import fs from 'fs';
import path from 'path';
import { DamData } from '../domain/types';

const DAMS_FILE = path.join(__dirname, 'dams.json');
const FULL_DAMS_FILE = path.join(__dirname, 'dams_full.json');

let cachedDams: DamData[] = [];

export function loadDams(): DamData[] {
    if (cachedDams.length > 0) return cachedDams;

    try {
        // Try full list first
        if (fs.existsSync(FULL_DAMS_FILE)) {
            let data = fs.readFileSync(FULL_DAMS_FILE, 'utf-8');
            // Remove BOM if present
            data = data.replace(/^\uFEFF/, '');
            cachedDams = JSON.parse(data);
        } else {
            let data = fs.readFileSync(DAMS_FILE, 'utf-8');
            // Remove BOM if present
            data = data.replace(/^\uFEFF/, '');
            cachedDams = JSON.parse(data);
        }
        
        console.log(`Successfully loaded ${cachedDams.length} dams`);
        return cachedDams;
    } catch (err) {
        console.error('Failed to load dam data', err);
        return [];
    }
}

export function getDamById(id: string): DamData | undefined {
    return loadDams().find(d => d.id === id);
}
