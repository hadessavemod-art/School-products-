'use strict';
/* ============================================================
   ШКОЛА №60 · ПУТЕВОДИТЕЛЬ
   Данные вшиты в файл — сайт работает и без сервера (file://).
   ============================================================ */
const $  = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- ДАННЫЕ: педагогический состав (из документа школы) ---------- */
const TEACHERS = [
  {name:'Аверина Елена Викторовна',      subject:'Учитель иностранных языков', room:''},
  {name:'Андреева Ксения Владимировна',  subject:'Учитель начальных классов', room:''},
  {name:'Борисова Варвара Алексеевна',   subject:'Учитель начальных классов', room:''},
  {name:'Борисова Елена Николаевна',     subject:'Заместитель директора по УВР / учитель математики', room:'307'},
  {name:'Булекова Дарья Андреевна',      subject:'Учитель музыки', room:'102'},
  {name:'Булекова Ирина Викторовна',     subject:'Заместитель директора по ВР / учитель биологии и географии', room:'209'},
  {name:'Бурлаченко Валентина Владимировна', subject:'Учитель начальных классов', room:'202'},
  {name:'Буткеева Евгения Андреевна',    subject:'Социальный педагог / учитель технологии', room:'109/411'},
  {name:'Головина Ксения Игоревна',      subject:'Учитель русского языка и литературы', room:'407'},
  {name:'Грицун Анастасия Ивановна',     subject:'Заведующая столовой', room:'Столовая'},
  {name:'Губарь Лариса Михайловна',      subject:'Учитель математики', room:'301'},
  {name:'Журавская Вера Александровна',  subject:'Учитель физической культуры', room:'Спортзал'},
  {name:'Зайцева Ненила Михайловна',     subject:'Учитель русского языка и литературы', room:'408'},
  {name:'Ильчишина Татьяна Евгеньевна',  subject:'Учитель иностранных языков', room:'309'},
  {name:'Каппес Даниил Олегович',        subject:'Учитель начальных классов', room:'214'},
  {name:'Кобозева Екатерина Николаевна', subject:'Учитель начальных классов', room:''},
  {name:'Козликина Евгения Николаевна',  subject:'Учитель физики и информатики', room:'208/211'},
  {name:'Кормина Наталья Александровна', subject:'Заместитель директора по УВР / учитель биологии и химии', room:'306'},
  {name:'Котова Дарья Алексеевна',       subject:'Педагог-психолог / учитель математики', room:'308'},
  {name:'Кочеткова Неля Владимировна',   subject:'Учитель начальных классов', room:''},
  {name:'Кривенко Анастасия Андреевна',  subject:'Заместитель директора по БЖ / учитель начальных классов', room:'106'},
  {name:'Лисина Юлия Вячеславовна',      subject:'Учитель иностранных языков', room:''},
  {name:'Недорезова Галина Николаевна',  subject:'Учитель технологии', room:''},
  {name:'Нечунаева Наталья Леонидовна',  subject:'Учитель физической культуры', room:'Спортзал'},
  {name:'Родина Галина Николаевна',      subject:'Учитель русского языка', room:'405'},
  {name:'Романчук Лариса Владимировна',  subject:'Заведующая библиотекой', room:'Библиотека'},
  {name:'Светлакова Светлана Юрьевна',   subject:'Учитель русского языка, литературы, истории и ДНКР', room:'406'},
  {name:'Серова Наталья Николаевна',     subject:'Учитель химии, ОБЗиР и географии', room:''},
  {name:'Сильченко Юлия Леонидовна',     subject:'Заместитель директора по ВР / учитель истории и обществознания', room:'402'},
  {name:'Силютина Марина Витальевна',    subject:'Учитель иностранных языков', room:'409'},
  {name:'Слойцева Галина Николаевна',    subject:'Учитель начальных классов', room:'201'},
  {name:'Супрунова Лидия Яковлевна',     subject:'Учитель географии', room:'404'},
  {name:'Трашков Егор Сергеевич',        subject:'Учитель физической культуры', room:'Спортзал'},
  {name:'Хайбулина Лариса Александровна',subject:'Учитель математики', room:'302'},
  {name:'Чайкина Наталья Геннадьевна',   subject:'Учитель истории и обществознания', room:'403'},
  {name:'Швидкова Анжелика Александровна', subject:'Учитель начальных классов', room:''},
  {name:'Швидкова Ольга Владимировна',   subject:'Заместитель директора по АХР / секретарь', room:''},
  {name:'Щенева Любовь Анатольевна',     subject:'Учитель начальных классов', room:''},
  {name:'Янц Кристина Рафаильевна',      subject:'Учитель русского языка и литературы', room:'305'},
  {name:'Янькин Дмитрий Валерьевич',     subject:'Директор школы', room:''}
];

