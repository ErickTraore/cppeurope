// File: user-backend/app.js

const path = require('path');
const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const apiRouter = require('./apiRouter').router;

let getSignature = null;
try {
  ({ getSignature } = require('./routes/zoomCtrl'));
} catch (err) {
  console.warn('⚠️ Route zoom désactivée: routes/zoomCtrl introuvable');
}

const app = express();

const env = process.env.NODE_ENV || 'development';
const envFile = env === 'production' ? '.env.production' : `.env.${env}`;
dotenv.config({ path: path.join(__dirname, envFile) });

// 🧩 Construire ALLOWED_ORIGINS à partir de REACT_APP_URL si non défini
// ex: REACT_APP_URL=https://lespremices.com
if (!process.env.ALLOWED_ORIGINS && process.env.REACT_APP_URL) {
  const base = process.env.REACT_APP_URL;
  process.env.ALLOWED_ORIGINS = [
    base,                                      // https://lespremices.com
    base.replace('://', '://www.'),            // https://www.lespremices.com
  ].join(',');
}

const isDev = process.env.NODE_ENV !== 'production';
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(o => o.length > 0);

console.log('🌍 CORS allowedOrigins (user-backend) :', allowedOrigins);

// 🔐 CORS
app.use(cors({
  origin: function (origin, callback) {
    // 1️⃣ Requêtes sans origin (curl, Postman, etc.)
    if (!origin) {
      console.log("⚠️ Requête sans origin → acceptée (requête serveur ou interne)");
      return callback(null, true);
    }

    console.log("🌍 Origin reçu :", origin);
    console.log("📜 Liste des origins autorisés :", allowedOrigins);

    // 2️⃣ Validation stricte
    if (isDev || allowedOrigins.includes(origin)) {
      console.log("✅ CORS autorisé pour :", origin);
      return callback(null, true);
    }

    // 3️⃣ Refus explicite
    console.log("❌ CORS refusé pour :", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET','POST','PUT','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
}));

app.options('*', cors());

// 📦 Middlewares
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// 🔁 Routes
app.get('/', (req, res) => res.status(200).send('USER-BACKEND (prod) actif'));
if (typeof getSignature === 'function') {
  app.get('/api/zoom/signature', getSignature);
}
app.use('/api', apiRouter);

module.exports = app;