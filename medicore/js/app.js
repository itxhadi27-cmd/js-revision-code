
        // ═══════════════════ AUTH / USER SYSTEM ═══════════════════
let currentUser = null;
let forgotUserId = null;

function getUsers() { return JSON.parse(localStorage.getItem('mc_users') || '[]'); }
function saveUsers(u) { localStorage.setItem('mc_users', JSON.stringify(u)); }

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab-btn').forEach((b, i) => {
        b.classList.toggle('active', ['login', 'register', 'forgot'][i] === tab);
    });
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    document.getElementById('auth' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
}

// NEW: Function to completely wipe all auth forms
function clearAuthForms() {
    // Login
    const loginId = document.getElementById('loginId');
    const loginPwd = document.getElementById('loginPwd');
    if (loginId) loginId.value = '';
    if (loginPwd) loginPwd.value = '';

    // Register
    const regId = document.getElementById('regId');
    const regName = document.getElementById('regName');
    const regRole = document.getElementById('regRole');
    const regPwd = document.getElementById('regPwd');
    const regPwd2 = document.getElementById('regPwd2');
    const regQ = document.getElementById('regQ');
    const regA = document.getElementById('regA');
    if (regId) regId.value = '';
    if (regName) regName.value = '';
    if (regRole) regRole.selectedIndex = 0;
    if (regPwd) regPwd.value = '';
    if (regPwd2) regPwd2.value = '';
    if (regQ) regQ.value = '';
    if (regA) regA.value = '';

    // Forgot Password
    const forgotId = document.getElementById('forgotId');
    const forgotAns = document.getElementById('forgotAns');
    const forgotNewPwd = document.getElementById('forgotNewPwd');
    const forgotNewPwd2 = document.getElementById('forgotNewPwd2');
    if (forgotId) forgotId.value = '';
    if (forgotAns) forgotAns.value = '';
    if (forgotNewPwd) forgotNewPwd.value = '';
    if (forgotNewPwd2) forgotNewPwd2.value = '';

    // Reset Forgot Password UI steps
    const step1 = document.getElementById('forgotStep1');
    const step2 = document.getElementById('forgotStep2');
    const step3 = document.getElementById('forgotStep3');
    if (step1) step1.style.display = 'block';
    if (step2) step2.style.display = 'none';
    if (step3) step3.style.display = 'none';

    // Remove any lingering error/success messages
    const authError = document.getElementById('authError');
    if (authError) authError.remove();
    
    // Always reset to login tab on clear
    switchAuthTab('login');
}

function doLogin() {
    const id = document.getElementById('loginId').value.trim();
    const pwd = document.getElementById('loginPwd').value;
    if (!id || !pwd) { showAuthError('Please enter User ID and Password.'); return; }
    const users = getUsers();
    const u = users.find(x => x.id === id);
    if (!u) { showAuthError('User ID not found. Please create an account first.', true); return; }
    if (u.password !== btoa(pwd)) {
        showAuthError('Wrong password. <a href="#" onclick="switchAuthTab(\'forgot\');return false;" style="color:var(--teal)">Forgot password?</a>'); return;
    }
    currentUser = u;
    localStorage.setItem('mc_session', JSON.stringify(u));
    showGreeting(u);
}

