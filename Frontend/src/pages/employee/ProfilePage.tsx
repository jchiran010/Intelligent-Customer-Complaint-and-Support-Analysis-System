import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { usePayroll } from '../../hooks/usePayroll';
import { MOCK_CURRENT_EMPLOYEE } from '../../api/mockData';
import {
  UserCheck,
  Edit,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building,
  Lock,
  FileText,
  Download,
  DollarSign,
} from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatters';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const { myPayroll } = usePayroll();
  const navigate = useNavigate();

  const empData = MOCK_CURRENT_EMPLOYEE;
  const salary = myPayroll?.salaryStructure || empData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Profile Header */}
      <div
        className="df-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '2rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ position: 'relative' }}>
            <img
              src={user?.avatarUrl || empData.profilePicture}
              alt={user?.name || empData.name}
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid var(--primary-500)',
                boxShadow: 'var(--shadow-lg)',
              }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{user?.name || empData.name}</h2>
              <span className="df-badge df-badge-present">Active Employee</span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
              {empData.designation} • {empData.department}
            </p>
            <div style={{ display: 'flex', gap: '1.25rem', marginTop: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>ID: <strong style={{ color: 'var(--text-primary)' }}>{user?.employeeId || empData.employeeId}</strong></span>
              <span>Joined: <strong style={{ color: 'var(--text-primary)' }}>{formatDate(empData.joiningDate)}</strong></span>
            </div>
          </div>
        </div>

        <button className="df-btn df-btn-primary" onClick={() => navigate('/employee/profile/edit')}>
          <Edit size={16} /> Edit My Contact Info
        </button>
      </div>

      {/* Grid: Personal Details + Job Details */}
      <div className="df-grid-2">
        {/* Personal Details */}
        <div className="df-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <UserCheck size={18} style={{ color: 'var(--primary-400)' }} /> Personal Details
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--emerald-500)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
              Editable Fields
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={16} style={{ color: 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Email Address</span>
                <span style={{ fontWeight: 600 }}>{user?.email || empData.email}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={16} style={{ color: 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Phone Number (Editable)</span>
                <span style={{ fontWeight: 600 }}>{empData.phone}</span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Residential Address (Editable)</span>
                <span style={{ fontWeight: 600 }}>{empData.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Job Details */}
        <div className="df-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Briefcase size={18} style={{ color: 'var(--primary-400)' }} /> Job & Employment Details
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
              <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Locked by HR
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Department</span>
              <span style={{ fontWeight: 600 }}>{empData.department}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Designation</span>
              <span style={{ fontWeight: 600 }}>{empData.designation}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Reporting Manager</span>
              <span style={{ fontWeight: 600 }}>{empData.reportingManager}</span>
            </div>

            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Employment Type</span>
              <span style={{ fontWeight: 600 }}>{empData.employmentType}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Structure (READ-ONLY FOR EMPLOYEE) */}
      <div className="df-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <DollarSign size={18} style={{ color: 'var(--emerald-500)' }} /> Salary Structure (Read-Only)
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--amber-500)', background: 'rgba(245, 158, 11, 0.1)', padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-full)' }}>
            <Lock size={12} style={{ display: 'inline', marginRight: '4px' }} /> Read-Only Transparency Mode
          </span>
        </div>

        <div className="df-grid-3">
          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Basic Salary</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {formatCurrency(myPayroll?.salaryStructure?.basicSalary || 6000)}
            </h4>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>House Rent Allowance (HRA)</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '0.25rem' }}>
              {formatCurrency(myPayroll?.salaryStructure?.hra || 2400)}
            </h4>
          </div>

          <div style={{ background: 'var(--bg-surface)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Net Salary Payout</span>
            <h4 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--emerald-500)', marginTop: '0.25rem' }}>
              {formatCurrency(myPayroll?.salaryStructure?.netSalary || 8750)}
            </h4>
          </div>
        </div>
      </div>

      {/* Employee Documents */}
      <div className="df-card">
        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} style={{ color: 'var(--primary-400)' }} /> Employee Documents & Contracts
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {empData.documents.map((doc) => (
            <div
              key={doc.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1.25rem',
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-color)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <FileText size={20} style={{ color: 'var(--primary-400)' }} />
                <div>
                  <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{doc.name}</strong>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>
                    Uploaded on {doc.uploadDate} • {doc.size}
                  </span>
                </div>
              </div>

              <button className="df-btn df-btn-secondary" style={{ padding: '0.375rem 0.75rem', fontSize: '0.75rem' }}>
                <Download size={14} /> Download
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
