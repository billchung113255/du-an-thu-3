/* ============================ LMS VIEWS ============================ */
function wfStatus(s){
  const m={pending_training:['b-amber','Chờ PĐT'],pending_principal:['b-amber','Chờ HT'],approved:['b-green','Đã duyệt'],active:['b-green','Đang dạy'],open:['b-blue','Mở ĐK'],rejected:['b-danger','Từ chối']};
  const [cls,txt]=m[s]||['b-soft',s]; return `<span class="badge ${cls}">${txt}</span>`;
}
function accountRows(filterRoles){
  return STORE.users.filter(u=>!filterRoles||filterRoles.includes(u.role)).map(u=>{
    const dept=u.departmentId?STORE.dept(u.departmentId).name:'—';
    return `<tr><td>${personCell(u.name,u.email)}</td><td><span class="badge b-soft">${ROLE_LABELS[u.role]}</span></td>
      <td class="small">${dept}</td><td>${statusBadge(u.status)}</td>
      <td class="small mut">${u.createdBy?STORE.user(u.createdBy).name:'—'}</td></tr>`;
  }).join('');
}
function modalCreateAccount(allowedRoles){
  const opts=allowedRoles.map(r=>`<option value="${r}">${ROLE_LABELS[r]}</option>`).join('');
  const depts=STORE.departments.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');
  openModal(`<div class="modal-head"><h3>Tạo tài khoản</h3><button class="icon-btn" onclick="closeModal()">${ico('x')}</button></div>
  <div class="modal-body">
    <div class="field"><label>Họ và tên</label><input id="naName" placeholder="Nguyễn Văn A"/></div>
    <div class="field"><label>Email</label><input id="naEmail" type="email" placeholder="email@school.edu"/></div>
    <div class="field"><label>Vai trò</label><select id="naRole" onchange="toggleDeptField()">${opts}</select></div>
    <div class="field" id="naDeptWrap" style="display:none"><label>Bộ môn</label><select id="naDept">${depts}</select></div>
  </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Huỷ</button>
  <button class="btn btn-pri" onclick="doCreateAccount(['${allowedRoles.join("','")}'])">${ico('plus')} Tạo</button></div>`);
  toggleDeptField();
}
function toggleDeptField(){
  const r=$('#naRole')?.value; const w=$('#naDeptWrap');
  if(w) w.style.display=['hod','lecturer'].includes(r)?'block':'none';
}
function doCreateAccount(allowed){
  const role=$('#naRole').value;
  if(!allowed.includes(role)){toast('Không được phép','Vai trò này không thuộc quyền tạo của bạn.');return;}
  const name=$('#naName').value.trim()||'Người dùng mới';
  const email=$('#naEmail').value.trim()||'user@school.edu';
  const deptId=['hod','lecturer'].includes(role)?$('#naDept').value:null;
  STORE.users.push({id:'u'+Date.now(),name,email,role,departmentId:deptId,status:'active',createdBy:me().id,classIds:role==='student'?[]:undefined,subjectIds:role==='lecturer'?[]:undefined});
  closeModal(); render(); buildShell(); toast('Đã tạo tài khoản',name+' · '+ROLE_LABELS[role]);
}

/* --- ADMIN --- */
VIEWS.a_dash = ()=>{
  const s=STORE;
  return `<div class="hero" style="margin-bottom:16px"><div class="glow"></div>
    <h2>Chào ${me().name.split(' ').slice(-1)} 👋</h2>
    <p>Admin tạo tài khoản cho <b>Hiệu trưởng</b> và <b>HR</b>. Các vai trò khác do HR quản lý.</p>
    <div class="stat-row">
      <div class="st"><div class="v">${s.users.length}</div><div class="l">Tài khoản</div></div>
      <div class="st"><div class="v">${s.subjects.filter(x=>x.status==='active').length}</div><div class="l">Môn học</div></div>
      <div class="st"><div class="v">${s.classes.length}</div><div class="l">Lớp học</div></div>
      <div class="st"><div class="v">${s.usersByRole('student').length}</div><div class="l">Sinh viên</div></div>
    </div></div>
    <div class="card tcard"><div class="sec-head" style="padding:15px 18px 0"><h3>Quy trình nghiệp vụ</h3></div>
    <div class="pad" style="padding:18px">
      <div class="workflow-step" style="margin-bottom:10px"><span class="dot done"></span> Admin → tạo HR, Hiệu trưởng</div>
      <div class="workflow-step" style="margin-bottom:10px"><span class="dot done"></span> HR → tạo Phòng ĐT, Trưởng BM, GV, SV</div>
      <div class="workflow-step" style="margin-bottom:10px"><span class="dot cur"></span> PĐT đề xuất môn → HT duyệt</div>
      <div class="workflow-step" style="margin-bottom:10px"><span class="dot"></span> Trưởng BM đề xuất số lớp → PĐT duyệt → tạo lớp</div>
      <div class="workflow-step"><span class="dot"></span> SV đăng ký lớp (cạnh tranh chỗ) → GV tạo bài kiểm tra</div>
    </div></div>`;
};
VIEWS.a_accounts = ()=>`
  <div class="row between vcenter" style="margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <p class="muted small">Admin chỉ tạo tài khoản <b>Hiệu trưởng</b> và <b>HR</b>.</p>
    <button class="btn btn-pri btn-sm" onclick="modalCreateAccount(['principal','hr'])">${ico('plus')} Tạo tài khoản</button>
  </div>
  <div class="card tcard"><table class="tbl"><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Bộ môn</th><th>Trạng thái</th><th>Tạo bởi</th></tr></thead>
  <tbody>${accountRows(['admin','principal','hr'])}</tbody></table></div>`;

