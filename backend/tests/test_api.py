"""
API Endpoint Tests
"""

import unittest
import json
from app.api import create_app


class TestAPI(unittest.TestCase):
    
    def setUp(self):
        self.app = create_app()
        self.client = self.app.test_client()
    
    def test_health(self):
        """Test health endpoint"""
        response = self.client.get('/api/system/health')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertEqual(data['status'], 'healthy')


if __name__ == '__main__':
    unittest.main()
