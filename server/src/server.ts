import express, {
  Application,
  Request,
  Response,
  NextFunction,
} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectDB } from './config/db.js';

import libraryRoutes from './routes/library.routes.js';
import healthRoutes from './routes/health.routes.js';
import musicRoutes from './routes/music.routes.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

// Allowed frontend origins
const allowedOrigins = [
  'http://localhost:5173',
  'https://oblivion-client.vercel.app',
];

// Create Express app
function App(): Application {
  const app = express();

  // =========================
  // CORS CONFIGURATION
  // =========================
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests without an Origin header
        // (curl, Postman, server-to-server requests, etc.)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.log(`Blocked by CORS: ${origin}`);

        return callback(
          new Error('Not allowed by CORS')
        );
      },

      credentials: true,

      methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH',
        'DELETE',
        'OPTIONS',
      ],

      allowedHeaders: [
        'Origin',
        'X-Requested-With',
        'Content-Type',
        'Accept',
        'Authorization',
      ],
    })
  );

  // =========================
  // BODY PARSING
  // =========================
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // =========================
  // ROUTES
  // =========================

  // Health
  app.use('/api', healthRoutes);

  // Library
  app.use('/api/library', libraryRoutes);

  // Music / Audius
  app.use('/api/music', musicRoutes);

  // Authentication
  app.use('/api/auth', authRoutes);

  // =========================
  // 404 HANDLER
  // =========================
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Endpoint not found',
      path: req.originalUrl,
    });
  });

  // =========================
  // ERROR HANDLER
  // =========================
  app.use(
    (
      err: Error,
      req: Request,
      res: Response,
      next: NextFunction
    ) => {
      console.error('Server Error:', err.message);

      res.status(500).json({
        error: 'Internal Server Error',
        message:
          process.env.NODE_ENV === 'production'
            ? undefined
            : err.message,
      });
    }
  );

  return app;
}

// Create application
const app = App();

// =========================
// START SERVER
// =========================
const startServer = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Allowed CORS origins:`);
      allowedOrigins.forEach((origin) => {
        console.log(`  - ${origin}`);
      });
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;