/* --- HR --- */
VIEWS.hr_dash = ()=>{
  const roles=['training','hod','lecturer','student'];
  return `<div class="grid g-4" style="margin-bottom:16px">
    ${roles.map(r=>kpi('user',ROLE_LABELS[r],STORE.usersByRole(r).length,'',null)).join('')}
  </div>
  <div class="card pad"><div class="sec-head"><h3>Nhiệm vụ HR</h3></div>
  <p class="small muted">Tạo và phân quyền tài khoản cho: <b>Phòng đào tạo</b>, <b>Trưởng bộ môn</b>, <b>Giảng viên</b>, <b>Sinh viên</b>.</p></div>`;
};
VIEWS.hr_accounts = ()=>`
  <div class="row between vcenter" style="margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <p class="muted small">HR tạo tài khoản cho Phòng ĐT, Trưởng BM, Giảng viên, Sinh viên.</p>
    <button class="btn btn-pri btn-sm" onclick="modalCreateAccount(['training','hod','lecturer','student'])">${ico('plus')} Tạo tài khoản</button>
  </div>
  <div class="card tcard"><table class="tbl"><thead><tr><th>Người dùng</th><th>Vai trò</th><th>Bộ môn</th><th>Trạng thái</th><th>Tạo bởi</th></tr></thead>
  <tbody>${accountRows(['training','hod','lecturer','student'])}</tbody></table></div>`;

/* --- PRINCIPAL --- */
VIEWS.pr_dash = ()=>{
  const pending=STORE.subjects.filter(s=>s.status==='pending_principal');
  return `<div class="hero" style="margin-bottom:16px"><div class="glow"></div>
    <h2>Hiệu trưởng</h2><p>Phê duyệt môn học mới do Phòng đào tạo đề xuất.</p>
    <div class="stat-row"><div class="st"><div class="v">${pending.length}</div><div class="l">Chờ duyệt</div></div>
    <div class="st"><div class="v">${STORE.subjects.filter(s=>s.status==='active').length}</div><div class="l">Môn đang dạy</div></div></div></div>
    ${pending.length?`<div class="card pad"><div class="sec-head"><h3>Cần phê duyệt</h3><a class="link" onclick="go('pr_subjects')">Xem tất cả ${svg(I.arr,'currentColor',14)}</a></div>
    ${pending.map(s=>`<div class="lrow"><div class="meta"><b>${s.name}</b><span>${s.code} · ${s.credits} TC · ${STORE.dept(s.departmentId).name}</span></div>
    <button class="btn btn-gold btn-sm" onclick="approveSubject('${s.id}')">${ico('check')} Duyệt</button></div>`).join('')}</div>`:''}`;
};
VIEWS.pr_subjects = ()=>{
  const pending=STORE.subjects.filter(s=>s.status==='pending_principal');
  const active=STORE.subjects.filter(s=>s.status==='active');
  return `<p class="muted small" style="margin-bottom:16px">Phòng đào tạo đề xuất môn mới → Hiệu trưởng phê duyệt → đưa vào chương trình.</p>
  ${pending.length?`<div class="card tcard" style="margin-bottom:16px"><div class="sec-head" style="padding:15px 18px 0"><h3>Chờ phê duyệt (${pending.length})</h3></div>
  <table class="tbl"><thead><tr><th>Môn học</th><th>Mã</th><th>TC</th><th>Bộ môn</th><th>Đề xuất bởi</th><th></th></tr></thead><tbody>
  ${pending.map(s=>`<tr><td><b>${s.name}</b></td><td class="small">${s.code}</td><td>${s.credits}</td><td class="small">${STORE.dept(s.departmentId).name}</td>
  <td class="small">${STORE.user(s.proposedBy).name}</td>
  <td><button class="btn btn-gold btn-sm" onclick="approveSubject('${s.id}')">${ico('check')} Duyệt</button></td></tr>`).join('')}
  </tbody></table></div>`:''}
  <div class="card tcard"><div class="sec-head" style="padding:15px 18px 0"><h3>Môn đã duyệt</h3></div>
  <table class="tbl"><thead><tr><th>Môn học</th><th>Mã</th><th>TC</th><th>Bộ môn</th><th>Trạng thái</th></tr></thead><tbody>
  ${active.map(s=>`<tr><td><b>${s.name}</b></td><td class="small">${s.code}</td><td>${s.credits}</td><td class="small">${STORE.dept(s.departmentId).name}</td><td>${wfStatus('active')}</td></tr>`).join('')}
  </tbody></table></div>`;
};
function approveSubject(id){
  const s=STORE.subject(id); s.status='active';
  STORE.notifications.push({id:'n'+Date.now(),userId:'u4',text:`Môn ${s.name} đã được Hiệu trưởng phê duyệt.`,when:'Vừa xong',read:false});
  render(); buildShell(); toast('Đã phê duyệt',s.name+' đã vào chương trình đào tạo.');
}

