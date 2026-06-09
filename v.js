function t(){

// ==================== SUPABASE CONFIG ====================
const SB_URL = 'https://gtlwbhxbhdhwoxuorvbn.supabase.co';
const SB_KEY = 'sb_publishable_4bhjxIWvPohJdLbAuFa0ZA_ltnxHwsi';

// REST API for data (all CRUD goes through this)
const SB_HEADERS = { 'apikey': SB_KEY, 'Authorization': 'Bearer ' + SB_KEY, 'Content-Type': 'application/json' };

async function api(method, table, body, query) {
  let url = `${SB_URL}/rest/v1/${table}`;
  if (query) url += '?' + query;
  const hdrs = { ...SB_HEADERS };
  if (body) hdrs['Prefer'] = 'return=representation';
  const opts = { method, headers: hdrs };
  if (body) opts.body = JSON.stringify(body);
  const res = await fetch(url, opts);
  if (!res.ok) {
    const err = await res.text();
    console.error(`API ${method} ${table} 失败:`, err);
    return { data: null, error: { message: err } };
  }
  if (method === 'DELETE') return { data: null, error: null };
  const text = await res.text();
  return { data: text ? JSON.parse(text) : [], error: null };
}

// ==================== AUTH STATE ====================
let authUser = null; // { role: 'coach'|'student', email?: string, student?: object }

// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }


// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }


// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }


// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }


// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }


// ==================== HELPERS ====================
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }


// Login page tab switching
$$('.login-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const t = tab.dataset.login;
    $$('.login-tab').forEach(b => b.classList.remove('active')); tab.classList.add('active');
    $$('.login-form').forEach(f => f.classList.remove('active'));
    if (t === 'coach') { showCoachLogin(); }
    else { showStudentLogin(); }
  });
});

function showCoachLogin() { $$('.login-form').forEach(f=>f.classList.remove('active')); $('#form-coach').classList.add('active'); $('#coach-error').textContent=''; }
function showCoachRegister() { $$('.login-form').forEach(f=>f.classList.remove('active')); $('#form-coach-register').classList.add('active'); $('#creg-error').textContent=''; }
function showStudentLogin() { $$('.login-form').forEach(f=>f.classList.remove('active')); $('#form-student').classList.add('active'); $('#student-error').textContent=''; }
function showStudentRegister() { $$('.login-form').forEach(f=>f.classList.remove('active')); $('#form-student-register').classList.add('active'); $('#reg-error').textContent=''; }

// Generate unique invite code
function genInviteCode() { return 'CT' + Math.random().toString(36).substring(2, 8).toUpperCase(); }

// Coach sign up
async function coachSignUp() {
  const name = $('#creg-name').value.trim();
  const email = $('#creg-email').value.trim();
  const pw = $('#creg-password').value;
  if (!name || !email || !pw) { $('#creg-error').textContent = '请填写完整信息'; return; }
  if (pw.length < 6) { $('#creg-error').textContent = '密码至少6位'; return; }
  try {
    const check = await api('GET', 'coaches', null, 'select=id&email=eq.'+encodeURIComponent(email));
    if (check.data && check.data.length > 0) { $('#creg-error').textContent = '该邮箱已注册'; return; }
    const invite = genInviteCode();
    const res = await api('POST', 'coaches', { name, email, password: pw, invite_code: invite });
    if (res.error || !res.data || res.data.length === 0) { $('#creg-error').textContent = '注册失败'; return; }
    showToast('注册成功！请登录');
    showCoachLogin();
  } catch(e) { $('#creg-error').textContent = '网络错误'; }
}

// Coach login
async function coachLogin() {
  const email = $('#coach-email').value.trim();
  const pw = $('#coach-password').value;
  if (!email || !pw) { $('#coach-error').textContent = '请填写邮箱和密码'; return; }
  try {
    const res = await api('GET', 'coaches', null, 'select=*&email=eq.'+encodeURIComponent(email));
    const coach = (res.data && res.data.length > 0) ? res.data[0] : null;
    if (!coach) { $('#coach-error').textContent = '邮箱未注册'; return; }
    if (coach.password !== pw) { $('#coach-error').textContent = '密码错误'; return; }
    authUser = { role: 'coach', email: coach.email, coach };
    sessionStorage.setItem('courtedge_coach', JSON.stringify(authUser));
    $('#coach-error').textContent = '';
    showApp();
  } catch(e) { $('#coach-error').textContent = '网络错误'; }
}

// Student login
async function studentLogin() {
  const phone = $('#login-phone').value.trim();
  const pin = $('#login-pin').value.trim();
  if (!phone) { $('#student-error').textContent = '请输入手机号'; return; }
  if (!pin) { $('#student-error').textContent = '请输入密码'; return; }
  try {
    const res = await api('GET', 'students', null, 'select=*&phone=eq.'+encodeURIComponent(phone));
    const student = (res.data && res.data.length > 0) ? res.data[0] : null;
    if (!student) { $('#student-error').textContent = '手机号未注册'; return; }
    if (student.login_pin !== pin) { $('#student-error').textContent = '密码错误'; return; }
    authUser = { role: 'student', student };
    $('#student-error').textContent = '';
    showApp();
  } catch(e) { $('#student-error').textContent = '登录失败，请重试'; }
}

// Student register
async function studentRegister() {
  const name = $('#reg-name').value.trim();
  const phone = $('#reg-phone').value.trim();
  const pin = $('#reg-pin').value.trim();
  const invite = $('#reg-invite').value.trim();
  if (!name) { $('#reg-error').textContent = '请输入姓名'; return; }
  if (!phone) { $('#reg-error').textContent = '请输入手机号'; return; }
  if (!pin || pin.length < 4) { $('#reg-error').textContent = '密码至少4位'; return; }
  if (!invite) { $('#reg-error').textContent = '请输入教练邀请码'; return; }
  try {
    // Check phone
    const check = await api('GET', 'students', null, 'select=id&phone=eq.'+encodeURIComponent(phone));
    if (check.data && check.data.length > 0) { $('#reg-error').textContent = '该手机号已注册'; return; }
    // Find coach by invite code
    const cRes = await api('GET', 'coaches', null, 'select=id,name&invite_code=eq.'+encodeURIComponent(invite));
    if (!cRes.data || cRes.data.length === 0) { $('#reg-error').textContent = '邀请码无效'; return; }
    const coach = cRes.data[0];
    // Create student linked to coach
    const res = await api('POST', 'students', {name, phone, login_pin: pin, level:'3.0', type:'成人', total_lessons:0, used_lessons:0, coach_id: coach.id});
    if (res.error || !res.data || res.data.length === 0) { $('#reg-error').textContent = '注册失败'; return; }
    authUser = { role: 'student', student: res.data[0], coachName: coach.name };
    showApp();
  } catch(e) { $('#reg-error').textContent = '注册失败，请重试'; }
}

// Logout
async function doLogout() {
  authUser = null;
  sessionStorage.removeItem('courtedge_coach');
  sessionStorage.removeItem('courtedge_auth');
  $('#main-app').style.display = 'none';
  $('#login-page').style.display = '';
  $('#coach-password').value = '';
  $('#login-pin').value = '';
}

// Show main app after login
function showApp() {
  $('#login-page').style.display = 'none';
  $('#main-app').style.display = '';
  if (authUser.role === 'coach') {
    const c = authUser.coach;
    $('#userInfo').textContent = '👤 ' + c.name + ' | 邀请码: ' + c.invite_code;
    $('#inviteCodeDisplay').textContent = c.invite_code;
    $('#inviteBox').style.display = '';
    $('#roleLabel').textContent = '教练模式';
    currentRole = 'coach';
  } else {
    $('#userInfo').textContent = '📖 ' + authUser.student.name + ' | 教练: ' + (authUser.coachName || '');
    $('#inviteBox').style.display = 'none';
    $('#roleLabel').textContent = '学员模式';
    currentRole = 'student';
    sessionStorage.setItem('courtedge_auth', JSON.stringify(authUser));
  }
  initApp();
}

// Check auth on page load
async function checkAuth() {
  // Check coach session (sessionStorage)
  const coach = sessionStorage.getItem('courtedge_coach');
  if (coach) {
    try {
      authUser = JSON.parse(coach);
      if (authUser.role === 'coach' && authUser.email) {
        showApp(); return;
      }
    } catch(e) {}
  }
  // Check student session (sessionStorage)
  const saved = sessionStorage.getItem('courtedge_auth');
  if (saved) {
    try {
      authUser = JSON.parse(saved);
      if (authUser.role === 'student' && authUser.student) {
        showApp(); return;
      }
    } catch(e) {}
  }
  // No auth, show login
  $('#login-page').style.display = '';
  $('#main-app').style.display = 'none';
}
let DATA = { students: [], lessons: [], journals: [] };
let currentRole = 'coach';