/* ---------- ДАННЫЕ: расписание звонков (меняется только здесь) ---------- */
const SCHEDULE = [
  {lesson:1,  start:'08:30', end:'09:15'},
  {lesson:2,  start:'09:25', end:'10:10'},
  {lesson:3,  start:'10:25', end:'11:10'},
  {lesson:4,  start:'11:25', end:'12:10'},
  {lesson:5,  start:'12:25', end:'13:10'},
  {lesson:6,  start:'13:20', end:'14:05'},
  {lesson:7,  start:'14:15', end:'15:00'},
  {lesson:8,  start:'15:10', end:'15:55'},
  {lesson:9,  start:'16:05', end:'16:50'},
  {lesson:10, start:'17:00', end:'17:45'}
];

/* ---------- особые пространства ---------- */
const SPACES = {
  'Спортзал':   {img:'assets/gym.jpg',      desc:'Физкультура, секции и школьные соревнования.'},
  'Столовая':   {img:'assets/canteen.jpg',  desc:'Горячие обеды для всей школы.'},
  'Библиотека': {img:'assets/library.jpg',  desc:'Учебники, книги и тихое место для подготовки.'}
};
const CLASSROOM_IMG = 'assets/classroom.jpg';
const CORRIDOR_IMG  = 'assets/corridor.jpg';

/* ---------- направления для фильтра ---------- */
const CATEGORIES = [
  {label:'Начальные классы',          keys:['начальных']},
  {label:'Математика',                keys:['математик']},
  {label:'Русский язык и литература', keys:['русского']},
  {label:'Иностранные языки',         keys:['иностранных']},
  {label:'История и обществознание',  keys:['истории','обществознан']},
  {label:'Биология и химия',          keys:['биолог','хими']},
  {label:'География',                 keys:['географ']},
  {label:'Физика и информатика',      keys:['физик','информат']},
  {label:'Технология',                keys:['технологи']},
  {label:'Физическая культура',       keys:['физической']},
  {label:'Музыка',                    keys:['музык']},
  {label:'Администрация',             keys:['директор','секретарь']},
  {label:'Психолог и соцпедагог',     keys:['психолог','социальный','соцпедагог']},
  {label:'Столовая и библиотека',     keys:['столов','библиотек']}
];
const SYN = {'английский':'иностранн','немецкий':'иностранн','физра':'физической','физкультура':'физической','матеша':'математик','обж':'обзир'};

/* ---------- утилиты ---------- */
const esc = (v) => String(v).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const roomsOf = (t) => t.room ? t.room.split('/').map(x => x.trim()).filter(Boolean) : [];
const categoryOf = (t) => CATEGORIES.find(c => c.keys.some(k => t.subject.toLowerCase().includes(k))) || {label:'Другое'};
const initials = (n) => n.split(/\s+/).slice(0,2).map(w => w[0] || '').join('').toUpperCase();
const shortName = (n) => { const p = n.split(/\s+/); return p[0] + (p[1] ? ' ' + p[1][0] + '.' : '') + (p[2] ? p[2][0] + '.' : ''); };
const plural = (n, f) => { const a = Math.abs(n) % 100, b = a % 10; return a > 10 && a < 20 ? f[2] : b > 1 && b < 5 ? f[1] : b === 1 ? f[0] : f[2]; };
const toMinutes = (t) => { const [h,m] = t.split(':').map(Number); return h * 60 + m; };
const scrollToEl = (el) => el.scrollIntoView({behavior: reduced ? 'auto' : 'smooth', block:'start'});

