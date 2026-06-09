# -*- coding: utf-8 -*-
import codecs

path = r'C:\Users\75624\tennis-coach\index.html'

with open(path, 'rb') as f:
    raw = f.read()
text = raw.decode('gbk')

# 1. Remove old HELPERS section (safe remove of the first HELPERS block)
old_start = '// ==================== HELPERS ===================='
old_defs = [
    'function $(sel) { return document.querySelector(sel); }',
    'function $$(sel) { return document.querySelectorAll(sel); }',
]

# Find position of HELPERS
pos_helpers = text.find(old_start)
if pos_helpers >= 0:
    # Find the line after the two function defs
    lines = text[pos_helpers:].split('\n')
    # Skip the HELPERS header line, then the two function lines
    # But need to handle \r\n
    lines_raw = text[pos_helpers:].splitlines()
    
    # Find where the function defs end and formatDate starts
    search_from = pos_helpers
    for line_prefix in ['function $(sel)', 'function $$(sel)']:
        idx = text.find(line_prefix, search_from)
        if idx >= 0:
            eol = text.find('\n', idx)
            search_from = eol + 1
    
    # Now search_from is right after the $$ line
    # Remove everything from pos_helpers to search_from
    text = text[:pos_helpers] + text[search_from:]
    print('Removed old HELPERS section')

# 2. Insert fresh version after 'let authUser = null;'
insert_after = 'let authUser = null;'
helper_code = '''
// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }
'''

pos = text.find(insert_after)
if pos >= 0:
    eol = text.find('\n', pos)
    text = text[:eol+1] + helper_code + text[eol+1:]
    print('Inserted helpers after authUser line')
else:
    print('ERROR: authUser not found')
    exit(1)

with open(path, 'wb') as f:
    f.write(text.encode('gbk'))
print('Done')
