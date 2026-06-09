import sys 
path = r'C:\Users\75624\tennis-coach\index.html' 
raw = open(path, 'rb').read() 
text = raw.decode('utf-8-sig') 
lines = text.split(chr(10)) 
auth_idx = None 
helpers_idx = None 
for i, line in enumerate(lines): 
    stripped = line.rstrip(chr(13)) 
    if stripped.startswith(chr(39) + 'let authUser = null' + chr(39) + ') 
        auth_idx = i 
    if chr(39) + 'HELPERS' + chr(39) in line and i 
        helpers_idx = i 
