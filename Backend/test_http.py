import requests

print("Testing /")
r = requests.get("http://localhost:8080/")
print(r.status_code, r.text)

print("Testing /register (OPTIONS)")
r = requests.options("http://localhost:8080/register")
print(r.status_code, r.headers)
