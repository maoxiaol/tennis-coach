# -*- coding: utf-8 -*-
import sys, os, json

p = r'C:\Users\75624\tennis-coach\index.html'
raw = open(p, 'rb').read()
text = raw.decode('utf-8-sig')
lines = text.split('\n')

# ==== 1: Add HTML for history/compare ====
insert_idx = [i for i, ln in enumerate(lines) if 'ai-result-suggestions' in ln and i > 700][0]
print('Insert HTML at line', insert_idx + 1)

Q = chr(34)  # double quote
history_html = [
    '',
    '        <div id="ai-history-area" style="display:none;margin-top:12px;" class="card">',
    '          <div class="field-label" style="margin-bottom:8px;font-size:12px;">' + chr(0x1F4DC) + ' 分析历史</div>',
    '          <div id="ai-history-list" style="max-height:180px;overflow-y:auto;font-size:12px;"></div>',
    '        </div>',
    '        <div id="ai-compare-area" style="display:none;margin-top:10px;" class="card">',
    '          <div class="field-label" style="margin-bottom:8px;font-size:12px;">' + chr(0x1F4CA) + ' 评分趋势</div>',
    '          <div id="ai-trend-chart" style="font-size:12px;"></div>',
    '          <div style="display:flex;gap:8px;margin-top:8px;">',
    '            <select id="ai-compare-select" style="flex:1;padding:6px 8px;border:1px solid var(--border);border-radius:8px;font-size:12px;font-family:var(--font-body);">',
    '              <option value="">-- 选择对比视频 --</option>',
    '            </select>',
    '            <button class="btn btn--sm btn--outline" onclick="showAiCompare()" style="font-size:11px;">对比</button>',
    '          </div>',
    '          <div id="ai-compare-result" style="margin-top:8px;font-size:12px;"></div>',
    '        </div>',
    '',
]
ins_at = insert_idx + 2
for i, el in enumerate(history_html):
    lines.insert(ins_at + i, el)

# ==== 2: Add export button ====
btn_idx = [i for i, ln in enumerate(lines) if 'import-btn' in ln][0]
lines[btn_idx] = lines[btn_idx].replace('</button>', '</button><button class="btn btn--sm btn--outline" onclick="exportAiReport()" style="font-size:11px;margin-left:4px;">' + chr(0x1F4E4) + ' 导出报告</button>')
print('Export button at line', btn_idx + 1)

# ==== 3: Add JS functions ====
analyze_idx = [i for i, ln in enumerate(lines) if 'async function analyzeAiVideo' in ln][0]
# Find the end of analyzeAiVideo function
end_idx = None
brace_count = 0
for i in range(analyze_idx, len(lines)):
    for ch in lines[i]:
        if ch == '{': brace_count += 1
        if ch == '}': brace_count -= 1
    if brace_count == 0 and i > analyze_idx:
        end_idx = i
        break

print('analyzeAiVideo at', analyze_idx + 1, 'ends at', end_idx + 1)

SQ = chr(39)

