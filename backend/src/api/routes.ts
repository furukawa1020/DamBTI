import { Router, Request, Response } from 'express';
import { QUESTIONS } from '../domain/questions';
import { computeUserTraits, findMatchingDams, generateTypeTags } from '../domain/traits';
import { loadDams, getDamById } from '../data/dam_loader';

const router = Router();

// GET /api/questions
router.get('/questions', (req: Request, res: Response) => {
    // Return questions without scoring effects to client? 
    // For simplicity, returning full object is verified safe as client needs IDs/Keys.
    // We might usually strip 'effects' but it's open logic anyway.
    return res.json(QUESTIONS);
});

// POST /api/diagnose
router.post('/diagnose', (req: Request, res: Response) => {
    try {
        const { answers } = req.body; // { answers: [{ questionId, choiceKey }] }

        if (!answers || !Array.isArray(answers)) {
            console.error('Invalid answers format:', answers);
            return res.status(400).json({ error: 'Invalid input', details: 'answers must be an array' });
        }

        console.log('Received answers:', answers);

        // 1. Calculate Traits
        const userTraits = computeUserTraits(answers);
        console.log('Computed user traits:', userTraits);

        // 2. Compute Tags
        const typeTags = generateTypeTags(userTraits);
        console.log('Generated tags:', typeTags);

        // 3. Find Matching Dam
        const allDams = loadDams();
        console.log('Total dams loaded:', allDams.length);
        
        if (!allDams || allDams.length === 0) {
            console.error('No dams data available');
            return res.status(500).json({ error: 'No dam data available', details: 'Failed to load dams' });
        }
        
        const { main, subs } = findMatchingDams(userTraits, allDams);
        console.log('Matched dam:', main?.name_ja);

        if (!main) {
            console.error('No matching dam found');
            return res.status(500).json({ error: 'Matching failed', details: 'Could not find matching dam' });
        }

        return res.json({
            userTraits,
            typeTags,
            mainDam: main,
            subDams: subs
        });
    } catch (error: any) {
        console.error('Error in /api/diagnose:', error);
        return res.status(500).json({ 
            error: 'Internal server error', 
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

import { fetchRealtimeDamData } from '../data/realtime_scraper';

// GET /api/dams
router.get('/dams', (req: Request, res: Response) => {
    const dams = loadDams();
    // 3000 items is ~1MB JSON, acceptable for single fetch on a "Database" page.
    return res.json(dams);
});

// GET /api/dams/:id
router.get('/dams/:id', async (req: Request, res: Response) => {
    const dam = getDamById(req.params.id);
    if (!dam) {
        res.status(404).json({ error: 'Dam not found' });
        return
    }

    // Fetch Simulated Real-time data
    const realtime = await fetchRealtimeDamData(dam.name_ja);

    return res.json({
        ...dam,
        realtime: realtime || {}
    });
});

export default router;
