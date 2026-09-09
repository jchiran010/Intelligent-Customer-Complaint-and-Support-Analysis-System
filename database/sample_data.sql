-- sample_data.sql: Default configuration and mock details

-- Insert default categories
INSERT INTO categories (name_en, name_ta, description) VALUES
('Payment/Billing', 'கட்டணம் மற்றும் பில்லிங்', 'Issues relating to transactions, refunds, subscription charges, or invoices.'),
('Technical Support', 'தொழில்நுட்ப ஆதரவு', 'Website bugs, application crashes, slow performance, or software errors.'),
('Account Access', 'கணக்கு அணுகல்', 'Trouble logging in, password resets, account locking, or profile updates.'),
('Shipping/Delivery', 'கப்பல் மற்றும் விநியோகம்', 'Delays, damaged goods, package tracking issues, or address modifications.'),
('Customer Service', 'வாடிக்கையாளர் சேவை', 'Feedback on support quality, staff behavior, or overall resolution experience.');

-- Insert default admin and user
-- Passwords: Admin@123 and User@123 respectively
INSERT INTO users (name, email, password_hash, mobile, role, is_active, language, theme) VALUES
('System Administrator', 'admin@support.com', 'scrypt:32768:8:1$rNYnIt1N2ZfjIXyC$5e7355ee8c408bb42a1dbd25ba2146fe6c17f7e670a88a6a7d1d15dd0efe6ff6854fc82ca9915b89dfa78cdb8426447fbf0e064d52fd78d1bb9ee04bfff3c872', '9876543210', 'admin', 1, 'en', 'dark'),
('John Doe', 'user@support.com', 'scrypt:32768:8:1$jJfTm9CQHaTDhjG1$c7dade7ef56e94861710d0aac3706b46eaf6e266992026879344f6ae13c074c81460af95564c12149149de33c2f1e1c50e5216bb91308647d9feee302a60a46d', '9012345678', 'user', 1, 'en', 'dark'),
('அன்பரசன்', 'anbu@support.com', 'scrypt:32768:8:1$jJfTm9CQHaTDhjG1$c7dade7ef56e94861710d0aac3706b46eaf6e266992026879344f6ae13c074c81460af95564c12149149de33c2f1e1c50e5216bb91308647d9feee302a60a46d', '9012345679', 'user', 1, 'ta', 'dark');

-- Insert sample complaints
INSERT INTO complaints (ticket_id, user_id, category_id, title, description, priority, status, feedback_rating, feedback_comments, resolved_at, created_at) VALUES
('TKT-100201', 2, 1, 'Double payment deducted', 'My payment was deducted twice for the subscription renewal. Please initiate a refund.', 'high', 'resolved', 5, 'Quick resolution! Refund processed in 24 hours.', datetime('now', '-5 days'), datetime('now', '-6 days')),
('TKT-100202', 2, 2, 'Dashboard load error', 'When loading the dashboard, I get a blank screen and a console error related to Chart.js.', 'medium', 'in_progress', NULL, NULL, NULL, datetime('now', '-3 days')),
('TKT-100203', 2, 3, 'Cannot reset security PIN', 'I followed the email link to reset my secure login PIN but the page returns a 404 error.', 'critical', 'pending', NULL, NULL, NULL, datetime('now', '-1 days')),
('TKT-100204', 3, 4, 'Delivery address not updated', 'மாற்றப்பட்ட முகவரிக்கு பார்சல் அனுப்பப்படவில்லை. எனது புதிய முகவரியை சரிபார்க்கவும்.', 'medium', 'pending', NULL, NULL, NULL, datetime('now', '-2 hours'));

-- Insert timelines
INSERT INTO complaint_timeline (complaint_id, status, title_en, title_ta, description_en, description_ta, updated_by) VALUES
(1, 'pending', 'Ticket Generated', 'டிக்கெட் உருவாக்கப்பட்டது', 'Ticket TKT-100201 successfully registered.', 'டிக்கெட் TKT-100201 வெற்றிகரமாக பதிவு செய்யப்பட்டது.', 2),
(1, 'in_progress', 'Assigned to Agent', 'முகவருக்கு ஒதுக்கப்பட்டது', 'Assigned to Billing support team for resolution.', 'தீர்வுக்காக பில்லிங் ஆதரவு குழுவிற்கு ஒதுக்கப்பட்டது.', 1),
(1, 'resolved', 'Refund Issued', 'பணம் திருப்பித் தரப்பட்டது', 'Refund has been approved and issued to user bank account.', 'பணம் திரும்பப் பெறுதல் அங்கீகரிக்கப்பட்டு வங்கி கணக்கில் செலுத்தப்பட்டது.', 1),
(2, 'pending', 'Ticket Generated', 'டிக்கெட் உருவாக்கப்பட்டது', 'Ticket TKT-100202 successfully registered.', 'டிக்கெட் TKT-100202 வெற்றிகரமாக பதிவு செய்யப்பட்டது.', 2),
(2, 'in_progress', 'Under Investigation', 'விசாரணையில் உள்ளது', 'Frontend engineering team is inspecting the script execution error.', 'முன்பக்க பொறியியல் குழு ஸ்கிரிப்ட் பிழையை ஆய்வு செய்கிறது.', 1),
(3, 'pending', 'Ticket Generated', 'டிக்கெட் உருவாக்கப்பட்டது', 'Ticket TKT-100203 successfully registered.', 'டிக்கெட் TKT-100203 வெற்றிகரமாக பதிவு செய்யப்பட்டது.', 2),
(4, 'pending', 'Ticket Generated', 'டிக்கெட் உருவாக்கப்பட்டது', 'Ticket TKT-100204 successfully registered.', 'டிக்கெட் TKT-100204 வெற்றிகரமாக பதிவு செய்யப்பட்டது.', 3);

-- Insert notifications
INSERT INTO notifications (user_id, title_en, title_ta, message_en, message_ta, is_read, type) VALUES
(2, 'Refund Issued', 'பணம் திருப்பித் தரப்பட்டது', 'Your refund for TKT-100201 has been processed.', 'TKT-100201 க்கான உங்கள் பணம் திரும்பப் பெறுதல் செயல்முறை செய்யப்பட்டுள்ளது.', 0, 'status_change'),
(2, 'Investigation Started', 'விசாரணை தொடங்கப்பட்டது', 'Work has begun on your issue TKT-100202.', 'உங்கள் சிக்கல் TKT-100202 இல் வேலை தொடங்கப்பட்டது.', 1, 'status_change');
