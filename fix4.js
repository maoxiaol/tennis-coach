const fs = require('fs'); 
var path = 'C:/Users/75624/tennis-coach/index.html'; 
var content = fs.readFileSync(path, 'utf-8'); 
var lines = content.split('\n'); 
var authIdx = -1, helpersIdx = -1; 
for (var i = 0; i < lines.length; i++) { 
  if (lines[i].startsWith('let authUser = null;')) authIdx = i; 
  if (lines[i].includes('HELPERS') && i > 1000) helpersIdx = i; 
} 
console.log('authUser:', authIdx+1, 'helpers:', helpersIdx+1); 
var dollar = String.fromCharCode(36); 
var ddollar = dollar + dollar; 
lines.splice(helpersIdx, 3); 
lines.splice(authIdx + 1, 0, '', '// ==================== HELPERS ====================', 'function ' + dollar + '(sel) { return document.querySelector(sel); }', 'function ' + ddollar + '(sel) { return document.querySelectorAll(sel); }', ''); 
fs.writeFileSync(path, lines.join('\n'), 'utf-8'); 
console.log('Done'); 
