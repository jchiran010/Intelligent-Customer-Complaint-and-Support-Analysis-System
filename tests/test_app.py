# test_app.py: Comprehensive test suite for Intelligent Support Analysis System
import unittest
import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.services.intelligent_service import analyze_complaint
from backend.utils.db_helper import query_db, execute_query

class SystemTestCase(unittest.TestCase):
    def setUp(self):
        os.environ['SECRET_KEY'] = 'testsecret'
        os.environ['DB_TYPE'] = 'sqlite'
        
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()

    def login_as(self, email):
        with self.client.session_transaction() as sess:
            user = query_db("SELECT * FROM users WHERE email = ?", (email,), one=True)
            if user:
                sess['user_id'] = user['id']
                sess['name'] = user['name']
                sess['email'] = user['email']
                sess['role'] = user['role']
                sess['theme'] = user['theme'] or 'dark'
                sess['lang'] = user['language'] or 'en'

    # --- 1. Public Routes & Splash Screen ---
    def test_splash_screen(self):
        """Verify the splash root endpoint returns 200"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Intelligent Customer Complaint', response.data)

    def test_login_page(self):
        """Verify the login endpoint returns 200"""
        response = self.client.get('/auth/login')
        self.assertEqual(response.status_code, 200)

    def test_register_page(self):
        """Verify the registration endpoint returns 200"""
        response = self.client.get('/auth/register')
        self.assertEqual(response.status_code, 200)

    def test_forgot_password_page(self):
        """Verify forgot password endpoint returns 200"""
        response = self.client.get('/auth/forgot-password')
        self.assertEqual(response.status_code, 200)

    # --- 2. NLP Ticket Classifier ---
    def test_nlp_classifier_billing(self):
        """Verify key NLP suggestions route for Payment/Billing"""
        analysis = analyze_complaint("My payment was deducted but the order failed.")
        self.assertEqual(analysis['category_id'], 1)
        self.assertEqual(analysis['priority'], 'high')

    def test_nlp_classifier_account_access(self):
        """Verify NLP suggestions for account locking"""
        analysis = analyze_complaint("I forgot my password and my account is locked.")
        self.assertEqual(analysis['category_id'], 3)
        self.assertEqual(analysis['priority'], 'high')

    def test_nlp_classifier_critical(self):
        """Verify NLP suggestion of critical priority for security issues"""
        analysis = analyze_complaint("Urgent: fraud on my account, money was stolen!")
        self.assertEqual(analysis['priority'], 'critical')

    def test_nlp_classifier_tamil(self):
        """Verify bilingual NLP suggestions for Tamil text"""
        analysis = analyze_complaint("பணம் கழிக்கப்பட்டது ஆனால் ரசீது வரவில்லை")
        self.assertEqual(analysis['category_id'], 1)

    # --- 3. Route Shielding & Role Enforcement ---
    def test_route_shielding_unauthorized(self):
        """Verify that accessing dashboard while logged out redirects to login"""
        response = self.client.get('/user/dashboard', follow_redirects=False)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login', response.headers['Location'])

    def test_admin_route_shielding_for_regular_user(self):
        """Verify that normal customer cannot access admin routes"""
        self.login_as('user@support.com')
        response = self.client.get('/admin/dashboard', follow_redirects=False)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/user/dashboard', response.headers['Location'])

    # --- 4. Customer Portal Endpoints ---
    def test_user_dashboard(self):
        """Verify user dashboard renders correctly for logged-in user"""
        self.login_as('user@support.com')
        response = self.client.get('/user/dashboard')
        self.assertEqual(response.status_code, 200)

    def test_user_settings_page(self):
        """Verify dedicated Theme & Language settings page renders"""
        self.login_as('user@support.com')
        response = self.client.get('/user/settings')
        self.assertEqual(response.status_code, 200)

    def test_user_chatbot_api(self):
        """Verify AI chatbot responds to query"""
        self.login_as('user@support.com')
        response = self.client.post('/user/api/chatbot', json={'message': 'track TKT-100201'})
        self.assertEqual(response.status_code, 200)
        self.assertIn('response', response.json)

    def test_theme_and_lang_api(self):
        """Verify theme and language preferences update API"""
        self.login_as('user@support.com')
        response = self.client.post('/user/api/theme_lang', json={'theme': 'light', 'lang': 'ta'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json.get('status'), 'success')

    # --- 5. Admin Console & Reports ---
    def test_admin_dashboard(self):
        """Verify admin dashboard loads with KPI metrics"""
        self.login_as('admin@support.com')
        response = self.client.get('/admin/dashboard')
        self.assertEqual(response.status_code, 200)

    def test_admin_complaints_list(self):
        """Verify admin complaints list endpoint"""
        self.login_as('admin@support.com')
        response = self.client.get('/admin/complaints', follow_redirects=True)
        self.assertEqual(response.status_code, 200)

    def test_admin_reports_export_csv(self):
        """Verify CSV report generator"""
        self.login_as('admin@support.com')
        response = self.client.get('/report/export/csv')
        self.assertEqual(response.status_code, 200)
        self.assertIn('text/csv', response.headers['Content-Type'])

    def test_admin_reports_export_pdf(self):
        """Verify PDF report generator"""
        self.login_as('admin@support.com')
        response = self.client.get('/report/export/pdf')
        self.assertEqual(response.status_code, 200)
        self.assertIn('application/pdf', response.headers['Content-Type'])

    def test_user_profile_preferences_update(self):
        """Verify profile settings update for theme, language, and account details"""
        self.login_as('user@support.com')
        response = self.client.get('/user/profile')
        self.assertEqual(response.status_code, 200)

        # POST update theme to light and language to ta
        post_response = self.client.post('/user/profile', data={
            'name': 'Standard User Updated',
            'mobile': '9876543210',
            'theme': 'light',
            'language': 'ta',
            'password': '',
            'confirm_password': ''
        }, follow_redirects=True)
        self.assertEqual(post_response.status_code, 200)

        with self.client.session_transaction() as sess:
            self.assertEqual(sess.get('theme'), 'light')
            self.assertEqual(sess.get('lang'), 'ta')
            self.assertEqual(sess.get('name'), 'Standard User Updated')

    def test_user_settings_post_update(self):
        """Verify theme and language settings form POST submission"""
        self.login_as('user@support.com')
        post_response = self.client.post('/user/settings', data={
            'theme': 'dark',
            'language': 'en'
        }, follow_redirects=True)
        self.assertEqual(post_response.status_code, 200)

        with self.client.session_transaction() as sess:
            self.assertEqual(sess.get('theme'), 'dark')
            self.assertEqual(sess.get('lang'), 'en')

if __name__ == '__main__':
    unittest.main()

