const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
// const rateLimit = require('express-rate-limit'); // COMMENTED OUT FOR NOW

// Import configurations and middleware
const config = require('./config/config');
const connectDB = require('./config/database');
const { errorHandler, notFound } = require('./middleware/errorHandler');

// Import routes
const authRouter = require('./routes/auth');
const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const openaiRouter = require('./routes/openai');

const app = express();

// ========== KEY FIX #1: TRUST PROXY MUST BE FIRST ==========
app.set('trust proxy', 1);
console.log('✅ Trust proxy set to:', app.get('trust proxy'));

// Connect to MongoDB (don't block app startup)
connectDB().catch(err => {
  console.error('Failed to connect to MongoDB:', err);
  console.warn('⚠️  App starting without database connection');
});

// Define CORS options - Simplified for Vercel compatibility
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://www.askcareer.in',
    'https://askcareer.in',
    'https://guidopia.com',
    'https://www.guidopia.com',
    'https://guidopialite-backend.vercel.app'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200
};

// Use CORS for all requests
app.use(cors(corsOptions));

// Handle preflight OPTIONS requests for all routes
app.options('*', (req, res) => {
  const origin = req.headers.origin;
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://www.askcareer.in',
    'https://askcareer.in',
    'https://guidopia.com',
    'https://www.guidopia.com',
    'https://guidopialite-backend.vercel.app'
  ];

  if (!origin || allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  } else {
    console.warn(`🚫 CORS preflight blocked origin: ${origin}`);
    res.sendStatus(403);
  }
});

// ========== KEY FIX #3: RATE LIMITING COMPLETELY DISABLED ==========
console.log('⚠️ Rate limiting is DISABLED for debugging');
// We'll add it back once login works

// Security middleware (after CORS to avoid conflicts)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://api.openai.com"], // Allow backend to connect to OpenAI
      frameSrc: ["'none'"], // Prevent iframe embedding
      objectSrc: ["'none'"], // Prevent object/embed tags
      baseUri: ["'self'"],
      formAction: ["'self'"],
      upgradeInsecureRequests: [], // Redirect HTTP to HTTPS in production
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000, // 1 year
    includeSubDomains: true,
    preload: true
  },
  noSniff: true, // Prevent MIME type sniffing
  xssFilter: true, // Enable XSS filtering
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
}));

// View engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Basic middleware
app.use(logger('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false, limit: '10mb' }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// ========== KEY FIX #4: FAVICON HANDLER ==========
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ========== DEBUGGING ENDPOINTS ==========
app.get('/health', (req, res) => {
  const { isDBConnected } = require('./config/database');

  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy'),
    database: {
      connected: isDBConnected(),
      readyState: require('mongoose').connection.readyState
    },
    ip: req.ip,
    ips: req.ips
  });
});

app.get('/api/test-cors', (req, res) => {
  const origin = req.get('Origin');
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://www.askcareer.in',
    'https://askcareer.in',
    'https://guidopia.com',
    'https://www.guidopia.com',
    'https://guidopialite-backend.vercel.app'
  ];

  const isAllowed = !origin || allowedOrigins.includes(origin);

  res.json({
    success: true,
    message: isAllowed ? 'CORS is working perfectly!' : `CORS check: Origin ${origin} would be blocked`,
    origin: origin,
    allowed: isAllowed,
    ip: req.ip,
    headers: {
      origin: req.get('Origin'),
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'user-agent': req.get('User-Agent'),
      'host': req.get('Host')
    },
    allowedOrigins: allowedOrigins
  });
});

app.get('/api/debug', (req, res) => {
  const { isDBConnected } = require('./config/database');

  res.json({
    timestamp: new Date().toISOString(),
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      hasMongoURI: !!process.env.MONGODB_URI,
      mongoURI: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 50) + '...' : null,
      hasJWT: !!process.env.JWT_SECRET,
      hasOpenAI: !!process.env.OPENAI_API_KEY,
      openAIKeyFormat: process.env.OPENAI_API_KEY ?
        (process.env.OPENAI_API_KEY.startsWith('sk-') ? 'valid' : 'invalid') : 'missing'
    },
    database: {
      connected: isDBConnected(),
      readyState: require('mongoose').connection.readyState,
      name: require('mongoose').connection.name || null
    },
    openai: {
      keyConfigured: !!process.env.OPENAI_API_KEY,
      keyFormat: process.env.OPENAI_API_KEY ? (process.env.OPENAI_API_KEY.startsWith('sk-') ? 'valid' : 'invalid') : 'missing',
      keyLength: process.env.OPENAI_API_KEY ? process.env.OPENAI_API_KEY.length : 0
    },
    cors: {
      origin: req.get('Origin'),
      allowed: true
    }
  });
});

// ========== API ROUTES ==========
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/openai', openaiRouter);
app.use('/', indexRouter);

// ========== ERROR HANDLERS (MUST BE LAST) ==========
app.use(notFound);
app.use(errorHandler);

module.exports = app;
