import json
import urllib.request
import urllib.error
url = 'http://127.0.0.1:8000/api/query'
data = json.dumps({'prompt': 'hello'}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as r:
        print('STATUS', r.status)
        print(r.read().decode('utf-8'))
except urllib.error.HTTPError as e:
    print('HTTPERROR', e.code, e.read().decode('utf-8'))
except Exception as e:
    print('ERROR', e)
