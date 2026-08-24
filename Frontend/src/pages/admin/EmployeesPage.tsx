import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { employeeService } from '../../services/employeeService';
import { Employee, User } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Modal } from '../../components/common/Modal';
import { FormInput } from '../../components/common/FormInput';
import { SelectInput } from '../../components/common/SelectInput';
import { LoadingState } from '../../components/common/LoadingState';
import { Users, Search, Filter, Eye, Edit, UserCheck, Plus, Shield } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';

export const EmployeesPage: React.FC = () => {
  const { switchRoleView, setSwitchedEmployee } = useAuth();
  const { addToast } = useNotification();
  const navigate = useNavigate();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Edit / Add Employee Modal
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    employeeService.getEmployees().then((data) => {
      setEmployees(data);
      setIsLoading(false);
    });
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDept === 'ALL' || emp.department === selectedDept;
    return matchesSearch && matchesDept;
  });

  const handleSwitchToEmployee = (emp: Employee) => {
    const userObj: User = {
      id: emp.id,
      employeeId: emp.employeeId,
      email: emp.email,
      name: emp.name,
      role: emp.role,
      avatarUrl: emp.profilePicture,
      isEmailVerified: true,
      department: emp.department,
      designation: emp.designation,
      phone: emp.phone,
      address: emp.address,
    };
    setSwitchedEmployee(userObj);
    switchRoleView('EMPLOYEE');
    addToast('info', 'Employee Switch Mode', `Now viewing workspace as ${emp.name} (${emp.employeeId}).`);
    navigate('/employee/dashboard');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Employee Master Directory</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manage staff profiles, organizational details, and employee switching controls
          </p>
        </div>

        <button className="df-btn df-btn-primary" onClick={() => setShowAddModal(true)}>
          <Plus size={18} /> Add New Employee
        </button>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="df-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', padding: '1rem 1.25rem' }}>
        <div style={{ flex: 1, minWidth: '260px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="df-input"
            placeholder="Search by Employee ID, Name, or Email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: '2.5rem' }}
          />
        </div>

        <div style={{ width: '220px' }}>
          <select
            className="df-input"
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            style={{ cursor: 'pointer' }}
          >
            <option value="ALL">All Departments</option>
            <option value="Engineering">Engineering</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Marketing">Marketing</option>
            <option value="Human Resources">Human Resources</option>
            <option value="Executive">Executive</option>
          </select>
        </div>
      </div>

      {/* Employee Master Table */}
      <div className="df-card">
        {isLoading ? (
          <LoadingState message="Fetching employee directory records..." />
        ) : (
          <div className="df-table-container">
            <table className="df-table">
              <thead>
                <tr>
                  <th>Employee Info</th>
                  <th>Employee ID</th>
                  <th>Department</th>
                  <th>Designation</th>
                  <th>Attendance Today</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((emp) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={emp.profilePicture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                          alt={emp.name}
                          style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
                        />
                        <div>
                          <strong style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{emp.name}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>{emp.email}</span>
                        </div>
                      </div>
                    </td>
                    <td><strong>{emp.employeeId}</strong></td>
                    <td>{emp.department}</td>
                    <td>{emp.designation}</td>
                    <td><StatusBadge status={emp.todayAttendanceStatus || 'Present'} /></td>
                    <td><span className="df-badge df-badge-present">{emp.status}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button
                          className="df-btn df-btn-secondary"
                          onClick={() => setEditingEmployee(emp)}
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem' }}
                          title="Edit Details"
                        >
                          <Edit size={14} /> Edit
                        </button>
                        <button
                          className="df-btn df-btn-primary"
                          onClick={() => handleSwitchToEmployee(emp)}
                          style={{ padding: '0.375rem 0.625rem', fontSize: '0.75rem', background: 'linear-gradient(135deg, var(--emerald-600), var(--emerald-500))' }}
                          title="Switch to Employee View"
                        >
                          <Shield size={14} /> Switch View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Employee Modal */}
      <Modal isOpen={!!editingEmployee} onClose={() => setEditingEmployee(null)} title={`Edit Employee Details — ${editingEmployee?.name}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <FormInput
            label="Full Name"
            value={editingEmployee?.name || ''}
            onChange={(e) => setEditingEmployee((prev) => prev ? { ...prev, name: e.target.value } : null)}
          />
          <FormInput
            label="Department"
            value={editingEmployee?.department || ''}
            onChange={(e) => setEditingEmployee((prev) => prev ? { ...prev, department: e.target.value } : null)}
          />
          <FormInput
            label="Designation"
            value={editingEmployee?.designation || ''}
            onChange={(e) => setEditingEmployee((prev) => prev ? { ...prev, designation: e.target.value } : null)}
          />

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
            <button className="df-btn df-btn-secondary" onClick={() => setEditingEmployee(null)}>Cancel</button>
            <button
              className="df-btn df-btn-primary"
              onClick={() => {
                addToast('success', 'Employee Saved', `Updated records for ${editingEmployee?.name}.`);
                setEditingEmployee(null);
              }}
            >
              Save Details
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
