import httpx
import json

base_url = 'http://localhost:8000'

endpoints = [
    '/',
    '/health',
    '/docs',
    '/api',
    '/api/v1',
    '/api/v1/',
]

for ep in endpoints:
    try:
        response = httpx.get(f'{base_url}{ep}', timeout=5)
        print(f"{ep}: Status {response.status_code}")
    except Exception as e:
        print(f"{ep}: Error - {e}")
