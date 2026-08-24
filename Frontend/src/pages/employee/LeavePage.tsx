import React, { useState, useEffect } from 'react';
import { useLeave } from '../../hooks/useLeave';
import { LeaveType } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { SelectInput } from '../../components/common/SelectInput';
import { LoadingState } from '../../components/common/LoadingState';
import { EmptyState } from '../../components/common/EmptyState';
import { CalendarDays, Plus, Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatDate, calculateDaysBetween } from '../../utils/formatters';

export const LeavePage: React.FC = () => {
  const { myLeaves, balances, isLoading, fetchMyLeaves, applyLeave } = useLeave();
  const [showModal, setShowModal] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid Leave');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyLeaves();
  }, [fetchMyLeaves]);

  const daysCount = startDate && endDate ? calculateDaysBetween(startDate, endDate) : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !remarks) return;

    setIsSubmitting(true);
    try {
      await applyLeave({ leaveType, startDate, endDate, remarks });
      setShowModal(false);
      setStartDate('');
      setEndDate('');
      setRemarks('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Leave & Time-Off Management</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Submit leave applications and track request status history
          </p>
        </div>

        <button className="df-btn df-btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={18} /> Apply For Leave
        </button>
      </div>

      {/* Leave Quota Balances Visual Cards */}
      <div className="df-grid-3">
        <div className="df-card" style={{ borderLeft: '4px solid var(--emerald-500)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            PAID VACATION LEAVE
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-500)' }}>
              {balances?.paidLeaveRemaining || 15}
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              / {balances?.paidLeaveTotal || 20} Days Remaining
            </span>
          </div>
        </div>

        <div className="df-card" style={{ borderLeft: '4px solid var(--primary-500)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            SICK / MEDICAL LEAVE
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--primary-400)' }}>
              {balances?.sickLeaveRemaining || 8}
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              / {balances?.sickLeaveTotal || 10} Days Remaining
            </span>
          </div>
        </div>

        <div className="df-card" style={{ borderLeft: '4px solid var(--amber-500)' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
            UNPAID TIME-OFF
          </span>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginTop: '0.5rem' }}>
            <h3 style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--amber-500)' }}>
              {balances?.unpaidLeaveUsed || 0}
            </h3>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Days Used This Year</span>
          </div>
        </div>
      </div>

      {/* Leave History Table */}
      <div className="df-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem' }}>My Leave Application History</h3>

        {isLoading ? (
          <LoadingState message="Loading your leave applications..." />
        ) : myLeaves.length === 0 ? (
          <EmptyState
            title="No Leave Requests Found"
            description="You haven't submitted any leave applications yet."
            actionLabel="Apply For Leave Now"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Leave Type</th>
                  <th>Duration / Dates</th>
                  <th>Days</th>
                  <th>Applied On</th>
                  <th>Remarks / Reason</th>
                  <th>Status</th>
                  <th>HR Comments</th>
                </tr>
              </thead>
              <tbody>
                {myLeaves.map((lve) => (
                  <tr key={lve.id}>
                    <td><strong>{lve.leaveType}</strong></td>
                    <td>{lve.startDate} to {lve.endDate}</td>
                    <td><strong>{lve.totalDays} Days</strong></td>
                    <td>{formatDate(lve.appliedOn)}</td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {lve.remarks}
                    </td>
                    <td><StatusBadge status={lve.status} /></td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {lve.adminComments || '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Apply Leave Modal Form */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Apply For Time-Off / Leave">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <SelectInput
            label="Select Leave Type"
            value={leaveType}
            onChange={(e) => setLeaveType(e.target.value as LeaveType)}
            options={[
              { value: 'Paid Leave', label: 'Paid Vacation Leave' },
              { value: 'Sick Leave', label: 'Sick / Medical Leave' },
              { value: 'Unpaid Leave', label: 'Unpaid Time-Off' },
            ]}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <FormInput
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              required
            />
            <FormInput
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              required
            />
          </div>

          {daysCount > 0 && (
            <div style={{ background: 'var(--bg-surface)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', fontSize: '0.8125rem', color: 'var(--primary-300)', fontWeight: 600 }}>
              Calculated Leave Duration: <strong>{daysCount} Days</strong>
            </div>
          )}

          <div className="df-form-group">
            <label className="df-label">Reason / Remarks *</label>
            <textarea
              className="df-input"
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="State the reason for your time-off request..."
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button type="button" className="df-btn df-btn-secondary" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="df-btn df-btn-primary" disabled={isSubmitting || !startDate || !endDate}>
              {isSubmitting ? 'Submitting Request...' : 'Submit Leave Request'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
