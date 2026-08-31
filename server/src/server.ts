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
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

function App(): Application {
  const app = express();

  app.use(
    cors({
      origin: CLIENT_URL,
      credentials: true,
    })
  );

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api', healthRoutes);
  app.use('/api/library', libraryRoutes);
  app.use('/api/music', musicRoutes);
  app.use('/api/auth', authRoutes);
  // 404 handler
  app.use((req: Request, res: Response) => {
    res.status(404).json({
      error: 'Endpoint not found',
    });
  });

  // Global error handler
  app.use(
    (err: Error, req: Request, res: Response, next: NextFunction) => {
      console.error(err.stack);

      res.status(500).json({
        error: 'Internal Server Error',
      });
    }
  );

  return app;
}

const app = App();

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

export default app;
