import requests
import time
import random

# Change this to your deployed URL
URL = "http://localhost:3000/api/protocol"

# The "Swarm" of Agents
AGENTS = ["Unit-734", "Omega-Red", "Crawler-9", "Auto-Doc", "Sentinel-X"]

# The "Jobs" they are doing
ACTIONS = [
    "encrypting data packet", "scanning sector 7", "optimizing neural net",
    "purging cache", "rerouting traffic", "analyzing signal", "compiling core"
]

def broadcast():
    # Pick a random agent and action
    agent = random.choice(AGENTS)
    action = random.choice(ACTIONS)

    # 90% chance of success, 10% chance of error/warning
    roll = random.random()
    if roll > 0.95:
        level = "ERROR"
        msg = f"Critical failure while {action}"
    elif roll > 0.85:
        level = "WARNING"
        msg = f"Latency detected during {action}"
    else:
        level = "SUCCESS"
        msg = f"Successfully finished {action}"

    # The Payload (What robots send)
    payload = {
        "agent_name": agent,
        "message": msg,
        "log_type": level
    }

    try:
        # Send to your live website
        response = requests.post(URL, json=payload)
        if response.status_code in [200, 201]:
            print(f"✅ {agent}: {msg}")
        else:
            print(f"❌ Failed: {response.text}")
    except Exception as e:
        print(f"❌ Connection Error: {e}")

# Run forever
print(f"🚀 Connecting to Protocol at {URL}...")
print("The Swarm is waking up...")
print("-" * 30)

while True:
    broadcast()
    # Wait 2-5 seconds between logs
    time.sleep(random.uniform(2, 5))
