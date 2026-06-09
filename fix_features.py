# -*- coding: utf-8 -*-
import sys
sys.stdout.reconfigure(encoding='utf-8')
p='C:/Users/75624/tennis-coach/index.html'
t=open(p,'rb').read().decode('utf-8-sig')
l=t.split(chr(10))
i=[j for j,ln in enumerate(l) if 'ai-result-suggestions' in ln and j>700][0]
print('Insert at L'+str(i+1))
h=[]