/* --- TRAINING DEPT --- */
VIEWS.tr_dash = ()=>{
  const cp=STORE.classProposals.filter(p=>p.status==='pending_training').length;
  return `<div class="grid g-3" style="margin-bottom:16px">
    ${kpi('book','Môn học',STORE.subjects.length,'',null)}
    ${kpi('cap','Lớp học',STORE.classes.length,'',null)}
    ${kpi('doc','Đề xuất chờ',cp,'',null)}
  </div>
  <div class="card pad"><p class="small muted">Đề xuất môn mới gửi Hiệu trưởng · Duyệt đề xuất lớp từ Trưởng BM · Tạo lớp và gán Trưởng BM quản lý.</p></div>`;
};
VIEWS.tr_subjects = ()=>`
  <div class="row between vcenter" style="margin-bottom:16px"><p class="muted small">Đề xuất môn học mới gửi Hiệu trưởng phê duyệt.</p>
  <button class="btn btn-pri btn-sm" onclick="modalProposeSubject()">${ico('plus')} Đề xuất môn mới</button></div>
  <div class="card tcard"><table class="tbl"><thead><tr><th>Môn học</th><th>Mã</th><th>TC</th><th>Bộ môn</th><th>Trạng thái</th></tr></thead><tbody>
  ${STORE.subjects.map(s=>`<tr><td><b>${s.name}</b></td><td class="small">${s.code}</td><td>${s.credits}</td><td class="small">${STORE.dept(s.departmentId).name}</td><td>${wfStatus(s.status)}</td></tr>`).join('')}
  </tbody></table></div>`;
function modalProposeSubject(){
  const depts=STORE.departments.map(d=>`<option value="${d.id}">${d.name}</option>`).join('');
  openModal(`<div class="modal-head"><h3>Đề xuất môn học mới</h3><button class="icon-btn" onclick="closeModal()">${ico('x')}</button></div>
  <div class="modal-body">
    <div class="field"><label>Tên môn</label><input id="psName" placeholder="VD: Blockchain cơ bản"/></div>
    <div class="row" style="gap:12px"><div class="field" style="flex:1"><label>Mã môn</label><input id="psCode" placeholder="BCT201"/></div>
    <div class="field" style="flex:1"><label>Số TC</label><input id="psCr" type="number" value="3"/></div></div>
    <div class="field"><label>Bộ môn</label><select id="psDept">${depts}</select></div>
  </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Huỷ</button>
  <button class="btn btn-pri" onclick="doProposeSubject()">${ico('check')} Gửi Hiệu trưởng</button></div>`);
}
function doProposeSubject(){
  const name=$('#psName').value.trim()||'Môn mới';
  STORE.subjects.push({id:'sub'+Date.now(),name,code:$('#psCode').value||'NEW101',credits:+$('#psCr').value||3,departmentId:$('#psDept').value,status:'pending_principal',proposedBy:me().id});
  STORE.notifications.push({id:'n'+Date.now(),userId:'u3',text:`Môn ${name} chờ Hiệu trưởng phê duyệt.`,when:'Vừa xong',read:false});
  closeModal(); render(); buildShell(); toast('Đã gửi đề xuất',name+' → chờ Hiệu trưởng duyệt.');
}
VIEWS.tr_proposals = ()=>{
  const pending=STORE.classProposals.filter(p=>p.status==='pending_training');
  const sp=STORE.subjectProposals.filter(p=>p.status==='pending_training');
  return `<p class="muted small" style="margin-bottom:16px">Trưởng bộ môn đề xuất số lớp → Phòng đào tạo duyệt → tạo lớp.</p>
  ${sp.length?`<div class="card pad" style="margin-bottom:16px"><div class="sec-head"><h3>Đề xuất môn từ Trưởng BM</h3></div>
  ${sp.map(p=>`<div class="lrow"><div class="meta"><b>${p.name}</b><span>${p.code} · ${STORE.dept(p.departmentId).name} · ${STORE.user(p.proposedBy).name}</span></div>
  <button class="btn btn-pri btn-sm" onclick="forwardSubjectProposal('${p.id}')">${ico('arr')} Gửi HT</button></div>`).join('')}</div>`:''}
  <div class="card tcard"><div class="sec-head" style="padding:15px 18px 0"><h3>Đề xuất mở lớp</h3></div>
  <table class="tbl"><thead><tr><th>Môn</th><th>Số lớp</th><th>Đề xuất bởi</th><th>Trạng thái</th><th></th></tr></thead><tbody>
  ${STORE.classProposals.map(p=>{const sub=STORE.subject(p.subjectId);
    return `<tr><td><b>${sub.name}</b></td><td>${p.count}</td><td class="small">${STORE.user(p.proposedBy).name}</td><td>${wfStatus(p.status)}</td>
    <td>${p.status==='pending_training'?`<button class="btn btn-gold btn-sm" onclick="approveClassProposal('${p.id}')">${ico('check')} Duyệt & tạo lớp</button>`:'—'}</td></tr>`;}).join('')}
  </tbody></table></div>`;
};
function forwardSubjectProposal(id){
  const p=STORE.subjectProposals.find(x=>x.id===id);
  STORE.subjects.push({id:'sub'+Date.now(),name:p.name,code:p.code,credits:p.credits,departmentId:p.departmentId,status:'pending_principal',proposedBy:me().id});
  p.status='forwarded';
  STORE.notifications.push({id:'n'+Date.now(),userId:'u3',text:`Môn ${p.name} (từ Trưởng BM) chờ phê duyệt.`,when:'Vừa xong',read:false});
  render(); toast('Đã chuyển','Gửi Hiệu trưởng phê duyệt môn '+p.name);
}
function approveClassProposal(id){
  const p=STORE.classProposals.find(x=>x.id===id);
  const sub=STORE.subject(p.subjectId);
  const hod=STORE.user(p.proposedBy);
  for(let i=1;i<=p.count;i++){
    const suffix=String.fromCharCode(64+i);
    STORE.classes.push({id:'c'+Date.now()+i,subjectId:p.subjectId,name:sub.code+'-'+suffix,capacity:30,studentIds:[],schedule:'TBD',room:'TBD',managerId:hod.id,lecturerIds:[],status:'open'});
  }
  p.status='approved';
  STORE.notifications.push({id:'n'+Date.now(),userId:hod.id,text:`Đã tạo ${p.count} lớp ${sub.name}.`,when:'Vừa xong',read:false});
  ['u7','u8'].forEach(uid=>STORE.notifications.push({id:'n'+Date.now()+uid,userId:uid,text:`Lớp ${sub.name} mở đăng ký!`,when:'Vừa xong',read:false}));
  render(); buildShell(); toast('Đã tạo lớp',p.count+' lớp '+sub.name+' — Trưởng BM '+hod.name+' quản lý.');
}
VIEWS.tr_classes = ()=>{
  return `<div class="card tcard"><table class="tbl"><thead><tr><th>Lớp</th><th>Môn</th><th>Lịch</th><th>Phòng</th><th>SV</th><th>Chỗ trống</th><th>Quản lý</th></tr></thead><tbody>
  ${STORE.classes.map(c=>{const sub=STORE.subject(c.subjectId),mgr=STORE.user(c.managerId);
    return `<tr><td><b>${c.name}</b></td><td class="small">${sub.name}</td><td class="small mut">${c.schedule}</td><td class="small">${c.room}</td>
    <td>${c.studentIds.length}/${c.capacity}</td><td><span class="badge ${STORE.classSlots(c)?'b-blue':'b-danger'}">${STORE.classSlots(c)}</span></td>
    <td class="small">${mgr.name}</td></tr>`;}).join('')}
  </tbody></table></div>`;
};

