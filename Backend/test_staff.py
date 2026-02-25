import requests
import time
import uuid

BASE_URL = "http://localhost:8000"
DEMO_EMAIL = f"staff_{uuid.uuid4().hex[:6]}@gmail.com"
DEMO_PASS = "123456"

print(f"1. Registering new STAFF user ({DEMO_EMAIL})...")
reg_payload = {
    "email": DEMO_EMAIL,
    "password": DEMO_PASS,
    "role": "STAFF"
}
reg_res = requests.post(f"{BASE_URL}/register", json=reg_payload)
if reg_res.status_code not in [200, 201]:
    print("Registration Failed:", reg_res.json())
    exit(1)

print("2. Logging in as STAFF...")
login_payload = {
    "email": DEMO_EMAIL,
    "password": DEMO_PASS,
    "role": "USER"
}
login_res = requests.post(f"{BASE_URL}/login", json=login_payload)
if login_res.status_code != 200:
    print("Login Failed:", login_res.json())
    exit(1)

data = login_res.json()
token = data["access_token"]
headers = {"Authorization": f"Bearer {token}"}
print(f"Success! Role: {data['user']['role']}")

print("\n3. Fetching Staff Items...")
items_res = requests.get(f"{BASE_URL}/staff/items", headers=headers)
if items_res.status_code != 200:
    print("Failed to fetch items:", items_res.json())
    exit(1)

items = items_res.json()
print(f"Success! Retrieved {len(items)} items.")
for i in items[:3]:
    print(f"  - [{i['type'].upper()} {i['id']}] {i['category']} (Status: {i['status']})")

if len(items) == 0:
    print("\nNo items to test PUT update on. Creating a mock request...")
    # create a mock request using the staff token
    req_payload = {"description": "Test request", "latitude": 0.0, "longitude": 0.0}
    requests.post(f"{BASE_URL}/requests", json=req_payload, headers=headers)
    
    # fetch items again
    items_res = requests.get(f"{BASE_URL}/staff/items", headers=headers)
    items = items_res.json()

if len(items) == 0:
    print("Still no items, exiting.")
    exit(0)

# 4. Test Status Update
target = items[0]
new_status = "Processing" if target["status"] != "Processing" else "Resolved"

print(f"\n4. Updating [{target['type'].upper()} {target['id']}] from '{target['status']}' to '{new_status}'...")

update_res = requests.put(
    f"{BASE_URL}/staff/items/{target['type']}/{target['id']}/status",
    json={"status": new_status},
    headers=headers
)

if update_res.status_code == 200:
    print("Success! " + str(update_res.json()))
else:
    print("Update Failed:", update_res.json())

print("\nStaff permissions and API test complete!")
