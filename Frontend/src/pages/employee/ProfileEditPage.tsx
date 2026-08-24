import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FormInput } from '../../components/common/FormInput';
import { MOCK_CURRENT_EMPLOYEE } from '../../api/mockData';
import { Save, ArrowLeft, Lock, Phone, MapPin, Camera } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const ProfileEditPage: React.FC = () => {
  const { user, updateCurrentUserProfile } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [phone, setPhone] = useState(MOCK_CURRENT_EMPLOYEE.phone);
  const [address, setAddress] = useState(MOCK_CURRENT_EMPLOYEE.address);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || MOCK_CURRENT_EMPLOYEE.profilePicture);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      updateCurrentUserProfile({ phone, address, avatarUrl });
      addToast('success', 'Profile Updated', 'Your contact details have been successfully updated.');
      setTimeout(() => navigate('/employee/profile'), 800);
    } catch (err) {
      addToast('error', 'Update Failed', 'Failed to update profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <button
            onClick={() => navigate('/employee/profile')}
            style={{ fontSize: '0.8125rem', color: 'var(--primary-400)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.5rem' }}
          >
            <ArrowLeft size={16} /> Back to Profile
          </button>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Edit My Profile Information</h2>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {/* Profile Picture Upload Section */}
        <div className="df-card" style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <img
            src={avatarUrl}
            alt="Avatar Preview"
            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary-500)' }}
          />
          <div style={{ flex: 1 }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700 }}>Profile Photo</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Paste image URL below to update your profile photo preview.
            </p>
            <input
              type="text"
              className="df-input"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              style={{ fontSize: '0.8125rem' }}
            />
          </div>
        </div>

        {/* Editable Fields Box */}
        <div className="df-card" style={{ borderLeft: '4px solid var(--emerald-500)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--emerald-500)', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.625rem', borderRadius: 'var(--radius-full)' }}>
              EMPLOYEE EDITABLE FIELDS
            </span>
          </div>

          <FormInput
            label="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            icon={<Phone size={18} />}
            required
          />

          <FormInput
            label="Residential Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            icon={<MapPin size={18} />}
            required
          />
        </div>

        {/* Read-Only Locked Fields Box */}
        <div className="df-card" style={{ borderLeft: '4px solid var(--text-muted)', opacity: 0.8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Lock size={14} style={{ color: 'var(--amber-500)' }} />
            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>
              ADMINISTRATIVE READ-ONLY FIELDS (LOCKED)
            </span>
          </div>

          <div className="df-grid-2">
            <FormInput label="Employee ID" value={user?.employeeId || 'DAY-1001'} disabled />
            <FormInput label="Work Email" value={user?.email || 'alex.vance@dayflow.io'} disabled />
            <FormInput label="Department" value={MOCK_CURRENT_EMPLOYEE.department} disabled />
            <FormInput label="Designation" value={MOCK_CURRENT_EMPLOYEE.designation} disabled />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button type="button" className="df-btn df-btn-secondary" onClick={() => navigate('/employee/profile')}>
            Cancel
          </button>
          <button type="submit" className="df-btn df-btn-primary" disabled={isSaving}>
            <Save size={18} /> {isSaving ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};
