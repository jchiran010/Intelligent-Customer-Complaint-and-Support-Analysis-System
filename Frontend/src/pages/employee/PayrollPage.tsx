import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../hooks/usePayroll';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { Lock, FileText, Download, ShieldCheck, DollarSign, Printer } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const PayrollPage: React.FC = () => {
  const { myPayroll, paySlips, isLoading, fetchMyPayroll } = usePayroll();
  const [selectedSlip, setSelectedSlip] = useState<any | null>(null);

  useEffect(() => {
    fetchMyPayroll();
  }, [fetchMyPayroll]);

  const salary = myPayroll?.salaryStructure || {
    basicSalary: 6000,
    hra: 2400,
    specialAllowance: 1100,
    conveyanceAllowance: 300,
    medicalAllowance: 200,
    grossSalary: 10000,
    pfDeduction: 750,
    taxDeduction: 500,
    otherDeductions: 0,
    totalDeductions: 1250,
    netSalary: 8750,
    currency: 'USD',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>My Payroll & Salary Structure</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--amber-500)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> READ-ONLY VISIBILITY
            </span>
          </div>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Transparent breakdown of your earnings, allowances, deductions, and pay slips
          </p>
        </div>
      </div>

      {/* Salary Overview KPI */}
      <div className="df-grid-3">
        <div className="df-card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            GROSS MONTHLY SALARY
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.375rem' }}>
            {formatCurrency(salary.grossSalary)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Before deductions</span>
        </div>

        <div className="df-card" style={{ borderLeft: '4px solid var(--rose-500)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            TOTAL DEDUCTIONS (PF & TAX)
          </span>
          <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--rose-500)', marginTop: '0.375rem' }}>
            -{formatCurrency(salary.totalDeductions)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Statutory withholdings</span>
        </div>

        <div className="df-card" style={{ borderLeft: '4px solid var(--emerald-500)', background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(30, 41, 59, 0.9))' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-500)', textTransform: 'uppercase' }}>
            NET TAKE-HOME PAY
          </span>
          <h3 style={{ fontSize: '2.25rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '0.375rem' }}>
            {formatCurrency(salary.netSalary)}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Direct deposit monthly payout</span>
        </div>
      </div>

      {/* Salary Component Breakdown Grid */}
      <div className="df-grid-2">
        {/* Earnings */}
        <div className="df-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--emerald-500)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Earnings & Allowances Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Basic Salary</span>
              <strong>{formatCurrency(salary.basicSalary)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>House Rent Allowance (HRA)</span>
              <strong>{formatCurrency(salary.hra)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Special Allowance</span>
              <strong>{formatCurrency(salary.specialAllowance)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Conveyance Allowance</span>
              <strong>{formatCurrency(salary.conveyanceAllowance)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Medical Allowance</span>
              <strong>{formatCurrency(salary.medicalAllowance)}</strong>
            </div>
          </div>
        </div>

        {/* Deductions */}
        <div className="df-card">
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--rose-500)', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            Statutory Deductions Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Provident Fund (PF) Contribution</span>
              <strong>{formatCurrency(salary.pfDeduction)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Income Tax (TDS) Withholding</span>
              <strong>{formatCurrency(salary.taxDeduction)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Other Deductions</span>
              <strong>{formatCurrency(salary.otherDeductions)}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Pay Slips History & Viewers */}
      <div className="df-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>Monthly Salary Slips</h3>

        {isLoading ? (
          <LoadingState message="Loading pay slips..." />
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Pay Period</th>
                  <th>Issue Date</th>
                  <th>Net Amount Paid</th>
                  <th>Payment Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paySlips.map((slip) => (
                  <tr key={slip.id}>
                    <td><strong>{slip.month}</strong></td>
                    <td>{slip.issueDate}</td>
                    <td><strong style={{ color: 'var(--emerald-500)' }}>{formatCurrency(slip.salaryStructure.netSalary)}</strong></td>
                    <td><span className="df-badge df-badge-present">Direct Deposited</span></td>
                    <td>
                      <button className="df-btn df-btn-secondary" onClick={() => setSelectedSlip(slip)} style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                        <FileText size={14} /> View Pay Slip
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pay Slip View Modal */}
      <Modal isOpen={!!selectedSlip} onClose={() => setSelectedSlip(null)} title={`Salary Slip — ${selectedSlip?.month}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--bg-surface)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ textAlign: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--primary-400)' }}>DAYFLOW HRMS</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Official Employee Pay Slip Statement</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.8125rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Employee Name:</span> <strong>{selectedSlip?.employeeName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Employee ID:</span> <strong>{selectedSlip?.employeeId}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pay Period:</span> <strong>{selectedSlip?.month}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Status:</span> <strong>{selectedSlip?.paymentStatus}</strong>
            </div>
          </div>

          <div style={{ background: 'var(--bg-primary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 800, fontSize: '1.125rem', color: 'var(--emerald-500)' }}>
              <span>NET PAYOUT:</span>
              <span>{formatCurrency(selectedSlip?.salaryStructure.netSalary || 8750)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="df-btn df-btn-secondary" onClick={() => setSelectedSlip(null)}>Close</button>
            <button className="df-btn df-btn-primary" onClick={() => window.print()}>
              <Printer size={16} /> Print / Download PDF
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
