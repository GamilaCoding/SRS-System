import { Router } from 'express';
import { authenticateToken } from '../auth';
import db from '../database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Proteger todas las rutas
router.use(authenticateToken);

// Obtener registros físicos
router.get('/', async (req, res, next) => {
  try {
    const records = db.getCollection('physical_records');
    res.json(records);
  } catch (error) {
    next(error);
  }
});

// Crear registro físico
router.post('/', async (req, res, next) => {
  try {
    const { type, date, items, location, notes } = req.body;

    if (!type || !date || !items || items.length === 0) {
      throw new AppError(400, 'Faltan campos requeridos');
    }

    const newRecord = await db.addPhysicalRecord({
      type,
      date,
      items,
      location,
      notes,
      created_by: req.user.id
    });

    // Actualizar inventario
    for (const item of items) {
      const inventoryItem = db.getCollection('inventory').find((i: any) => i.id === item.id);
      if (inventoryItem) {
        const newQuantity = type === 'entrada' 
          ? inventoryItem.quantity + item.quantity
          : inventoryItem.quantity - item.quantity;

        await db.updateInventoryItem(item.id, { quantity: newQuantity });
      }
    }

    logger.info(`New physical record created: ${newRecord.id}`);
    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
});

export default router;