import express from 'express';
import cors from 'cors';
import configRouter from './routes/config';
import evaluateRouter from './routes/evaluate';
import improveRouter from './routes/improve';

const app = express();
const PORT = 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// API routes
app.use('/api', configRouter);
app.use('/api', evaluateRouter);
app.use('/api', improveRouter);

// Start server
app.listen(PORT, () => {
    console.log(`✓ Backend server running on http://localhost:${PORT}`);
});
