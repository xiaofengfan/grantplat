import httpx
import json

response = httpx.get('http://localhost:8000/health')
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
