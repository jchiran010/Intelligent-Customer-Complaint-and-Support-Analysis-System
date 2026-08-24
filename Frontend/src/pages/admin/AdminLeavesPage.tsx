import React, { useState, useEffect } from 'react';
import { useLeave } from '../../hooks/useLeave';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { LoadingState } from '../../components/common/LoadingState';
import { CalendarDays, CheckCircle2, XCircle, Filter, Search } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

export const AdminLeavesPage: React.FC = () => {
  const { allLeaves, isLoading, fetchAllLeaves, approveLeave, rejectLeave } = useLeave();
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [selectedLeave, setSelectedLeave] = useState<any | null>(null);
  const [adminComment, setAdminComment] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchAllLeaves();
  }, [fetchAllLeaves]);

  const filteredLeaves = allLeaves.filter((lve) => {
    return filterStatus === 'ALL' || lve.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const handleApprove = async (id: string) => {
    setIsProcessing(true);
    try {
      await approveLeave(id, adminComment);
      setSelectedLeave(null);
      setAdminComment('');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async (id: string) => {
    setIsProcessing(true);
    try {
      await rejectLeave(id, adminComment);
      setSelectedLeave(null);
      setAdminComment('');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Leave Approvals & Management Hub</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Review, approve, or reject employee leave applications with admin commentary
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="df-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--primary-400)' }} />
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Filter Request Status:</span>
          <select
            className="df-input"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{ width: '180px', cursor: 'pointer' }}
          >
            <option value="ALL">All Applications</option>
            <option value="Pending">Pending Approvals</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="df-card">
        {isLoading ? (
          <LoadingState message="Loading leave applications..." />
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Date Range</th>
                  <th>Days</th>
                  <th>Applicant Remarks</th>
                  <th>Status</th>
                  <th>Actions / Review</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeaves.map((lve) => (
                  <tr key={lve.id}>
                    <td><strong>{lve.employeeName}</strong></td>
                    <td>{lve.department}</td>
                    <td><span className="df-badge df-badge-leave">{lve.leaveType}</span></td>
                    <td>{lve.startDate} to {lve.endDate}</td>
                    <td><strong>{lve.totalDays} Days</strong></td>
                    <td style={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{lve.remarks}</td>
                    <td><StatusBadge status={lve.status} /></td>
                    <td>
                      <button
                        className={`df-btn ${lve.status === 'Pending' ? 'df-btn-primary' : 'df-btn-secondary'}`}
                        onClick={() => setSelectedLeave(lve)}
                        style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}
                      >
                        {lve.status === 'Pending' ? 'Review & Decision' : 'View Details'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <Modal isOpen={!!selectedLeave} onClose={() => setSelectedLeave(null)} title="Leave Application Decision">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', fontSize: '0.8125rem' }}>
              <div><span style={{ color: 'var(--text-muted)' }}>Employee:</span> <strong>{selectedLeave?.employeeName}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Department:</span> <strong>{selectedLeave?.department}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Leave Type:</span> <strong>{selectedLeave?.leaveType}</strong></div>
              <div><span style={{ color: 'var(--text-muted)' }}>Dates:</span> <strong>{selectedLeave?.startDate} to {selectedLeave?.endDate}</strong></div>
            </div>

            <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', fontSize: '0.8125rem' }}>
              <span style={{ color: 'var(--text-muted)', display: 'block' }}>Reason:</span>
              <p style={{ marginTop: '0.25rem', fontStyle: 'italic' }}>"{selectedLeave?.remarks}"</p>
            </div>
          </div>

          <div className="df-form-group">
            <label className="df-label">HR / Admin Comments *</label>
            <input
              type="text"
              className="df-input"
              value={adminComment}
              onChange={(e) => setAdminComment(e.target.value)}
              placeholder="Enter decision comments or rationale..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              className="df-btn df-btn-danger"
              onClick={() => handleReject(selectedLeave.id)}
              disabled={isProcessing}
            >
              <XCircle size={16} /> Reject Application
            </button>
            <button
              className="df-btn df-btn-success"
              onClick={() => handleApprove(selectedLeave.id)}
              disabled={isProcessing}
            >
              <CheckCircle2 size={16} /> Approve Application
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
