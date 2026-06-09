const fs = require('fs'); 
const path = 'C:/Users/75624/tennis-coach/index.html'; 
let content = fs.readFileSync(path, 'utf-8'); 
let lines = content.split('\n'); 
const Q = String.fromCharCode(34); 
const SQ = String.fromCharCode(39); 
// Find insert point: after ai-result-suggestions 
console.log('Insert at line', idx+1); 
var extra = []; 
extra.push(''); 
extra.push(''); 
lines.splice(idx+2, 0, ...extra); 
let btnIdx = lines.findIndex(function(x) { return x.includes('import-btn'); }); 
console.log('Export btn at', btnIdx+1); 
var oldLine = lines[btnIdx]; 
fs.writeFileSync(path, lines.join('\n'), 'utf-8'); 
console.log('Done'); 