function doRegister() {
    const id = document.getElementById('regId').value.trim();
    const name = document.getElementById('regName').value.trim();
    const role = document.getElementById('regRole').value;
    const pwd = document.getElementById('regPwd').value;
    const pwd2 = document.getElementById('regPwd2').value;
    const q = document.getElementById('regQ').value.trim();
    const a = document.getElementById('regA').value.trim();
    if (!id || !name || !pwd || !q || !a) { showAuthError('Please fill all required fields.'); return; }
    if (pwd !== pwd2) { showAuthError('Passwords do not match.'); return; }
    if (pwd.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
    const users = getUsers();
    if (users.find(x => x.id === id)) { showAuthError('This User ID already exists. Please choose a different one.'); return; }
    const u = { id, name, role, password: btoa(pwd), secQ: q, secA: a.toLowerCase() };
    users.push(u); saveUsers(users);
    currentUser = u;
    localStorage.setItem('mc_session', JSON.stringify(u));
    showGreeting(u);
}

function doForgotStep1() {
    const id = document.getElementById('forgotId').value.trim();
    if (!id) { showAuthError('Please enter your User ID.'); return; }
    const users = getUsers();
    const u = users.find(x => x.id === id);
    if (!u) { showAuthError('User ID not found. Please create a new account.'); return; }
    forgotUserId = id;
    document.getElementById('forgotQDisplay').textContent = u.secQ;
    document.getElementById('forgotStep1').style.display = 'none';
    document.getElementById('forgotStep2').style.display = 'block';
}

function doForgotStep2() {
    const ans = document.getElementById('forgotAns').value.trim().toLowerCase();
    const users = getUsers();
    const u = users.find(x => x.id === forgotUserId);
    if (!u) { return; }
    if (u.secA !== ans) { showAuthError('Wrong answer. Please try again or create a new account.'); return; }
    document.getElementById('forgotStep2').style.display = 'none';
    document.getElementById('forgotStep3').style.display = 'block';
}

function doForgotStep3() {
    const pwd = document.getElementById('forgotNewPwd').value;
    const pwd2 = document.getElementById('forgotNewPwd2').value;
    if (!pwd || pwd !== pwd2) { showAuthError('Passwords do not match or are empty.'); return; }
    if (pwd.length < 6) { showAuthError('Password must be at least 6 characters.'); return; }
    const users = getUsers();
    const idx = users.findIndex(x => x.id === forgotUserId);
    if (idx < 0) { return; }
    users[idx].password = btoa(pwd);
    saveUsers(users);
    showAuthSuccess('Password updated! You can now sign in.');
    switchAuthTab('login');
    document.getElementById('forgotStep1').style.display = 'block';
    document.getElementById('forgotStep2').style.display = 'none';
    document.getElementById('forgotStep3').style.display = 'none';
}

function showAuthError(msg, redirect = false) {
    let el = document.getElementById('authError');
    if (!el) { el = document.createElement('div'); el.id = 'authError'; el.style.cssText = 'background:var(--red-dim);border:1px solid rgba(239,68,68,0.3);border-radius:9px;padding:12px 16px;font-size:13px;color:var(--red);margin-bottom:14px;'; document.querySelector('.auth-form.active').prepend(el); }
    if (window.DOMPurify) el.innerHTML = DOMPurify.sanitize(msg); else el.textContent = msg.replace(/<[^>]*>/g,'');
}

function showAuthSuccess(msg) {
    let el = document.getElementById('authError');
    if (!el) { el = document.createElement('div'); el.id = 'authError'; el.style.cssText = 'background:var(--green-dim);border:1px solid rgba(34,197,94,0.3);border-radius:9px;padding:12px 16px;font-size:13px;color:var(--green);margin-bottom:14px;'; document.querySelector('.auth-form.active').prepend(el); }
    el.style.background = 'var(--green-dim)'; el.style.borderColor = 'rgba(34,197,94,0.3)'; el.style.color = 'var(--green)';
    if (window.DOMPurify) el.innerHTML = DOMPurify.sanitize(msg); else el.textContent = msg.replace(/<[^>]*>/g,'');
}

// ═══════════════════ GREETING SCREEN ═══════════════════
function showGreeting(user) {
    document.getElementById('landingPage').classList.add('hidden');
    const gs = document.getElementById('greetingScreen');
    gs.classList.remove('hidden');
    
    const h = new Date().getHours();
    let gMsg = 'Welcome Back';
    let iconClass = 'ti ti-activity';
    
    if (h < 12) { gMsg = 'Good Morning ☀️'; iconClass = 'ti ti-sun'; }
    else if (h < 17) { gMsg = 'Good Afternoon 🌤️'; iconClass = 'ti ti-sun-high'; }
    else if (h < 21) { gMsg = 'Good Evening 🌇'; iconClass = 'ti ti-sunset'; }
    else { gMsg = 'Good Night 🌙'; iconClass = 'ti ti-moon'; }
    
    document.getElementById('greetingMsg').textContent = gMsg;
    const greetingIcon = document.querySelector('.greeting-icon i');
    if (greetingIcon) greetingIcon.className = iconClass;

    document.getElementById('greetingUserName').textContent = `Welcome back, ${user.name}`;
    const now = new Date();
    document.getElementById('greetingDate').textContent = now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    
    const btn = document.getElementById('greetingEnterBtn');
    const timerEl = document.getElementById('greetingTimer');
    btn.classList.remove('visible');
    btn.disabled = true;
    let sec = 5;
    timerEl.textContent = `Button available in ${sec}s…`;
    
    const iv = setInterval(() => {
        sec--;
        if (sec <= 0) {
            clearInterval(iv);
            btn.classList.add('visible');
            btn.disabled = false;
            timerEl.textContent = 'Click to enter the system';
        } else {
            timerEl.textContent = `Button available in ${sec}s…`;
        }
    }, 1000);
}

function enterApp() {
    document.getElementById('greetingScreen').classList.add('hidden');
    const shell = document.getElementById('appShell');
    shell.classList.add('visible');
    const initials = (currentUser.name || 'U').split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('sidebarAvatar').textContent = initials;
    document.getElementById('sidebarName').textContent = currentUser.name;
    document.getElementById('sidebarRole').textContent = currentUser.role || 'Staff';
    document.getElementById('topbarDate').textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    updateBadges();
    renderDashboard();
    initMessages();
}

function doLogout() {
    if (!confirm('Are you sure you want to logout?')) return;
    currentUser = null;
    localStorage.removeItem('mc_session');
    document.getElementById('appShell').classList.remove('visible');
    document.getElementById('landingPage').classList.remove('hidden');
    
    // CLEAR FORMS ON LOGOUT
    clearAuthForms();
    
    showToast('Logged out successfully', 'info');
}

// ═══════════════════ THEME TOGGLE ═══════════════════
function toggleTheme() {
    const root = document.documentElement;
    const isDark = root.getAttribute('data-theme') === 'dark';
    const newTheme = isDark ? 'light' : 'dark';
    root.setAttribute('data-theme', newTheme);
    localStorage.setItem('mc_theme', newTheme);
}

// ═══════════════════ SIDEBAR AUTO-COLLAPSE ═══════════════════
function checkSidebarResponsive() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (!sidebar) return;
    if (window.innerWidth <= 960) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    } else {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
    }
}

// ═══════════════════ INITIALIZATION ═══════════════════
window.addEventListener('DOMContentLoaded', () => {
    // CLEAR FORMS ON PAGE LOAD/REFRESH
    clearAuthForms();
    
    const sess = localStorage.getItem('mc_session');
    if (sess) {
        try {
            currentUser = JSON.parse(sess);
            showGreeting(currentUser);
        } catch (e) { localStorage.removeItem('mc_session'); }
    }
    initMessages();
    const savedTheme = localStorage.getItem('mc_theme');
    if (savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);
    window.addEventListener('resize', checkSidebarResponsive);
});

// ═══════════════════ PATIENT DATA ═══════════════════
let patients = JSON.parse(localStorage.getItem('medi_patients') || '[]');
function savePatients() { localStorage.setItem('medi_patients', JSON.stringify(patients)); }

// ═══════════════════ APPOINTMENTS ═══════════════════
let appointments = JSON.parse(localStorage.getItem('medi_appts') || '[]');
function saveAppointments() { localStorage.setItem('medi_appts', JSON.stringify(appointments)); }

