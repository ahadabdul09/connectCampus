import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { ENV } from './config/env.js';
import apiRouter from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

app.use(
  cors({
    origin: [ENV.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'Too many campus requests from this IP address. Please try again shortly.',
  },
});
app.use('/api', limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(ENV.UPLOAD_DIR));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'connectCampus API & Realtime Gateway',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', apiRouter);

app.use('/api/*', (_req, res) => {
  res.status(404).json({
    success: false,
    error: 'The requested campus API endpoint was not found.',
  });
});

app.use(errorHandler);

export default app;
