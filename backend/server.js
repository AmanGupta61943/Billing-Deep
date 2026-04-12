const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const { connectMongo } = require('./db/connectMongo');

// Ensure .env is loaded from the project root even if the working directory changes.
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// CORS — allow local dev + production Vercel frontend
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:3001',
  // Add your Vercel URL here (no trailing slash):
  'https://billing-deep.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
    // In development, allow any localhost origin
    if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return callback(null, true);
    }
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());

// MongoDB Connection — always use resolved URI (env or local fallback)
const rawMongoUri = process.env.MONGODB_URI;
const MONGODB_URI =
  typeof rawMongoUri === 'string'
    ? rawMongoUri.trim().replace(/^["']|["']$/g, '')
    : '';
const usingDefaultMongo = !MONGODB_URI;
const mongoUriForConnect =
  MONGODB_URI || 'mongodb://127.0.0.1:27017/inventory-system';
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME || 'inventory-system';

// Avoid leaking credentials in logs.
const maskedMongoUri = String(mongoUriForConnect).replace(
  /:\/\/([^:]+):([^@]+)@/g,
  '://$1:***@'
);
console.log(
  `[config] MongoDB URI source: ${usingDefaultMongo ? 'default(localhost)' : '.env'} (${maskedMongoUri})`
);

app.locals.mongoReady = false;
app.locals.mongoLastError = null;

// Import routes
const authMiddleware = require('./middleware/auth');
const productsRouter = require('./routes/products');
const billsRouter = require('./routes/bills');
const authRouter = require('./routes/auth');

// Use routes
app.use('/api/auth', authRouter);
app.use('/api/products', authMiddleware, productsRouter);
app.use('/api/bills', authMiddleware, billsRouter);

// Basic route for testing
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    mongoReady: Boolean(app.locals.mongoReady),
    mongoState: mongoose.connection?.readyState,
    mongoDbName:
      mongoose.connection?.db?.databaseName || mongoose.connection?.name,
    mongoError: app.locals.mongoLastError || undefined,
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

(async function start() {
  try {
    const result = await connectMongo({
      mongoUriForConnect,
      usingDefaultMongo,
      dbName: MONGODB_DB_NAME,
    });
    app.locals.mongoReady = result.ok;
    app.locals.mongoLastError = result.ok ? null : result.error?.message || 'Connection failed';
    if (!result.ok) {
      console.warn(
        '[warn] MongoDB unavailable after retries — auth and DB routes will return errors until connection succeeds. Check /api/health.'
      );
    }
  } catch (err) {
    app.locals.mongoReady = false;
    app.locals.mongoLastError = err?.message || String(err);
    console.error('MongoDB startup error:', app.locals.mongoLastError);
  }

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`API endpoints available at http://localhost:${PORT}/api`);
  });
})();