function switchTab(name) {
  $$('.tab').forEach(t => t.classList.remove('active'));
  const tab = document.querySelector('.tab[data-tab="' + name + '"]');
  if (tab) tab.classList.add('active');
  $$('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById('page-' + name);
  if (page) page.classList.add('active');
  if (name === 'board') refreshBoard();
  if (name === 'ai') { if (_detailStudentId) loadVideos(_detailStudentId); else if (authUser && authUser.student) loadStudentVideos(authUser.student.id); }
  if (name === 'lesson' && currentRole === 'student') { updateJournalSelects(); $('#journal-date').value = formatDate(new Date()); }
}

function coachFilter() {
  if (authUser && authUser.role === 'coach' && authUser.coach) {
    return '&coach_id=eq.' + authUser.coach.id;
  }
  return '';
}

async function syncFromCloud() {
  try {
    const cf = coachFilter();
    const sRes = await api('GET', 'students', null, 'select=*&order=id'+cf);
    DATA.students = (sRes.data && !sRes.error) ? sRes.data : [];
    const lRes = await api('GET', 'lessons', null, 'select=*&order=id'+cf);
    DATA.lessons = (lRes.data && !lRes.error) ? lRes.data : [];
    const jRes = await api('GET', 'journals', null, 'select=*&order=id'+cf);
    DATA.journals = (jRes.data && !jRes.error) ? jRes.data : [];
    console.log('同步完成:', DATA.students.length, '学员');
    const vRes = await api("GET", "videos", null, "select=*&order=id"+cf);
    DATA.videos = (vRes.data && !vRes.error) ? vRes.data : [];
  } catch(e) {
    console.error('同步异常:', e.message);
    showToast('网络连接失败');
    DATA.students = []; DATA.lessons = []; DATA.journals = [];
  }
}

function formatDate(ds) { const d=new Date(ds); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function remaining(s) { return (s.total_lessons||0)-(s.used_lessons||0); }
function avatarColor(name) {
  const clrs = ['#2ecc71','#27ae60','#74b9ff','#f9a825','#e8895b','#e74c3c','#3498db','#9b59b6','#1abc9c','#e67e22'];
  let h=0; for(let c of name) h=c.charCodeAt(0)+((h<<5)-h);
  return clrs[Math.abs(h)%clrs.length];
}
function showToast(msg) {
  const t=$('#toast'); t.textContent=msg; t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(()=>t.classList.remove('show'),2500);
}
function showLoading(show) {
  const btns = $$('button[onclick]');
  btns.forEach(b => { if(show) b.disabled = true; else b.disabled = false; });
}

// ==================== ROLE ====================
function switchRole(role) {
  currentRole=role;
  $$('#roleToggle .role-btn').forEach(b=>b.classList.toggle('active',b.dataset.role===role));
  $('#roleLabel').textContent=role==='coach'?'教练模式 · 管理学员、记录训练、追踪进度':'学员模式 · 查看进度、写训练笔记';
  applyRoleUI();
}
function applyRoleUI() {
  const isCoach=currentRole==='coach';
  $$('.coach-only').forEach(el=>el.style.display=isCoach?'':'none');
  $$('.student-only').forEach(el=>el.style.display=isCoach?'none':'');
  if(!isCoach) {
    const sid = authUser && authUser.student ? authUser.student.id : null;
    if (sid) {
      $('#board-student').value = sid;
      $('#journal-student-select').value = sid;
      renderBoard();
      renderStudentJournal();
      renderStudentCalendar(sid);
      loadStudentVideos(sid);
    }
    $('#journal-date').value=formatDate(new Date());
  }
  renderStudentList(); renderRecentLogs();
}

function renderStudentCalendar(studentId) {
  const area = $('#student-cal-area');
  if (!area) return;
  const lessons = DATA.lessons.filter(l => l.student_id === studentId);
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const lessonDates = new Set(lessons.map(l => l.date));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const dayLabels = ['日','一','二','三','四','五','六'];
  let html = '<div class="cal">';
  html += '<div class="cal-head"><button onclick="studCalShift(-1)">◀</button><span class="month" id="stud-cal-month">'+year+'年 '+(month+1)+'月</span><button onclick="studCalShift(1)">▶</button></div>';
  html += '<div class="cal-grid">';
  dayLabels.forEach(d => html += '<div class="cal-day-label">'+d+'</div>');
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day other"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = 'cal-day cur';
    if (d === now.getDate()) cls += ' today';
    if (lessonDates.has(ds)) cls += ' has-lesson';
    html += `<div class="${cls}" onclick="studCalClick('${ds}')">${d}</div>`;
  }
  html += '</div><div class="cal-detail" id="stud-cal-detail">👆 点击日期查看训练详情</div></div>';
  area.innerHTML = html;
  window._studCalYear = year; window._studCalMonth = month; window._studCalSid = studentId;
}

function studCalShift(delta) {
  let y = window._studCalYear, m = window._studCalMonth + delta;
  if (m < 0) { y--; m = 11; } if (m > 11) { y++; m = 0; }
  window._studCalYear = y; window._studCalMonth = m;
  renderStudentCalMonth(y, m, window._studCalSid);
}
function renderStudentCalMonth(year, month, studentId) {
  const lessons = DATA.lessons.filter(l => l.student_id === studentId);
  const now = new Date();
  const lessonDates = new Set(lessons.map(l => l.date));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const dayLabels = ['日','一','二','三','四','五','六'];
  let html = '<div class="cal-head"><button onclick="studCalShift(-1)">◀</button><span class="month">'+year+'年 '+(month+1)+'月</span><button onclick="studCalShift(1)">▶</button></div>';
  html += '<div class="cal-grid">';
  dayLabels.forEach(d => html += '<div class="cal-day-label">'+d+'</div>');
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day other"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = 'cal-day cur';
    if (d === now.getDate() && month === now.getMonth() && year === now.getFullYear()) cls += ' today';
    if (lessonDates.has(ds)) cls += ' has-lesson';
    html += `<div class="${cls}" onclick="studCalClick('${ds}')">${d}</div>`;
  }
  html += '</div><div class="cal-detail" id="stud-cal-detail">👆 点击日期查看训练详情</div>';
  $('#student-cal-area').innerHTML = '<div class="cal">'+html+'</div>';
  window._studCalYear = year; window._studCalMonth = month;
}
async function studentUploadVideo() {
  const file = $('#home-video-file').files[0];
  const note = $('#home-video-note').value.trim();
  const status = $('#home-upload-status');
  if (!file) { status.textContent = '请选择视频'; return; }
  if (file.size > 300*1024*1024) { status.textContent = '视频不能超过300MB'; return; }
  status.textContent = '上传中 0%';
  try {
    const sid = authUser.student.id;
    const url = await uploadFile(file, status);
    await api('POST', 'videos', { student_id: sid, coach_id: authUser.student.coach_id||null, filename:file.name, url, note:note||'自拍视频', uploaded_by:'student' });
    $('#home-video-file').value = ''; $('#home-video-note').value = '';
    status.textContent = '✓ 上传成功';
    loadStudentVideos(sid);
  } catch(e) { status.textContent = '上传失败: ' + e.message; }
}

async function loadStudentVideos(sid) {
  const container = $('#student-video-list'); if(!container) return;
  try {
    const res = await api('GET', 'videos', null, 'select=*&student_id=eq.'+sid+'&order=created_at.desc');
    const videos = (res.data && !res.error) ? res.data : [];
    if (videos.length === 0) { container.innerHTML = '<span style="color:var(--muted);font-size:12px;">暂无视频，上传你的训练视频吧</span>'; return; }
    container.innerHTML = videos.map(v => `
      <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
        <video src="${v.url}" controls style="width:80px;height:60px;object-fit:cover;border-radius:4px;background:#000;"></video>
        <div style="flex:1;font-size:12px;"><div>${v.note||'视频'}</div><div style="color:var(--muted);font-size:10px;">${v.created_at?v.created_at.substring(0,10):''}${v.ai_ratings?' | AI评分':''} · ${v.uploaded_by==='student'?'自拍':'教练'}</div></div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          <button class="btn btn--sm btn--primary" onclick="var p=document.getElementById('ai-analysis-panel');if(p){p._lastVideoUrl='${v.url}';p._lastVideoId='${v.id}';}analyzeVideo('${v.url}','${v.id}')" style="font-size:10px;">🤖 AI</button>
          ${v.ai_ratings?'<button class="btn btn--sm btn--outline" onclick="importAiRatings(\'${encodeURIComponent(v.ai_ratings)}\')" style="font-size:9px;">导入评分</button>':''}
          <button class="del-btn" onclick="deleteVideo(${v.id}).then(()=>loadStudentVideos(${sid}))" style="font-size:12px;">✕</button>
        </div>
      </div>`).join('');
  } catch(e) { container.innerHTML = ''; }
}

function studCalClick(date) {
  const sid = window._studCalSid;
  const lessons = DATA.lessons.filter(l => l.student_id === sid && l.date === date);
  const detail = $('#stud-cal-detail');
  if (!detail) return;
  if (lessons.length === 0) { detail.textContent = '📅 '+date+' · 无训练'; return; }
  detail.innerHTML = lessons.map(l => {
    const dims = l.ratings ? Object.entries(l.ratings).filter(([,v]) => v>0) : [];
    const dl = { forehand:'正手', backhand:'反手', serve:'发球', volley:'截击', footwork:'步伐', fitness:'体能' };
    const tags = dims.map(([k,v]) => `<span class="skill-tag">${dl[k]||k} ${v}</span>`).join('');
    return `📅 ${date} · ${l.content||'训练'} ${tags} ${l.note?'<br>📌 '+l.note:''}`;
  }).join('<br>');
}

// ==================== TABS ====================
$$('.tab').forEach(tab=>{
  tab.addEventListener('click',()=>{
    const n=tab.dataset.tab;
    $$('.tab').forEach(t=>t.classList.remove('active')); tab.classList.add('active');
    $$('.page').forEach(p=>p.classList.remove('active')); $(`#page-${n}`).classList.add('active');
    if(n==='board') refreshBoard();
    if(n==='lesson'&&currentRole==='student'){updateJournalSelects();$('#journal-date').value=formatDate(new Date());}
  });
});

// ==================== STUDENTS ====================
function renderStudentList() {
  const list=$('#student-list'), empty=$('#empty-students'), count=$('#student-count');
  const isCoach=currentRole==='coach';
  // Student can only see themselves
  let students = DATA.students;
  if (!isCoach && authUser && authUser.student) {
    students = students.filter(s => s.id === authUser.student.id);
  }
  count.textContent=`共 ${students.length} 名学员`;
  if(students.length===0){list.innerHTML='';empty.style.display='block';return;}
  empty.style.display='none';
  list.innerHTML=students.map(s=>{
    const rem=remaining(s); let cls='ok'; if(rem<=0)cls='danger'; else if(rem<=2)cls='warn';
    return `<div class="card" style="cursor:pointer;" onclick="${isCoach?`editStudent(${s.id})`:`showDetailModal(${s.id})`}">
      <div class="student-row">
        <div class="avatar" style="background:${avatarColor(s.name)};">${s.name[0]}</div>
        <div class="student-info">
          <div class="student-name">${s.name}</div>
          <div class="student-meta"><span class="level-tag">NTRP ${s.level}</span><span class="type-tag">${s.type}</span>${s.phone?`<span class="type-tag">${s.phone}</span>`:''}</div>
        </div>
        <div class="lesson-badge"><div class="lesson-num ${cls}">${rem}</div><div class="lesson-label">剩余课时</div></div>
        ${isCoach?`<button class="del-btn" onclick="event.stopPropagation();deleteStudent(${s.id},'${s.name}')">✕</button>`:''}
      </div></div>`;
  }).join('');
  updateStudentSelects(); if(!isCoach) updateJournalSelects();
}
function updateStudentSelects() {
  const isCoach=currentRole==='coach';
  let students=DATA.students;
  if (!isCoach && authUser && authUser.student) {
    students=students.filter(s=>s.id===authUser.student.id);
  }
  const opts=students.map(s=>`<option value="${s.id}">${s.name} · ${s.level} · 剩${remaining(s)}节</option>`).join('');
  $$('#lesson-student,#board-student,#view-as-student').forEach(sel=>{sel.innerHTML=`<option value="">-- 请选择学员 --</option>`+opts;});
}
function updateJournalSelects() {
  const isCoach=currentRole==='coach';
  let students=DATA.students;
  if (!isCoach && authUser && authUser.student) {
    students=students.filter(s=>s.id===authUser.student.id);
  }
  const opts=students.map(s=>`<option value="${s.id}">${s.name} (${s.level})</option>`).join('');
  const a=$('#journal-student-select'); if(a){a.innerHTML=`<option value="">-- 我是哪位学员？ --</option>`+opts; if(students.length===1) a.value=students[0].id;}
  const b=$('#view-as-student'); if(b){b.innerHTML=`<option value="">-- 我是哪位学员？ --</option>`+opts; if(students.length===1) b.value=students[0].id;}
}
function showStudentModal(id) {
  const modal=$('#student-modal');
  if(id){const s=DATA.students.find(st=>st.id===id);if(!s)return;
    $('#student-modal-title').textContent='编辑学员';$('#edit-student-id').value=s.id;
    $('#s-name').value=s.name;$('#s-phone').value=s.phone||'';$('#s-level').value=s.level;
    $('#s-type').value=s.type;$('#s-total').value=s.total_lessons;$('#s-used').value=s.used_lessons;
    $('#s-pin').value=s.login_pin||'';$('#s-note').value=s.note||'';
  }else{
    $('#student-modal-title').textContent='添加学员';$('#edit-student-id').value='';
    $('#s-name').value='';$('#s-phone').value='';$('#s-level').value='3.0';$('#s-type').value='成人';
    $('#s-total').value='10';$('#s-used').value='0';$('#s-pin').value='';$('#s-note').value='';
  }
  modal.classList.add('show');
}
function closeStudentModal(){$('#student-modal').classList.remove('show');}
async function saveStudent() {
  const name=$('#s-name').value.trim();if(!name){showToast('请输入姓名');return;}
  const id=parseInt($('#edit-student-id').value)||0;
  const data={
    name, phone:$('#s-phone').value.trim(), level:$('#s-level').value, type:$('#s-type').value,
    total_lessons:parseInt($('#s-total').value)||0, used_lessons:parseInt($('#s-used').value)||0,
    login_pin:$('#s-pin').value.trim(), note:$('#s-note').value.trim(),
    coach_id: authUser.coach ? authUser.coach.id : null
  };
  showLoading(true);
  if(id>0){await api('PATCH', 'students', data, 'id=eq.'+id);}
  else{await api('POST', 'students', data);}
  await syncFromCloud();showLoading(false);
  closeStudentModal();renderStudentList();renderRecentLogs();showToast('学员已保存 ✓');
}
function editStudent(id){showStudentModal(id);}