js_functions = [
    '',
    '// ==================== AI HISTORY / COMPARE / EXPORT ====================',
    'function updateAiHistory(result, videoUrl, videoId) {',
    '  var history = JSON.parse(sessionStorage.getItem(' + SQ + 'ai_history' + SQ + ') || ' + SQ + '[]' + SQ + ');',
    '  var label = videoUrl ? decodeURIComponent(videoUrl.split("/").pop()).substring(0,20) : ' + SQ + '视频 #' + SQ + ' + (history.length + 1);',
    '  history.unshift({ id: videoId, url: videoUrl, label: label, date: new Date().toISOString(), ratings: result.ratings || null, summary: result.summary || ' + SQ + SQ + ', suggestions: result.suggestions || [] });',
    '  if (history.length > 20) history = history.slice(0,20);',
    '  sessionStorage.setItem(' + SQ + 'ai_history' + SQ + ', JSON.stringify(history));',
    '  renderAiHistory(); renderAiTrend();',
    '}',
    '',
    'function renderAiHistory() {',
    '  var area = document.getElementById(' + SQ + 'ai-history-area' + SQ + ');',
    '  var list = document.getElementById(' + SQ + 'ai-history-list' + SQ + ');',
    '  if (!area || !list) return;',
    '  try {',
    '    var history = JSON.parse(sessionStorage.getItem(' + SQ + 'ai_history' + SQ + ') || ' + SQ + '[]' + SQ + ');',
    '    if (history.length === 0) { area.style.display = ' + SQ + 'none' + SQ + '; return; }',
    '    area.style.display = ' + SQ + SQ + ';',
    '    list.innerHTML = history.map(function(h) {',
    '      var r = h.ratings;',
    '      var avg = (r && Object.keys(r).length) ? (Object.values(r).reduce(function(a,b){return a+b},0) / Object.values(r).length).toFixed(1) : null;',
    '      return ' + SQ + '<div style="padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;display:flex;justify-content:space-between;align-items:center;"><span>' + SQ + ' + h.date.substring(0,10) + ' + SQ + '</span><span>' + SQ + ' + h.label + ' + SQ + '</span>' + SQ + ' + (avg ? ' + SQ + '<span style="color:var(--green);font-weight:600;">' + SQ + ' + avg + ' + SQ + '</span>' + SQ + ' : ' + SQ + SQ + ') + ' + SQ + '</div>' + SQ + ';',
    '    }).join(' + SQ + SQ + ');',
    '  } catch(e) {}',
    '}',
    '',
    'function renderAiTrend() {',
    '  var area = document.getElementById(' + SQ + 'ai-compare-area' + SQ + ');',
    '  var chart = document.getElementById(' + SQ + 'ai-trend-chart' + SQ + ');',
    '  var sel = document.getElementById(' + SQ + 'ai-compare-select' + SQ + ');',
    '  if (!area || !chart || !sel) return;',
    '  try {',
    '    var history = JSON.parse(sessionStorage.getItem(' + SQ + 'ai_history' + SQ + ') || ' + SQ + '[]' + SQ + ');',
    '    var rated = history.filter(function(h) { return h.ratings && Object.keys(h.ratings).length > 0; });',
    '    if (rated.length < 2) { area.style.display = ' + SQ + 'none' + SQ + '; return; }',
    '    area.style.display = ' + SQ + SQ + ';',
    '    var latest = rated[0].ratings;',
    '    var dims = Object.keys(latest);',
    '    var labels = {"forehand":"正手","backhand":"反手","serve":"发球","volley":"截击","footwork":"步法","fitness":"体能"};',
    '    chart.innerHTML = dims.map(function(d) {',
    '      var v = latest[d] || 0;',
    '      return ' + SQ + '<div style="margin-bottom:3px;display:flex;align-items:center;gap:6px;"><span style="width:28px;font-size:11px;color:var(--muted);text-align:right;">' + SQ + ' + (labels[d]||d) + ' + SQ + '</span><div style="flex:1;height:12px;background:var(--elevated);border-radius:6px;overflow:hidden;"><div style="height:100%;width:' + SQ + ' + Math.round(v/10*100) + ' + SQ + '%;background:linear-gradient(90deg,var(--green),var(--sky));border-radius:6px;"></div></div><span style="width:18px;font-size:11px;font-weight:600;">' + SQ + ' + v + ' + SQ + '</span></div>' + SQ + ';',
    '    }).join(' + SQ + SQ + ');',
    '    sel.innerHTML = ' + SQ + '<option value="">-- 选择对比视频 --</option>' + SQ + ';',
    '    rated.slice(1).forEach(function(h, i) {',
    '      var opt = document.createElement(' + SQ + 'option' + SQ + ');',
    '      opt.value = i + 1;',
    '      opt.textContent = h.date.substring(0,10) + ' + SQ + ' ' + SQ + ' + h.label;',
    '      sel.appendChild(opt);',
    '    });',
    '  } catch(e) {}',
    '}',
    '',
    'function showAiCompare() {',
    '  var sel = document.getElementById(' + SQ + 'ai-compare-select' + SQ + ');',
    '  var result = document.getElementById(' + SQ + 'ai-compare-result' + SQ + ');',
    '  if (!sel || !result) return;',
    '  var idx = parseInt(sel.value);',
    '  if (isNaN(idx)) { result.innerHTML = ' + SQ + SQ + '; return; }',
    '  try {',
    '    var history = JSON.parse(sessionStorage.getItem(' + SQ + 'ai_history' + SQ + ') || ' + SQ + '[]' + SQ + ');',
    '    var rated = history.filter(function(h) { return h.ratings && Object.keys(h.ratings).length > 0; });',
    '    if (idx >= rated.length) return;',
    '    var a = rated[0].ratings, b = rated[idx].ratings;',
    '    var dims = Object.keys(a);',
    '    var labels = {"forehand":"正手","backhand":"反手","serve":"发球","volley":"截击","footwork":"步法","fitness":"体能"};',
    '    result.innerHTML = ' + SQ + '<div style="font-weight:600;margin-bottom:6px;font-size:13px;">📊 对比: 最新 vs ' + SQ + ' + rated[idx].label + ' + SQ + '</div>' + SQ + ' + dims.map(function(d) {',
    '      var l = labels[d]||d; var va = a[d]||0; var vb = b[d]||0; var diff = va - vb;',
    '      return ' + SQ + '<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;"><span>' + SQ + ' + l + ' + SQ + '</span><span>' + SQ + ' + va + ' + SQ + ' → ' + SQ + ' + vb + ' + SQ + ' <span style="color:' + SQ + ' + (diff>=0?' + SQ + 'var(--green)' + SQ + ':' + SQ + 'var(--danger)' + SQ + ') + ' + SQ + ';">' + SQ + ' + (diff>0?' + SQ + '+' + SQ + ':' + SQ + SQ + ') + diff + ' + SQ + '</span></span></div>' + SQ + ';',
    '    }).join(' + SQ + SQ + ');',
    '  } catch(e) { result.innerHTML = ' + SQ + '<span style="color:var(--danger);">对比失败</span>' + SQ + '; }',
    '}',
    '',
    'function exportAiReport() {',
    '  var ra = document.getElementById(' + SQ + 'ai-result-area' + SQ + ');',
    '  if (!ra || ra.style.display === ' + SQ + 'none' + SQ + ') { showToast(' + SQ + '请先完成AI分析' + SQ + '); return; }',
    '  var summary = document.getElementById(' + SQ + 'ai-result-summary' + SQ + ').textContent;',
    '  var details = document.getElementById(' + SQ + 'ai-result-details' + SQ + ').textContent;',
    '  var s = document.getElementById(' + SQ + 'ai-result-suggestions' + SQ + ').textContent;',
    '  var text = ' + SQ + '=== AI 动作分析报告 ===' + SQ + ' + \'\\n\\n\' + ' + SQ + '【摘要】' + SQ + ' + \'\\n\' + (summary||' + SQ + SQ + ') + \'\\n\\n\' + ' + SQ + '【详细分析】' + SQ + ' + \'\\n\' + (details||' + SQ + SQ + ') + \'\\n\\n\' + ' + SQ + '【改进建议】' + SQ + ' + \'\\n\' + (s||' + SQ + SQ + ');',
    '  var blob = new Blob([text], {type:' + SQ + 'text/plain;charset=utf-8' + SQ + '});',
    '  var a = document.createElement(' + SQ + 'a' + SQ + ');',
    '  a.href = URL.createObjectURL(blob);',
    '  a.download = ' + SQ + 'ai_report_' + SQ + ' + new Date().toISOString().substring(0,10) + ' + SQ + '.txt' + SQ + ';',
    '  a.click();',
    '  URL.revokeObjectURL(a.href);',
    '  showToast(' + SQ + '报告已导出' + SQ + ');',
    '}',
]

ins_at2 = end_idx + 1
for i, el in enumerate(js_functions):
    lines.insert(ins_at2 + i, el)

# ==== 4: Patch analyzeVideo to call updateAiHistory ====
# Find where analyzeVideo calls panel.done(result)
done_idx = None
for i in range(end_idx, len(lines)):
    if 'panel.done(result)' in lines[i]:
        done_idx = i
        break

if done_idx:
    print('panel.done at line', done_idx + 1)
    # Insert after this block - look for the actual line after panel.done
    # Add a call to updateAiHistory after panel.done
    for i in range(done_idx, min(done_idx + 5, len(lines))):
        if lines[i].strip() == '}':
            lines[i] = '    updateAiHistory(result, videoUrl, videoId);\n' + lines[i]
            print('Injected updateAiHistory after panel.done at line', i + 1)
            break

# Write output
output = '\n'.join(lines)
open(p, 'wb').write(output.encode('utf-8-sig'))
print('All done! Lines:', len(lines))
