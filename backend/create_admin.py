import httpx
import json

base_url = 'http://localhost:8000'
api_url = f'{base_url}/api/v1'

response = httpx.post(
    f'{api_url}/auth/register',
    json={
        "username": "admin",
        "email": "admin@quantmaster.com",
        "password": "admin123"
    }
)
print(f"Status: {response.status_code}")
print(f"Content: {response.text[:500] if response.text else 'Empty'}")
