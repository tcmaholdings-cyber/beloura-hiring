import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Prisma
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging in development
if (process.env.NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: process.env.API_VERSION || 'v1',
  });
});

// API version endpoint
app.get('/api/v1', (_req, res) => {
  res.json({
    name: 'BELOURA HIRING API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    documentation: '/api/v1/docs',
  });
});

// Test database connection
app.get('/api/v1/test-db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [candidateCount, userCount, sourceCount] = await Promise.all([
      prisma.candidate.count(),
      prisma.user.count(),
      prisma.source.count(),
    ]);

    res.json({
      status: 'connected',
      database: 'beloura_hiring_dev',
      stats: {
        candidates: candidateCount,
        users: userCount,
        sources: sourceCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database connection error:', error);
    res.status(500).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import candidateRoutes from './routes/candidates';
import sourceRoutes from './routes/sources';
import referrerRoutes from './routes/referrers';
import importRoutes from './routes/import';

// Mount routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/candidates', candidateRoutes);
app.use('/api/v1/sources', sourceRoutes);
app.use('/api/v1/referrers', referrerRoutes);
app.use('/api/v1/import', importRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    path: req.path,
    message: 'The requested resource does not exist',
  });
});

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
});

// Start server
const server = app.listen(PORT, () => {
  console.log('╔═══════════════════════════════════════════════════════════╗');
  console.log('║                 BELOURA HIRING API                        ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  console.log(`\n🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: Connected`);
  console.log(`\n📍 Endpoints:`);
  console.log(`   GET  /health              - Health check`);
  console.log(`   GET  /api/v1              - API info`);
  console.log(`   GET  /api/v1/test-db      - Database test\n`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log('\n🛑 Shutting down gracefully...');
  server.close(async () => {
    await prisma.$disconnect();
    console.log('✅ Server closed');
    process.exit(0);
  });

  // Force shutdown after 10 seconds
  setTimeout(() => {
    console.error('⚠️  Forced shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
