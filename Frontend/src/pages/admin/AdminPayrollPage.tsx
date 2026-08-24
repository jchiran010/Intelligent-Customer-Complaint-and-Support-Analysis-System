import React, { useState, useEffect } from 'react';
import { usePayroll } from '../../hooks/usePayroll';
import { EmployeePayroll, UpdateSalaryPayload } from '../../types';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { LoadingState } from '../../components/common/LoadingState';
import { CreditCard, Edit, DollarSign, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const AdminPayrollPage: React.FC = () => {
  const { allPayroll, isLoading, fetchAllPayroll, updateSalaryStructure } = usePayroll();
  const [editingPayroll, setEditingPayroll] = useState<EmployeePayroll | null>(null);
  const [basic, setBasic] = useState(6000);
  const [hra, setHra] = useState(2400);
  const [special, setSpecial] = useState(1100);
  const [pf, setPf] = useState(750);
  const [tax, setTax] = useState(500);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchAllPayroll();
  }, [fetchAllPayroll]);

  const openEditModal = (item: EmployeePayroll) => {
    setEditingPayroll(item);
    setBasic(item.salaryStructure.basicSalary);
    setHra(item.salaryStructure.hra);
    setSpecial(item.salaryStructure.specialAllowance);
    setPf(item.salaryStructure.pfDeduction);
    setTax(item.salaryStructure.taxDeduction);
  };

  const grossCalculated = basic + hra + special + 300 + 200;
  const netCalculated = grossCalculated - (pf + tax);

  const handleSaveSalary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayroll) return;

    setIsSubmitting(true);
    try {
      const payload: UpdateSalaryPayload = {
        employeeId: editingPayroll.employeeId,
        basicSalary: basic,
        hra,
        specialAllowance: special,
        conveyanceAllowance: 300,
        medicalAllowance: 200,
        pfDeduction: pf,
        taxDeduction: tax,
        otherDeductions: 0,
      };

      await updateSalaryStructure(editingPayroll.employeeId, payload);
      setEditingPayroll(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Organizational Payroll Management</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage employee salary structures, allowances, statutory deductions, and payouts
          </p>
        </div>
      </div>

      {/* Payroll Table */}
      <div className="df-card">
        {isLoading ? (
          <LoadingState message="Loading payroll table..." />
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Gross Salary</th>
                  <th>Net Monthly Payout</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allPayroll.map((item) => (
                  <tr key={item.employeeId}>
                    <td><strong>{item.employeeName}</strong></td>
                    <td><strong>{item.employeeId}</strong></td>
                    <td>{item.department}</td>
                    <td>{item.designation}</td>
                    <td>{formatCurrency(item.salaryStructure.grossSalary)}</td>
                    <td><strong style={{ color: 'var(--emerald-500)' }}>{formatCurrency(item.salaryStructure.netSalary)}</strong></td>
                    <td><span className="df-badge df-badge-present">{item.status}</span></td>
                    <td>
                      <button
                        className="df-btn df-btn-primary"
                        onClick={() => openEditModal(item)}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        <Edit size={14} /> Edit Salary Structure
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Salary Structure Modal */}
      <Modal isOpen={!!editingPayroll} onClose={() => setEditingPayroll(null)} title={`Edit Salary Structure — ${editingPayroll?.employeeName}`}>
        <form onSubmit={handleSaveSalary} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="df-grid-2">
            <FormInput
              label="Basic Salary ($)"
              type="number"
              value={basic}
              onChange={(e) => setBasic(Number(e.target.value))}
              required
            />
            <FormInput
              label="House Rent Allowance (HRA) ($)"
              type="number"
              value={hra}
              onChange={(e) => setHra(Number(e.target.value))}
              required
            />
            <FormInput
              label="Special Allowance ($)"
              type="number"
              value={special}
              onChange={(e) => setSpecial(Number(e.target.value))}
              required
            />
            <FormInput
              label="Provident Fund (PF) ($)"
              type="number"
              value={pf}
              onChange={(e) => setPf(Number(e.target.value))}
              required
            />
            <FormInput
              label="Tax Deduction (TDS) ($)"
              type="number"
              value={tax}
              onChange={(e) => setTax(Number(e.target.value))}
              required
            />
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
              <span>Calculated Gross:</span>
              <strong>{formatCurrency(grossCalculated)}</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '0.5rem' }}>
              <span>Calculated Net Payout:</span>
              <span>{formatCurrency(netCalculated)}</span>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="df-btn df-btn-secondary" onClick={() => setEditingPayroll(null)}>Cancel</button>
            <button type="submit" className="df-btn df-btn-primary" disabled={isSubmitting}>
              <Save size={16} /> {isSubmitting ? 'Updating...' : 'Save Salary Structure'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
