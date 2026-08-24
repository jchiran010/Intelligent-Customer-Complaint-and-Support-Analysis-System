import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer, Filter, Calendar } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const AdminReportsPage: React.FC = () => {
  const { addToast } = useNotification();
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-24');
  const [dept, setDept] = useState('ALL');

  const handleExportCSV = (reportType: string) => {
    addToast('success', 'Report Exported', `${reportType} report for period ${startDate} to ${endDate} downloaded successfully.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Reports & Data Exporter</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Generate custom filtered CSV logs, attendance audit trails, and payroll reports
        </p>
      </div>

      {/* Date & Dept Filter Options */}
      <div className="df-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Start Date:</span>
          <input type="date" className="df-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ width: '170px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>End Date:</span>
          <input type="date" className="df-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ width: '170px' }} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Department:</span>
          <select className="df-input" value={dept} onChange={(e) => setDept(e.target.value)} style={{ width: '180px' }}>
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product">Product</option>
            <option value="Sales">Sales</option>
          </select>
        </div>
      </div>

      {/* Available Report Cards */}
      <div className="df-grid-2">
        {/* Attendance Report Card */}
        <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--emerald-500)', borderRadius: 'var(--radius-md)' }}>
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Attendance Audit Log Report</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Daily check-in timestamps, working hours, and location verification records.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button className="df-btn df-btn-primary" onClick={() => handleExportCSV('Attendance CSV')}>
              <Download size={16} /> Export CSV Log
            </button>
            <button className="df-btn df-btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print Report
            </button>
          </div>
        </div>

        {/* Payroll Summary Report Card */}
        <div className="df-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-400)', borderRadius: 'var(--radius-md)' }}>
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Payroll & Salary Statement Report</h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Employee gross salary, PF/Tax statutory deductions, and net payouts bundle.</p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button className="df-btn df-btn-primary" onClick={() => handleExportCSV('Payroll CSV')}>
              <Download size={16} /> Export CSV Report
            </button>
            <button className="df-btn df-btn-secondary" onClick={() => window.print()}>
              <Printer size={16} /> Print Statement
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
