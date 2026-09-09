# test_app.py: Automated tests to verify endpoints, routers, and classifications
import unittest
import os
import sys

# Ensure backend folder is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.services.intelligent_service import analyze_complaint
from backend.utils.db_helper import query_db

class SystemTestCase(unittest.TestCase):
    def setUp(self):
        # Override env to test mode
        os.environ['SECRET_KEY'] = 'testsecret'
        os.environ['DB_TYPE'] = 'sqlite'
        
        self.app = create_app()
        self.app.config['TESTING'] = True
        self.app.config['WTF_CSRF_ENABLED'] = False
        self.client = self.app.test_client()

    def test_splash_screen(self):
        """Verify the splash root endpoint returns 200"""
        response = self.client.get('/')
        self.assertEqual(response.status_code, 200)
        self.assertIn(b'Intelligent Customer Complaint', response.data)

    def test_login_page(self):
        """Verify the login endpoint returns 200"""
        response = self.client.get('/login')
        self.assertEqual(response.status_code, 200)

    def test_nlp_classifier_billing(self):
        """Verify key NLP suggestions route for Payment/Billing"""
        analysis = analyze_complaint("My payment was deducted but the order failed.")
        self.assertEqual(analysis['category_id'], 1)  # Payment/Billing
        self.assertEqual(analysis['priority'], 'high')  # High priority keyword match

    def test_nlp_classifier_account_access(self):
        """Verify NLP suggestions for account locking"""
        analysis = analyze_complaint("I forgot my password and my account is locked.")
        self.assertEqual(analysis['category_id'], 3)  # Account Access
        self.assertEqual(analysis['priority'], 'high')

    def test_nlp_classifier_critical(self):
        """Verify NLP suggestion of critical priority for security issues"""
        analysis = analyze_complaint("Urgent: fraud on my account, money was stolen!")
        self.assertEqual(analysis['priority'], 'critical')

    def test_route_shielding_unauthorized(self):
        """Verify that accessing dashboard while logged out redirects to login"""
        response = self.client.get('/user/dashboard', follow_redirects=False)
        self.assertEqual(response.status_code, 302)
        self.assertIn('/login', response.headers['Location'])

if __name__ == '__main__':
    unittest.main()