function scheduleAppointment() {
    const patient = document.getElementById('apptPatient').value.trim();
    const doctor = document.getElementById('apptDoctor').value;
    const date = document.getElementById('apptDate').value;
    const time = document.getElementById('apptTime').value;
    const type = document.getElementById('apptType').value;
    if (!patient || !date || !time) { showToast('Please fill in Patient, Date, and Time', 'error'); return; }
    const appt = {
        id: 'APT-' + Date.now().toString().slice(-6),
        patient, doctor, date, time, type,
        created: new Date().toISOString()
    };
    appointments.push(appt);
    saveAppointments();
    updateBadges();
    renderAppointments();
    document.getElementById('apptPatient').value = '';
    document.getElementById('apptDate').value = '';
    document.getElementById('apptTime').value = '';
    showToast(`Appointment scheduled for ${patient}`, 'success');
}

function renderAppointments() {
    const list = document.getElementById('apptList');
    if (!list) return;
    if (appointments.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="ti ti-calendar-off"></i><p>No appointments scheduled yet. Use the form to add one.</p></div>';
        return;
    }
    const sorted = [...appointments].sort((a, b) => new Date(a.date + 'T' + a.time) - new Date(b.date + 'T' + b.time));
    const typeColor = { 'Consultation': 'pill-teal', 'Surgery': 'pill-red', 'Follow_up': 'pill-blue', 'Follow-up': 'pill-blue', 'Lab Review': 'pill-amber', 'Emergency': 'pill-red' };
    list.innerHTML = sorted.map(a => {
        const d = new Date(a.date + 'T' + a.time);
        const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const isPast = d < new Date();
        return `<div class="appt-item" style="${isPast ? 'opacity:0.55;' : ''}">
            <div class="appt-time-block">
                <span style="font-size:18px;font-weight:700;color:var(--teal);">${timeStr}</span>
                <span style="font-size:10px;color:var(--text-muted);display:block;margin-top:2px;">${dateStr}</span>
            </div>
            <div style="flex:1;">
                <p style="font-weight:500;font-size:14px;">${a.patient}</p>
                <span style="font-size:12px;color:var(--text-muted);">${a.doctor} · ${a.type}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                <span class="pill ${typeColor[a.type] || 'pill-blue'}">${a.type}</span>
                ${isPast ? '<span class="pill pill-red" style="font-size:10px;">Past</span>' : ''}
                <button class="btn btn-danger btn-xs" onclick="deleteAppointment('${a.id}')"><i class="ti ti-trash"></i></button>
            </div>
        </div>`;
    }).join('');
}

function deleteAppointment(id) {
    appointments = appointments.filter(a => a.id !== id);
    saveAppointments();
    updateBadges();
    renderAppointments();
    showToast('Appointment removed', 'info');
}

// ═══════════════════ STAFF ═══════════════════
let staffList = JSON.parse(localStorage.getItem('medi_staff') || JSON.stringify([
    { id: 'STF-001', name: 'Dr. Sarah Kim', fatherName: 'Robert Kim', role: 'Doctor', dept: 'Cardiology', degree: 'FCPS', spec: 'Interventional Cardiology', exp: '12', fee: '3000', cases: '840', status: 'On Duty', phone: '+1-555-0101', email: 's.kim@medicore.hospital', cnic: '35202-1234567-1', passout: '2013', bio: 'Dr. Sarah Kim is a highly experienced cardiologist.', pic: '' },
    { id: 'STF-002', name: 'Dr. Mark Torres', fatherName: 'James Torres', role: 'Doctor', dept: 'Neurology', degree: 'MBBS', spec: 'Neurology', exp: '9', fee: '2500', cases: '610', status: 'On Duty', phone: '+1-555-0102', email: 'm.torres@medicore.hospital', cnic: '35202-2345678-2', passout: '2015', bio: 'Dr. Mark Torres is a dedicated neurologist.', pic: '' }
]));
let viewingStaffId = null;
function saveStaff() { localStorage.setItem('medi_staff', JSON.stringify(staffList)); }

function addStaff() {
    const name = document.getElementById('s-name').value.trim();
    const role = document.getElementById('s-role').value;
    const dept = document.getElementById('s-dept').value;
    const degree = document.getElementById('s-degree').value;
    if (!name || !role || !dept || !degree) { showToast('Please fill required fields (Name, Role, Department, Degree)', 'error'); return; }
    const degOther = document.getElementById('s-degreeOther').value.trim();
    const s = {
        id: 'STF-' + Date.now().toString().slice(-5),
        name,
        fatherName: document.getElementById('s-fname').value.trim(),
        role, dept,
        degree: degOther || degree,
        spec: document.getElementById('s-spec').value.trim(),
        exp: document.getElementById('s-exp').value,
        fee: document.getElementById('s-fee').value,
        cases: document.getElementById('s-cases').value,
        status: 'On Duty',
        phone: document.getElementById('s-phone').value.trim(),
        email: document.getElementById('s-email').value.trim(),
        cnic: document.getElementById('s-cnic').value.trim(),
        passout: document.getElementById('s-passout').value,
        bio: document.getElementById('s-bio').value.trim(),
        pic: ''
    };
    staffList.push(s); saveStaff();
    showToast(`${name} added to staff directory`, 'success');
    clearStaffForm();
    showPage('staff', document.querySelector('[onclick*=staff]'));
}