// ==================== STUDENT DETAIL & VIDEO ====================
let _detailStudentId = null;

function showDetailModal(id) {
  const s = DATA.students.find(st => st.id === id);
  if (!s) return;
  _detailStudentId = id;
  $('#detail-name').textContent = s.name + ' · 训练视频';
  const rem = remaining(s);
  $('#detail-info').innerHTML = `
    <div class="student-row" style="margin-bottom:12px;">
      <div class="avatar" style="background:${avatarColor(s.name)};width:40px;height:40px;font-size:16px;">${s.name[0]}</div>
      <div class="student-info">
        <div class="student-name">${s.name} <span style="font-size:11px;color:var(--muted);">${s.level} · ${s.type}</span></div>
        <div class="student-meta">剩余 <b style="color:${rem<=2?'var(--danger)':'var(--green-d)'};">${rem}</b> 课时 · 共 ${DATA.lessons.filter(l=>l.student_id===id).length} 节课</div>
      </div>
    </div>`;
  loadVideos(id);
  $('#detail-modal').classList.add('show');
}
function closeDetailModal() { $('#detail-modal').classList.remove('show'); _detailStudentId = null; }

async function loadVideos(studentId) {
  const container = $('#detail-videos');
  container.innerHTML = '<span style="color:var(--muted);font-size:12px;">加载中...</span>';
  try {
    const res = await api('GET', 'videos', null, 'select=*&student_id=eq.'+studentId+'&order=created_at.desc');
    const videos = (res.data && !res.error) ? res.data : [];
    if (videos.length === 0) { container.innerHTML = '<span style="color:var(--muted);font-size:12px;">暂无视频</span>'; return; }
    container.innerHTML = videos.map(v => {
      const isOwner = (authUser.role === 'coach' && authUser.coach && authUser.coach.id === v.coach_id)
                   || (authUser.role === 'student' && authUser.student && authUser.student.id === v.student_id);
      if (!isOwner) return '';
      return `<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid var(--border);">
        <video src="${v.url}" controls style="width:80px;height:60px;object-fit:cover;border-radius:4px;background:#000;"></video>
        <div style="flex:1;font-size:12px;"><div>${v.note||'视频'}</div><div style="color:var(--muted);font-size:10px;">${v.created_at?v.created_at.substring(0,10):''}${v.ai_ratings?' | AI评分':''}</div></div>
        <div style="display:flex;gap:4px;flex-wrap:wrap;">
          <button class="btn btn--sm btn--primary" onclick="var p=document.getElementById('ai-analysis-panel');if(p){p._lastVideoUrl='${v.url}';p._lastVideoId='${v.id}';}analyzeVideo('${v.url}','${v.id}')" style="font-size:10px;">🤖 AI分析</button>
          ${v.ai_ratings?'<button class="btn btn--sm btn--outline" onclick="importAiRatings(\'${encodeURIComponent(v.ai_ratings)}\')" style="font-size:9px;">导入评分</button>':''}
          <button class="del-btn" onclick="deleteVideo(${v.id})" style="font-size:12px;">✕</button>
        </div>
      </div>`;
    }).join('');
  } catch(e) { container.innerHTML = '<span style="color:var(--danger);font-size:12px;">加载失败</span>'; }
}

// Upload to Supabase Storage with progress
function uploadFile(file, statusEl) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener('progress', e => {
      if (e.lengthComputable && statusEl) statusEl.textContent = '读取中 '+Math.round(e.loaded/e.total*100)+'%';
    });
    reader.addEventListener('load', () => resolve(reader.result));
    reader.addEventListener('error', () => reject(new Error('读取失败')));
    reader.readAsDataURL(file);
  });
}

async function uploadVideo() {
  const file = $('#detail-video-file').files[0];
  const note = $('#detail-video-note').value.trim();
  const status = $('#upload-status');
  if (!file) { status.textContent = '请选择视频文件'; return; }
  if (file.size > 300*1024*1024) { status.textContent = '视频不能超过300MB'; return; }
  status.textContent = '上传中 0%';
  try {
    let url;
    // Try Storage first, fall back to base64 for small files
    try {
      url = await uploadFile(file, status);
    } catch(e) {
      if (file.size < 20*1024*1024) {
        status.textContent = '备用上传中...';
        url = await new Promise((res, rej) => { const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); });
      } else { throw e; }
    }
    await api('POST', 'videos', {
      student_id: _detailStudentId, coach_id: authUser.coach ? authUser.coach.id : null,
      filename: file.name, url, note, uploaded_by: authUser.role
    });
    $('#detail-video-file').value = ''; $('#detail-video-note').value = '';
    status.textContent = '✓ 上传成功';
    loadVideos(_detailStudentId);
  } catch(e) { status.textContent = '上传失败: ' + e.message; }
}

// AI Analysis - uses coach's own endpoint
let aiEndpoint = localStorage.getItem('courtedge_ai_url') || 'https://tennis-coach-ai-s646.onrender.com/analyze';

function setAIEndpoint() {
  const url = prompt('请输入你的 AI 分析服务地址：\n（你部署的 ai-server 地址 + /analyze）\n推荐用 Gemini (免费) / Qwen / OpenAI', aiEndpoint);
  if (url) { aiEndpoint = url; localStorage.setItem('courtedge_ai_url', url); showToast('AI 地址已保存'); }
}

async function analyzeVideo(videoUrl, videoId) {
  if (!aiEndpoint) {
    const url = prompt(
      '请先设置 AI 分析服务地址：\n（你部署的 AI 分析端点 URL）\n\n' +
      'POST body: {"frames":["base64..."], "prompt":"..."}\n' +
      '返回: {"ratings":{...}, "summary":"...", "suggestions":[...], "details":"..."}'
    );
    if (!url) return;
    aiEndpoint = url; localStorage.setItem('courtedge_ai_url', url);
  }

  const panel = showAnalysisPanel(true);

  try {
    // Step 1: Extract frames
    panel.update('提取视频帧中...', 0);
    let frames, timestamps, duration;
    try {
      const result = await extractFrames(videoUrl, 8, function(cur, total) {
        panel.update('提取帧 ' + cur + '/' + total, Math.round(cur / total * 25));
      });
      frames = result.frames;
      timestamps = result.timestamps;
      duration = result.duration;
    } catch(e) {
      panel.error('帧提取失败: ' + e.message, true);
      return;
    }

    // Step 2: AI analysis
    panel.update('AI 分析中...（首次需 30s 左右唤醒服务）', 30);

    const controller = new AbortController();
    panel._abort = controller;

    const res = await fetch(aiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        frames: frames,
        timestamps: timestamps,
        duration: duration,
        prompt: '你是专业网球教练。分析这个网球训练视频的关键帧（共' + frames.length + '帧）。' +
          '按以下JSON格式回复（不要markdown代码块，只返回纯JSON）：' +
          '{"action_type":"动作类型","ratings":{"forehand":0-10,"backhand":0-10,"serve":0-10,"volley":0-10,"footwork":0-10,"fitness":0-10},"summary":"一句话评价","details":"各维度详细分析","suggestions":["建议1","建议2"]}' +
          '要求：1.先判断动作类型 2.只对实际出现的动作维度打分，未出现的填0 3.建议要具体'
      }),
      signal: controller.signal
    });

    panel.update('处理分析结果...', 65);

    if (!res.ok) {
      panel.error('AI服务错误 (' + res.status + ')', true);
      return;
    }

    const data = await res.json();

    // Step 3: Parse result
    panel.update('解析结果...', 80);

    let result = { summary: '', ratings: null, suggestions: [], details: '' };

    // Try to parse structured JSON from AI response
    if (data.ratings || data.summary || data.suggestions) {
      result = data;
    } else if (data.analysis) {
      // Try to extract JSON from text response
      try {
        const jsonMatch = data.analysis.match(/{[\s\S]*?}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          result.ratings = parsed.ratings || null;
          result.summary = parsed.summary || data.analysis.substring(0, 200);
          result.suggestions = parsed.suggestions || [];
          result.details = parsed.details || data.analysis;
        } else {
          result.summary = data.analysis;
          result.details = data.analysis;
        }
      } catch(e) {
        result.summary = data.analysis;
        result.details = data.analysis;
      }
    } else {
      result.summary = data.error || '分析完成';
      result.details = JSON.stringify(data);
    }

    // Step 4: Save result
    panel.update('保存结果...', 90);

    const saveNote = result.summary || (result.ratings ? JSON.stringify(result.ratings) : '');
    const aiRatingsStr = result.ratings ? JSON.stringify(result.ratings) : '';
    await api('PATCH', 'videos', {
      note: saveNote.substring(0, 1000),
      ai_ratings: aiRatingsStr
    }, 'id=eq.' + videoId);

    // Step 5: Show result
    panel.done(result);
    updateAiHistory(result, videoUrl, videoId);

    // Refresh video list
    if (_detailStudentId) loadVideos(_detailStudentId);
    else if (authUser.student) loadStudentVideos(authUser.student.id);
  } catch(e) {
    if (e.name === 'AbortError') {
      panel.error('分析已取消', false);
    } else {
      panel.error('分析失败: ' + e.message, true);
    }
  }
}

