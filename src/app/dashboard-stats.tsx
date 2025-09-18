'use client';

interface DashboardStatsProps {
  suppliers: any[];
  payments: any[];
  invoices: any[];
}

export default function DashboardStats({ suppliers, payments, invoices }: DashboardStatsProps) {
  const totalSuppliers = suppliers.length;
  const totalPayments = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);
  const totalInvoices = invoices.length;
  const averagePayment = totalPayments / (payments.length || 1);

  const statsData = [
    {
      title: 'ספקים פעילים',
      value: totalSuppliers.toLocaleString('he-IL'),
      description: 'סה״כ ספקים במערכת'
    },
    {
      title: 'תשלומים השנה',
      value: `₪${totalPayments.toLocaleString('he-IL')}`,
      description: `סה״כ תשלומים ב-${new Date().getFullYear()}`
    },
    {
      title: 'חשבוניות השנה',
      value: totalInvoices.toLocaleString('he-IL'),
      description: `חשבוניות שנוצרו ב-${new Date().getFullYear()}`
    },
    {
      title: 'ממוצע תשלום',
      value: `₪${Math.round(averagePayment).toLocaleString('he-IL')}`,
      description: 'ממוצע סכום לתשלום'
    }
  ];

  return (
    <div className="dashboard-stats">
      <h2 className="stats-title">נתונים כלליים</h2>
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <div key={index} className="stat-card glass-panel">
            <div className="stat-content">
              <div className="stat-value">{stat.value}</div>
              <div className="stat-title">{stat.title}</div>
              <div className="stat-description">{stat.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