function clearStaffForm() {
    ['s-name', 's-fname', 's-cnic', 's-phone', 's-email', 's-spec', 's-exp', 's-fee', 's-cases', 's-bio', 's-degreeOther', 's-passout']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['s-role', 's-dept', 's-degree', 's-gender'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
}

function renderStaff() {
    const grid = document.getElementById('staffGrid');
    if (!grid) return;
    const q = (document.getElementById('staffSearch')?.value || '').toLowerCase();
    const dept = document.getElementById('staffDeptFilter')?.value || '';
    const sc = { 'On Duty': 'pill-green', 'In OR': 'pill-purple', 'On Leave': 'pill-amber', 'Off Duty': 'pill-red' };
    const filtered = staffList.filter(s =>
        (!q || (s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q) || s.dept.toLowerCase().includes(q)))
        && (!dept || s.dept === dept)
    );
    if (filtered.length === 0) {
        grid.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="ti ti-users-off"></i><p>No staff found.</p></div>'; return;
    }
    grid.innerHTML = filtered.map(s => `<div class="glass-card" style="padding:20px;cursor:pointer;transition:var(--transition);" onclick="viewStaff('${s.id}')" onmouseover="this.style.background='var(--glass-hover)'" onmouseout="this.style.background='var(--glass)'">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px;">
            <div style="width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--blue),var(--purple));display:flex;align-items:center;justify-content:center;font-size:16px;font-weight:700;color:#fff;flex-shrink:0;overflow:hidden;position:relative;">
                ${s.pic ? `<img src="${s.pic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;">` : s.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase()}
            </div>
            <div style="min-width:0;">
                <p style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${s.name}</p>
                <p style="font-size:12px;color:var(--text-muted);">${s.role}</p>
            </div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;">
            <span style="font-size:12px;color:var(--text-muted);"><i class="ti ti-building-hospital" style="font-size:13px;vertical-align:-1px;"></i> ${s.dept}</span>
            <span class="pill ${sc[s.status] || 'pill-blue'}">${s.status}</span>
        </div>
        ${s.spec ? `<p style="font-size:11px;color:var(--text-muted);margin-top:8px;border-top:1px solid var(--border);padding-top:8px;">${s.degree} · ${s.spec}</p>` : ''}
    </div>`).join('');
}

function viewStaff(id) {
    const s = staffList.find(x => x.id === id);
    if (!s) return;
    viewingStaffId = id;
    const initials = s.name.split(' ').map(w => w[0]).join('').substring(0, 2).toUpperCase();
    document.getElementById('staffModalInitials').textContent = initials;
    const img = document.getElementById('staffModalImg');
    if (s.pic) { img.src = s.pic; img.style.display = 'block'; document.getElementById('staffModalInitials').style.display = 'none'; }
    else { img.style.display = 'none'; document.getElementById('staffModalInitials').style.display = 'block'; }
    document.getElementById('staffModalName').textContent = s.name;
    document.getElementById('staffModalRole').textContent = `${s.role} · ${s.dept}`;
    const sc = { 'On Duty': 'pill-green', 'In OR': 'pill-purple', 'On Leave': 'pill-amber', 'Off Duty': 'pill-red' };
    document.getElementById('staffModalStatus').innerHTML = `<span class="pill ${sc[s.status] || 'pill-blue'}">${s.status}</span>`;
    document.getElementById('smDegree').textContent = s.degree || '—';
    document.getElementById('smSpec').textContent = s.spec || '—';
    document.getElementById('smPassout').textContent = s.passout ? `Class of ${s.passout}` : '—';
    document.getElementById('smExp').textContent = s.exp ? `${s.exp} years` : '—';
    document.getElementById('smCases').textContent = s.cases ? `${parseInt(s.cases).toLocaleString()} cases` : '—';
    document.getElementById('smFee').textContent = s.fee && s.fee !== '0' ? `PKR ${parseInt(s.fee).toLocaleString()}/consultation` : 'N/A';
    document.getElementById('smPhone').textContent = s.phone || '—';
    document.getElementById('smEmail').textContent = s.email || '—';
    document.getElementById('smCnic').textContent = s.cnic || '—';
    document.getElementById('smBio').textContent = s.bio || 'No biography added yet.';
    document.getElementById('staffDeleteBtn').onclick = () => {
        if (!confirm('Remove this staff member?')) return;
        staffList = staffList.filter(x => x.id !== id);
        saveStaff(); renderStaff(); closeModal('staffModal');
        showToast('Staff member removed', 'info');
    };
    document.getElementById('staffModal').classList.add('open');
}

function updateStaffPic(input) {
    if (!input.files || !input.files[0]) return;
    const reader = new FileReader();
    reader.onload = e => {
        const pic = e.target.result;
        const img = document.getElementById('staffModalImg');
        img.src = pic; img.style.display = 'block';
        document.getElementById('staffModalInitials').style.display = 'none';
        if (viewingStaffId) {
            const idx = staffList.findIndex(x => x.id === viewingStaffId);
            if (idx >= 0) { staffList[idx].pic = pic; saveStaff(); renderStaff(); }
        }
        showToast('Photo updated', 'success');
    };
    reader.readAsDataURL(input.files[0]);
}

// ═══════════════════ MESSAGES ═══════════════════
let messages = JSON.parse(localStorage.getItem('medi_messages') || '[]');
function saveMessages() { localStorage.setItem('medi_messages', JSON.stringify(messages)); }

function initMessages() {
    if (messages.length === 0) {
        messages = [
            { id: 'MSG-001', from: 'Ali Hassan (Guardian)', patient: 'Patient MC-000001', body: 'Hello, my father has been asking about his medication schedule. Can someone please update us?', time: new Date(Date.now() - 3600000).toISOString(), read: false },
            { id: 'MSG-002', from: 'Fatima Khan (Guardian)', patient: 'Patient MC-000002', body: 'We would like to know when the next doctor visit is scheduled for our mother.', time: new Date(Date.now() - 7200000).toISOString(), read: false },
            { id: 'MSG-003', from: 'Dr. Sarah Kim', patient: 'Internal', body: 'Ward B medication review completed. All patients stable.', time: new Date(Date.now() - 10800000).toISOString(), read: true },
        ];
        saveMessages();
    }
    renderMessages();
    updateMsgDot();
}

function renderMessages() {
    const list = document.getElementById('msgList');
    if (!list) return;
    if (messages.length === 0) {
        list.innerHTML = '<div class="empty-state"><i class="ti ti-message-off"></i><p>No messages.</p></div>'; return;
    }
    list.innerHTML = [...messages].reverse().map(m => `<div class="msg-item ${m.read ? '' : 'unread'}" onclick="readMessage('${m.id}')">
        <div class="msg-item-header">
            <span style="font-weight:600;font-size:13px;">${m.from}</span>
            <span style="font-size:11px;color:var(--text-muted);">${timeAgo(m.time)}</span>
        </div>
        <p style="font-size:11px;color:var(--teal);margin-bottom:4px;">${m.patient}</p>
        <p style="font-size:13px;color:var(--text-secondary);line-height:1.4;">${m.body}</p>
        ${!m.read ? '<span class="pill pill-teal" style="margin-top:6px;font-size:10px;">New</span>' : ''}
    </div>`).join('');
}

