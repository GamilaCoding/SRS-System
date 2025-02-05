import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`[${req.method}] ${req.path} - ${err.message}`);
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    });
  }

  // Error no controlado
  logger.error(`Unhandled error: ${err.message}`);
  logger.error(err.stack);
  
  res.status(500).json({
    status: 'error',
    message: 'Error interno del servidor'
  });
};