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

// Connect to MongoDB and start server
(async () => {
  await connectDB();
})();

// Define CORS options in a single object
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'https://www.askcareer.in',
    'https://guidopia.com',
    'https://www.guidopia.com'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
};

// Use CORS for all requests
app.use(cors(corsOptions));

// Explicitly handle preflight requests for all routes
app.options('*', cors(corsOptions));

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
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV || 'development',
    trustProxy: app.get('trust proxy'),
    ip: req.ip,
    ips: req.ips
  });
});

app.get('/api/test-cors', (req, res) => {
  res.json({
    success: true,
    message: 'CORS is working perfectly!',
    origin: req.get('Origin'),
    ip: req.ip,
    headers: {
      origin: req.get('Origin'),
      'x-forwarded-for': req.get('X-Forwarded-For'),
      'user-agent': req.get('User-Agent')
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
