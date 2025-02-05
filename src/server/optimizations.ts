import { Request, Response, NextFunction } from 'express';
import db from './database';

// Cache configuration
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, { data: any; timestamp: number }>();

// Cache middleware
export const cacheMiddleware = (ttl = CACHE_TTL) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = `${req.url}-${JSON.stringify(req.query)}`;
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return res.json(cached.data);
    }

    const originalJson = res.json;
    res.json = function(data) {
      cache.set(key, {
        data,
        timestamp: Date.now()
      });
      return originalJson.call(this, data);
    };

    next();
  };
};

// Clear cache when data is modified
export const clearCache = () => {
  cache.clear();
};

// Query optimization
export const optimizeQueries = () => {
  // Create indexes for frequently accessed columns
  db.exec(`
    -- Requisitions indexes
    CREATE INDEX IF NOT EXISTS idx_requisitions_date ON requisitions(date);
    CREATE INDEX IF NOT EXISTS idx_requisitions_status ON requisitions(status);
    CREATE INDEX IF NOT EXISTS idx_requisitions_provider ON requisitions(provider_id);
    CREATE INDEX IF NOT EXISTS idx_requisitions_community ON requisitions(community_id);
    
    -- Payment requests indexes
    CREATE INDEX IF NOT EXISTS idx_payments_date ON payment_requests(date);
    CREATE INDEX IF NOT EXISTS idx_payments_status ON payment_requests(status);
    
    -- Records indexes
    CREATE INDEX IF NOT EXISTS idx_records_date ON records(delivery_date);
    CREATE INDEX IF NOT EXISTS idx_records_type ON records(type);
  `);
};

// Connection pooling configuration
const POOL_SIZE = 10;
let connectionPool: any[] = [];

export const getConnection = () => {
  if (connectionPool.length < POOL_SIZE) {
    const connection = db.prepare('PRAGMA journal_mode = WAL');
    connectionPool.push(connection);
    return connection;
  }
  return connectionPool[Math.floor(Math.random() * POOL_SIZE)];
};

// Query batching
export const batchQueries = async (queries: string[]) => {
  const connection = getConnection();
  connection.exec('BEGIN TRANSACTION');
  
  try {
    const results = queries.map(query => connection.prepare(query).run());
    connection.exec('COMMIT');
    return results;
  } catch (error) {
    connection.exec('ROLLBACK');
    throw error;
  }
};

// Response compression middleware
export const compressionMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (req.headers['accept-encoding']?.includes('gzip')) {
    res.setHeader('Content-Encoding', 'gzip');
  }
  next();
};