TEACHERS.forEach(t => { t._rooms = roomsOf(t); t._cat = categoryOf(t); t._hay = `${t.name} ${t.subject} ${t.room}`.toLocaleLowerCase('ru'); });

function matchWord(hay, w){
  if (hay.includes(w)) return true;
  if (w.length >= 5 && hay.includes(w.slice(0,-1))) return true;   // математика → математик(и)
  if (w.length >= 6 && hay.includes(w.slice(0,-2))) return true;   // столовая → столов(ой)
  return !!(SYN[w] && hay.includes(SYN[w]));
}
function highlight(text, words){
  if (!words.length) return esc(text);
  const re = new RegExp('(' + words.map(escRe).join('|') + ')', 'ig');
  return text.split(re).map((part, i) => i % 2 ? `<mark>${esc(part)}</mark>` : esc(part)).join('');
}

/* ============================================================
   ПЕДАГОГИ: поиск, фильтр, сортировка
   ============================================================ */
function renderTeachers(){
  const query  = $('#teacherSearch').value.trim().toLocaleLowerCase('ru');
  const words  = query.split(/\s+/).filter(Boolean);
  const filter = $('#subjectFilter').value;
  const sort   = $('#sortMode').value;

  let list = TEACHERS.filter(t =>
    words.every(w => matchWord(t._hay, w)) && (!filter || t._cat.label === filter)
  );
  if (sort === 'room') {
    const key = (t) => {
      if (!t._rooms.length) return 9999;
      const r = t._rooms[0];
      return /^\d+$/.test(r) ? Number(r) : 9000;
    };
    list = [...list].sort((a,b) => key(a) - key(b) || a.name.localeCompare(b.name, 'ru'));
  } else {
    list = [...list].sort((a,b) => a.name.localeCompare(b.name, 'ru'));
  }

  $('#teacherCount').textContent = `${list.length} из ${TEACHERS.length} сотрудников`;
  $('#teacherEmpty').hidden = list.length !== 0;

  $('#teacherGrid').innerHTML = list.map((t, i) => {
    const numRoom   = t._rooms.find(r => /^\d{3}$/.test(r));
    const spaceRoom = t._rooms.find(r => SPACES[r]);
    const target = numRoom ? ` data-room="${esc(numRoom)}"` : spaceRoom ? ` data-space="${esc(spaceRoom)}"` : '';
    const clickable = !!(numRoom || spaceRoom);
    const av = 'av' + (CATEGORIES.indexOf(t._cat) % 4 + 4) % 4;
    const tags = t._rooms.length
      ? t._rooms.map(r => `<span class="room-tag${/^\d{3}$/.test(r) ? '' : ' space'}">⌖ ${highlight(r, words)}</span>`).join('')
      : '<span class="room-tag unknown">Кабинет уточняется</span>';
    const go = clickable ? `<span class="go">${numRoom ? 'На карте' : 'Открыть'} →</span>` : '';
    const delay = Math.min(i * 24, 280);
    const a11y = clickable ? ` role="button" tabindex="0" aria-label="${esc(t.name)} — показать на карте"` : '';
    return `<article class="teacher-card${clickable ? ' clickable' : ''}"${target}${a11y} style="animation-delay:${delay}ms">
      <span class="avatar ${av}">${esc(initials(t.name))}</span>
      <div class="tc-body">
        <h3>${highlight(t.name, words)}</h3>
        <p>${highlight(t.subject, words)}</p>
        <div class="tags">${tags}</div>
      </div>${go}</article>`;
  }).join('');
}

function setupFilters(){
  const opts = CATEGORIES
    .map(c => ({...c, count: TEACHERS.filter(t => t._cat.label === c.label).length}))
    .filter(c => c.count > 0);
  $('#subjectFilter').innerHTML = '<option value="">Все направления</option>' +
    opts.map(c => `<option value="${esc(c.label)}">${esc(c.label)} · ${c.count}</option>`).join('');
  $('#teacherSearch').addEventListener('input', renderTeachers);
  $('#subjectFilter').addEventListener('change', renderTeachers);
  $('#sortMode').addEventListener('change', renderTeachers);
  $('#resetFilters').addEventListener('click', () => {
    $('#teacherSearch').value = ''; $('#subjectFilter').value = ''; $('#sortMode').value = 'name';
    renderTeachers(); $('#teacherSearch').focus();
  });
}

