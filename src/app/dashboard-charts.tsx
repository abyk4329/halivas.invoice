'use client';

import { useState, useEffect } from 'react';

interface DashboardChartsProps {
  suppliers: any[];
  payments: any[];
  invoices: any[];
}

export default function DashboardCharts({ suppliers, payments, invoices }: DashboardChartsProps) {
  const [monthlyData, setMonthlyData] = useState<{month: string, payments: number}[]>([]);

  useEffect(() => {
    // חישוב תשלומים לפי חודש
    const monthlyPayments = payments.reduce((acc, payment) => {
      const date = new Date(payment.date || payment.created_at);
      const month = date.toLocaleDateString('he-IL', { month: 'long' });
      acc[month] = (acc[month] || 0) + (payment.amount || 0);
      return acc;
    }, {} as Record<string, number>);

    const sortedData = Object.entries(monthlyPayments)
      .map(([month, payments]) => ({ month, payments: payments as number }))
      .sort((a, b) => new Date(`${a.month} 2023`).getMonth() - new Date(`${b.month} 2023`).getMonth());

    setMonthlyData(sortedData);
  }, [payments]);

  const maxPayment = Math.max(...monthlyData.map(d => d.payments), 1);
  
  // חישוב נתונים נוספים
  const recentPayments = payments.slice(0, 5);
  const topSuppliers = suppliers
    .map(supplier => ({
      ...supplier,
      totalPayments: payments
        .filter(p => p.supplierId === supplier.id)
        .reduce((sum, p) => sum + (p.amount || 0), 0)
    }))
    .sort((a, b) => b.totalPayments - a.totalPayments)
    .slice(0, 4);

  return (
    <div className="dashboard-charts">
      <div className="charts-grid">
        {/* גרף תשלומים חודשי */}
        <div className="chart-panel glass-panel">
          <h3 className="chart-title">תשלומים לפי חודש</h3>
          <div className="chart-content">
            <div className="bar-chart">
              {monthlyData.map((data, index) => (
                <div key={index} className="bar-item">
                  <div 
                    className="bar"
                    style={{ 
                      height: `${(data.payments / maxPayment) * 100}%`,
                      backgroundColor: 'rgba(55, 55, 55, 0.6)'
                    }}
                  >
                    <span className="bar-value">₪{data.payments.toLocaleString('he-IL')}</span>
                  </div>
                  <span className="bar-label">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ספקים מובילים */}
        <div className="chart-panel glass-panel">
          <h3 className="chart-title">ספקים מובילים</h3>
          <div className="chart-content">
            <div className="suppliers-list">
              {topSuppliers.map((supplier, index) => (
                <div key={supplier.id} className="supplier-item">
                  <div className="supplier-rank">#{index + 1}</div>
                  <div className="supplier-info">
                    <div className="supplier-name">{supplier.name}</div>
                    <div className="supplier-amount">₪{supplier.totalPayments.toLocaleString('he-IL')}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* תשלומים אחרונים */}
        <div className="chart-panel glass-panel">
          <h3 className="chart-title">תשלומים אחרונים</h3>
          <div className="chart-content">
            <div className="payments-list">
              {recentPayments.map((payment, index) => (
                <div key={payment.id || index} className="payment-item">
                  <div className="payment-info">
                    <div className="payment-amount">₪{(payment.amount || 0).toLocaleString('he-IL')}</div>
                    <div className="payment-date">
                      {new Date(payment.date || payment.created_at).toLocaleDateString('he-IL')}
                    </div>
                  </div>
                  <div className="payment-description">{payment.description || 'ללא תיאור'}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* סיכום שנתי */}
        <div className="chart-panel glass-panel">
          <h3 className="chart-title">סיכום שנתי</h3>
          <div className="chart-content">
            <div className="summary-items">
              <div className="summary-item">
                <div className="summary-label">חשבוניות חדשות</div>
                <div className="summary-value">{invoices.length}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">תשלומים שבוצעו</div>
                <div className="summary-value">{payments.length}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">ספקים פעילים</div>
                <div className="summary-value">{suppliers.length}</div>
              </div>
              <div className="summary-item">
                <div className="summary-label">ממוצע חודשי</div>
                <div className="summary-value">
                  ₪{Math.round(payments.reduce((sum, p) => sum + (p.amount || 0), 0) / 12).toLocaleString('he-IL')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