/* --- HEAD OF DEPT --- */
function hodDeptClasses(){ return STORE.classes.filter(c=>c.managerId===me().id); }
VIEWS.hod_dash = ()=>{
  const cls=hodDeptClasses();
  return `<div class="grid g-3" style="margin-bottom:16px">
    ${kpi('cap','Lớp bộ môn',cls.length,'',null)}
    ${kpi('users','Giảng viên',STORE.users.filter(u=>u.role==='lecturer'&&u.departmentId===me().departmentId).length,'',null)}
    ${kpi('book','Môn học',STORE.subjects.filter(s=>s.departmentId===me().departmentId).length,'',null)}
  </div>`;
};
VIEWS.hod_propose = ()=>{
  const subs=STORE.subjects.filter(s=>s.departmentId===me().departmentId&&s.status==='active');
  const subOpts=subs.map(s=>`<option value="${s.id}">${s.name}</option>`).join('');
  return `<div class="grid g-2">
    <div class="card pad"><div class="sec-head"><h3>Đề xuất số lớp</h3></div>
    <p class="small muted" style="margin-bottom:14px">Môn có sẵn: đề xuất số lớp → PĐT duyệt → PĐT tạo lớp.</p>
    <div class="field"><label>Môn học</label><select id="hcpSub">${subOpts}</select></div>
    <div class="field"><label>Số lớp cần mở</label><input id="hcpCnt" type="number" value="1" min="1" max="5"/></div>
    <button class="btn btn-pri btn-block" onclick="doProposeClass()">${ico('plus')} Gửi Phòng đào tạo</button></div>
    <div class="card pad"><div class="sec-head"><h3>Đề xuất môn mới</h3></div>
    <p class="small muted" style="margin-bottom:14px">Môn mới: đề xuất → PĐT → Hiệu trưởng duyệt.</p>
    <div class="field"><label>Tên môn</label><input id="hspName" placeholder="Machine Learning"/></div>
    <div class="field"><label>Mã môn</label><input id="hspCode" placeholder="ML301"/></div>
    <button class="btn btn-gold btn-block" onclick="doHodProposeSubject()">${ico('arr')} Gửi Phòng đào tạo</button></div>
  </div>`;
};
function doProposeClass(){
  const subjectId=$('#hcpSub').value, count=+$('#hcpCnt').value||1;
  STORE.classProposals.push({id:'cp'+Date.now(),subjectId,count,proposedBy:me().id,status:'pending_training'});
  STORE.notifications.push({id:'n'+Date.now(),userId:'u4',text:`Đề xuất ${count} lớp ${STORE.subject(subjectId).name}.`,when:'Vừa xong',read:false});
  render(); buildShell(); toast('Đã gửi đề xuất',count+' lớp → chờ Phòng đào tạo duyệt.');
}
function doHodProposeSubject(){
  const name=$('#hspName').value.trim()||'Môn mới';
  STORE.subjectProposals.push({id:'sp'+Date.now(),name,code:$('#hspCode').value||'NEW',credits:3,departmentId:me().departmentId,proposedBy:me().id,status:'pending_training'});
  STORE.notifications.push({id:'n'+Date.now(),userId:'u4',text:`Trưởng BM đề xuất môn ${name}.`,when:'Vừa xong',read:false});
  render(); toast('Đã gửi','Đề xuất môn '+name+' → Phòng đào tạo.');
}
VIEWS.hod_lecturers = ()=>{
  const lecs=STORE.users.filter(u=>u.role==='lecturer'&&u.departmentId===me().departmentId);
  const subs=STORE.subjects.filter(s=>s.departmentId===me().departmentId&&s.status==='active');
  return `<p class="muted small" style="margin-bottom:16px">Thêm giảng viên vào môn — GV được quyền quản lý môn đó.</p>
  <div class="grid g-2">${lecs.map(l=>{
    const assigned=(l.subjectIds||[]).map(id=>STORE.subject(id)?.name).filter(Boolean).join(', ')||'Chưa phân công';
    return `<div class="card pad"><div class="row vcenter" style="gap:11px;margin-bottom:12px"><span class="av gd m">${initials(l.name)}</span>
    <div><div style="font-weight:600">${l.name}</div><div class="tiny mut">${l.email}</div></div></div>
    <div class="tiny mut2" style="margin-bottom:10px">Môn: <b>${assigned}</b></div>
  <div class="tagrow">${subs.map(s=>{
    const on=(l.subjectIds||[]).includes(s.id);
    return `<button class="chip ${on?'on':''}" onclick="toggleLecturerSubject('${l.id}','${s.id}')">${s.name}</button>`;
  }).join('')}</div></div>`;}).join('')}</div>`;
};
function toggleLecturerSubject(lid,sid){
  const l=STORE.user(lid); if(!l.subjectIds) l.subjectIds=[];
  const i=l.subjectIds.indexOf(sid);
  if(i>=0) l.subjectIds.splice(i,1); else l.subjectIds.push(sid);
  const c=STORE.classes.find(x=>x.subjectId===sid&&x.managerId===me().id);
  if(c&&!c.lecturerIds.includes(lid)&&i<0) c.lecturerIds.push(lid);
  render(); toast('Đã cập nhật',l.name+' — môn '+STORE.subject(sid).name);
}
VIEWS.hod_classes = ()=>{
  const cls=hodDeptClasses();
  return `<div class="card tcard"><table class="tbl"><thead><tr><th>Lớp</th><th>Môn</th><th>Giảng viên</th><th>SV</th><th>Trạng thái</th></tr></thead><tbody>
  ${cls.map(c=>{const sub=STORE.subject(c.subjectId);
    const lecs=c.lecturerIds.map(id=>STORE.user(id)?.name).join(', ')||'—';
    return `<tr><td><b>${c.name}</b></td><td class="small">${sub.name}</td><td class="small">${lecs}</td>
    <td>${c.studentIds.length}/${c.capacity}</td><td>${wfStatus(c.status)}</td></tr>`;}).join('')}
  </tbody></table></div>`;
};

