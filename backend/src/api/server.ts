import express from 'express';
import cors from 'cors';
import router from './routes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', router);

// Health check
app.get('/', (req, res) => {
    res.send('DamBTI API is running');
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