function readMessage(id) {
    const m = messages.find(x => x.id === id);
    if (m) m.read = true;
    saveMessages(); renderMessages(); updateMsgDot();
}

function sendReply() {
    const txt = document.getElementById('msgReplyInput').value.trim();
    if (!txt) { showToast('Please type a message', 'error'); return; }
    messages.push({ id: 'MSG-' + Date.now(), from: currentUser ? currentUser.name : 'Staff', patient: 'Internal', body: txt, time: new Date().toISOString(), read: true });
    saveMessages(); renderMessages();
    document.getElementById('msgReplyInput').value = '';
    showToast('Message sent', 'success');
}

function updateMsgDot() {
    const unread = messages.filter(m => !m.read).length;
    const dot = document.getElementById('msgDot');
    if (dot) dot.style.display = unread > 0 ? 'block' : 'none';
}

function timeAgo(iso) {
    const diff = (Date.now() - new Date(iso)) / 1000;
    if (diff < 60) return 'just now';
    if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
    if (diff < 86400) return Math.floor(diff / 3600) + 'h ago';
    return Math.floor(diff / 86400) + 'd ago';
}

// ═══════════════════ PANELS ═══════════════════
function toggleAlerts() {
    const p = document.getElementById('alertPanel');
    const o = document.getElementById('panelOverlay');
    const isOpen = p.classList.contains('open');
    closePanels();
    if (!isOpen) { p.classList.add('open'); o.classList.add('open'); }
}

function toggleMessages() {
    const p = document.getElementById('msgPanel');
    const o = document.getElementById('panelOverlay');
    const isOpen = p.classList.contains('open');
    closePanels();
    if (!isOpen) { p.classList.add('open'); o.classList.add('open'); renderMessages(); }
}

function closePanels() {
    document.getElementById('alertPanel').classList.remove('open');
    document.getElementById('msgPanel').classList.remove('open');
    document.getElementById('panelOverlay').classList.remove('open');
}

// ═══════════════════ NAV ═══════════════════
function showPage(id, el) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    const page = document.getElementById('page-' + id);
    if (page) page.classList.add('active');
    if (el) el.classList.add('active');
    else { const found = document.querySelector(`[onclick*="'${id}'"]`); if (found) found.classList.add('active'); }
    const titles = { dashboard: 'Dashboard', admit: 'Admit Patient', patients: 'Patient Records', wards: 'Ward Management', schedule: 'Appointments', staff: 'Staff Directory', addstaff: 'Add Staff Member', pharmacy: 'Pharmacy', analytics: 'Analytics', billing: 'Billing', settings: 'Settings' };
    document.getElementById('topbarTitle').textContent = titles[id] || id;
    closeSidebar(); closePanels();
    if (id === 'patients') renderPatientsTable();
    if (id === 'wards') renderWardGrid();
    if (id === 'dashboard') renderDashboard();
    if (id === 'analytics') renderCharts();
    if (id === 'staff') renderStaff();
    if (id === 'schedule') renderAppointments();
}

function toggleSidebar() { document.getElementById('sidebar').classList.toggle('open'); document.getElementById('sidebarOverlay').classList.toggle('open'); }
function closeSidebar() { document.getElementById('sidebar').classList.remove('open'); document.getElementById('sidebarOverlay').classList.remove('open'); }

// ═══════════════════ TOAST ═══════════════════
function showToast(msg, type = 'info') {
    const icons = { success: 'ti-circle-check', error: 'ti-circle-x', info: 'ti-info-circle' };
    const t = document.createElement('div'); t.className = `toast ${type}`;
    t.innerHTML = `<i class="ti ${icons[type]} toast-icon"></i><span class="toast-msg">${msg}</span>`;
    document.getElementById('toastContainer').appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(40px)'; t.style.transition = 'all 0.3s'; setTimeout(() => t.remove(), 300); }, 3200);
}

// ═══════════════════ ADMIT PATIENT (FIXED: All typos and spaces removed) ═══════════════════
function admitPatient() {
    const fname = document.getElementById('f-fname').value.trim();
    const lname = document.getElementById('f-lname').value.trim();
    const cnic = document.getElementById('f-cnic').value.trim();
    const guardian = document.getElementById('f-guardian').value.trim();
    const gcnic = document.getElementById('f-gcnic').value.trim();
    const gphone = document.getElementById('f-gphone').value.trim();
    const room = document.getElementById('f-room').value.trim();
    const ward = document.getElementById('f-ward').value;
    const reason = document.getElementById('f-reason').value.trim();

    if (!fname || !lname || !room || !ward || !reason || !cnic || !guardian || !gcnic || !gphone) {
        showToast('Please fill all required fields (*)', 'error');
        return;
    }

    const p = {
        id: 'MC-' + Date.now().toString().slice(-6),
        firstName: fname,
        lastName: lname,
        cnic: cnic,
        dob: document.getElementById('f-dob').value,
        gender: document.getElementById('f-gender').value,
        blood: document.getElementById('f-blood').value,
        phone: document.getElementById('f-phone').value,
        email: document.getElementById('f-email').value,
        address: document.getElementById('f-address').value,
        guardian: guardian,
        grel: document.getElementById('f-grel').value,
        gcnic: gcnic,
        gphone: gphone,
        gemail: document.getElementById('f-gemail').value,
        gaddress: document.getElementById('f-gaddress').value,
        ward: ward,
        room: room,
        doctor: document.getElementById('f-doctor').value,
        priority: document.getElementById('f-priority').value,
        insurance: document.getElementById('f-insurance').value,
        reason: reason,
        meds: document.getElementById('f-meds').value,
        admitted: new Date().toISOString()
    };

    patients.push(p);
    savePatients();
    updateBadges();

    messages.push({
        id: 'MSG-' + Date.now(),
        from: `${guardian} (Guardian — ${p.id})`,
        patient: `Patient: ${fname} ${lname}`,
        body: `Patient ${fname} ${lname} has been admitted. Guardian ${guardian} (${gphone}) is on-site. Please keep us updated.`,
        time: new Date().toISOString(),
        read: false
    });
    saveMessages();
    updateMsgDot();

    showToast(`${fname} ${lname} admitted successfully!`, 'success');
    clearAdmitForm();
    showPage('patients', null);
}

