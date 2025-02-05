import express from 'express';
import cors from 'cors';
import { join } from 'path';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import db from './database';
import { login, authenticateToken } from './auth';
import { getAuditLogs } from './audit';
import { getReports } from './reports';
import { createBackup, restoreBackup, getBackups } from './backup';
import { 
  importProviders, 
  importProgramModels, 
  importCommunities, 
  importAccountCodes, 
  importAccountChart 
} from './import';
import { errorHandler } from './middleware/errorHandler';
import { logger } from './utils/logger';

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api', apiLimiter);

// Auth routes
app.post('/api/auth/login', login);

// Protected routes
app.use('/api', authenticateToken);

// Settings routes
app.get('/api/settings', (req, res) => {
  try {
    const data = db.read();
    res.json(data.company_settings);
  } catch (error) {
    logger.error(`Error getting settings: ${error}`);
    res.status(500).json({ message: 'Error al obtener configuración' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const data = db.read();
    data.company_settings = {
      ...data.company_settings,
      ...req.body
    };
    db.write(data);
    res.json(data.company_settings);
  } catch (error) {
    logger.error(`Error updating settings: ${error}`);
    res.status(500).json({ message: 'Error al actualizar configuración' });
  }
});

// Requisition routes
app.get('/api/requisitions/last-number', (req, res) => {
  try {
    const data = db.read();
    const requisitions = data.requisitions || [];
    const lastNumber = requisitions.length > 0 
      ? Math.max(...requisitions.map(r => parseInt(r.number)))
      : 0;
    res.json({ number: lastNumber });
  } catch (error) {
    logger.error(`Error getting last requisition number: ${error}`);
    res.status(500).json({ message: 'Error al obtener número de requisición' });
  }
});

// Basic data routes
app.get('/api/providers', (req, res) => {
  try {
    const data = db.read();
    res.json(data.providers || []);
  } catch (error) {
    logger.error(`Error getting providers: ${error}`);
    res.status(500).json({ message: 'Error al obtener proveedores' });
  }
});

app.get('/api/program-models', (req, res) => {
  try {
    const data = db.read();
    res.json(data.program_models || []);
  } catch (error) {
    logger.error(`Error getting program models: ${error}`);
    res.status(500).json({ message: 'Error al obtener modelos de programa' });
  }
});

app.get('/api/communities', (req, res) => {
  try {
    const data = db.read();
    res.json(data.communities || []);
  } catch (error) {
    logger.error(`Error getting communities: ${error}`);
    res.status(500).json({ message: 'Error al obtener comunidades' });
  }
});

app.get('/api/account-codes', (req, res) => {
  try {
    const data = db.read();
    res.json(data.account_codes || []);
  } catch (error) {
    logger.error(`Error getting account codes: ${error}`);
    res.status(500).json({ message: 'Error al obtener códigos contables' });
  }
});

app.get('/api/account-chart', (req, res) => {
  try {
    const data = db.read();
    res.json(data.account_chart || []);
  } catch (error) {
    logger.error(`Error getting account chart: ${error}`);
    res.status(500).json({ message: 'Error al obtener plan de cuentas' });
  }
});

// Import routes
app.post('/api/import/providers', importProviders);
app.post('/api/import/program-models', importProgramModels);
app.post('/api/import/communities', importCommunities);
app.post('/api/import/account-codes', importAccountCodes);
app.post('/api/import/account-chart', importAccountChart);

// Error handler
app.use(errorHandler);

// Start server
app.listen(port, () => {
  logger.info(`Server running at http://localhost:${port}`);
});

export default app;