import requests
import json

class myfxbook:
    def __init__(self, email, password):
        self.email = email
        self.password = password
        self.session = None
        self.base_url = "https://www.myfxbook.com/api"
    
    def login(self):
        """Login to MyFXBook API"""
        try:
            url = f"{self.base_url}/login.json"
            params = {
                'email': self.email,
                'password': self.password
            }
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if not data.get('error'):
                self.session = data.get('session')
            
            return data
        except Exception as e:
            return {'error': True, 'message': str(e)}
    
    def logout(self):
        """Logout from MyFXBook API"""
        try:
            if not self.session:
                return {'error': True, 'message': 'Not logged in'}
            
            url = f"{self.base_url}/logout.json"
            params = {'session': self.session}
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if not data.get('error'):
                self.session = None
            
            return data
        except Exception as e:
            return {'error': True, 'message': str(e)}
    
    def get_community_outlook(self):
        """Get community outlook (economic calendar data)"""
        try:
            if not self.session:
                login_result = self.login()
                if login_result.get('error'):
                    return []
            
            url = f"{self.base_url}/get-community-outlook.json"
            params = {'session': self.session}
            response = requests.get(url, params=params, timeout=10)
            data = response.json()
            
            if data.get('error'):
                return []
            
            return data.get('outlook', [])
        except Exception as e:
            print(f"MyFXBook API error: {e}")
            return []