function clearAdmitForm() {
    ['f-fname', 'f-lname', 'f-dob', 'f-cnic', 'f-phone', 'f-email', 'f-address', 'f-ecname', 'f-ecphone', 'f-room', 'f-reason', 'f-meds', 'f-insurance', 'f-guardian', 'f-gcnic', 'f-gphone', 'f-gemail', 'f-gaddress']
        .forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
    ['f-gender', 'f-blood', 'f-ward', 'f-doctor', 'f-priority', 'f-grel'].forEach(id => { const el = document.getElementById(id); if (el) el.selectedIndex = 0; });
}

// ═══════════════════ PATIENT TABLE ═══════════════════
function renderPatientsTable() {
    const q = (document.getElementById('patSearch')?.value || '').toLowerCase();
    const fw = (document.getElementById('patFilterWard')?.value || '');
    const fs = (document.getElementById('patFilterStatus')?.value || '');
    const filtered = patients.filter(p => {
        const name = `${p.firstName} ${p.lastName}`.toLowerCase();
        const id = p.id.toLowerCase();
        const cnic = (p.cnic || '').toLowerCase();
        return (!q || (name.includes(q) || id.includes(q) || cnic.includes(q))) && (!fw || p.ward === fw) && (!fs || p.priority === fs);
    });
    const label = document.getElementById('patCountLabel');
    if (label) label.textContent = `${filtered.length} patient${filtered.length !== 1 ? 's' : ''} found`;
    const tbody = document.getElementById('patientTable');
    if (!tbody) return;
    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><i class="ti ti-users"></i><p>No patients found.</p></div></td></tr>`; return;
    }
    const priorityClass = { Stable: 'pill-green', Moderate: 'pill-blue', Critical: 'pill-amber', Emergency: 'pill-red' };
    tbody.innerHTML = filtered.map(p => {
        const d = p.admitted ? new Date(p.admitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
        return `<tr>
            <td><div style="display:flex;align-items:center;gap:10px;"><div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--blue));display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;color:#fff;flex-shrink:0;">${(p.firstName[0] || '') + (p.lastName[0] || '')}</div><div><p style="font-weight:500;font-size:14px;color:var(--text-primary);">${p.firstName} ${p.lastName}</p><p style="font-size:11px;color:var(--text-muted);">${p.gender || '—'}</p></div></div></td>
            <td style="font-family:monospace;color:var(--teal);font-size:13px;">${p.id}</td>
            <td style="font-size:12px;font-family:monospace;">${p.cnic || '—'}</td>
            <td>${p.ward || '—'}</td>
            <td>${p.room}</td>
            <td>${p.doctor || 'Unassigned'}</td>
            <td><span class="pill ${priorityClass[p.priority] || 'pill-blue'}">${p.priority || '—'}</span></td>
            <td style="font-size:12px;color:var(--text-muted);">${d}</td>
            <td><div style="display:flex;gap:6px;"><button class="btn btn-secondary btn-xs" onclick="viewPatient('${p.id}')"><i class="ti ti-eye"></i></button><button class="btn btn-danger btn-xs" onclick="deletePatient('${p.id}')"><i class="ti ti-trash"></i></button></div></td>
        </tr>`;
    }).join('');
}

function viewPatient(id) {
    const p = patients.find(x => x.id === id);
    if (!p) return;
    const ini = (p.firstName[0] || '') + (p.lastName[0] || '');
    document.getElementById('modalAvatar').textContent = ini;
    document.getElementById('modalName').textContent = `${p.firstName} ${p.lastName}`;
    document.getElementById('modalWardRoom').textContent = `${p.ward || '—'} · Room ${p.room}`;
    document.getElementById('modalId').textContent = p.id;
    document.getElementById('mDob').textContent = p.dob || '—';
    document.getElementById('mGender').textContent = p.gender || '—';
    document.getElementById('mBlood').textContent = p.blood || '—';
    document.getElementById('mCnic').textContent = p.cnic || '—';
    document.getElementById('mPhone').textContent = p.phone || '—';
    document.getElementById('mInsurance').textContent = p.insurance || '—';
    document.getElementById('mGuardian').textContent = p.guardian || '—';
    document.getElementById('mGrel').textContent = p.grel || '—';
    document.getElementById('mGcnic').textContent = p.gcnic || '—';
    document.getElementById('mGphone').textContent = p.gphone || '—';
    document.getElementById('mGemail').textContent = p.gemail || '—';
    document.getElementById('mGaddress').textContent = p.gaddress || '—';
    const d = p.admitted ? new Date(p.admitted).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—';
    document.getElementById('mAdmitted').textContent = d;
    document.getElementById('mDoctor').textContent = p.doctor || 'Unassigned';
    document.getElementById('mWardRoom2').textContent = `${p.ward || '—'} / Room ${p.room}`;
    document.getElementById('mReason').textContent = p.reason || '—';
    document.getElementById('mMeds').textContent = p.meds || 'None listed';
    const pClass = { Stable: 'pill-green', Moderate: 'pill-blue', Critical: 'pill-amber', Emergency: 'pill-red' };
    const pill = document.getElementById('modalStatusPill');
    pill.textContent = p.priority || '—'; pill.className = `pill ${pClass[p.priority] || 'pill-blue'}`;
    document.getElementById('modalDeleteBtn').onclick = () => { deletePatient(id); closeModal('reportModal'); };
    document.getElementById('reportModal').classList.add('open');
}

function deletePatient(id) {
    if (!confirm('Discharge and permanently delete this patient record?')) return;
    patients = patients.filter(p => p.id !== id);
    savePatients(); updateBadges(); renderPatientsTable(); renderDashboard();
    showToast('Patient record deleted', 'info');
}

// ═══════════════════ DASHBOARD ═══════════════════
function renderDashboard() {
    document.getElementById('dash-total').textContent = patients.length;
    const today = new Date().toDateString();
    const todayCount = patients.filter(p => new Date(p.admitted).toDateString() === today).length;
    document.getElementById('dash-today').textContent = todayCount;
    const occupied = Math.min(patients.length + 8, 60);
    document.getElementById('dash-rooms').textContent = occupied;
    document.getElementById('dash-appts').textContent = appointments.length;
    const priorityClass = { Stable: 'pill-green', Moderate: 'pill-blue', Critical: 'pill-amber', Emergency: 'pill-red' };
    const recent = [...patients].sort((a, b) => new Date(b.admitted) - new Date(a.admitted)).slice(0, 5);
    const tbody = document.getElementById('dashRecentTable');
    if (!tbody) return;
    if (patients.length === 0) { tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><i class="ti ti-users"></i><p>No patients yet. <a href="#" onclick="showPage('admit',document.querySelector('[onclick*=admit]'));return false;" style="color:var(--teal)">Admit your first patient.</a></p></div></td></tr>`; return; }
    tbody.innerHTML = recent.map(p => {
        const d = new Date(p.admitted).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        return `<tr>
            <td><div style="display:flex;align-items:center;gap:10px;"><div style="width:30px;height:30px;border-radius:50%;background:linear-gradient(135deg,var(--teal),var(--blue));display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;color:#fff;">${p.firstName[0]}${p.lastName[0]}</div><span style="font-weight:500;">${p.firstName} ${p.lastName}</span></div></td>
            <td style="font-family:monospace;color:var(--teal);font-size:12px;">${p.id}</td>
            <td>${p.ward || '—'} / ${p.room}</td>
            <td style="font-size:12px;color:var(--text-muted);">${d}</td>
            <td><span class="pill ${priorityClass[p.priority] || 'pill-blue'}">${p.priority || '—'}</span></td>
            <td style="font-size:13px;">${p.doctor || '—'}</td>
            <td><button class="btn btn-secondary btn-xs" onclick="viewPatient('${p.id}')"><i class="ti ti-eye"></i> View</button></td>
        </tr>`;
    }).join('');
}

