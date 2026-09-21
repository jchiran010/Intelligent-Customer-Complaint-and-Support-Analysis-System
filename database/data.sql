-- ====================================================================
-- INTELLIGENT CUSTOMER COMPLAINT & SUPPORT ANALYSIS SYSTEM
-- SEED DATA: data.sql (Demo Accounts, Categories, Sample Complaints)
-- Passwords:
--   Admin: Admin@123   (BCrypt hash: $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC)
--   User:  User@123    (BCrypt hash: $2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC)
-- ====================================================================

USE complaint_db;

-- 1. USERS (Admin and Regular Users)
INSERT INTO users (id, name, email, password, role, phone, department, status) VALUES
(1, 'System Administrator', 'admin@complaintsystem.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC', 'ROLE_ADMIN', '+1-800-555-0100', 'IT Administration', 'ACTIVE'),
(2, 'Sarah Jenkins (Support Lead)', 'sarah.support@complaintsystem.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC', 'ROLE_ADMIN', '+1-800-555-0101', 'Customer Support', 'ACTIVE'),
(3, 'John Doe', 'john.doe@example.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC', 'ROLE_USER', '+1-555-0199', 'Customer', 'ACTIVE'),
(4, 'Jane Smith', 'jane.smith@example.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC', 'ROLE_USER', '+1-555-0198', 'Customer', 'ACTIVE'),
(5, 'Robert Johnson', 'robert.j@example.com', '$2a$10$GRLdNijSQMUvl/au9ofL.eDwmoohzzS7.rmNSJZ.StGQc3KwXa1eC', 'ROLE_USER', '+1-555-0197', 'Customer', 'ACTIVE');

-- 2. CATEGORIES
INSERT INTO categories (id, name, description, sla_hours, icon, is_active) VALUES
(1, 'Billing & Payments', 'Issues regarding invoices, overcharges, unauthorized deductions, and payment gateways.', 24, 'bi-credit-card', TRUE),
(2, 'Technical & System Glitches', 'Software bugs, application crashes, service downtime, and feature malfunctions.', 12, 'bi-cpu', TRUE),
(3, 'Delivery & Logistics', 'Late delivery, missing packages, damaged goods upon arrival, and courier tracking.', 48, 'bi-truck', TRUE),
(4, 'Product Quality & Defects', 'Defective hardware, broken seals, missing parts, or non-functional items.', 72, 'bi-box-seam', TRUE),
(5, 'Customer Service & Staff', 'Complaints regarding agent behavior, unhelpful responses, or long wait times.', 36, 'bi-person-badge', TRUE),
(6, 'Account & Security', 'Account lockouts, MFA issues, credential resets, and privacy concerns.', 8, 'bi-shield-lock', TRUE);

-- 3. COMPLAINTS
INSERT INTO complaints (id, complaint_number, title, description, user_id, category_id, assigned_admin_id, priority, status, sentiment, sentiment_score, resolution_notes, resolved_at, created_at) VALUES
(1, 'CMP-2026-0001', 'Double debited for subscription invoice #9821', 'I was charged twice on September 15 for my monthly SaaS enterprise subscription. Kindly refund the duplicate $199 deduction immediately as this has affected our company petty cash.', 3, 1, 1, 'HIGH', 'IN_PROGRESS', 'VERY_NEGATIVE', -0.85, 'Under review by finance department.', NULL, '2026-09-16 09:15:00'),

(2, 'CMP-2026-0002', 'Mobile app crashes on checkout page', 'Whenever I click Proceed to Payment on the Android app (version 4.2), the application crashes to the home screen without any error code. I have tried clearing cache.', 3, 2, 2, 'HIGH', 'PENDING', 'NEGATIVE', -0.62, NULL, NULL, '2026-09-17 11:30:00'),

(3, 'CMP-2026-0003', 'Package arrived with torn seals and missing accessories', 'Order #ORD-7741 was delivered today. The outer packaging was completely ripped open and the power adapter was missing from the box.', 4, 4, 2, 'MEDIUM', 'RESOLVED', 'NEGATIVE', -0.71, 'Replacement adapter dispatched via express courier tracking #EXP-99214. $15 store credit issued.', '2026-09-18 16:00:00', '2026-09-17 14:10:00'),

(4, 'CMP-2026-0004', 'Inquiry regarding corporate discount tier update', 'Our contract renewal is coming up next month and we wanted to confirm if the 20% team tier discount is still active on our profile.', 4, 1, 1, 'LOW', 'CLOSED', 'POSITIVE', 0.65, 'Confirmed with sales manager that 20% tier is locked in for the upcoming annual cycle.', '2026-09-18 18:20:00', '2026-09-18 10:05:00'),

(5, 'CMP-2026-0005', 'Unable to reset two-factor authentication after phone lost', 'I lost my work phone yesterday and need to reset Google Authenticator for my company portal account. Please verify my identity and assist.', 5, 6, 1, 'CRITICAL', 'IN_PROGRESS', 'NEGATIVE', -0.55, 'Identity verification initiated via secondary contact phone.', NULL, '2026-09-19 08:45:00');

-- 4. TICKETS
INSERT INTO tickets (id, ticket_number, complaint_id, status, assigned_to, estimated_resolution, created_at) VALUES
(1, 'TCK-2026-0001', 1, 'IN_REVIEW', 'Finance Desk - System Admin', '2026-09-20 18:00:00', '2026-09-16 09:20:00'),
(2, 'TCK-2026-0002', 2, 'OPEN', 'Mobile Engineering Team', '2026-09-21 12:00:00', '2026-09-17 11:35:00'),
(3, 'TCK-2026-0003', 3, 'RESOLVED', 'Logistics Support - Sarah Jenkins', '2026-09-18 16:00:00', '2026-09-17 14:15:00'),
(4, 'TCK-2026-0004', 4, 'CLOSED', 'Billing Desk - System Admin', '2026-09-18 18:20:00', '2026-09-18 10:10:00'),
(5, 'TCK-2026-0005', 5, 'ASSIGNED', 'Security Response Team', '2026-09-19 18:00:00', '2026-09-19 08:50:00');

-- 5. FEEDBACKS
INSERT INTO feedbacks (id, complaint_id, user_id, rating, comments, created_at) VALUES
(1, 3, 4, 5, 'Quick resolution! The replacement power adapter was shipped immediately. Appreciate the great support.', '2026-09-18 17:30:00'),
(2, 4, 4, 4, 'Fast answer to our billing contract inquiry. Thank you!', '2026-09-18 19:00:00');

-- 6. NOTIFICATIONS
INSERT INTO notifications (id, user_id, title, message, type, is_read, target_url, created_at) VALUES
(1, 3, 'Complaint In Progress', 'Your complaint CMP-2026-0001 regarding double billing is now being investigated by our Finance team.', 'INFO', FALSE, '/user/complaint-details.html?id=1', '2026-09-16 09:20:00'),
(2, 3, 'Ticket Generated', 'Support Ticket TCK-2026-0002 has been opened for your mobile checkout issue.', 'SUCCESS', FALSE, '/user/complaint-details.html?id=2', '2026-09-17 11:35:00'),
(3, 4, 'Complaint Resolved', 'Your complaint CMP-2026-0003 regarding order #ORD-7741 has been resolved with a replacement shipment.', 'SUCCESS', TRUE, '/user/complaint-details.html?id=3', '2026-09-18 16:05:00'),
(4, 1, 'Critical Complaint Alert', 'New CRITICAL priority complaint CMP-2026-0005 has been lodged for Account & Security.', 'ALERT', FALSE, '/admin/complaint-details.html?id=5', '2026-09-19 08:46:00');