// Extract frames from video at equal intervals
function extractFrames(videoUrl, count, onProgress) {
  if (!count) count = 8;
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    if (!videoUrl.startsWith('data:')) video.crossOrigin = 'anonymous';
    video.src = videoUrl;
    video.muted = true;
    video.preload = 'metadata';
    const timer = setTimeout(() => reject(new Error('视频加载超时')), 30000);
    video.addEventListener('loadedmetadata', async () => {
      clearTimeout(timer);
      try {
        const frames = [];
        const timestamps = [];
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 320; canvas.height = 180;
        const step = video.duration / (count + 1);
        for (let i = 1; i <= count; i++) {
          const t = step * i;
          await new Promise(r => { video.onseeked = r; video.currentTime = t; });
          ctx.drawImage(video, 0, 0, 320, 180);
          frames.push(canvas.toDataURL('image/jpeg', 0.5));
          timestamps.push(Math.round(t));
          if (onProgress) onProgress(i, count);
        }
        resolve({ frames: frames, timestamps: timestamps, duration: video.duration });
      } catch(e) { reject(e); }
    });
    video.addEventListener('error', () => { clearTimeout(timer); reject(new Error('视频加载失败')); });
    video.load();
  });
}

// Upload with progress bar


// ==================== AI ANALYSIS PANEL UI (新增) ====================
function showAnalysisPanel(show) {
  var existing = document.getElementById('ai-analysis-panel');
  if (!show) {
    if (existing) existing.style.display = 'none';
    return null;
  }

  if (!existing) {
    existing = document.createElement('div');
    existing.id = 'ai-analysis-panel';
    existing.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:150;background:rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;padding:20px;';
    existing.innerHTML =
      '<div style="background:#fff;border-radius:20px;padding:24px;width:100%;max-width:420px;box-shadow:0 12px 40px rgba(0,0,0,0.15);">' +
        '<div style="font-size:16px;font-weight:700;margin-bottom:16px;color:var(--text);">AI 动作分析</div>' +
        '<div id="ai-progress-bar" style="height:6px;background:var(--elevated);border-radius:3px;overflow:hidden;margin-bottom:12px;"><div id="ai-progress-fill" style="height:100%;width:0%;background:linear-gradient(90deg,var(--green),var(--sky));border-radius:3px;transition:width 0.4s ease;"></div></div>' +
        '<div id="ai-status" style="font-size:13px;color:var(--text-dim);margin-bottom:12px;">准备中...</div>' +
        '<div id="ai-result-box" style="display:none;"></div>' +
        '<div id="ai-error-box" style="display:none;text-align:center;"></div>' +
        '<div id="ai-actions" style="display:flex;gap:8px;margin-top:12px;"></div>' +
      '</div>';
    document.body.appendChild(existing);

    existing.addEventListener('click', function(e) {
      if (e.target === existing && existing._allowClose) {
        existing.style.display = 'none';
      }
    });
  }

  existing.style.display = 'flex';
  existing._allowClose = false;

  // Reset state
  document.getElementById('ai-progress-fill').style.width = '0%';
  document.getElementById('ai-status').textContent = '准备中...';
  document.getElementById('ai-status').style.color = 'var(--text-dim)';
  document.getElementById('ai-result-box').style.display = 'none';
  document.getElementById('ai-error-box').style.display = 'none';
  document.getElementById('ai-actions').innerHTML = '';

  return {
    update: function(msg, pct) {
      var progress = document.getElementById('ai-progress-fill');
      var status = document.getElementById('ai-status');
      if (progress) progress.style.width = (pct || 0) + '%';
      if (status) status.textContent = msg || '';
    },
    done: function(result) {
      var progress = document.getElementById('ai-progress-fill');
      var status = document.getElementById('ai-status');
      var resultBox = document.getElementById('ai-result-box');
      var actions = document.getElementById('ai-actions');
      existing._allowClose = true;

      if (progress) progress.style.width = '100%';
      if (status) { status.textContent = '分析完成'; status.style.color = 'var(--green)'; }

      // Build result display
      if (result && result.ratings) {
        var dimLabels = {forehand:'正手', backhand:'反手', serve:'发球', volley:'截击', footwork:'步伐', fitness:'体能'};
        var dimColors = {forehand:'#2ecc71', backhand:'#74b9ff', serve:'#e8895b', volley:'#f9a825', footwork:'#a29bfe', fitness:'#fd79a8'};
        var html = '';

        // Rating bars
        html += '<div style="margin-bottom:14px;">';
        Object.keys(result.ratings).forEach(function(d) {
          var val = result.ratings[d];
          if (val > 0) {
            var pct2 = (val / 10 * 100);
            html += '<div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">' +
              '<span style="font-size:11px;font-weight:600;width:36px;color:var(--text-dim);text-align:right;">' + (dimLabels[d]||d) + '</span>' +
              '<div style="flex:1;height:16px;background:var(--elevated);border-radius:8px;overflow:hidden;">' +
              '<div style="height:100%;width:' + pct2 + '%;background:' + (dimColors[d]||'var(--green)') + ';border-radius:8px;transition:width 0.6s ease;"></div></div>' +
              '<span style="font-size:12px;font-weight:700;width:24px;">' + val + '</span></div>';
          }
        });
        html += '</div>';
        resultBox.innerHTML = html;

        // Import button
        html += '<div style="margin-top:8px;display:flex;gap:8px;">' +
          '<button class="btn btn--primary btn--sm" style="flex:1;" onclick="importAiRatings(\'' + encodeURIComponent(JSON.stringify(result.ratings)) + '\')">导入评分到记课</button></div>';
      }

      // Summary
      if (result && result.summary) {
        resultBox.innerHTML += '<div style="font-size:13px;color:var(--text);margin-top:8px;padding:10px;background:var(--elevated);border-radius:10px;line-height:1.7;">' + result.summary + '</div>';
      }

      // Details
      if (result && result.details && result.details !== result.summary) {
        resultBox.innerHTML += '<div style="font-size:12px;color:var(--text-dim);margin-top:8px;line-height:1.6;max-height:150px;overflow-y:auto;padding:8px;background:#fafafa;border-radius:8px;">' + result.details + '</div>';
      }

      // Suggestions
      if (result && result.suggestions && result.suggestions.length > 0) {
        var sHtml = '<div style="margin-top:10px;"><div style="font-size:12px;font-weight:700;color:var(--text-dim);margin-bottom:4px;">改进建议</div>';
        result.suggestions.forEach(function(s, i) {
          sHtml += '<div style="font-size:12px;color:var(--clay);padding:3px 0;">' + (i+1) + '. ' + s + '</div>';
        });
        sHtml += '</div>';
        resultBox.innerHTML += sHtml;
      }

      resultBox.style.display = 'block';

      actions.innerHTML = '<button class="btn btn--outline btn--sm btn--block" onclick="this.closest(\'[id=ai-analysis-panel]\') ? document.getElementById(\'ai-analysis-panel\').style.display=\'none\' : \'\'">关闭</button>';
      if (existing._lastVideoUrl) {
        actions.innerHTML += '<button class="btn btn--primary btn--sm" onclick="analyzeVideo(existing._lastVideoUrl, existing._lastVideoId)">重新分析</button>';
      }
    },
    error: function(msg, showRetry) {
      var progress = document.getElementById('ai-progress-fill');
      var status = document.getElementById('ai-status');
      var errorBox = document.getElementById('ai-error-box');
      var actions = document.getElementById('ai-actions');
      existing._allowClose = true;

      if (progress) progress.style.width = '0%';
      if (status) { status.textContent = '分析失败'; status.style.color = 'var(--danger)'; }
      if (errorBox) {
        errorBox.innerHTML = '<div style="font-size:13px;color:var(--danger);margin-bottom:12px;padding:12px;background:var(--danger-bg);border-radius:10px;">' + msg + '</div>';
        errorBox.style.display = 'block';
      }
      if (showRetry && existing._lastVideoUrl) {
        actions.innerHTML = '<button class="btn btn--outline btn--sm btn--block" onclick="this.closest(\'[id=ai-analysis-panel]\') ? document.getElementById(\'ai-analysis-panel\').style.display=\'none\' : \'\'">关闭</button>' +
          '<button class="btn btn--primary btn--sm" onclick="analyzeVideo(existing._lastVideoUrl, existing._lastVideoId)">重试</button>';
      } else {
        actions.innerHTML = '<button class="btn btn--outline btn--sm btn--block" onclick="this.closest(\'[id=ai-analysis-panel]\') ? document.getElementById(\'ai-analysis-panel\').style.display=\'none\' : \'\'">关闭</button>';
      }
    }
  };
}

function importAiRatings(ratingsStr) {
  try {
    var ratings = JSON.parse(decodeURIComponent(ratingsStr));
    // Map AI ratings to lesson rating sliders
    var dimMap = {forehand:'forehand', backhand:'backhand', serve:'serve', volley:'volley', footwork:'footwork', fitness:'fitness'};
    Object.keys(ratings).forEach(function(k) {
      var dim = dimMap[k] || k;
      var slider = document.querySelector('.rating[data-dim="' + dim + '"]');
      if (slider && ratings[k] > 0) {
        slider.value = Math.round(ratings[k]);
        var valEl = slider.closest('.rating-cell').querySelector('.rating-cell__val');
        if (valEl) valEl.textContent = Math.round(ratings[k]);
      }
    });
    // Switch to lesson tab
    document.querySelectorAll('.tab').forEach(function(t) { t.classList.remove('active'); });
    document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
    var lessonTab = document.querySelector('.tab[data-tab="lesson"]');
    var lessonPage = document.getElementById('page-lesson');
    if (lessonTab) lessonTab.classList.add('active');
    if (lessonPage) lessonPage.classList.add('active');

    // Close panel
    var panel = document.getElementById('ai-analysis-panel');
    if (panel) panel.style.display = 'none';
    showToast('AI 评分已导入！可手动调整后保存课程');
  } catch(e) {
    showToast('评分导入失败');
  }
}
function uploadWithProgress(url, file, statusEl) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable && statusEl) {
        const pct = Math.round(e.loaded/e.total*100);
        statusEl.textContent = '上传中 ' + pct + '%';
      }
    });
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve(xhr.responseText);
      else reject(new Error('上传失败: '+xhr.status));
    });
    xhr.addEventListener('error', () => reject(new Error('网络错误')));
    xhr.open('POST', url);
    xhr.setRequestHeader('apikey', SB_KEY);
    xhr.setRequestHeader('Authorization', 'Bearer ' + SB_KEY);
    const fd = new FormData(); fd.append('file', file);
    xhr.send(fd);
  });
}

async function deleteVideo(vid) {
  if (!confirm('删除这个视频？')) return;
  try {
    await api('DELETE', 'videos', null, 'id=eq.'+vid);
    loadVideos(_detailStudentId);
    showToast('视频已删除');
  } catch(e) { showToast('删除失败'); }
}
async function deleteStudent(id,name){
  if(!confirm(`确定删除「${name}」？\n相关上课记录也会删除。`))return;
  showLoading(true);
  await api('DELETE', 'students', null, 'id=eq.'+id);
  await syncFromCloud();showLoading(false);
  renderStudentList();renderRecentLogs();showToast('已删除');
}