function focusSearch(){
  scrollToEl($('#teachers'));
  setTimeout(() => $('#teacherSearch').focus({preventScroll:true}), reduced ? 0 : 550);
}
function findInList(value){
  $('#teacherSearch').value = value;
  $('#subjectFilter').value = '';
  renderTeachers();
  focusSearch();
}

/* ============================================================
   КАРТА: этажи, кабинеты, особые пространства
   ============================================================ */
const FLOOR_NAMES = ['','ПЕРВЫЙ ЭТАЖ','ВТОРОЙ ЭТАЖ','ТРЕТИЙ ЭТАЖ','ЧЕТВЁРТЫЙ ЭТАЖ'];
const roomStaff = (room) => TEACHERS.filter(t => t._rooms.includes(String(room)));

function defaultInfo(){
  $('#roomInfo').innerHTML = `
    <div class="room-info-icon">⌖</div>
    <div class="section-kicker light">ВЫБЕРИТЕ КАБИНЕТ</div>
    <h3>Информация<br>появится здесь</h3>
    <p>Нажмите на номер на схеме или на особое пространство выше — покажем, кто там работает.</p>
    <div class="room-info-line"></div>
    <small>МБУ СОШ №60 · Новокузнецк</small>`;
}

function renderMap(floor){
  $$('.floor-tab').forEach(b => {
    const on = Number(b.dataset.floor) === floor;
    b.classList.toggle('active', on);
    b.setAttribute('aria-selected', on);
  });
  $$('.space-chip').forEach(c => c.classList.remove('active'));
  $('#floorTitle').textContent = FLOOR_NAMES[floor];

  const rooms = [...new Set(TEACHERS.flatMap(t => t._rooms))]
    .filter(r => /^\d{3}$/.test(r) && Number(r[0]) === floor)
    .sort((a,b) => Number(a) - Number(b));
  const nodes = floor === 1 ? [...rooms, 'Вход'] : rooms;

  $('#roomCount').textContent = rooms.length
    ? `${rooms.length} ${plural(rooms.length, ['кабинет','кабинета','кабинетов'])}${floor === 1 ? ' + вход' : ''}`
    : 'нет данных';

  $('#floorPlan').innerHTML = nodes.length ? nodes.map(r => {
    if (r === 'Вход') return `<button type="button" class="room special-room" data-room="Вход"><span>Вход</span><small>условно</small></button>`;
    const staff = roomStaff(r);
    const label = staff.length ? shortName(staff[0].name) : 'кабинет';
    return `<button type="button" class="room" data-room="${esc(r)}"><span>${esc(r)}</span><small>${esc(label)}</small></button>`;
  }).join('') : '<div class="empty-state">В списке педагогов нет кабинетов этого уровня.</div>';

  defaultInfo();
}

function clearSelection(){
  $$('.room').forEach(b => b.classList.remove('selected'));
  $$('.space-chip').forEach(c => c.classList.remove('active'));
}

function showRoom(room, btn){
  clearSelection();
  if (btn) btn.classList.add('selected');
  const staff = roomStaff(room);
  const floor = Number(String(room)[0]);
  $('#roomInfo').innerHTML = `
    <img class="room-photo" src="${CLASSROOM_IMG}" alt="Учебный кабинет" loading="lazy" onerror="this.remove()">
    <div class="section-kicker light">КАБИНЕТ · ${floor} ЭТАЖ</div>
    <h3>${esc(room)}</h3>
    ${staff.length
      ? `<p class="room-staff">${staff.map(t => `<b>${esc(t.name)}</b><br>${esc(t.subject)}`).join('<br><br>')}</p>`
      : '<p>В исходном списке педагогов этот кабинет не указан.</p>'}
    <button type="button" class="mini-btn" data-find="${esc(room)}">Найти в списке ↗</button>
    <div class="room-info-line"></div>
    <small>Этаж определён по первой цифре номера · расположение условное</small>`;
}

