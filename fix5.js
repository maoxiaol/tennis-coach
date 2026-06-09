const fs = require('fs'); 
const path = 'C:/Users/75624/tennis-coach/index.html'; 
let content = fs.readFileSync(path, 'utf-8'); 
let lines = content.split('\n'); 
for (let i = 0; i < lines.length; i++) { 
  if (lines[i].includes('selectAiVideo') && lines[i].includes('onclick')) { 
    console.log('Fixing line:', i+1); 
    const oldLine = lines[i]; 
    const idx = oldLine.indexOf('onclick='); 
    const before = oldLine.substring(0, idx); 
    const afterOnclick = oldLine.substring(idx); 
    const Q = String.fromCharCode(39); 
    const q = String.fromCharCode(34); 
    const bq = String.fromCharCode(96); 
    var dollar = String.fromCharCode(36); 
    var ddollar = dollar + dollar; 
    console.log('Found onclick:'); 
    console.log('  ' + before.substring(Math.max(0, before.length-30)) + '[...]'); 
    break; 
  } 
} 
fs.writeFileSync(path, lines.join('\n'), 'utf-8'); 
console.log('Done'); 