// ==================== LESSON ====================
async function recordLesson() {
  const studentId=parseInt($('#lesson-student').value);if(!studentId){showToast('请选择学员');return;}
  const student=DATA.students.find(s=>s.id===studentId);if(!student){showToast('学员不存在');return;}
  const drills = [...$$('#drill-options input:checked')].map(cb => cb.value);
  const content = drills.join('、');
  const note=$('#lesson-note').value.trim();
  if(!content&&!note){showToast('请选择训练内容或填写备注');return;}
  const ratings={};$$('.rating').forEach(r=>{ratings[r.dataset.dim]=parseInt(r.value);});
  showLoading(true);
  await api('POST', 'lessons', {student_id:studentId,date:$('#lesson-date').value||formatDate(new Date()),content,note,ratings,coach_id: authUser.coach ? authUser.coach.id : null});
  // Upload video if selected
  const videoFile = $('#lesson-video').files[0];
  if (videoFile) {
    try {
      const ls = $('#lesson-upload-status');
      ls.textContent = '上传中 0%';
      const url = await uploadFile(videoFile, ls);
      ls.textContent = '✓';
      await api('POST', 'videos', {student_id:studentId, coach_id: authUser.coach ? authUser.coach.id : null, filename:videoFile.name, url, note:'课程视频', uploaded_by:'coach'});
    } catch(e) { console.error('视频上传失败:', e); }
  }
  await api('PATCH', 'students', {used_lessons:(student.used_lessons||0)+1}, 'id=eq.'+studentId);
  await syncFromCloud();showLoading(false);
  $$('#drill-options input:checked').forEach(cb=>cb.checked=false);
  $('#lesson-note').value='';$('#lesson-video').value='';
  $$('.rating').forEach(r=>{r.value=5;const d=r.parentElement.querySelector('.rating-cell__val');if(d)d.textContent='5';});
  renderStudentList();renderRecentLogs();
  const rem=remaining(student);showToast(`记课成功 · ${student.name} 剩余 ${rem} 节${rem<=2?' ⚠️':''}`);
}

// ==================== JOURNAL ====================
async function submitJournal() {
  const studentId=parseInt($('#journal-student-select').value);if(!studentId){showToast('请先选择你是哪位学员');return;}
  const content=$('#journal-content').value.trim();if(!content){showToast('请写点训练感受');return;}
  showLoading(true);
  const student = authUser.role === 'student' ? authUser.student : null;
  const cid = student ? student.coach_id : (authUser.coach ? authUser.coach.id : null);
  await api('POST', 'journals', {student_id:studentId,date:$('#journal-date').value||formatDate(new Date()),content,coach_id: cid});
  await syncFromCloud();showLoading(false);
  $('#journal-content').value='';showToast('训练笔记已提交 ✓');
  renderStudentJournal();renderRecentLogs();
}
function renderStudentJournal() {
  const container=$('#student-journal');if(!container)return;
  const studentId=parseInt($('#view-as-student').value);if(!studentId){container.innerHTML='';return;}
  const entries=(DATA.journals||[]).filter(j=>j.student_id===studentId).sort((a,b)=>b.id-a.id).slice(0,20);
  if(entries.length===0){container.innerHTML='<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">还没有训练笔记</div>';return;}
  container.innerHTML=entries.map(e=>`<div class="journal-entry"><div class="journal-date">📅 ${e.date}</div><div class="journal-text">${e.content}</div></div>`).join('');
}

// ==================== RECENT LOGS ====================
function renderRecentLogs() {
  const container=$('#recent-logs');if(!container)return;
  let items=[];
  DATA.lessons.forEach(l=>items.push({...l,type:'lesson'}));
  (DATA.journals||[]).forEach(j=>items.push({...j,type:'journal'}));
  // Student can only see their own records
  if (currentRole !== 'coach' && authUser && authUser.student) {
    items = items.filter(i => i.student_id === authUser.student.id);
  }
  items.sort((a,b)=>b.id-a.id);const recent=items.slice(0,20);
  if(recent.length===0){container.innerHTML='<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px;">还没有训练记录</div>';return;}
  container.innerHTML=recent.map(item=>{
    const s=DATA.students.find(st=>st.id===item.student_id);const nm=s?s.name:'(已删除)';
    if(item.type==='journal')return `<div class="log-item"><div class="log-item__head"><span class="log-item__date">${item.date} · ${nm} 的训练笔记</span></div><div class="log-item__content" style="color:var(--clay);">💬 ${item.content}</div></div>`;
    const dims=item.ratings?Object.entries(item.ratings).filter(([,v])=>v>0):[];
    const dl={forehand:'正手',backhand:'反手',serve:'发球',volley:'截击',footwork:'步伐',fitness:'体能'};
    const tags=dims.map(([k,v])=>`<span class="skill-tag">${dl[k]||k} ${v}</span>`).join('');
    return `<div class="log-item"><div class="log-item__head"><span class="log-item__date">${item.date}</span><span class="log-item__student">${nm}</span></div><div class="log-item__content">${item.content||'(仅评分)'}</div>${tags?`<div class="log-item__tags">${tags}</div>`:''}${item.note?`<div class="log-item__note">📌 ${item.note}</div>`:''}</div>`;
  }).join('');
}

// ==================== BOARD ====================
function refreshBoard() {
  const students=DATA.students;
  const now=new Date();const thisMonth=`${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}`;
  const monthLessons=DATA.lessons.filter(l=>l.date.startsWith(thisMonth)).length;
  const lowLesson=students.filter(s=>remaining(s)<=2).length;
  $('#stat-month').textContent=monthLessons;
  // Level distribution chart
  const levels = ['1.0','1.5','2.0','2.5','3.0','3.5','4.0','4.5','5.0'];
  const counts = levels.map(l => students.filter(s => s.level === l).length);
  const maxC = Math.max(...counts, 1);
  const colors = ['#e8f5e9','#c8e6c9','#a5d6a7','#81c784','#66bb6a','#4caf50','#43a047','#388e3c','#2e7d32'];
  $('#level-dist').innerHTML = levels.map((l,i) => {
    const h = Math.max(counts[i]/maxC*44, counts[i]>0?6:2);
    return `<div style="flex:1;display:flex;flex-direction:column;align-items:center;gap:3px;">
      <span style="font-size:10px;font-weight:600;color:${counts[i]>0?'#2c3e50':'#ccc'};">${counts[i]||''}</span>
      <div style="width:100%;height:${h}px;background:${counts[i]>0?colors[i]:'#f0f0f0'};border-radius:3px 3px 0 0;min-height:2px;"></div>
      <span style="font-size:9px;color:var(--muted);">${l}</span></div>`;
  }).join('');
  if(students.length>0){const all=DATA.lessons.flatMap(l=>Object.values(l.ratings||{}));$('#stat-avg').textContent=all.length>0?(all.reduce((a,b)=>a+b,0)/all.length).toFixed(1):'—';}
  else $('#stat-avg').textContent='—';
  $('#stat-low').textContent=lowLesson;
  updateStudentSelects();renderBoard();
  if (currentRole === 'student') { setTimeout(function() { drawStudentRadar(); renderStudentLessonHistory(); }, 100); }
}
function renderBoard() {
  const studentId=parseInt($('#board-student').value),detail=$('#board-detail');
  if(!studentId){detail.innerHTML='<div style="text-align:center;padding:30px;color:var(--muted);font-size:13px;">选择学员查看能力雷达图</div>';return;}
  const s=DATA.students.find(st=>st.id===studentId);if(!s)return;
  const sLessons=DATA.lessons.filter(l=>l.student_id===studentId).sort((a,b)=>a.date.localeCompare(b.date));
  const rem=remaining(s);
  const dims=['forehand','backhand','serve','volley','footwork','fitness'];
  const dl={forehand:'正手',backhand:'反手',serve:'发球',volley:'截击',footwork:'步伐',fitness:'体能'};
  const avg={};dims.forEach(d=>{const vals=sLessons.map(l=>(l.ratings||{})[d]).filter(v=>v);avg[d]=vals.length?(vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1):0;});
  const cls=rem<=2?'low':'ok';
  detail.innerHTML=`<div class="board-header"><div class="avatar" style="background:${avatarColor(s.name)};width:42px;height:42px;font-size:20px;">${s.name[0]}</div><div class="board-header__info"><div class="board-header__name">${s.name}</div><div class="board-header__sub">${s.level} · ${s.type} · ${sLessons.length} 节课</div></div><div class="board-header__lessons"><div class="board-header__num ${cls}">${rem}</div><div style="font-size:10px;color:var(--muted);">剩余课时</div></div></div><div class="radar-container"><canvas id="radar" width="280" height="280"></canvas></div>${s.note?`<div style="font-size:12px;color:var(--muted);margin-top:8px;text-align:center;">📝 ${s.note}</div>`:''}`;
  setTimeout(()=>drawRadar(avg,dl,dims),60);
  renderCalendar(studentId);
}
function drawRadar(ratings,labels,dims) {
  const canvas=document.getElementById('radar');if(!canvas)return;
  const ctx=canvas.getContext('2d'),cx=140,cy=140,r=105,n=dims.length;ctx.clearRect(0,0,280,280);
  for(let lv=2;lv<=10;lv+=2){ctx.beginPath();for(let i=0;i<n;i++){const a=(Math.PI*2/n)*i-Math.PI/2,pr=r*lv/10,x=cx+pr*Math.cos(a),y=cy+pr*Math.sin(a);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.closePath();ctx.strokeStyle=lv===10?'rgba(0,0,0,0.12)':'rgba(0,0,0,0.05)';ctx.lineWidth=lv===10?1.5:1;ctx.stroke();}
  for(let i=0;i<n;i++){const a=(Math.PI*2/n)*i-Math.PI/2;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+r*Math.cos(a),cy+r*Math.sin(a));ctx.strokeStyle='rgba(0,0,0,0.06)';ctx.lineWidth=1;ctx.stroke();}
  ctx.beginPath();for(let i=0;i<n;i++){const val=parseFloat(ratings[dims[i]])||0,a=(Math.PI*2/n)*i-Math.PI/2,pr=r*Math.max(val,0.5)/10,x=cx+pr*Math.cos(a),y=cy+pr*Math.sin(a);i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);}ctx.closePath();
  ctx.fillStyle='rgba(46,204,113,0.12)';ctx.fill();ctx.strokeStyle='rgba(46,204,113,0.7)';ctx.lineWidth=2.5;ctx.shadowColor='rgba(46,204,113,0.25)';ctx.shadowBlur=10;ctx.stroke();ctx.shadowBlur=0;
  for(let i=0;i<n;i++){const val=parseFloat(ratings[dims[i]])||0,a=(Math.PI*2/n)*i-Math.PI/2,pr=r*Math.max(val,0.5)/10,x=cx+pr*Math.cos(a),y=cy+pr*Math.sin(a);ctx.beginPath();ctx.arc(x,y,5,0,Math.PI*2);ctx.fillStyle='rgba(46,204,113,0.2)';ctx.fill();ctx.beginPath();ctx.arc(x,y,3.2,0,Math.PI*2);ctx.fillStyle='#2ecc71';ctx.fill();const lx=cx+(r+24)*Math.cos(a),ly=cy+(r+24)*Math.sin(a);ctx.fillStyle='#2c3e50';ctx.font='600 11px "Noto Sans SC","PingFang SC","Microsoft YaHei",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(`${labels[dims[i]]} ${val}`,lx,ly);}
}