/* --- LECTURER --- */
function lecClasses(){ return STORE.classes.filter(c=>(c.lecturerIds||[]).includes(me().id)); }
VIEWS.lec_dash = ()=>{
  const cls=lecClasses();
  return `<div class="hero" style="margin-bottom:16px"><div class="glow"></div>
    <h2>Chào ${me().name.split(' ').slice(-1)} 👋</h2>
    <p>Quản lý bài giảng và bài kiểm tra trong các lớp được phân công.</p>
    <div class="stat-row"><div class="st"><div class="v">${cls.length}</div><div class="l">Lớp</div></div>
    <div class="st"><div class="v">${STORE.lessons.filter(l=>cls.some(c=>c.id===l.classId)).length}</div><div class="l">Bài giảng</div></div>
    <div class="st"><div class="v">${STORE.tests.filter(t=>cls.some(c=>c.id===t.classId)).length}</div><div class="l">Bài kiểm tra</div></div></div></div>`;
};
VIEWS.lec_classes = ()=>{
  const cls=lecClasses();
  return `<div class="grid g-2">${cls.map(c=>{const sub=STORE.subject(c.subjectId);
    return `<div class="card pad"><div class="row between vcenter" style="margin-bottom:10px"><div><div style="font-weight:600;font-size:15px">${c.name}</div><div class="tiny mut">${sub.name}</div></div>${wfStatus(c.status)}</div>
    <div class="small mut">${c.schedule} · ${c.room} · ${c.studentIds.length} SV</div></div>`;}).join('')||'<div class="card pad flake">Chưa có lớp được phân công.</div>'}</div>`;
};
VIEWS.lec_content = ()=>{
  const cls=lecClasses();
  const clsOpts=cls.map(c=>`<option value="${c.id}">${c.name} · ${STORE.subject(c.subjectId).name}</option>`).join('');
  return `<div class="row between vcenter" style="margin-bottom:16px;flex-wrap:wrap;gap:10px">
    <p class="muted small">Tạo bài giảng và bài kiểm tra trong lớp được phân công.</p>
    <div class="row" style="gap:8px"><button class="btn btn-ghost btn-sm" onclick="modalAddLesson()">${ico('book')} Thêm bài giảng</button>
    <button class="btn btn-pri btn-sm" onclick="modalAddTest()">${ico('doc')} Tạo bài kiểm tra</button></div></div>
  <div class="grid g-2">
    <div class="card pad"><div class="sec-head"><h3>Bài giảng</h3></div>
    ${STORE.lessons.filter(l=>cls.some(c=>c.id===l.classId)).map(l=>`<div class="lrow"><div class="meta"><b>${l.title}</b><span>${STORE.cls(l.classId).name} · ${l.date}</span></div></div>`).join('')||'<div class="flake">Chưa có bài giảng.</div>'}</div>
    <div class="card pad"><div class="sec-head"><h3>Bài kiểm tra</h3></div>
    ${STORE.tests.filter(t=>cls.some(c=>c.id===t.classId)).map(t=>`<div class="lrow"><div class="meta"><b>${t.title}</b><span>${STORE.cls(t.classId).name} · ${t.duration} phút · ${t.questions.length} câu</span></div>${wfStatus(t.status)}</div>`).join('')||'<div class="flake">Chưa có bài kiểm tra.</div>'}</div>
  </div>
  <input type="hidden" id="lecClsOpts" value='${cls.map(c=>c.id).join(",")}'/>`;
};
function modalAddLesson(){
  const cls=lecClasses();
  openModal(`<div class="modal-head"><h3>Thêm bài giảng</h3><button class="icon-btn" onclick="closeModal()">${ico('x')}</button></div>
  <div class="modal-body">
    <div class="field"><label>Lớp</label><select id="alCls">${cls.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
    <div class="field"><label>Tiêu đề</label><input id="alTitle" placeholder="Bài 3: Kế thừa trong Java"/></div>
    <div class="field"><label>Nội dung</label><textarea id="alContent" rows="3" placeholder="Nội dung bài giảng..."></textarea></div>
  </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Huỷ</button><button class="btn btn-pri" onclick="doAddLesson()">${ico('plus')} Thêm</button></div>`);
}
function doAddLesson(){
  STORE.lessons.push({id:'les'+Date.now(),classId:$('#alCls').value,title:$('#alTitle').value||'Bài giảng mới',date:'2026-06-17',content:$('#alContent').value||'',createdBy:me().id});
  closeModal(); render(); toast('Đã thêm bài giảng','Sinh viên có thể xem trong lớp.');
}
function modalAddTest(){
  const cls=lecClasses();
  openModal(`<div class="modal-head"><h3>Tạo bài kiểm tra</h3><button class="icon-btn" onclick="closeModal()">${ico('x')}</button></div>
  <div class="modal-body">
    <div class="field"><label>Lớp</label><select id="atCls">${cls.map(c=>`<option value="${c.id}">${c.name}</option>`).join('')}</select></div>
    <div class="field"><label>Tiêu đề</label><input id="atTitle" placeholder="Kiểm tra cuối kỳ"/></div>
    <div class="field"><label>Thời gian (phút)</label><input id="atDur" type="number" value="30"/></div>
    <p class="tiny mut">Bài mẫu: 3 câu trắc nghiệm (có thể mở rộng sau).</p>
  </div><div class="modal-foot"><button class="btn btn-ghost" onclick="closeModal()">Huỷ</button><button class="btn btn-pri" onclick="doAddTest()">${ico('check')} Xuất bản</button></div>`);
}
function doAddTest(){
  STORE.tests.push({id:'tst'+Date.now(),classId:$('#atCls').value,title:$('#atTitle').value||'Bài kiểm tra',duration:+$('#atDur').value||30,
    questions:[{q:'Câu hỏi mẫu 1?',options:['A','B','C','D'],answer:0},{q:'Câu hỏi mẫu 2?',options:['A','B','C','D'],answer:1}],
    createdBy:me().id,status:'published'});
  closeModal(); render(); toast('Đã tạo bài kiểm tra','Sinh viên có thể làm bài (chế độ khóa màn hình).');
}

