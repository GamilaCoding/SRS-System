import { Request, Response } from 'express';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import db from './database';
import { logger } from './utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString('hex');

export const login = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      logger.info(`Login attempt failed: Missing credentials for ${email}`);
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    const data = db.read();
    const user = data.users.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      logger.info(`Login attempt failed: User not found for ${email}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Comparación directa de contraseñas
    if (password !== user.password) {
      logger.info(`Login attempt failed: Invalid password for ${email}`);
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      }, 
      JWT_SECRET, 
      { expiresIn: '8h' }
    );

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;

    logger.info(`User logged in successfully: ${email}`);

    res.json({
      token,
      user: userWithoutPassword
    });
  } catch (error) {
    logger.error(`Login error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};

export const authenticateToken = (req: Request, res: Response, next: Function) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      logger.info('Authentication failed: No token provided');
      return res.status(401).json({ message: 'Token no proporcionado' });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        logger.info(`Authentication failed: Invalid token - ${err.message}`);
        return res.status(403).json({ message: 'Token inválido' });
      }
      req.user = user;
      next();
    });
  } catch (error) {
    logger.error(`Auth error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    res.status(500).json({ message: 'Error en el servidor' });
  }
};