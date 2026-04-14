import httpx
import json

base_url = 'http://localhost:8000'
api_url = f'{base_url}/api/v1'

print("Testing login with JSON...")
response = httpx.post(
    f'{api_url}/auth/login',
    json={
        "email": "admin@quantmaster.com",
        "password": "admin123"
    }
)
print(f"Status: {response.status_code}")
print(f"Response: {json.dumps(response.json(), indent=2, ensure_ascii=False) if response.status_code == 200 else response.text}")
