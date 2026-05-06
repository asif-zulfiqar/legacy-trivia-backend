import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import compression from 'compression';
import mongoSanitize from 'express-mongo-sanitize';
import rateLimit from 'express-rate-limit';

import routes from './routes/index.js';
import { notFound, errorHandler } from './middleware/error.middleware.js';
import { env, isProd } from './config/env.js';

const app = express();

app.set('trust proxy', 1);

app.use(helmet());
app.use(
  cors({
    origin: env.clientUrl ? env.clientUrl.split(',').map((s) => s.trim()) : true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(mongoSanitize());
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));

app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

export default app;