// ═══════════════════ WARD GRID ═══════════════════
const roomStatuses = {};
function renderWardGrid() {
    const grid = document.getElementById('wardGrid');
    if (!grid) return;
    const occupiedRooms = new Set(patients.map(p => p.room));
    const maintenance = new Set(['108', '215', '302', '418']);
    let html = ''; let occupied = 0;
    for (let f = 1; f <= 3; f++) {
        for (let r = 1; r <= 20; r++) {
            const num = `${f}${String(r).padStart(2, '0')}`;
            let cls = 'available', label = 'Free';
            if (maintenance.has(num)) { cls = 'maintenance'; label = 'Maint.'; }
            else if (occupiedRooms.has(num) || roomStatuses[num] === 'occupied') { cls = 'occupied'; label = 'In Use'; occupied++; }
            html += `<div class="room ${cls}" onclick="toggleRoom('${num}')"><span class="room-num">${num}</span>${label}</div>`;
        }
    }
    grid.innerHTML = html;
    const el = document.getElementById('wardOccupied');
    if (el) el.textContent = occupied;
    document.getElementById('wardAvailable').textContent = 60 - occupied - 4;
}
function toggleRoom(num) { roomStatuses[num] = roomStatuses[num] === 'occupied' ? '' : 'occupied'; renderWardGrid(); }

// ═══════════════════ BADGES ═══════════════════
function updateBadges() {
    const badge = document.getElementById('patientCountBadge');
    if (badge) { badge.textContent = patients.length; badge.style.display = patients.length ? '' : 'none'; }
    const ab = document.getElementById('apptBadge');
    if (ab) { ab.textContent = appointments.length; ab.style.display = appointments.length ? '' : 'none'; }
    updateMsgDot();
}

// ═══════════════════ SEARCH ═══════════════════
function handleGlobalSearch() {
    const q = document.getElementById('globalSearch').value.trim();
    if (!q) return;
    showPage('patients', null);
    setTimeout(() => { const el = document.getElementById('patSearch'); if (el) { el.value = q; renderPatientsTable(); } }, 50);
}

// ═══════════════════ MODAL ═══════════════════
function closeModal(id) { document.getElementById(id).classList.remove('open'); }
document.getElementById('reportModal').addEventListener('click', function (e) { if (e.target === this) closeModal('reportModal'); });
document.getElementById('staffModal').addEventListener('click', function (e) { if (e.target === this) closeModal('staffModal'); });

// ═══════════════════ CONFIRM CLEAR ═══════════════════
function confirmClearData() {
    if (confirm('Are you absolutely sure? This will delete ALL patient records permanently.')) {
        patients = []; savePatients(); updateBadges(); renderDashboard(); showToast('All patient data cleared', 'info');
    }
}

