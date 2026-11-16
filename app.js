const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
let teachers = [], schedule = [], activeFloor = 1, selectedRoom = null;

async function loadData(){
  const [t,s] = await Promise.all([
    fetch('assets/teachers.json').then(r=>{if(!r.ok)throw Error('teachers');return r.json()}),
    fetch('assets/schedule.json').then(r=>{if(!r.ok)throw Error('schedule');return r.json()})
  ]);
  teachers=t; schedule=s; renderTeachers(); renderSchedule(); setupFilters(); renderMap(1); tick();
}
function initials(name){return name.split(' ').slice(0,2).map(x=>x[0]).join('').toUpperCase()}
function renderTeachers(){
 const query=$('#teacherSearch').value.trim().toLocaleLowerCase('ru');
 const filter=$('#subjectFilter').value;
 const filtered=teachers.filter(t=>(`${t.name} ${t.subject} ${t.room}`.toLocaleLowerCase('ru').includes(query))&&(!filter||t.subject.toLocaleLowerCase('ru').includes(filter)));
 $('#teacherCount').textContent=`${filtered.length} из ${teachers.length} сотрудников`;
 $('#teacherGrid').innerHTML=filtered.map(t=>`<article class="teacher-card"><div class="avatar">${initials(t.name)}</div><div><h3>${escapeHtml(t.name)}</h3><p>${escapeHtml(t.subject)}</p><span class="room-tag">${t.room?`⌖ ${escapeHtml(t.room)}`:'Кабинет уточняется'}</span></div></article>`).join('');
 $('#teacherEmpty').hidden=filtered.length!==0;
}
function setupFilters(){
 const subjects=[...new Set(teachers.map(t=>t.subject.split(' · ')[0]))].sort((a,b)=>a.localeCompare(b,'ru'));
 $('#subjectFilter').innerHTML='<option value="">Все направления</option>'+subjects.map(s=>`<option value="${escapeAttr(s.toLocaleLowerCase('ru'))}">${escapeHtml(s)}</option>`).join('');
 $('#teacherSearch').addEventListener('input',renderTeachers);
 $('#subjectFilter').addEventListener('change',renderTeachers);
}
function escapeHtml(v){return String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function escapeAttr(v){return escapeHtml(v)}
function roomStaff(room){
 return teachers.filter(t=>t.room.split('/').map(x=>x.trim()).includes(String(room)) || t.room.split(' / ').map(x=>x.trim()).includes(String(room)));
}
function renderMap(floor){
 activeFloor=floor; selectedRoom=null;
 $$('.floor-tab').forEach(b=>b.classList.toggle('active',Number(b.dataset.floor)===floor));
 $('#floorTitle').textContent=['','ПЕРВЫЙ ЭТАЖ','ВТОРОЙ ЭТАЖ','ТРЕТИЙ ЭТАЖ','ЧЕТВЁРТЫЙ ЭТАЖ'][floor];
 const rooms=teachers.flatMap(t=>t.room.split('/').map(x=>x.trim())).filter(x=>/^\d{3}$/.test(x)&&Number(x[0])===floor);
 const unique=[...new Set(rooms)].sort((a,b)=>Number(a)-Number(b));
 const extras=floor===1?['Вход']:floor===2?[]:floor===3?[]:[];
 const nodes=[...unique,...extras];
 $('#floorPlan').innerHTML=nodes.length?nodes.map((r,i)=>`<button class="room" data-room="${escapeAttr(r)}" style="grid-column:${(i%4)+1};grid-row:${Math.floor(i/4)+1}"><span>${escapeHtml(r)}</span><small>КАБИНЕТ</small></button>`).join(''):'<div class="empty-state">В предоставленном списке нет номеров кабинетов для этого уровня.</div>';
 $$('.room').forEach(b=>b.addEventListener('click',()=>showRoom(b.dataset.room,b)));
 $('#roomInfo').innerHTML='<div class="room-info-icon">⌖</div><div class="section-kicker light">ВЫБЕРИТЕ КАБИНЕТ</div><h3>Информация<br>появится здесь</h3><p>Нажмите на любой номер на схеме, чтобы посмотреть связанные данные.</p><div class="room-info-line"></div><small>МБУ СОШ №60 · Новокузнецк</small>';
}
function showRoom(room,button){
 $$('.room').forEach(b=>b.classList.toggle('selected',b===button));
 const staff=roomStaff(room);
 $('#roomInfo').innerHTML=`<div class="room-info-icon">⌖</div><div class="section-kicker light">КАБИНЕТ</div><h3>${escapeHtml(room)}</h3>${staff.length?`<p>${staff.map(t=>`<b>${escapeHtml(t.name)}</b><br>${escapeHtml(t.subject)}`).join('<br><br>')}</p>`:'<p>В исходном списке педагогов этот кабинет не указан.</p>'}<div class="room-info-line"></div><small>Этаж по номеру кабинета · расположение условное</small>`;
}
function toMinutes(t){const [h,m]=t.split(':').map(Number);return h*60+m}
function renderSchedule(){
 const out=[];
 schedule.forEach((l,i)=>{
  out.push(`<div class="lesson-row" data-lesson="${l.lesson}"><div class="lesson-left"><span class="lesson-num">${String(l.lesson).padStart(2,'0')}</span><span class="lesson-name">${l.lesson} урок</span></div><span class="lesson-time">${l.start} — ${l.end}</span></div>`);
  if(i<schedule.length-1){const gap=toMinutes(schedule[i+1].start)-toMinutes(l.end);out.push(`<div class="break-label">ПЕРЕМЕНА · ${gap} МИН.</div>`)}
 });
 $('#scheduleList').innerHTML=out.join('');
}
function tick(){
 const now=new Date(), h=String(now.getHours()).padStart(2,'0'),m=String(now.getMinutes()).padStart(2,'0'),s=String(now.getSeconds()).padStart(2,'0');
 $('#liveClock').textContent=`${h}:${m}:${s}`;
 $('#clockDate').textContent=new Intl.DateTimeFormat('ru-RU',{weekday:'long',day:'numeric',month:'long'}).format(now);
 const mins=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
 let state=null, next=null;
 for(let i=0;i<schedule.length;i++){
  const l=schedule[i], start=toMinutes(l.start),end=toMinutes(l.end);
  if(mins>=start&&mins<end){state={type:'lesson',item:l,start,end};next={type:'break',time:i<schedule.length-1?schedule[i+1].start:null};break}
  if(i<schedule.length-1){const nextStart=toMinutes(schedule[i+1].start);if(mins>=end&&mins<nextStart){state={type:'break',item:l,start:end,end:nextStart};next={type:'lesson',time:schedule[i+1].start};break}}
 }
 $$('.lesson-row').forEach(el=>el.classList.toggle('current',state?.type==='lesson'&&Number(el.dataset.lesson)===state.item.lesson));
 if(!state){$('#nowTitle').textContent=mins<toMinutes(schedule[0].start)?'Уроки ещё не начались':'Занятия на сегодня завершены';$('#nowText').textContent=mins<toMinutes(schedule[0].start)?`Первый звонок в ${schedule[0].start}. Хорошего учебного дня!`:'До следующего учебного дня можно отдохнуть.';$('#timeProgress').style.width='0%';$('#progressLabel').textContent='';$('#nextTime').textContent='';}
 else{
  const left=Math.max(0,Math.ceil(state.end-mins)),pct=Math.min(100,Math.max(0,(mins-state.start)/(state.end-state.start)*100));
  $('#nowTitle').textContent=state.type==='lesson'?`${state.item.lesson}-й урок`:'Перемена';
  $('#nowText').textContent=state.type==='lesson'?`Сейчас идёт урок. До звонка осталось ${left} мин.`:`Перерыв между уроками. До звонка осталось ${left} мин.`;
  $('#timeProgress').style.width=`${pct}%`;$('#progressLabel').textContent=`${Math.round(pct)}% прошло`;$('#nextTime').textContent=state.type==='lesson'?(next.time?`Перемена · ${next.time}`:'Конец занятий'):`Следующий урок · ${next.time}`;
 }
}
$$('.floor-tab').forEach(b=>b.addEventListener('click',()=>renderMap(Number(b.dataset.floor))));
$('#menuToggle').addEventListener('click',()=>$('#nav').classList.toggle('open'));
$$('#nav a').forEach(a=>a.addEventListener('click',()=>$('#nav').classList.remove('open')));
loadData().catch(err=>{console.error(err);$('#teacherGrid').innerHTML='<div class="empty-state">Не удалось загрузить данные. Проверьте, что сайт открыт через GitHub Pages или локальный сервер.</div>';$('#scheduleList').innerHTML='<div class="empty-state">Не удалось загрузить расписание.</div>';});
setInterval(()=>{if(schedule.length)tick()},1000);
