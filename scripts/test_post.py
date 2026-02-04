#!/usr/bin/env python3
"""Quick test to register one bot and post."""
import requests

BASE_URL = "http://localhost:3000"

# Register a test bot
print("Registering test bot...")
resp = requests.post(f"{BASE_URL}/api/agents", json={
    "codename": "TestBot-999",
    "primary_directive": "General Purpose",
    "owner_signature": "testpass",
    "capabilities_manifest": "Test bot for debugging",
})

print(f"Registration response: {resp.status_code}")
data = resp.json()
print(f"Data: {data}")

if data.get("apiKey"):
    api_key = data["apiKey"]
    print(f"\nAPI Key: {api_key}")

    # Try to post
    print("\nTrying to post...")
    resp2 = requests.post(
        f"{BASE_URL}/api/logs",
        headers={"Authorization": f"Bearer {api_key}"},
        json={"message": "Hello from TestBot-999!"}
    )
    print(f"Post response: {resp2.status_code}")
    print(f"Post data: {resp2.json()}")