function showEntrance(btn){
  clearSelection();
  if (btn) btn.classList.add('selected');
  $('#roomInfo').innerHTML = `
    <img class="room-photo" src="${CORRIDOR_IMG}" alt="Школьный коридор" loading="lazy" onerror="this.remove()">
    <div class="section-kicker light">ТОЧКА СТАРТА</div>
    <h3>Вход в школу</h3>
    <p>Начало любого маршрута по школе. Отсюда стройте путь до нужного кабинета.</p>
    <div class="room-info-line"></div>
    <small>Расположение на схеме условное</small>`;
}

function showSpace(name){
  clearSelection();
  const chip = $(`.space-chip[data-space="${CSS.escape(name)}"]`);
  if (chip) chip.classList.add('active');
  const sp = SPACES[name];
  const staff = roomStaff(name);
  $('#roomInfo').innerHTML = `
    <img class="room-photo" src="${sp.img}" alt="${esc(name)}" loading="lazy" onerror="this.remove()">
    <div class="section-kicker light">ОСОБОЕ ПРОСТРАНСТВО</div>
    <h3>${esc(name)}</h3>
    <p>${esc(sp.desc)}</p>
    ${staff.length ? `<p class="room-staff">${staff.map(t => `<b>${esc(t.name)}</b><br>${esc(t.subject)}`).join('<br><br>')}</p>` : ''}
    <button type="button" class="mini-btn" data-find="${esc(name)}">Найти в списке ↗</button>
    <div class="room-info-line"></div>
    <small>МБУ СОШ №60 · Новокузнецк</small>`;
}

function gotoRoom(room){
  if (!/^\d{3}$/.test(room)) return;
  renderMap(Number(room[0]));
  const btn = $(`#floorPlan .room[data-room="${room}"]`);
  showRoom(room, btn);
  scrollToEl($('#map'));
  if (btn) { btn.classList.add('ping'); setTimeout(() => btn.classList.remove('ping'), 1700); }
}
function gotoSpace(name){
  if (!SPACES[name]) return;
  showSpace(name);
  scrollToEl($('#map'));
}

/* ============================================================
   РАСПИСАНИЕ: живые часы, текущий урок, прогресс
   ============================================================ */
function renderSchedule(){
  const out = [];
  SCHEDULE.forEach((l, i) => {
    out.push(`<div class="lesson-row" data-lesson="${l.lesson}">
      <div class="lesson-left"><span class="lesson-num">${String(l.lesson).padStart(2,'0')}</span><span class="lesson-name">${l.lesson} урок</span></div>
      <span class="lesson-time">${l.start} — ${l.end}</span></div>`);
    if (i < SCHEDULE.length - 1) {
      const gap = toMinutes(SCHEDULE[i+1].start) - toMinutes(l.end);
      out.push(`<div class="break-label">ПЕРЕМЕНА · ${gap} МИН</div>`);
    }
  });
  $('#scheduleList').innerHTML = out.join('');
}

function setNow(title, text, pct, label, next){
  $('#nowTitle').textContent = title;
  $('#nowText').textContent = text;
  $('#timeProgress').style.width = pct + '%';
  $('#progressLabel').textContent = label;
  $('#nextTime').textContent = next;
}

