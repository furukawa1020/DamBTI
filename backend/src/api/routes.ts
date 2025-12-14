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
    res.json(QUESTIONS);
});

// POST /api/diagnose
router.post('/diagnose', (req: Request, res: Response) => {
    const { answers } = req.body; // { answers: [{ questionId, choiceKey }] }

    if (!answers || !Array.isArray(answers)) {
        res.status(400).json({ error: 'Invalid input' });
        return
    }

    // 1. Calculate Traits
    const userTraits = computeUserTraits(answers);

    // 2. Compute Tags
    const typeTags = generateTypeTags(userTraits);

    // 3. Find Matching Dam
    const allDams = loadDams();
    const { main, subs } = findMatchingDams(userTraits, allDams);

    res.json({
        userTraits,
        typeTags,
        mainDam: main,
        subDams: subs
    });
});

import { fetchRealtimeDamData } from '../data/realtime_scraper';

// GET /api/dams/:id
router.get('/dams/:id', async (req: Request, res: Response) => {
    const dam = getDamById(req.params.id);
    if (!dam) {
        res.status(404).json({ error: 'Dam not found' });
        return
    }

    // Fetch Simulated Real-time data
    const realtime = await fetchRealtimeDamData(dam.name_ja);

    res.json({
        ...dam,
        realtime: realtime || {}
    });
});

export default router;
