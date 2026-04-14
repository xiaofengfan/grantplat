import httpx
import json

base_url = 'http://localhost:8000'
api_url = f'{base_url}/api/v1'

print("Testing health endpoint...")
response = httpx.get(f'{base_url}/health')
print(f"/health: {response.status_code} - {response.text}")

print("\nTesting register endpoint...")
response = httpx.post(
    f'{api_url}/auth/register',
    json={
        "username": "admin",
        "email": "admin@quantmaster.com",
        "password": "admin123"
    }
)
print(f"/auth/register: {response.status_code}")
print(f"Content: {response.text[:1000] if response.text else 'Empty'}")