function tick(){
  const now = new Date();
  const pad = (n) => String(n).padStart(2,'0');
  $('#liveClock').textContent = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const date = new Intl.DateTimeFormat('ru-RU', {weekday:'long', day:'numeric', month:'long'}).format(now);
  $('#clockDate').textContent = date.charAt(0).toUpperCase() + date.slice(1);

  const mins = now.getHours() * 60 + now.getMinutes() + now.getSeconds() / 60;
  const day = now.getDay();
  let state = null, next = null;

  if (day !== 0 && day !== 6) {
    for (let i = 0; i < SCHEDULE.length; i++) {
      const l = SCHEDULE[i], start = toMinutes(l.start), end = toMinutes(l.end);
      if (mins >= start && mins < end) { state = {type:'lesson', item:l, start, end}; next = SCHEDULE[i+1] || null; break; }
      if (i < SCHEDULE.length - 1) {
        const ns = toMinutes(SCHEDULE[i+1].start);
        if (mins >= end && mins < ns) { state = {type:'break', item:l, start:end, end:ns}; next = SCHEDULE[i+1]; break; }
      }
    }
  }

  $$('.lesson-row').forEach(el => {
    const on = !!state && state.type === 'lesson' && Number(el.dataset.lesson) === state.item.lesson;
    el.classList.toggle('current', on);
    if (on) el.setAttribute('aria-current','true'); else el.removeAttribute('aria-current');
  });

  if (day === 0 || day === 6) {
    setNow('Сегодня выходной', 'Звонки молчат — отдыхаем. Следующий учебный день — понедельник.', 0, '', `Пн · ${SCHEDULE[0].start}`);
    return;
  }
  if (!state) {
    if (mins < toMinutes(SCHEDULE[0].start)) {
      setNow('Уроки ещё не начались', `Первый звонок в ${SCHEDULE[0].start}. Не опаздывай!`, 0, 'скоро', `1-й урок · ${SCHEDULE[0].start}`);
    } else {
      setNow('Занятия завершены', 'Школа отдыхает до завтра. Хорошего вечера!', 0, '', '');
    }
    return;
  }
  const left = Math.max(0, Math.ceil(state.end - mins));
  const leftTxt = left > 1 ? `${left} мин` : 'меньше минуты';
  const pct = Math.min(100, Math.max(0, (mins - state.start) / (state.end - state.start) * 100));
  if (state.type === 'lesson') {
    setNow(`${state.item.lesson}-й урок`, `Сейчас идёт урок. До звонка ${leftTxt}.`, pct, `${Math.round(pct)}% прошло`,
      next ? `Далее · перемена ${next.start}` : 'Конец занятий');
  } else {
    setNow('Перемена', `Перерыв между уроками. До звонка ${leftTxt}.`, pct, `${Math.round(pct)}% прошло`,
      `Далее · ${next.lesson}-й урок ${next.start}`);
  }
}

/* ---------- школьный звонок (WebAudio, без аудиофайлов) ---------- */
let ringing = false;
function ringBellSound(){
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  try {
    const ctx = new AC();
    if (ctx.state === 'suspended') ctx.resume();
    const t = ctx.currentTime, dur = 2.1;
    const master = ctx.createGain();
    master.gain.setValueAtTime(0.0001, t);
    master.gain.exponentialRampToValueAtTime(0.4, t + 0.03);
    master.gain.setValueAtTime(0.4, t + dur - 0.35);
    master.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    master.connect(ctx.destination);
    const trem = ctx.createGain(); trem.gain.value = 0.65; trem.connect(master);
    const lfo = ctx.createOscillator(); lfo.frequency.value = 22;
    const lfoGain = ctx.createGain(); lfoGain.gain.value = 0.35;
    lfo.connect(lfoGain); lfoGain.connect(trem.gain);
    [[1046.5,'triangle',0.5],[1568,'sine',0.28],[2093,'sine',0.16],[2637,'sine',0.08]].forEach(([f, type, g]) => {
      const o = ctx.createOscillator(); o.type = type; o.frequency.value = f;
      const og = ctx.createGain(); og.gain.value = g;
      o.connect(og); og.connect(trem); o.start(t); o.stop(t + dur);
    });
    lfo.start(t); lfo.stop(t + dur);
    setTimeout(() => ctx.close().catch(() => {}), (dur + 0.25) * 1000);
  } catch (e) { /* звук недоступен — визуальная анимация всё равно сработает */ }
}
function ringBell(){
  if (ringing) return;
  ringing = true;
  const btn = $('#bellBtn');
  btn.classList.add('ringing'); btn.disabled = true;
  $('#bellLabel').textContent = 'Звенит…';
  $('.next-card').classList.add('flash');
  ringBellSound();
  setTimeout(() => {
    ringing = false;
    btn.classList.remove('ringing'); btn.disabled = false;
    $('#bellLabel').textContent = 'Звонок';
    $('.next-card').classList.remove('flash');
  }, 2250);
}

/* ============================================================
   НАВИГАЦИЯ, СКРОЛЛ, АНИМАЦИИ
   ============================================================ */