// ═══════════════════ CHARTS ═══════════════════
let chartsRendered = false;
function renderCharts() {
    if (chartsRendered) return; chartsRendered = true;
    const gridColor = getComputedStyle(document.documentElement).getPropertyValue('--border').trim() || 'rgba(255,255,255,0.05)';
    const labelColor = getComputedStyle(document.documentElement).getPropertyValue('--text-muted').trim() || 'rgba(140,165,210,0.7)';
    const defaultOpts = { responsive: true, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gridColor }, ticks: { color: labelColor } }, y: { grid: { color: gridColor }, ticks: { color: labelColor } } } };
    const ctx1 = document.getElementById('admissionsChart');
    if (ctx1) new Chart(ctx1, { type: 'bar', data: { labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'], datasets: [{ label: 'Admissions', data: [142, 158, 130, 165, 178, 192, 155, 168, 174, 190, 210, 230], backgroundColor: 'rgba(0,198,207,0.3)', borderColor: 'rgba(0,198,207,0.8)', borderWidth: 1.5, borderRadius: 5 }] }, options: { ...defaultOpts } });
    const ctx2 = document.getElementById('deptChart');
    if (ctx2) new Chart(ctx2, { type: 'doughnut', data: { labels: ['Emergency', 'Cardiology', 'Neurology', 'Oncology', 'Surgery', 'General'], datasets: [{ data: [22, 18, 15, 12, 10, 23], backgroundColor: ['rgba(239,68,68,0.75)', 'rgba(0,198,207,0.75)', 'rgba(58,142,246,0.75)', 'rgba(139,92,246,0.75)', 'rgba(245,166,35,0.75)', 'rgba(34,197,94,0.75)'], borderWidth: 0 }] }, options: { responsive: true, plugins: { legend: { position: 'bottom', labels: { color: labelColor, padding: 12, font: { size: 12 } } } } } });
}

    
// === Added helpers and robust admit handlers ===
function elVal(id) {
  const el = document.getElementById(id);
  return el ? (el.value || '').trim() : '';
}

function clearAdmitForm() {
  const ids = ['f-fname','f-lname','f-dob','f-cnic','f-phone','f-email','f-address','f-ecname','f-ecphone','f-room','f-reason','f-meds','f-insurance','f-guardian','f-gcnic','f-gphone','f-gemail','f-gaddress','f-gender','f-blood','f-ward','f-doctor','f-priority','f-grel'];
  ids.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (typeof el.selectedIndex !== 'undefined') el.selectedIndex = 0;
    else el.value = '';
  });
}

function admitPatient() {
  try {
    const fname = elVal('f-fname'), lname = elVal('f-lname');
    const cnic = elVal('f-cnic'), guardian = elVal('f-guardian'), gcnic = elVal('f-gcnic'), gphone = elVal('f-gphone');
    const room = elVal('f-room'), ward = elVal('f-ward'), reason = elVal('f-reason');
    if (!fname || !lname || !room || !ward || !reason || !cnic || !guardian || !gcnic || !gphone) {
      showToast('Please fill all required fields (*)', 'error');
      return;
    }
    const p = {
      id: 'MC-' + Date.now().toString().slice(-6),
      firstName: fname, lastName: lname, cnic: cnic, dob: elVal('f-dob'), gender: elVal('f-gender'),
      blood: elVal('f-blood'), phone: elVal('f-phone'), email: elVal('f-email'), address: elVal('f-address'),
      guardian: guardian, grel: elVal('f-grel'), gcnic: gcnic, gphone: gphone, gemail: elVal('f-gemail'), gaddress: elVal('f-gaddress'),
      ward: ward, room: room, doctor: elVal('f-doctor'), priority: elVal('f-priority'), insurance: elVal('f-insurance'),
      reason: reason, meds: elVal('f-meds'), admitted: new Date().toISOString()
    };
    patients.push(p);
    savePatients();
    messages.push({ id: 'MSG-' + Date.now(), from: guardian + ' (Guardian — ' + p.id + ')', patient: 'Patient: ' + fname + ' ' + lname, body: 'Patient ' + fname + ' ' + lname + ' has been admitted. Guardian ' + guardian + ' (' + gphone + ') is on-site.', time: new Date().toISOString(), read: false });
    saveMessages(); updateMsgDot();
    showToast(fname + ' ' + lname + ' admitted successfully!', 'success');
    clearAdmitForm();
    showPage('patients', null);
  } catch (err) {
    console.error('admitPatient error', err);
    showToast('An unexpected error occurred. See console for details.', 'error');
  }
}

// Attach the admit form submit handler and clear button after DOM ready
(function() {
  document.addEventListener('DOMContentLoaded', function() {
    const admitForm = document.getElementById('admitForm');
    if (admitForm) {
      admitForm.addEventListener('submit', function(e) { e.preventDefault(); admitPatient(); });
    }
    const clearBtn = document.getElementById('admitClearBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearAdmitForm);
  });
})();

// Sanitize auth messages
(function(){
  const origShowAuthError = window.showAuthError;
  if (typeof origShowAuthError === 'function') {
    window.showAuthError = function(msg, redirect=false) {
      let el = document.getElementById('authError');
      if (!el) { el = document.createElement('div'); el.id = 'authError'; el.style.cssText = 'background:var(--red-dim);border:1px solid rgba(239,68,68,0.3);border-radius:9px;padding:12px 16px;font-size:13px;color:var(--red);margin-bottom:14px;'; const target=document.querySelector('.auth-form.active'); if (target) target.prepend(el); }
      if (window.DOMPurify) el.innerHTML = DOMPurify.sanitize(msg); else el.textContent = msg.replace(/<[^>]*>/g,'');
      if (redirect) setTimeout(()=> switchAuthTab('register'), 1200);
    }
  }
})();

// Block common devtools shortcuts and right-click (deterrent only)
(function blockDevShortcuts(){
  document.addEventListener('contextmenu', function(e){ e.preventDefault(); }, {passive:false});
  document.addEventListener('selectstart', function(e){ /* allow selection for accessibility; keep commented */ }, {passive:false});
  document.addEventListener('keydown', function(e){
    if (e.key === 'F12') { e.preventDefault(); return false; }
    if (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key.toUpperCase())) { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'U') { e.preventDefault(); return false; }
    if ((e.ctrlKey || e.metaKey) && e.key.toUpperCase() === 'S') { e.preventDefault(); return false; }
  }, {passive:false});
})();

