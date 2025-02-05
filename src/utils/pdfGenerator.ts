import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface RequisitionData {
  number: string;
  date: string;
  provider: {
    name: string;
    ruc: string;
  };
  items: Array<{
    itemNumber: number;
    quantity: number;
    description: string;
  }>;
  detail: string;
  community: string;
  programModel: string;
  executionDate: string;
}

interface PaymentRequestData {
  number: string;
  date: string;
  requisitionNumber: string;
  provider: {
    name: string;
    ruc: string;
  };
  accounts: Array<{
    code: string;
    account: string;
    amount: number;
  }>;
  totalAmount: number;
}

interface ReportData {
  requisitionsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
    correction: number;
  };
  requisitionsByMonth: {
    [key: string]: number;
  };
  paymentsByStatus: {
    pending: number;
    approved: number;
    rejected: number;
  };
  totalAmountByMonth: {
    [key: string]: number;
  };
}

interface FilterOptions {
  startDate: string;
  endDate: string;
  community: string;
  programModel: string;
}

export const generateRequisitionPDF = (data: RequisitionData): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(16);
  doc.text('FEDACC', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('REQUISICIÓN DE MATERIALES', pageWidth / 2, 30, { align: 'center' });
  doc.text(`N° ${data.number}`, pageWidth / 2, 40, { align: 'center' });

  // Basic Info
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(data.date).toLocaleDateString()}`, 20, 55);
  doc.text(`Proveedor: ${data.provider.name}`, 20, 62);
  doc.text(`RUC: ${data.provider.ruc}`, 20, 69);
  doc.text(`Comunidad: ${data.community}`, 20, 76);
  doc.text(`Modelo de Programa: ${data.programModel}`, 20, 83);
  doc.text(`Fecha de Ejecución: ${new Date(data.executionDate).toLocaleDateString()}`, 20, 90);

  // Items Table
  autoTable(doc, {
    startY: 100,
    head: [['Item', 'Cantidad', 'Descripción']],
    body: data.items.map(item => [
      item.itemNumber,
      item.quantity,
      item.description
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // Detail
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text('Detalle:', 20, finalY);
  doc.setFontSize(10);
  const splitDetail = doc.splitTextToSize(data.detail, pageWidth - 40);
  doc.text(splitDetail, 20, finalY + 7);

  // Signatures
  const signatureY = finalY + splitDetail.length * 7 + 20;
  doc.line(20, signatureY, 90, signatureY);
  doc.line(pageWidth - 90, signatureY, pageWidth - 20, signatureY);
  doc.text('Solicitante', 45, signatureY + 5);
  doc.text('Coordinación', pageWidth - 65, signatureY + 5);

  return doc.output('datauristring');
};

export const generatePaymentRequestPDF = (data: PaymentRequestData): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(16);
  doc.text('FEDACC', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('SOLICITUD DE PAGO', pageWidth / 2, 30, { align: 'center' });
  doc.text(`N° ${data.number}`, pageWidth / 2, 40, { align: 'center' });

  // Basic Info
  doc.setFontSize(10);
  doc.text(`Fecha: ${new Date(data.date).toLocaleDateString()}`, 20, 55);
  doc.text(`Requisición N°: ${data.requisitionNumber}`, 20, 62);
  doc.text(`Proveedor: ${data.provider.name}`, 20, 69);
  doc.text(`RUC: ${data.provider.ruc}`, 20, 76);

  // Accounts Table
  autoTable(doc, {
    startY: 85,
    head: [['Código', 'Cuenta', 'Monto']],
    body: data.accounts.map(account => [
      account.code,
      account.account,
      `$${account.amount.toFixed(2)}`
    ]),
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // Total
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text(`Total: $${data.totalAmount.toFixed(2)}`, pageWidth - 60, finalY);

  // Signatures
  const signatureY = finalY + 40;
  doc.line(20, signatureY, 90, signatureY);
  doc.line(pageWidth - 90, signatureY, pageWidth - 20, signatureY);
  doc.setFontSize(10);
  doc.text('Solicitante', 45, signatureY + 5);
  doc.text('Presidencia', pageWidth - 65, signatureY + 5);

  return doc.output('datauristring');
};

export const generateReportPDF = (data: ReportData, filters: FilterOptions): string => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;

  // Header
  doc.setFontSize(16);
  doc.text('FEDACC', pageWidth / 2, 20, { align: 'center' });
  doc.setFontSize(14);
  doc.text('REPORTE DE REQUISICIONES Y PAGOS', pageWidth / 2, 30, { align: 'center' });

  // Filters
  doc.setFontSize(10);
  doc.text('Filtros:', 20, 45);
  doc.text(`Fecha Inicio: ${filters.startDate || 'Todas'}`, 20, 52);
  doc.text(`Fecha Fin: ${filters.endDate || 'Todas'}`, 20, 59);
  doc.text(`Comunidad: ${filters.community || 'Todas'}`, 20, 66);
  doc.text(`Modelo de Programa: ${filters.programModel || 'Todos'}`, 20, 73);

  // Requisitions by Status
  doc.setFontSize(12);
  doc.text('Estado de Requisiciones', 20, 90);
  autoTable(doc, {
    startY: 95,
    head: [['Estado', 'Cantidad']],
    body: [
      ['Pendiente', data.requisitionsByStatus.pending],
      ['Aprobado', data.requisitionsByStatus.approved],
      ['Rechazado', data.requisitionsByStatus.rejected],
      ['Corrección', data.requisitionsByStatus.correction]
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // Payments by Status
  const paymentsY = (doc as any).lastAutoTable.finalY + 20;
  doc.text('Estado de Pagos', 20, paymentsY);
  autoTable(doc, {
    startY: paymentsY + 5,
    head: [['Estado', 'Cantidad']],
    body: [
      ['Pendiente', data.paymentsByStatus.pending],
      ['Aprobado', data.paymentsByStatus.approved],
      ['Rechazado', data.paymentsByStatus.rejected]
    ],
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  // Monthly Data
  const monthlyY = (doc as any).lastAutoTable.finalY + 20;
  doc.text('Datos Mensuales', 20, monthlyY);
  const monthlyData = Object.entries(data.requisitionsByMonth).map(([month, count]) => [
    month,
    count,
    data.totalAmountByMonth[month] ? `$${data.totalAmountByMonth[month].toFixed(2)}` : '$0.00'
  ]);

  autoTable(doc, {
    startY: monthlyY + 5,
    head: [['Mes', 'Requisiciones', 'Monto Total']],
    body: monthlyData,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [66, 139, 202] }
  });

  return doc.output('datauristring');
};