// ==================== CALENDAR ====================
function renderCalendar(studentId) {
  const area = $('#calendar-area'); if (!area) return;
  if (!studentId) { area.innerHTML=''; return; }
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth();
  const lessons = DATA.lessons.filter(l => l.student_id === studentId);
  const lessonDates = new Set(lessons.map(l => l.date));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const dayLabels = ['日','一','二','三','四','五','六'];

  let html = '<div class="cal">';
  html += '<div class="cal-head"><button onclick="changeCalMonth(-1)">◀</button><span class="month">'+year+'年 '+(month+1)+'月</span><button onclick="changeCalMonth(1)">▶</button></div>';
  html += '<div class="cal-grid">';
  dayLabels.forEach(d => html += '<div class="cal-day-label">'+d+'</div>');
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day other"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = 'cal-day cur';
    if (d === now.getDate()) cls += ' today';
    if (lessonDates.has(ds)) cls += ' has-lesson';
    html += `<div class="${cls}" onclick="calDayClick('${ds}')">${d}</div>`;
  }
  html += '</div><div class="cal-detail" id="cal-detail">点击日期查看训练内容</div></div>';
  area.innerHTML = html;
  window._calYear = year; window._calMonth = month; window._calStudentId = studentId;
}

function changeCalMonth(delta) {
  const y = window._calYear, m = window._calMonth + delta;
  window._calYear = m < 0 ? y-1 : m > 11 ? y+1 : y;
  window._calMonth = m < 0 ? 11 : m > 11 ? 0 : m;
  renderCalendarMonth(window._calYear, window._calMonth, window._calStudentId);
}

function renderCalendarMonth(year, month, studentId) {
  const area = $('#calendar-area'); if (!area) return;
  const now = new Date();
  const lessons = DATA.lessons.filter(l => l.student_id === studentId);
  const lessonDates = new Set(lessons.map(l => l.date));
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const dayLabels = ['日','一','二','三','四','五','六'];
  let html = '<div class="cal">';
  html += '<div class="cal-head"><button onclick="changeCalMonth(-1)">◀</button><span class="month">'+year+'年 '+(month+1)+'月</span><button onclick="changeCalMonth(1)">▶</button></div>';
  html += '<div class="cal-grid">';
  dayLabels.forEach(d => html += '<div class="cal-day-label">'+d+'</div>');
  for (let i = 0; i < firstDay; i++) html += '<div class="cal-day other"></div>';
  for (let d = 1; d <= daysInMonth; d++) {
    const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    let cls = 'cal-day cur';
    if (d === now.getDate() && month === now.getMonth() && year === now.getFullYear()) cls += ' today';
    if (lessonDates.has(ds)) cls += ' has-lesson';
    html += `<div class="${cls}" onclick="calDayClick('${ds}')">${d}</div>`;
  }
  html += '</div><div class="cal-detail" id="cal-detail">点击日期查看训练内容</div></div>';
  area.innerHTML = html;
  window._calYear = year; window._calMonth = month; window._calStudentId = studentId;
}

function calDayClick(date) {
  const studentId = window._calStudentId;
  const lessons = DATA.lessons.filter(l => l.student_id === studentId && l.date === date);
  const detail = $('#cal-detail');
  if (!detail) return;
  if (lessons.length === 0) { detail.textContent = '📅 '+date+' · 无训练记录'; return; }
  detail.innerHTML = lessons.map(l => {
    const dims = l.ratings ? Object.entries(l.ratings).filter(([,v]) => v>0) : [];
    const dl = { forehand:'正手', backhand:'反手', serve:'发球', volley:'截击', footwork:'步伐', fitness:'体能' };
    const tags = dims.map(([k,v]) => `<span class="skill-tag">${dl[k]||k} ${v}</span>`).join('');
    return `📅 ${date} · ${l.content||'训练'} ${tags} ${l.note?'<br>📌 '+l.note:''}`;
  }).join('<br>');
  // Highlight selected date
  $$('.cal-day.selected').forEach(el => el.classList.remove('selected'));
  $$('.cal-day.has-lesson').forEach(el => { if (el.textContent == new Date(date).getDate()) el.classList.add('selected'); });
}

// ==================== INIT ====================

// ==================== ENHANCED STUDENT DETAIL (新增) ====================
function openStudentDetail(studentId) {
  _detailStudentId = studentId;
  var s = DATA.students.find(function(st) { return st.id === studentId; });
  if (!s) { showToast('学员不存在'); return; }
  document.getElementById('detail-name').textContent = s.name + ' · 详情';
  document.getElementById('detail-info').innerHTML = '<div style="display:flex;align-items:center;gap:10px;">' +
    '<div class="avatar" style="background:' + avatarColor(s.name) + ';width:40px;height:40px;font-size:18px;">' + s.name[0] + '</div>' +
    '<div style="flex:1;"><div style="font-weight:600;">' + s.name + '</div>' +
    '<div style="font-size:11px;color:var(--muted);">NTRP ' + s.level + ' · ' + s.type + (s.note ? ' · 📝 ' + s.note : '') + '</div></div>' +
    '<div style="text-align:center;"><div style="font-size:28px;font-weight:600;color:' + (remaining(s)<=2?'var(--danger)':'var(--green-d)') + ';">' + remaining(s) + '</div>' +
    '<div style="font-size:10px;color:var(--muted);">剩余 / ' + (s.total_lessons||s.lessons||0) + '节</div></div></div>';
  switchDetailTab('lessons');
  if (typeof loadVideos !== 'undefined') setTimeout(function() { loadVideos(studentId); }, 100);
  document.getElementById('detail-modal').classList.add('show');
}

function switchDetailTab(tab) {
  var tabs = document.querySelectorAll('.detail-tab');
  var panels = document.querySelectorAll('.detail-panel');
  tabs.forEach(function(t) { t.classList.remove('active'); });
  panels.forEach(function(p) { p.classList.remove('active'); });
  tabs.forEach(function(t) { if (t.dataset.tab === tab) t.classList.add('active'); });
  var panelId = tab === 'lessons' ? 'detail-lessons' : tab === 'trend' ? 'detail-trend' : tab === 'videos' ? 'detail-videos' : 'detail-notes';
  var panel = document.getElementById(panelId);
  if (panel) panel.classList.add('active');
  if (tab === 'lessons') renderDetailLessons();
  else if (tab === 'trend') renderDetailTrend();
  else if (tab === 'videos') loadVideos(_detailStudentId);
  else if (tab === 'notes') renderDetailNotes();
}

function renderDetailLessons() {
  var sid = _detailStudentId;
  var sLessons = DATA.lessons.filter(function(l) { return l.student_id === sid; }).sort(function(a,b) { return b.id - a.id; });
  var container = document.getElementById('detail-lessons');
  if (sLessons.length === 0) { container.innerHTML = '<div class="empty-detail">还没有课程记录</div>'; return; }
  var dl = {forehand:'正',backhand:'反',serve:'发',volley:'截',footwork:'步',fitness:'体'};
  container.innerHTML = sLessons.map(function(l) {
    var dims = l.ratings ? Object.keys(l.ratings).filter(function(k) { return l.ratings[k] > 0; }) : [];
    var tags = dims.map(function(k) { return '<span class="mini-tag">' + (dl[k]||k) + l.ratings[k] + '</span>'; }).join('');
    return '<div class="lesson-row"><span class="lesson-row__date">' + (l.date||'') + '</span>' +
      '<span class="lesson-row__content">' + (l.content||'(仅评分)') + '</span>' +
      '<span class="lesson-row__ratings">' + tags + '</span></div>' +
      (l.note ? '<div style="font-size:11px;color:var(--clay);padding:0 0 6px 0;">📌 ' + l.note + '</div>' : '');
  }).join('');
}

