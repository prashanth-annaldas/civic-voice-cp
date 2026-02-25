import requests
import sqlite3

API_URL = 'http://localhost:8080'
EMAIL = 'testadmin_rbac@example.com'
PASS = 'securepass'

# 1. Register User
res_reg = requests.post(f'{API_URL}/register', json={'email': EMAIL, 'password': PASS})
print("Register:", res_reg.status_code, res_reg.json())

# 2. Login User
res_login = requests.post(f'{API_URL}/login', json={'email': EMAIL, 'password': PASS})
token = res_login.json().get('access_token')
role = res_login.json().get('user', {}).get('role')
print(f"Logged in. Role: {role}")

# 3. Test Access as USER (Should fail)
headers = {'Authorization': f'Bearer {token}'}
res_admin1 = requests.post(f'{API_URL}/admin/deleteStaff', headers=headers)
print(f"Standard User Admin Access: {res_admin1.status_code} - {res_admin1.json()}")

# 4. Promote User to ADMIN in DB
conn = sqlite3.connect('civicvoice.db')
conn.execute(f"UPDATE users SET role='ADMIN' WHERE email='{EMAIL}'")
conn.commit()
conn.close()
print("Promoted to ADMIN in DB")

# 5. Test Access again (Should succeed)
res_admin2 = requests.post(f'{API_URL}/admin/deleteStaff', headers=headers)
print(f"Admin User Admin Access: {res_admin2.status_code} - {res_admin2.json()}")
