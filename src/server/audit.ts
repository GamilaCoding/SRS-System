import { Request, Response } from 'express';
import db from './database';

export interface AuditLogEntry {
  action_type: string;
  entity_type: string;
  entity_id?: number;
  old_values?: any;
  new_values?: any;
}

export const createAuditLog = (
  req: Request,
  entry: AuditLogEntry
) => {
  const userId = req.user?.id;
  const ipAddress = req.ip;
  const userAgent = req.get('user-agent');

  try {
    // Leer la base de datos actual
    const data = db.read();

    // Asegurarse de que existe el array de audit_logs
    if (!data.audit_logs) {
      data.audit_logs = [];
    }

    // Crear nueva entrada de auditoría
    const auditLog = {
      id: data.audit_logs.length + 1,
      user_id: userId,
      action_type: entry.action_type,
      entity_type: entry.entity_type,
      entity_id: entry.entity_id || null,
      old_values: entry.old_values ? JSON.stringify(entry.old_values) : null,
      new_values: entry.new_values ? JSON.stringify(entry.new_values) : null,
      ip_address: ipAddress,
      user_agent: userAgent,
      created_at: new Date().toISOString()
    };

    // Agregar la nueva entrada
    data.audit_logs.push(auditLog);

    // Guardar los cambios
    db.write(data);
  } catch (error) {
    console.error('Error creating audit log:', error);
  }
};

export const getAuditLogs = (req: Request, res: Response) => {
  const {
    startDate,
    endDate,
    userId,
    actionType,
    entityType,
    entityId,
    page = 1,
    limit = 50
  } = req.query;

  try {
    const data = db.read();
    let logs = data.audit_logs || [];

    // Aplicar filtros
    if (startDate) {
      logs = logs.filter(log => log.created_at >= startDate);
    }
    if (endDate) {
      logs = logs.filter(log => log.created_at <= endDate);
    }
    if (userId) {
      logs = logs.filter(log => log.user_id === Number(userId));
    }
    if (actionType) {
      logs = logs.filter(log => log.action_type === actionType);
    }
    if (entityType) {
      logs = logs.filter(log => log.entity_type === entityType);
    }
    if (entityId) {
      logs = logs.filter(log => log.entity_id === Number(entityId));
    }

    // Ordenar por fecha descendente
    logs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Calcular paginación
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = startIndex + Number(limit);
    const paginatedLogs = logs.slice(startIndex, endIndex);

    // Agregar información del usuario
    const logsWithUserInfo = paginatedLogs.map(log => {
      const user = data.users.find(u => u.id === log.user_id);
      return {
        ...log,
        user_name: user ? user.name : '',
        user_lastname: user ? user.lastname : '',
        user_email: user ? user.email : ''
      };
    });

    res.json({
      logs: logsWithUserInfo,
      pagination: {
        total: logs.length,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(logs.length / Number(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching audit logs:', error);
    res.status(500).json({ message: 'Error al obtener registros de auditoría' });
  }
};