function renderDetailTrend() {
  var sid = _detailStudentId;
  var sLessons = DATA.lessons.filter(function(l) { return l.student_id === sid; }).sort(function(a,b) { return a.date.localeCompare(b.date); });
  var container = document.getElementById('detail-trend');
  if (sLessons.length < 2) {
    container.innerHTML = '<div class="empty-detail">至少需要 2 节课才能绘制趋势图</div>';
    return;
  }
  var dims = ['forehand','backhand','serve','volley','footwork','fitness'];
  var labels = {forehand:'正手',backhand:'反手',serve:'发球',volley:'截击',footwork:'步伐',fitness:'体能'};
  var colors = ['#2ecc71','#74b9ff','#e8895b','#f9a825','#a29bfe','#fd79a8'];
  var dates = sLessons.map(function(l) { return l.date; });
  var series = {};
  dims.forEach(function(d) { series[d] = sLessons.map(function(l) { return (l.ratings||{})[d] || null; }); });
  
  setTimeout(function() {
    var canvas = document.getElementById('trend-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W = 300, H = 200, pad = {t:15, r:15, b:30, l:30};
    var cw = W - pad.l - pad.r, ch = H - pad.t - pad.b;
    ctx.clearRect(0, 0, W, H);
    for (var v = 0; v <= 10; v += 2) {
      var y = pad.t + ch - (v/10)*ch;
      ctx.beginPath(); ctx.moveTo(pad.l, y); ctx.lineTo(W-pad.r, y);
      ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.lineWidth = 0.5; ctx.stroke();
      ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'right';
      ctx.fillText(v, pad.l-4, y+3);
    }
    ctx.fillStyle = '#94a3b8'; ctx.font = '9px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('评分', 12, pad.t+8);
    var n = dates.length;
    for (var i = 0; i < n; i++) {
      var x = pad.l + (i/(Math.max(n-1,1)))*cw;
      ctx.fillStyle = '#94a3b8'; ctx.font = '8px sans-serif'; ctx.textAlign = 'center';
      ctx.fillText(dates[i].substring(5), x, H-pad.b+12);
      if (i > 0 && i < n-1 && n > 4) { i += Math.max(1, Math.floor(n/4)-1); }
    }
    dims.forEach(function(d, idx) {
      var pts = series[d].map(function(v, i) {
        if (v !== null && v !== undefined) return {x: pad.l + (i/(Math.max(n-1,1)))*cw, y: pad.t + ch - (v/10)*ch};
        return null;
      });
      ctx.beginPath(); ctx.strokeStyle = colors[idx]; ctx.lineWidth = 2;
      ctx.lineJoin = 'round'; ctx.lineCap = 'round';
      var started = false;
      pts.forEach(function(p) {
        if (!p) { started = false; return; }
        if (!started) { ctx.moveTo(p.x, p.y); started = true; }
        else ctx.lineTo(p.x, p.y);
      });
      ctx.stroke();
      pts.forEach(function(p) {
        if (!p) return;
        ctx.beginPath(); ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fillStyle = colors[idx]; ctx.fill();
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 1.5; ctx.stroke();
      });
    });
    var legend = document.getElementById('trend-legend');
    legend.innerHTML = dims.map(function(d, i) { return '<span class="trend-legend-item"><span class="trend-legend-dot" style="background:'+colors[i]+'"></span>' + labels[d] + '</span>'; }).join('');
  }, 80);
}

function renderDetailVideos() {
  var sid = _detailStudentId;
  var vs = (DATA.videos||[]).filter(function(v) { return v.student_id === sid; });
  var container = document.getElementById('detail-videos');
  if (vs.length === 0) { container.innerHTML = '<div class="empty-detail">还没有视频</div>'; return; }
  container.innerHTML = vs.map(function(v, i) {
    return '<div class="log-item" style="padding:10px 0;"><div class="log-item__head"><span>🎬 视频 #' + (i+1) + '</span><span class="log-item__date">' + (v.created_at?v.created_at.substring(0,10):'') + '</span></div>' +
    (v.note ? '<div class="log-item__note" style="font-size:11px;">' + v.note.substring(0,80) + '</div>' : '') +
    '<div style="margin-top:4px;display:flex;gap:6px;"><button class="btn btn--sm btn--outline" onclick="playVideo('+v.id+')">▶ 播放</button>' +
    '<button class="btn btn--sm btn--danger" onclick="deleteVideo('+v.id+')">✕ 删除</button></div></div>';
  }).join('');
}

function renderDetailNotes() {
  var sid = _detailStudentId;
  var entries = (DATA.journals||[]).filter(function(j) { return j.student_id === sid; }).sort(function(a,b) { return b.id - a.id; });
  var container = document.getElementById('detail-notes');
  if (entries.length === 0) { container.innerHTML = '<div class="empty-detail">还没有训练笔记</div>'; return; }
  container.innerHTML = entries.map(function(e) { return '<div class="journal-entry"><div class="journal-date">📅 ' + e.date + '</div><div class="journal-text">' + e.content + '</div></div>'; }).join('');
}

// ==================== STUDENT SELF-VIEW (新增) ====================
function drawStudentRadar() {
  if (currentRole !== 'student' || !authUser || !authUser.student) return;
  var sid = authUser.student.id;
  var sLessons = DATA.lessons.filter(function(l) { return l.student_id === sid; });
  var dims = ['forehand','backhand','serve','volley','footwork','fitness'];
  var labels = {forehand:'正手',backhand:'反手',serve:'发球',volley:'截击',footwork:'步伐',fitness:'体能'};
  var avg = {};
  dims.forEach(function(d) {
    var vals = sLessons.map(function(l) { return (l.ratings||{})[d]; }).filter(function(v) { return v; });
    avg[d] = vals.length ? (vals.reduce(function(a,b){return a+b;},0)/vals.length).toFixed(1) : 0;
  });
  var canvas = document.getElementById('student-radar');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var cx = 130, cy = 130, r = 100, n = dims.length;
  ctx.clearRect(0, 0, 260, 260);
  for (var lv = 2; lv <= 10; lv += 2) {
    ctx.beginPath();
    for (var i = 0; i < n; i++) { var a = (Math.PI*2/n)*i - Math.PI/2; var pr = r*lv/10; var x = cx + pr*Math.cos(a), y = cy + pr*Math.sin(a); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); }
    ctx.closePath(); ctx.strokeStyle = lv === 10 ? 'rgba(0,0,0,0.12)' : 'rgba(0,0,0,0.05)'; ctx.lineWidth = lv === 10 ? 1 : 0.5; ctx.stroke();
  }
  for (var i = 0; i < n; i++) { var a = (Math.PI*2/n)*i - Math.PI/2; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + r*Math.cos(a), cy + r*Math.sin(a)); ctx.strokeStyle = 'rgba(0,0,0,0.06)'; ctx.stroke(); }
  ctx.beginPath();
  for (var i = 0; i < n; i++) { var val = parseFloat(avg[dims[i]])||0; var a = (Math.PI*2/n)*i - Math.PI/2; var pr = r * Math.max(val, 0.5)/10; var x = cx + pr*Math.cos(a), y = cy + pr*Math.sin(a); i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); }
  ctx.closePath(); ctx.fillStyle = 'rgba(46,204,113,0.12)'; ctx.fill(); ctx.strokeStyle = 'rgba(46,204,113,0.7)'; ctx.lineWidth = 2.5; ctx.stroke();
  for (var i = 0; i < n; i++) { var val = parseFloat(avg[dims[i]])||0; var a = (Math.PI*2/n)*i - Math.PI/2; var pr = r * Math.max(val, 0.5)/10; var x = cx + pr*Math.cos(a), y = cy + pr*Math.sin(a); ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI*2); ctx.fillStyle = '#2ecc71'; ctx.fill(); var lx = cx + (r + 20)*Math.cos(a), ly = cy + (r + 20)*Math.sin(a); ctx.fillStyle = '#2c3e50'; ctx.font = '600 10px sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(labels[dims[i]] + ' ' + val, lx, ly); }
}

function renderStudentLessonHistory() {
  if (currentRole !== 'student' || !authUser || !authUser.student) return;
  var sid = authUser.student.id;
  var sLessons = DATA.lessons.filter(function(l) { return l.student_id === sid; }).sort(function(a,b) { return b.id - a.id; }).slice(0, 10);
  var container = document.getElementById('student-lesson-history');
  if (!container) return;
  if (sLessons.length === 0) { container.innerHTML = '<div style="text-align:center;padding:16px;color:var(--muted);font-size:12px;">还没有课程记录</div>'; return; }
  var dl = {forehand:'正手',backhand:'反手',serve:'发球',volley:'截击',footwork:'步伐',fitness:'体能'};
  container.innerHTML = sLessons.map(function(l) {
    var dims = l.ratings ? Object.keys(l.ratings).filter(function(k) { return l.ratings[k] > 0; }) : [];
    var tags = dims.map(function(k) { return '<span class="skill-tag" style="font-size:9px;padding:1px 5px;">' + (dl[k]||k) + ' ' + l.ratings[k] + '</span>'; }).join('');
    return '<div class="student-lesson-item"><span style="color:var(--muted);">' + (l.date||'') + '</span><span>' + (l.content||'') + '</span><span>' + tags + '</span></div>';
  }).join('');
}

function renderStudentDashboard() {
  setTimeout(function() { drawStudentRadar(); renderStudentLessonHistory(); }, 100);
}

// ==================== ASSIGNMENTS (新增) ====================
function showAssignModal() {
  var sid = _detailStudentId;
  if (!sid) { showToast('请先选择学员'); return; }
  document.getElementById('assign-content').value = '';
  var today = new Date(); today.setDate(today.getDate() + 7);
  document.getElementById('assign-due').value = today.toISOString().substring(0,10);
  document.getElementById('assign-modal').classList.add('show');
}
function closeAssignModal() { document.getElementById('assign-modal').classList.remove('show'); }