/* --- STUDENT --- */
function stuClasses(){ const u=me(); return STORE.classes.filter(c=>(u.classIds||[]).includes(c.id)); }
VIEWS.st_dash = ()=>{
  const notifs=STORE.myNotifs(me().id).filter(n=>!n.read);
  return `<div class="hero" style="margin-bottom:16px"><div class="glow"></div>
    <h2>Chào ${me().name.split(' ').slice(-1)} 👋</h2>
    <p>Đăng ký lớp theo thứ tự đến trước — xem thông báo lớp mở và số chỗ còn lại.</p></div>
  <div class="card pad"><div class="sec-head"><h3>Thông báo ${notifs.length?`<span class="badge b-amber">${notifs.length}</span>`:''}</h3>
  <a class="link" onclick="go('st_register')">Đăng ký lớp ${svg(I.arr,'currentColor',14)}</a></div>
  ${STORE.myNotifs(me().id).slice(0,5).map(n=>`<div class="notif-item"><span class="nd"></span><div><b style="font-size:13px">${n.text}</b><div class="tiny mut2">${n.when}</div></div></div>`).join('')||'<div class="flake">Không có thông báo.</div>'}
  </div>`;
};
VIEWS.st_register = ()=>{
  const u=me();
  const open=STORE.classes.filter(c=>c.status==='open'&&!((u.classIds||[]).includes(c.id)));
  return `<p class="muted small" style="margin-bottom:16px">Đăng ký lớp theo cơ chế <b>cạnh tranh</b> — đến trước được trước khi hết chỗ.</p>
  <div class="grid g-2">${open.map(c=>{const sub=STORE.subject(c.subjectId), slots=STORE.classSlots(c);
    return `<div class="card pad"><div class="row between vcenter" style="margin-bottom:10px"><div><div style="font-weight:600;font-size:15px">${sub.name}</div><div class="tiny mut">${c.name} · ${c.schedule}</div></div>
    <span class="badge ${slots>5?'b-green':slots>0?'b-amber':'b-danger'}">${slots} chỗ</span></div>
    <div class="small mut" style="margin-bottom:12px">Phòng ${c.room} · ${c.studentIds.length}/${c.capacity} SV</div>
    <button class="btn ${slots?'btn-gold':'btn-ghost'} btn-block btn-sm" ${slots?'':'disabled'} onclick="registerClass('${c.id}')">${ico('plus')} ${slots?'Đăng ký ngay':'Hết chỗ'}</button></div>`;
  }).join('')||'<div class="card pad flake">Không có lớp nào mở đăng ký.</div>'}</div>`;
};
function registerClass(cid){
  const c=STORE.cls(cid), u=me();
  if(STORE.classSlots(c)<=0){toast('Hết chỗ','Lớp đã đủ sinh viên.');return;}
  if((u.classIds||[]).includes(cid)){toast('Đã đăng ký','Bạn đã trong lớp này.');return;}
  c.studentIds.push(u.id); if(!u.classIds) u.classIds=[]; u.classIds.push(cid);
  render(); buildShell(); toast('Đăng ký thành công','Bạn đã được thêm vào lớp '+c.name+'.');
}
VIEWS.st_classes = ()=>{
  const cls=stuClasses();
  return `<div class="grid g-2">${cls.map(c=>{const sub=STORE.subject(c.subjectId);
    const lecs=c.lecturerIds.map(id=>STORE.user(id)?.name).join(', ');
  const less=STORE.lessons.filter(l=>l.classId===c.id);
    return `<div class="card pad"><div style="font-weight:600;font-size:15px;margin-bottom:4px">${sub.name} — ${c.name}</div>
    <div class="tiny mut" style="margin-bottom:10px">${c.schedule} · ${c.room} · GV: ${lecs||'—'}</div>
    <div class="eyebrow" style="margin-bottom:8px">Bài giảng (${less.length})</div>
    ${less.map(l=>`<div class="small" style="margin-bottom:6px">📖 ${l.title} <span class="mut2">· ${l.date}</span></div>`).join('')||'<div class="tiny mut2">Chưa có bài giảng.</div>'}
    </div>`;}).join('')||'<div class="card pad flake">Chưa đăng ký lớp nào. <a class="link" onclick="go('st_register')">Đăng ký ngay</a></div>'}</div>`;
};
VIEWS.st_tests = ()=>{
  const cls=stuClasses();
  const tests=STORE.tests.filter(t=>cls.some(c=>c.id===t.classId)&&t.status==='published');
  return `<p class="muted small" style="margin-bottom:16px">Khi làm bài, màn hình sẽ bị <b>khóa</b> — không chuyển tab hoặc cửa sổ khác.</p>
  <div class="grid g-2">${tests.map(t=>{const done=STORE.testResults.find(r=>r.testId===t.id&&r.studentId===me().id);
    const c=STORE.cls(t.classId);
    return `<div class="card pad"><div class="row between vcenter"><div><div style="font-weight:600">${t.title}</div><div class="tiny mut">${c.name} · ${t.duration} phút · ${t.questions.length} câu</div></div>
    ${done?`<span class="badge b-green">${done.score}/${done.total} điểm</span>`:`<button class="btn btn-gold btn-sm" onclick="startExam('${t.id}')">${ico('bolt')} Làm bài</button>`}</div></div>`;
  }).join('')||'<div class="card pad flake">Chưa có bài kiểm tra.</div>'}</div>`;
};

