import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');
const ERROR_LOG = path.join(LOG_DIR, 'error.log');
const INFO_LOG = path.join(LOG_DIR, 'info.log');

// Asegurar que el directorio de logs existe
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export const logger = {
  error: (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ERROR: ${message}\n`;
    fs.appendFileSync(ERROR_LOG, logMessage);
    console.error(message);
  },

  info: (message: string) => {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] INFO: ${message}\n`;
    fs.appendFileSync(INFO_LOG, logMessage);
    console.log(message);
  }
};