async function saveAssignment() {
  var content_val = document.getElementById('assign-content').value.trim();
  if (!content_val) { showToast('请输入作业内容'); return; }
  var sid = _detailStudentId;
  if (!sid) { showToast('学员错误'); return; }
  var due = document.getElementById('assign-due').value || new Date().toISOString().substring(0,10);
  showLoading(true);
  try {
    await api('POST', 'assignments', {
      student_id: sid,
      coach_id: authUser.coach ? authUser.coach.id : null,
      content: content_val,
      due_date: due,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    await syncFromCloud();
    closeAssignModal();
    showToast('作业已布置 ✓');
    renderDetailLessons();
  } catch(e) { showToast('布置失败'); }
  showLoading(false);
}

function openStudentHomework() {
  if (!authUser || !authUser.student) return;
  var sid = authUser.student.id;
  var assigns = (DATA.assignments||[]).filter(function(a) { return a.student_id === sid; }).sort(function(a,b) { return a.status === 'pending' ? -1 : 1; });
  var container = document.getElementById('homework-list');
  if (assigns.length === 0) { container.innerHTML = '<div style="text-align:center;padding:24px;color:var(--muted);font-size:13px;">还没有作业 🎉</div>'; }
  else {
    container.innerHTML = assigns.map(function(a) {
      return '<div class="assign-card' + (a.status === 'done' ? ' done' : '') + '">' +
      '<div class="assign-head"><span class="assign-title">' + (a.content||'').substring(0,30) + ((a.content && a.content.length>30)?'...':'') + '</span>' +
      '<span class="assign-status ' + (a.status === 'done' ? 'done' : 'pending') + '">' + (a.status === 'done' ? '✓ 已完成' : '⏳ 待完成') + '</span></div>' +
      '<div class="assign-desc">' + (a.content||'') + '</div>' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-top:6px;">' +
      '<span class="assign-date">截止: ' + (a.due_date||'') + '</span>' +
      (a.status !== 'done' ? '<button class="assign-done-btn" onclick="markAssignmentDone('+a.id+')">✓ 标记完成</button>' : '') +
      '</div></div>';
    }).join('');
  }
  document.getElementById('student-homework-modal').classList.add('show');
}
function closeStudentHomework() { document.getElementById('student-homework-modal').classList.remove('show'); }

async function markAssignmentDone(id) {
  if (!confirm('确认完成这个作业？')) return;
  try {
    await api('PATCH', 'assignments', {status: 'done', completed_at: new Date().toISOString()}, 'id=eq.'+id);
    await syncFromCloud();
    openStudentHomework();
    showToast('🎉 作业已完成！');
  } catch(e) { showToast('操作失败'); }
}

function playVideo(vid) {
  var v = DATA.videos.find(function(vi) { return vi.id === vid; });
  if (!v) return;
  var url = v.url || (v.filename ? SB_URL + '/storage/v1/object/videos/' + v.filename : '');
  if (url) window.open(url, '_blank');
  else showToast('视频地址不可用');
}

function onStudentCardClick(studentId) {
  openStudentDetail(studentId);
}


// ==================== AI STANDALONE PAGE (新增) ====================
var _aiCurrentVideoUrl = null;
var _aiCurrentVideoId = null;

function switchAiTab() { loadAiVideoList(); }

function loadAiVideoList() {
  var container = document.getElementById('ai-video-list');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:10px;color:var(--muted);">加载中...</div>';
  try {
    var videos = DATA.videos || [];
    if (videos.length === 0) {
      container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--muted);font-size:13px;">还没有视频，点击上方按钮上传</div>';
      return;
    }
    var students = DATA.students || [];
    container.innerHTML = videos.map(function(v, i) {
      var s = students.find(function(st) { return st.id === v.student_id; });
      var sName = s ? s.name : '未知';
      var hasAi = v.ai_ratings || (v.note && v.note.length > 15);
      return `<div class="card" style="cursor:pointer;padding:10px;margin-bottom:4px;" onclick="clickVideo(this)" data-vid="${v.id}" data-url="${v.url.replace(/'/g,'')}" data-note="${(v.note||'').replace(/\"/g,'')}">`  +
        '<div style="display:flex;justify-content:space-between;align-items:center;">' +
        '<span style="display:flex;align-items:center;gap:6px;font-size:13px;font-weight:600;">\U0001f3ac 视频 #' + (videos.length - i) + '</span>' +
        '<span style="font-size:11px;color:var(--muted);">' + sName + ' · ' + ((v.created_at||'').substring(0,10)||'') + '</span>' +
        (hasAi ? '<span class="skill-tag" style="font-size:9px;">\u2713 AI</span>' : '') +
        '</div></div>';
    }).join('');
  } catch(e) {
    container.innerHTML = '<div style="text-align:center;padding:20px;color:var(--danger);font-size:13px;">加载失败</div>';
  }
}

function clickVideo(el) { selectAiVideo(el.dataset.url, el.dataset.vid, el.dataset.note || ''); }

function selectAiVideo(url, id, note) {
  _aiCurrentVideoUrl = url;
  _aiCurrentVideoId = id;
  var pa = document.getElementById('ai-player-area');
  var p = document.getElementById('ai-video-player');
  var ra = document.getElementById('ai-result-area');
  if (p) p.src = url;
  if (pa) pa.style.display = 'block';
  if (ra) ra.style.display = 'none';
}

async function analyzeAiVideo() {
  if (!_aiCurrentVideoUrl || !_aiCurrentVideoId) { showToast('\u8bf7\u5148\u9009\u62e9\u89c6\u9891'); return; }
  var panel = showAnalysisPanel(true);
  if (panel) { panel._lastVideoUrl = _aiCurrentVideoUrl; panel._lastVideoId = _aiCurrentVideoId; }
  await analyzeVideo(_aiCurrentVideoUrl, _aiCurrentVideoId);
  setTimeout(function() { loadAiVideoList(); }, 500);
}

// ==================== AI HISTORY / COMPARE / EXPORT ====================
function updateAiHistory(result, videoUrl, videoId) {
  var history = JSON.parse(sessionStorage.getItem('ai_history') || '[]');
  var label = videoUrl ? decodeURIComponent(videoUrl.split("/").pop()).substring(0,20) : '视频 #' + (history.length + 1);
  history.unshift({ id: videoId, url: videoUrl, label: label, date: new Date().toISOString(), ratings: result.ratings || null, summary: result.summary || '', suggestions: result.suggestions || [] });
  if (history.length > 20) history = history.slice(0,20);
  sessionStorage.setItem('ai_history', JSON.stringify(history));
  renderAiHistory(); renderAiTrend();
}

function renderAiHistory() {
  var area = document.getElementById('ai-history-area');
  var list = document.getElementById('ai-history-list');
  if (!area || !list) return;
  try {
    var history = JSON.parse(sessionStorage.getItem('ai_history') || '[]');
    if (history.length === 0) { area.style.display = 'none'; return; }
    area.style.display = '';
    list.innerHTML = history.map(function(h) {
      var r = h.ratings;
      var avg = (r && Object.keys(r).length) ? (Object.values(r).reduce(function(a,b){return a+b},0) / Object.values(r).length).toFixed(1) : null;
      return '<div style="padding:5px 0;border-bottom:1px solid var(--border);font-size:12px;display:flex;justify-content:space-between;align-items:center;"><span>' + h.date.substring(0,10) + '</span><span>' + h.label + '</span>' + (avg ? '<span style="color:var(--green);font-weight:600;">' + avg + '</span>' : '') + '</div>';
    }).join('');
  } catch(e) {}
}

function renderAiTrend() {
  var area = document.getElementById('ai-compare-area');
  var chart = document.getElementById('ai-trend-chart');
  var sel = document.getElementById('ai-compare-select');
  if (!area || !chart || !sel) return;
  try {
    var history = JSON.parse(sessionStorage.getItem('ai_history') || '[]');
    var rated = history.filter(function(h) { return h.ratings && Object.keys(h.ratings).length > 0; });
    if (rated.length < 2) { area.style.display = 'none'; return; }
    area.style.display = '';
    var latest = rated[0].ratings;
    var dims = Object.keys(latest);
    var labels = {"forehand":"正手","backhand":"反手","serve":"发球","volley":"截击","footwork":"步法","fitness":"体能"};
    chart.innerHTML = dims.map(function(d) {
      var v = latest[d] || 0;
      return '<div style="margin-bottom:3px;display:flex;align-items:center;gap:6px;"><span style="width:28px;font-size:11px;color:var(--muted);text-align:right;">' + (labels[d]||d) + '</span><div style="flex:1;height:12px;background:var(--elevated);border-radius:6px;overflow:hidden;"><div style="height:100%;width:' + Math.round(v/10*100) + '%;background:linear-gradient(90deg,var(--green),var(--sky));border-radius:6px;"></div></div><span style="width:18px;font-size:11px;font-weight:600;">' + v + '</span></div>';
    }).join('');
    sel.innerHTML = '<option value="">-- 选择对比视频 --</option>';
    rated.slice(1).forEach(function(h, i) {
      var opt = document.createElement('option');
      opt.value = i + 1;
      opt.textContent = h.date.substring(0,10) + ' ' + h.label;
      sel.appendChild(opt);
    });
  } catch(e) {}
}

function showAiCompare() {
  var sel = document.getElementById('ai-compare-select');
  var result = document.getElementById('ai-compare-result');
  if (!sel || !result) return;
  var idx = parseInt(sel.value);
  if (isNaN(idx)) { result.innerHTML = ''; return; }
  try {
    var history = JSON.parse(sessionStorage.getItem('ai_history') || '[]');
    var rated = history.filter(function(h) { return h.ratings && Object.keys(h.ratings).length > 0; });
    if (idx >= rated.length) return;
    var a = rated[0].ratings, b = rated[idx].ratings;
    var dims = Object.keys(a);
    var labels = {"forehand":"正手","backhand":"反手","serve":"发球","volley":"截击","footwork":"步法","fitness":"体能"};
    result.innerHTML = '<div style="font-weight:600;margin-bottom:6px;font-size:13px;">📊 对比: 最新 vs ' + rated[idx].label + '</div>' + dims.map(function(d) {
      var l = labels[d]||d; var va = a[d]||0; var vb = b[d]||0; var diff = va - vb;
      return '<div style="display:flex;justify-content:space-between;padding:2px 0;font-size:12px;"><span>' + l + '</span><span>' + va + ' → ' + vb + ' <span style="color:' + (diff>=0?'var(--green)':'var(--danger)') + ';">' + (diff>0?'+':'') + diff + '</span></span></div>';
    }).join('');
  } catch(e) { result.innerHTML = '<span style="color:var(--danger);">对比失败</span>'; }
}

function exportAiReport() {
  var ra = document.getElementById('ai-result-area');
  if (!ra || ra.style.display === 'none') { showToast('请先完成AI分析'); return; }
  var summary = document.getElementById('ai-result-summary').textContent;
  var details = document.getElementById('ai-result-details').textContent;
  var s = document.getElementById('ai-result-suggestions').textContent;
  var text = '=== AI 动作分析报告 ===' + '\n\n' + '【摘要】' + '\n' + (summary||'') + '\n\n' + '【详细分析】' + '\n' + (details||'') + '\n\n' + '【改进建议】' + '\n' + (s||'');
  var blob = new Blob([text], {type:'text/plain;charset=utf-8'});
  var a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ai_report_' + new Date().toISOString().substring(0,10) + '.txt';
  a.click();
  URL.revokeObjectURL(a.href);
  showToast('报告已导出');
}

function importAiRatingsFromPage() {
  var ra = document.getElementById('ai-result-area');
  var rs = ra ? ra.dataset.ratingsJson : null;
  if (rs) importAiRatings(rs);
}

function uploadFromAiPage(event) {
  var file = event.target.files[0];
  if (!file) { showToast('请选择视频文件'); return; }
  var coachId = (authUser && authUser.coach) ? authUser.coach.id : (authUser && authUser.student ? authUser.student.coach_id : null);
  if (!coachId) { showToast('请先登录'); return; }
  showLoading(true);
  try {
    var fname = 'v_' + Date.now() + '_' + file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    var xhr = new XMLHttpRequest();
    xhr.addEventListener('load', async function() {
      if (xhr.status >= 200 && xhr.status < 300) {
        var url = SB_URL + '/storage/v1/object/public/videos/' + fname;
        var sid = (DATA.students||[]).length > 0 ? DATA.students[0].id : null;
        try {
          await api('POST', 'videos', { student_id: sid, coach_id: coachId, filename: fname, url: url, note: '从AI页面上传', uploaded_by: 'coach' });
          await syncFromCloud();
          loadAiVideoList();
          showToast('视频上传成功');
        } catch(e2) { showToast('保存失败'); }
      } else { showToast('上传失败: ' + xhr.status); }
      showLoading(false);
    });
    xhr.addEventListener('error', function() { showToast('网络错误'); showLoading(false); });
    xhr.open('POST', SB_URL + '/storage/v1/object/videos/' + fname);
    xhr.setRequestHeader('apikey', SB_KEY); xhr.setRequestHeader('Authorization', 'Bearer ' + SB_KEY);
    var fd = new FormData(); fd.append(file.name, file); xhr.send(fd);
  } catch(e) { showLoading(false); showToast('上传失败: ' + e.message); }
  event.target.value = '';
}

// Tab switching
function switchTab(tabName) {
  $$('.tab').forEach(function(t) { t.classList.remove('active'); });
  $$('.page').forEach(function(p) { p.classList.remove('active'); });
  var tab = document.querySelector('.tab[data-tab="' + tabName + '"]');
  var page = document.getElementById('page-' + tabName);
  if (tab) tab.classList.add('active');
  if (page) page.classList.add('active');
  if (tabName === 'ai') switchAiTab();
}
async function initApp() {
  showLoading(true);
  await syncFromCloud();
  showLoading(false);
  $('#lesson-date').value=formatDate(new Date());
  $('#journal-date').value=formatDate(new Date());
  renderStudentList();renderRecentLogs();refreshBoard();applyRoleUI();
  if (authUser && authUser.role === 'student') { setTimeout(function() { drawStudentRadar(); renderStudentLessonHistory(); }, 300); }
  $$('.rating').forEach(slider=>{slider.addEventListener('input',(e)=>{const val=e.target.value;const d=e.target.closest('.rating-cell').querySelector('.rating-cell__val');if(d)d.textContent=val;});});
  $('#student-modal').addEventListener('click',(e)=>{if(e.target===$('#student-modal'))closeStudentModal();});
  $('#detail-modal').addEventListener('click',(e)=>{if(e.target===$('#detail-modal'))closeDetailModal();});
}
// Start: check auth state
checkAuth();
}
t();