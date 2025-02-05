import { Request, Response } from 'express';
import db from './database';
import { createAuditLog } from './audit';

interface ImportData {
  data: any[];
}

export const importProviders = (req: Request, res: Response) => {
  const { data }: ImportData = req.body;
  const errors: string[] = [];

  try {
    const validProviders = data.map((row, index) => {
      if (!row.Nombre) {
        errors.push(`Fila ${index + 1}: Falta el nombre del proveedor`);
        return null;
      }
      return {
        name: row.Nombre,
        created_by: req.user?.id
      };
    }).filter(provider => provider !== null);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error al importar proveedores',
        details: errors
      });
    }

    const newProviders = db.addToCollection('providers', validProviders);

    createAuditLog(req, {
      action_type: 'import',
      entity_type: 'providers',
      new_values: { count: newProviders.length }
    });

    res.json({
      success: true,
      message: 'Proveedores importados exitosamente',
      count: newProviders.length
    });
  } catch (error) {
    console.error('Error importing providers:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar proveedores',
      details: [error instanceof Error ? error.message : 'Error desconocido']
    });
  }
};

export const importProgramModels = (req: Request, res: Response) => {
  const { data }: ImportData = req.body;
  const errors: string[] = [];

  try {
    const validModels = data.map((row, index) => {
      if (!row.Nombre) {
        errors.push(`Fila ${index + 1}: Falta el nombre del modelo`);
        return null;
      }
      return {
        name: row.Nombre,
        created_by: req.user?.id
      };
    }).filter(model => model !== null);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error al importar modelos',
        details: errors
      });
    }

    const newModels = db.addToCollection('program_models', validModels);

    createAuditLog(req, {
      action_type: 'import',
      entity_type: 'program_models',
      new_values: { count: newModels.length }
    });

    res.json({
      success: true,
      message: 'Modelos importados exitosamente',
      count: newModels.length
    });
  } catch (error) {
    console.error('Error importing program models:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar modelos',
      details: [error instanceof Error ? error.message : 'Error desconocido']
    });
  }
};

export const importCommunities = (req: Request, res: Response) => {
  const { data }: ImportData = req.body;
  const errors: string[] = [];

  try {
    const validCommunities = data.map((row, index) => {
      if (!row.Nombre) {
        errors.push(`Fila ${index + 1}: Falta el nombre de la comunidad`);
        return null;
      }
      return {
        name: row.Nombre,
        created_by: req.user?.id
      };
    }).filter(community => community !== null);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error al importar comunidades',
        details: errors
      });
    }

    const newCommunities = db.addToCollection('communities', validCommunities);

    createAuditLog(req, {
      action_type: 'import',
      entity_type: 'communities',
      new_values: { count: newCommunities.length }
    });

    res.json({
      success: true,
      message: 'Comunidades importadas exitosamente',
      count: newCommunities.length
    });
  } catch (error) {
    console.error('Error importing communities:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar comunidades',
      details: [error instanceof Error ? error.message : 'Error desconocido']
    });
  }
};

export const importAccountCodes = (req: Request, res: Response) => {
  const { data }: ImportData = req.body;
  const errors: string[] = [];

  try {
    const validCodes = data.map((row, index) => {
      const code = Object.values(row)[0];
      if (!code) {
        errors.push(`Fila ${index + 1}: Código no válido`);
        return null;
      }
      return {
        code: code.toString(),
        description: code.toString(),
        created_by: req.user?.id
      };
    }).filter(code => code !== null);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error al importar códigos',
        details: errors
      });
    }

    const newCodes = db.addToCollection('account_codes', validCodes);

    createAuditLog(req, {
      action_type: 'import',
      entity_type: 'account_codes',
      new_values: { count: newCodes.length }
    });

    res.json({
      success: true,
      message: 'Códigos importados exitosamente',
      count: newCodes.length
    });
  } catch (error) {
    console.error('Error importing account codes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar códigos',
      details: [error instanceof Error ? error.message : 'Error desconocido']
    });
  }
};

export const importAccountChart = (req: Request, res: Response) => {
  const { data }: ImportData = req.body;
  const errors: string[] = [];

  try {
    const validAccounts = data.map((row, index) => {
      const account = Object.values(row)[0];
      if (!account) {
        errors.push(`Fila ${index + 1}: Cuenta no válida`);
        return null;
      }
      return {
        account: account.toString(),
        description: account.toString(),
        created_by: req.user?.id
      };
    }).filter(account => account !== null);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Error al importar cuentas',
        details: errors
      });
    }

    const newAccounts = db.addToCollection('account_chart', validAccounts);

    createAuditLog(req, {
      action_type: 'import',
      entity_type: 'account_chart',
      new_values: { count: newAccounts.length }
    });

    res.json({
      success: true,
      message: 'Cuentas importadas exitosamente',
      count: newAccounts.length
    });
  } catch (error) {
    console.error('Error importing account chart:', error);
    res.status(500).json({
      success: false,
      message: 'Error al importar cuentas',
      details: [error instanceof Error ? error.message : 'Error desconocido']
    });
  }
};