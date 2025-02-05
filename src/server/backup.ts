import { Request, Response } from 'express';
import { join } from 'path';
import fs from 'fs';
import db from './database';
import { createAuditLog } from './audit';

const BACKUP_DIR = join(process.cwd(), 'backups');

// Ensure backup directory exists
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

interface TableData {
  name: string;
  schema: string;
  data: any[];
}

export const createBackup = async (req: Request, res: Response) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(BACKUP_DIR, `backup-${timestamp}.json`);

    // Get all table names
    const tables = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%'
    `).all();

    const backup: TableData[] = [];

    // For each table, get schema and data
    for (const { name } of tables) {
      // Get table schema
      const schema = db.prepare(`
        SELECT sql FROM sqlite_master 
        WHERE type='table' AND name=?
      `).get(name).sql;

      // Get table data
      const data = db.prepare(`SELECT * FROM ${name}`).all();

      backup.push({ name, schema, data });
    }

    // Write backup to file
    fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2));

    // Create audit log
    createAuditLog(req, {
      action_type: 'create',
      entity_type: 'backup',
      new_values: { filename: backupPath }
    });

    res.json({
      message: 'Backup created successfully',
      filename: `backup-${timestamp}.json`
    });
  } catch (error) {
    console.error('Error creating backup:', error);
    res.status(500).json({ message: 'Error al crear respaldo' });
  }
};

export const restoreBackup = async (req: Request, res: Response) => {
  const { filename } = req.params;
  const backupPath = join(BACKUP_DIR, filename);

  try {
    if (!fs.existsSync(backupPath)) {
      return res.status(404).json({ message: 'Archivo de respaldo no encontrado' });
    }

    const backup: TableData[] = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));

    // Begin transaction
    db.prepare('BEGIN TRANSACTION').run();

    try {
      // Drop all existing tables
      const tables = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' 
        AND name NOT LIKE 'sqlite_%'
      `).all();

      for (const { name } of tables) {
        db.prepare(`DROP TABLE IF EXISTS ${name}`).run();
      }

      // Restore tables and data
      for (const table of backup) {
        // Create table
        db.prepare(table.schema).run();

        // Insert data
        if (table.data.length > 0) {
          const columns = Object.keys(table.data[0]);
          const placeholders = columns.map(() => '?').join(',');
          const stmt = db.prepare(`
            INSERT INTO ${table.name} (${columns.join(',')})
            VALUES (${placeholders})
          `);

          for (const row of table.data) {
            stmt.run(...columns.map(col => row[col]));
          }
        }
      }

      // Commit transaction
      db.prepare('COMMIT').run();

      // Create audit log
      createAuditLog(req, {
        action_type: 'restore',
        entity_type: 'backup',
        new_values: { filename }
      });

      res.json({ message: 'Backup restored successfully' });
    } catch (error) {
      // Rollback on error
      db.prepare('ROLLBACK').run();
      throw error;
    }
  } catch (error) {
    console.error('Error restoring backup:', error);
    res.status(500).json({ message: 'Error al restaurar respaldo' });
  }
};

export const getBackups = (req: Request, res: Response) => {
  try {
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const stats = fs.statSync(join(BACKUP_DIR, file));
        return {
          filename: file,
          size: stats.size,
          created_at: stats.birthtime
        };
      })
      .sort((a, b) => b.created_at.getTime() - a.created_at.getTime());

    res.json(files);
  } catch (error) {
    console.error('Error getting backups:', error);
    res.status(500).json({ message: 'Error al obtener respaldos' });
  }
};