function setupNavigation(){
  const nav = $('#nav'), toggle = $('#menuToggle');
  const closeMenu = () => { nav.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); };
  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open);
    toggle.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
  });
  $$('#nav a').forEach(a => a.addEventListener('click', closeMenu));
  document.addEventListener('click', (e) => {
    if (nav.classList.contains('open') && !$('#topbar').contains(e.target)) closeMenu();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
      if (document.activeElement === $('#teacherSearch') && $('#teacherSearch').value) {
        $('#teacherSearch').value = ''; renderTeachers();
      }
    }
    if (e.key === '/' && !/^(INPUT|SELECT|TEXTAREA)$/.test(document.activeElement.tagName)) {
      e.preventDefault(); focusSearch();
    }
  });
  $('#toTop').addEventListener('click', () => window.scrollTo({top:0, behavior: reduced ? 'auto' : 'smooth'}));
}

function setupScroll(){
  const bar = $('#pageProgress'), topbar = $('#topbar'), toTop = $('#toTop'), frame = $('.photo-frame');
  let busy = false;
  const onScroll = () => {
    busy = false;
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    topbar.classList.toggle('scrolled', y > 8);
    toTop.classList.toggle('show', y > 640);
    if (frame && !reduced && matchMedia('(min-width: 851px)').matches && y < 900) {
      frame.style.transform = `translateY(${y * 0.05}px)`;
    }
  };
  window.addEventListener('scroll', () => {
    if (!busy) { busy = true; requestAnimationFrame(onScroll); }
  }, {passive:true});
  onScroll();
}

function setupReveal(){
  $$('.hero .reveal').forEach((el, i) => el.style.transitionDelay = (i * 90) + 'ms');
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
  }, {threshold:.12, rootMargin:'0px 0px -30px 0px'});
  $$('.reveal').forEach(el => io.observe(el));

  const spy = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) {
        $$('#nav a').forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
      }
    });
  }, {rootMargin:'-40% 0px -55% 0px'});
  $$('main section[id]').forEach(s => spy.observe(s));
}

function setupCounters(){
  $('#statTeachers').dataset.count = TEACHERS.length;
  $('#statLessons').dataset.count = SCHEDULE.length;
  const stats = $('.hero-stats');
  const run = () => $$('.stat-num').forEach(el => {
    const target = Number(el.dataset.count);
    if (reduced) { el.textContent = target; return; }
    const t0 = performance.now(), dur = 900;
    const step = (now) => {
      const p = Math.min(1, (now - t0) / dur);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  });
  const io = new IntersectionObserver((es) => {
    es.forEach(en => { if (en.isIntersecting) { run(); io.disconnect(); } });
  }, {threshold:.4});
  io.observe(stats);
}

function setupDelegation(){
  $('#teacherGrid').addEventListener('click', (e) => {
    const card = e.target.closest('.teacher-card[data-room], .teacher-card[data-space]');
    if (!card) return;
    if (card.dataset.room) gotoRoom(card.dataset.room);
    else gotoSpace(card.dataset.space);
  });
  $('#teacherGrid').addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    const card = e.target.closest('.teacher-card[data-room], .teacher-card[data-space]');
    if (card) { e.preventDefault(); card.click(); }
  });
  $$('.floor-tab').forEach(b => b.addEventListener('click', () => renderMap(Number(b.dataset.floor))));
  $('#floorPlan').addEventListener('click', (e) => {
    const btn = e.target.closest('.room');
    if (!btn) return;
    if (btn.dataset.room === 'Вход') showEntrance(btn);
    else showRoom(btn.dataset.room, btn);
  });
  $('#spaceRow').addEventListener('click', (e) => {
    const chip = e.target.closest('.space-chip');
    if (chip) showSpace(chip.dataset.space);
  });
  $$('.polaroid').forEach(p => p.addEventListener('click', () => gotoSpace(p.dataset.space)));
  $('#roomInfo').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-find]');
    if (btn) findInList(btn.dataset.find);
  });
  $('#quickSearch').addEventListener('click', focusSearch);
  $('#bellBtn').addEventListener('click', ringBell);
}

/* ---------- старт ---------- */
setupFilters();
renderTeachers();
renderMap(1);
renderSchedule();
tick();
setInterval(tick, 1000);
setupNavigation();
setupScroll();
setupReveal();
setupCounters();
setupDelegation();
