import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './db.js';
import authRoutes from './routes/authRoutes.js';
import apiRoutes from './routes/apiRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Root Health endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'SmartCampus ERP MySQL Backend',
    status: 'Running',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth/login',
      bootstrap: '/api/bootstrap',
      attendance: '/api/attendance',
      smsLogs: '/api/sms-logs',
      users: '/api/users'
    }
  });
});

// Boot Server & MySQL Connection
async function startServer() {
  await initDatabase();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 SmartCampus ERP Server active on http://localhost:${PORT}`);
    console.log(`📁 Connected to MySQL Database: ${process.env.DB_NAME || 'smartcampus_db'}`);
    console.log(`📱 SMS Notification Gateway: ${process.env.SMS_GATEWAY_PROVIDER || 'Simulator / Live'}`);
    console.log(`====================================================`);
  });
}

startServer();
