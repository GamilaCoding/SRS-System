import { Router } from 'express';
import { authenticateToken } from '../auth';
import db from '../database';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const router = Router();

// Proteger todas las rutas
router.use(authenticateToken);

// Obtener inventario
router.get('/', async (req, res, next) => {
  try {
    const inventory = db.getCollection('inventory');
    res.json(inventory);
  } catch (error) {
    next(error);
  }
});

// Agregar item al inventario
router.post('/', async (req, res, next) => {
  try {
    const { code, name, description, quantity, unit, location } = req.body;

    if (!code || !name || !quantity || !unit) {
      throw new AppError(400, 'Faltan campos requeridos');
    }

    const newItem = await db.addInventoryItem({
      code,
      name,
      description,
      quantity,
      unit,
      location,
      created_by: req.user.id
    });

    logger.info(`New inventory item added: ${code}`);
    res.status(201).json(newItem);
  } catch (error) {
    next(error);
  }
});

// Actualizar item del inventario
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, location } = req.body;

    const updatedItem = await db.updateInventoryItem(Number(id), {
      quantity,
      location,
      updated_by: req.user.id
    });

    logger.info(`Inventory item updated: ${id}`);
    res.json(updatedItem);
  } catch (error) {
    next(error);
  }
});

export default router;