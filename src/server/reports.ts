import { Request, Response } from 'express';
import db from './database';

export const getReports = (req: Request, res: Response) => {
  const { startDate, endDate, community, programModel } = req.query;

  try {
    const data = db.read();
    const requisitions = data.requisitions || [];
    const paymentRequests = data.payment_requests || [];

    // Filtrar requisiciones
    let filteredRequisitions = requisitions;
    if (startDate) {
      filteredRequisitions = filteredRequisitions.filter(r => r.date >= startDate);
    }
    if (endDate) {
      filteredRequisitions = filteredRequisitions.filter(r => r.date <= endDate);
    }
    if (community) {
      filteredRequisitions = filteredRequisitions.filter(r => {
        const comm = data.communities.find(c => c.id === r.community_id);
        return comm?.name === community;
      });
    }
    if (programModel) {
      filteredRequisitions = filteredRequisitions.filter(r => {
        const model = data.program_models.find(m => m.id === r.program_model_id);
        return model?.name === programModel;
      });
    }

    // Calcular estadísticas
    const requisitionsByStatus = {
      pending: filteredRequisitions.filter(r => r.status === 'pending').length,
      approved: filteredRequisitions.filter(r => r.status === 'approved').length,
      rejected: filteredRequisitions.filter(r => r.status === 'rejected').length,
      correction: filteredRequisitions.filter(r => r.status === 'correction').length
    };

    // Agrupar requisiciones por mes
    const requisitionsByMonth = filteredRequisitions.reduce((acc, req) => {
      const month = req.date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Filtrar solicitudes de pago relacionadas con las requisiciones filtradas
    const filteredPayments = paymentRequests.filter(p => 
      filteredRequisitions.some(r => r.id === p.requisition_id)
    );

    const paymentsByStatus = {
      pending: filteredPayments.filter(p => p.status === 'pending').length,
      approved: filteredPayments.filter(p => p.status === 'approved').length,
      rejected: filteredPayments.filter(p => p.status === 'rejected').length
    };

    // Agrupar montos por mes
    const totalAmountByMonth = filteredPayments.reduce((acc, payment) => {
      const month = payment.date.substring(0, 7); // YYYY-MM
      acc[month] = (acc[month] || 0) + payment.total_amount;
      return acc;
    }, {} as Record<string, number>);

    res.json({
      requisitionsByStatus,
      requisitionsByMonth,
      paymentsByStatus,
      totalAmountByMonth
    });
  } catch (error) {
    console.error('Error generating reports:', error);
    res.status(500).json({ message: 'Error al generar reportes' });
  }
};