import fs from 'fs';
import path from 'path';
import { logger } from './utils/logger';

const DB_FILE = path.join(process.cwd(), 'db.json');

// Initial database structure
const initialDB = {
  users: [
    // ... (mantener usuarios existentes)
  ],
  requisitions: [],
  providers: [],
  program_models: [],
  communities: [],
  account_codes: [],
  account_chart: [],
  audit_logs: [],
  notifications: [],
  company_settings: {
    ruc: '0491506385001',
    name: 'Federación de Asociaciones Comunitarias del Carchi'
  }
};

// Ensure database file exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(initialDB, null, 2));
}

const db = {
  read() {
    try {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      logger.error(`Error reading database: ${error}`);
      throw new Error('Error al leer la base de datos');
    }
  },

  write(data: any) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (error) {
      logger.error(`Error writing database: ${error}`);
      throw new Error('Error al escribir en la base de datos');
    }
  },

  addToCollection(collection: string, items: any[]) {
    try {
      const data = this.read();
      
      if (!data[collection]) {
        data[collection] = [];
      }

      const newItems = items.map((item, index) => ({
        id: (data[collection].length || 0) + index + 1,
        ...item,
        created_at: new Date().toISOString()
      }));

      data[collection].push(...newItems);
      this.write(data);
      
      return newItems;
    } catch (error) {
      logger.error(`Error adding to collection ${collection}: ${error}`);
      throw new Error(`Error al agregar elementos a ${collection}`);
    }
  },

  getCollection(collection: string) {
    const data = this.read();
    return data[collection] || [];
  }
};

export default db;