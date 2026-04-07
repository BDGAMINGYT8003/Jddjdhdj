import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import cors from 'cors';
import { initFirebase } from './src/server/services/db.js';
import { ensureImagesDirectory, IMAGES_DIR } from './src/server/utils/fileHandler.js';
import { syncImages } from './src/server/services/sync.js';
import cosplayRoutes from './src/server/routes/cosplay.js';

dotenv.config();

async function startServer() {
  await initFirebase();
  await ensureImagesDirectory();
  await syncImages();

  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Serve static images directly
  app.use('/Images/cosplay', express.static(IMAGES_DIR));

  // API Routes
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/cosplay', cosplayRoutes);

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