let EXAM = null;
function startExam(tid){
  const t=STORE.tests.find(x=>x.id===tid);
  EXAM={testId:tid,qi:0,answers:[],warnings:0,started:Date.now()};
  document.body.insertAdjacentHTML('beforeend',`<div class="exam-lock" id="examLock">
    <div class="eyebrow" style="color:#C9D4E4;margin-bottom:8px">CHẾ ĐỘ KIỂM TRA — MÀN HÌNH BỊ KHÓA</div>
    <h2 class="serif" style="font-size:22px;margin-bottom:4px">${t.title}</h2>
    <p class="small" style="color:#A9B6CB;margin-bottom:8px">Không được Alt+Tab hoặc chuyển cửa sổ. Vi phạm sẽ bị ghi nhận.</p>
    <div id="examWarn" class="warn" style="display:none"></div>
    <div id="examBody"></div>
  </div>`);
  if(document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(()=>{});
  document.addEventListener('visibilitychange',examVisibility);
  document.addEventListener('keydown',examKeyBlock);
  window.addEventListener('blur',examBlur);
  renderExamQ();
}
function examVisibility(){
  if(document.hidden&&EXAM){EXAM.warnings++;showExamWarn('Cảnh báo: Bạn đã rời khỏi màn hình kiểm tra! ('+EXAM.warnings+' lần)');}
}
function examBlur(){if(EXAM) showExamWarn('Cảnh báo: Không được chuyển sang cửa sổ khác!');}
function examKeyBlock(e){
  if(!EXAM) return;
  if(e.altKey&&(e.key==='Tab'||e.key==='F4')){e.preventDefault();showExamWarn('Alt+Tab bị chặn trong lúc làm bài!');}
}
function showExamWarn(msg){const w=$('#examWarn');if(w){w.style.display='block';w.textContent=msg;}}
function renderExamQ(){
  const t=STORE.tests.find(x=>x.id===EXAM.testId), q=t.questions[EXAM.qi], body=$('#examBody');
  if(!q){finishExam();return;}
  body.innerHTML=`<div class="exam-q"><div style="margin-bottom:14px;font-weight:600">Câu ${EXAM.qi+1}/${t.questions.length}</div>
    <p style="margin-bottom:16px;font-size:15px">${q.q}</p>
    ${q.options.map((o,i)=>`<label class="${EXAM.answers[EXAM.qi]===i?'sel':''}" onclick="pickAnswer(${i})"><input type="radio" name="eq" ${EXAM.answers[EXAM.qi]===i?'checked':''} style="margin-right:8px"/>${o}</label>`).join('')}
    <div class="row between" style="margin-top:18px">
      <button class="btn btn-ghost" onclick="finishExam()" style="color:var(--danger)">Nộp bài</button>
      <button class="btn btn-pri" onclick="nextExamQ()">${EXAM.qi<t.questions.length-1?'Câu tiếp':'Nộp bài'} ${ico('arr')}</button>
    </div></div>`;
}
function pickAnswer(i){EXAM.answers[EXAM.qi]=i;renderExamQ();}
function nextExamQ(){if(EXAM.answers[EXAM.qi]==null){showExamWarn('Vui lòng chọn đáp án!');return;}EXAM.qi++;renderExamQ();}
function finishExam(){
  const t=STORE.tests.find(x=>x.id===EXAM.testId);
  let score=0; t.questions.forEach((q,i)=>{if(EXAM.answers[i]===q.answer) score++;});
  const total=t.questions.length;
  STORE.testResults.push({testId:EXAM.testId,studentId:me().id,score,total,submittedAt:new Date().toISOString().slice(0,10)});
  const avg=Math.round(score/total*10*10)/10;
  const grade=STORE.grades.find(g=>g.studentId===me().id&&g.classId===t.classId);
  if(grade){grade.midterm=avg;grade.average=(grade.midterm+grade.final)/2;grade.status=STORE.passFail(grade.average);}
  cleanupExam();
  openModal(`<div class="modal-head"><h3>Kết quả bài kiểm tra</h3></div>
  <div class="modal-body" style="text-align:center"><div class="serif" style="font-size:48px;font-weight:700;color:var(--accent)">${score}/${total}</div>
  <p class="muted" style="margin:12px 0 20px">Điểm: ${avg}/10</p>
  <button class="btn btn-pri btn-block" onclick="closeModal();go('st_grades')">Đóng</button></div>`);
  render();
}
function cleanupExam(){
  document.removeEventListener('visibilitychange',examVisibility);
  document.removeEventListener('keydown',examKeyBlock);
  window.removeEventListener('blur',examBlur);
  $('#examLock')?.remove(); EXAM=null;
  if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
}

VIEWS.st_grades = ()=>{
  const u=me();
  const subjectGrades=STORE.grades.filter(g=>g.studentId===u.id);
  const finalAvg=subjectGrades.length?Math.round(subjectGrades.reduce((s,g)=>s+g.average,0)/subjectGrades.length*10)/10:0;
  const finalStatus=STORE.passFail(finalAvg);
  return `<div class="grid g-2" style="margin-bottom:16px">
    <div class="card pad" style="text-align:center;background:var(--green-bg)"><div class="eyebrow">Bảng điểm tổng kết</div>
    <div class="serif" style="font-weight:700;font-size:36px;margin:8px 0">${finalAvg||'—'}</div>
    ${finalAvg?STORE.passFailLabel(finalStatus):'<span class="mut2">Chưa có điểm</span>'}</div>
    <div class="card pad"><div class="eyebrow" style="margin-bottom:10px">Quy định</div>
    <p class="small muted">Điểm trung bình ≥ 5.0 → <span class="pass-fail pass">Đạt</span> · &lt; 5.0 → <span class="pass-fail fail">Không đạt</span></p></div>
  </div>
  <div class="card tcard" style="margin-bottom:16px"><div class="sec-head" style="padding:15px 18px 0"><h3>Bảng điểm theo môn</h3></div>
  <table class="tbl"><thead><tr><th>Môn học</th><th>Lớp</th><th>Giữa kỳ</th><th>Cuối kỳ</th><th>TB</th><th>Đạt/Không đạt</th></tr></thead><tbody>
  ${subjectGrades.map(g=>{const sub=STORE.subject(g.subjectId),c=STORE.cls(g.classId);
    return `<tr><td><b>${sub.name}</b></td><td class="small">${c.name}</td><td>${g.midterm}</td><td>${g.final}</td>
    <td><span class="serif" style="font-weight:700">${g.average}</span></td><td>${STORE.passFailLabel(g.status)}</td></tr>`;
  }).join('')||'<tr><td colspan="6" class="muted small" style="text-align:center;padding:24px">Chưa có điểm môn học.</td></tr>'}
  </tbody></table></div>`;
};
