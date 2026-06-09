# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
p = 'C:/Users/75624/tennis-coach/ai-server/app.py'
raw = open(p, 'rb').read()
text = raw.decode('utf-8')
lines = text.split(chr(10))

# 1. Fix PROMPT_TEMPLATE
s = [i for i,l in enumerate(lines) if 'PROMPT_TEMPLATE' in l and '=' in l][0]
e = [i for i,l in enumerate(lines) if '@app.route' in l and i>s][0]
new_prompt = [
    'PROMPT_TEMPLATE = " \\你是专业网球教练。请分析这段训练视频，用中文回复。,
