// ====== Dados iniciais ======
const DEFAULT_SCHEDULE = [
  { time: '06:00', title: 'Acordar' },
  { time: '07:00', title: 'Ir trabalhar' },
  { time: '14:30', title: 'Sair do Trabalho' },
  { time: '15:20', title: 'Academia' },
  { time: '16:20', title: 'Casa' },
  { time: '17:40', title: 'Ir para a Facul' },
  { time: '22:50', title: 'Chegar em casa' },
];

const LS_KEYS = {
  schedule: 'minha-rotina:schedule:v1',
  theme: 'minha-rotina:theme',
  remindBefore: 'minha-rotina:remindBefore',
};

let schedule = loadSchedule();

// ====== Utilidades ======
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function todayKey(date = new Date()) {
  return date.toISOString().slice(0,10); // YYYY-MM-DD
}

function parseTimeStr(t) {
  const [h, m] = t.split(':').map(Number);
  return {h, m};
}

function toMinutes(t) {
  const {h, m} = parseTimeStr(t);
  return h * 60 + m;
}

function formatMMSS(totalSec) {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function loadSchedule() {
  try { return JSON.parse(localStorage.getItem(LS_KEYS.schedule)) || DEFAULT_SCHEDULE.slice(); }
  catch { return DEFAULT_SCHEDULE.slice(); }
}

function saveSchedule(newSched) {
  schedule = newSched.slice().sort((a,b)=> toMinutes(a.time)-toMinutes(b.time));
  localStorage.setItem(LS_KEYS.schedule, JSON.stringify(schedule));
}

function loadRemindBefore() {
  const v = Number(localStorage.getItem(LS_KEYS.remindBefore));
  return Number.isFinite(v) ? v : 10;
}

function saveRemindBefore(v) {
  localStorage.setItem(LS_KEYS.remindBefore, String(v));
}

// Checklist por dia
function dayStatusKey(date = new Date()) { return `minha-rotina:status:${todayKey(date)}`; }
function loadDayStatus(date = new Date()) {
  try { return JSON.parse(localStorage.getItem(dayStatusKey(date))) || {}; } catch { return {}; }
}
function saveDayStatus(status, date = new Date()) {
  localStorage.setItem(dayStatusKey(date), JSON.stringify(status));
}

// ====== Renderização da rotina ======
function renderSchedule() {
  const list = $('#scheduleList');
  list.innerHTML = '';
  const status = loadDayStatus();
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes();

  schedule.forEach((item, idx) => {
    const li = document.createElement('li');
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = item.time;

    const title = document.createElement('div');
    title.textContent = item.title;

    const right = document.createElement('div');
    right.style.display = 'flex';
    right.style.gap = '8px';
    right.style.alignItems = 'center';

    const badge = document.createElement('span');
    badge.className = 'badge';
    const itemMin = toMinutes(item.time);
    if (itemMin > nowMin) badge.textContent = '⏳ Por vir';
    else if (itemMin <= nowMin && !status[idx]) badge.textContent = '🟡 Em andamento';
    else badge.textContent = '✅ Concluído';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = Boolean(status[idx]);
    cb.addEventListener('change', () => {
      const s = loadDayStatus();
      s[idx] = cb.checked;
      saveDayStatus(s);
      renderSchedule();
      renderWeekly();
    });

    right.append(badge, cb);

    if (cb.checked) {
      title.classList.add('done');
      time.classList.add('done');
    }

    li.append(time, title, right);
    list.append(li);
  });
}

// ====== Editor de rotina ======
function renderEditor() {
  const host = $('#editList');
  host.innerHTML = '';
  schedule.forEach((it, i) => {
    const time = document.createElement('input');
    time.type = 'time';
    time.value = it.time;

    const title = document.createElement('input');
    title.type = 'text';
    title.value = it.title;

    host.append(time, title);
  });
}

function readEditor() {
  const inputs = $$('#editList input');
  const pairs = [];
  for (let i=0; i<inputs.length; i+=2) {
    const time = inputs[i].value.trim();
    const title = inputs[i+1].value.trim() || 'Atividade';
    if (/^\d{2}:\d{2}$/.test(time)) pairs.push({ time, title });
  }
  return pairs.sort((a,b)=> toMinutes(a.time)-toMinutes(b.time));
}

// ====== Lembretes ======
let reminderTimers = [];

function clearReminders() {
  reminderTimers.forEach(id => clearTimeout(id));
  reminderTimers = [];
}

function scheduleReminders() {
  clearReminders();
  const beforeMin = Number($('#minutesBefore').value) || 0;
  saveRemindBefore(beforeMin);

  const now = new Date();
  const nowMs = now.getTime();
  const tzOffset = now.getTimezoneOffset(); // for info

  schedule.forEach((item, idx) => {
    const {h, m} = parseTimeStr(item.time);

    const event = new Date();
    event.setHours(h, m, 0, 0);
    const fireTimes = [
      { t: new Date(event.getTime() - beforeMin*60000), label: `Lembrete: ${item.title} às ${item.time}` },
      { t: event, label: `Agora: ${item.title}` }
    ];

    fireTimes.forEach(({t, label}) => {
      const delay = t.getTime() - nowMs;
      if (delay > 500) {
        const id = setTimeout(() => {
          notify(label);
          beep();
          // marcar em andamento automaticamente quando chega a hora
          if (t.getTime() === event.getTime()) {
            const s = loadDayStatus();
            if (!s[idx]) { // não marca como concluído, apenas mostra em andamento
              // nada a fazer, render apenas para atualizar badge
            }
            renderSchedule();
          }
        }, delay);
        reminderTimers.push(id);
      }
    });
  });
}

function requestNotifications() {
  if (!('Notification' in window)) {
    toast('Seu navegador não suporta notificações.');
    return;
  }
  Notification.requestPermission().then((perm) => {
    if (perm === 'granted') toast('Notificações ativadas! Deixe esta aba aberta para receber os alertas.');
    else if (perm === 'denied') toast('Permissão negada. Usaremos alertas na tela.');
  });
}

function notify(text) {
  if ('Notification' in window && Notification.permission === 'granted') {
    try { new Notification('Minha Rotina', { body: text }); } catch {}
  } else {
    toast(text);
  }
}

// Som simples
let audioCtx;
function beep() {
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    o.type = 'sine';
    o.frequency.value = 880; // A5
    g.gain.value = 0.001;
    o.connect(g); g.connect(audioCtx.destination);
    o.start();
    g.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 1.0);
    o.stop(audioCtx.currentTime + 1.0);
  } catch {}
}

// Toast/banners
let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> t.classList.remove('show'), 4000);
}

// ====== Relatório semanal ======
function renderWeekly() {
  const host = $('#weeklyStats');
  host.innerHTML = '';

  const labels = ['S', 'T', 'Q', 'Q', 'S', 'S', 'D']; // seg..dom? Vamos alinhar ao locale
  const today = new Date();
  const week = [];
  for (let i=6; i>=0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate()-i);
    week.push(d);
  }

  let sumPct = 0;
  week.forEach((d) => {
    const st = (function() {
      try { return JSON.parse(localStorage.getItem(`minha-rotina:status:${todayKey(d)}`)) || {}; } catch { return {}; }
    })();
    const total = schedule.length || 1;
    const done = Object.values(st).filter(Boolean).length;
    const pct = Math.round((done/total)*100);
    sumPct += pct;

    const col = document.createElement('div');
    col.className = 'daycol';

    const wrap = document.createElement('div');
    wrap.className = 'barwrap';

    const bar = document.createElement('div');
    bar.className = 'bar';
    bar.style.height = `${pct}%`;

    wrap.append(bar);

    const label = document.createElement('div');
    const wd = d.getDay(); // 0=Dom..6=Sab
    const weekday = ['D','S','T','Q','Q','S','S'][wd];
    label.className = 'label';
    label.textContent = `${weekday} ${d.getDate()}`;

    col.append(wrap, label);
    host.append(col);
  });

  const avg = Math.round(sumPct / 7);
  $('#weeklySummary').textContent = `Média de consistência (7 dias): ${avg}%`;
}

// ====== Sugestões de microtarefas ======
const SUGGESTIONS = {
  quick: [
    'Hidratar: beba um copo de água 💧',
    'Respiração 2 minutos: 4-4-4-4 🧘',
    'Revisar 5 flashcards (Anki/Quiz) 🧠',
    'Organizar mochila/itens para a próxima etapa 🎒',
    'Mensagem rápida: responder algo pendente 📱',
  ],
  study: [
    'Ler/resumir 2 páginas de um material da FATEC 📘',
    'Resolver 2 exercícios rápidos 🧩',
    'Revisar anotações da última aula 📝',
    'Planejar objetivos da semana de estudos 🎯',
  ],
  wellness: [
    'Alongamento de 5 minutos 🧎',
    'Caminhada curta (se possível) 🚶',
    'Lanche proteico/fruta 🍎',
  ]
};

function currentGapSuggestions(now = new Date()) {
  // Descobrir intervalo até a próxima atividade
  const nowM = now.getHours()*60 + now.getMinutes();
  const times = schedule.map(s=> toMinutes(s.time));
  const nextIdx = times.findIndex(t => t > nowM);

  if (nextIdx === -1) return ['Fim do dia. 🏁 Que tal preparar o dia seguinte?']

  const gap = times[nextIdx] - nowM;
  const out = [];
  if (gap >= 15) out.push(...SUGGESTIONS.quick);
  if (gap >= 25) out.push(...SUGGESTIONS.study);
  if (gap >= 35) out.push(...SUGGESTIONS.wellness);
  if (out.length === 0) out.push('Faltam poucos minutos. Respire fundo e prepare-se. ✅');
  return out.slice(0, 5);
}

function renderSuggestions() {
  const host = $('#suggestions');
  host.innerHTML = '';
  currentGapSuggestions().forEach(s => {
    const li = document.createElement('li');
    li.textContent = s;
    host.append(li);
  });
}

// ====== Pomodoro ======
const POM_DUR = { work: 25*60, short: 5*60, long: 15*60 };
let pomState = { mode: 'work', remaining: POM_DUR.work, timer: null, running: false };

function renderPomodoro() {
  $('#pomodoroTimer').textContent = formatMMSS(pomState.remaining);
}

function startPomodoro() {
  if (pomState.running) return;
  pomState.running = true;
  pomState.timer = setInterval(() => {
    pomState.remaining -= 1;
    if (pomState.remaining <= 0) {
      clearInterval(pomState.timer);
      pomState.timer = null;
      pomState.running = false;
      beep(); notify('Pomodoro finalizado!');
    }
    renderPomodoro();
  }, 1000);
}

function pausePomodoro() {
  if (pomState.timer) clearInterval(pomState.timer);
  pomState.timer = null; pomState.running = false;
}

function resetPomodoro() {
  pausePomodoro();
  pomState.remaining = POM_DUR[pomState.mode];
  renderPomodoro();
}

// ====== Tema ======
function loadTheme() { return localStorage.getItem(LS_KEYS.theme) || 'dark'; }
function saveTheme(t) { localStorage.setItem(LS_KEYS.theme, t); }
function applyTheme(t) {
  document.body.classList.toggle('light', t === 'light');
}

// ====== Inicialização ======
function init() {
  // Hoje
  const today = new Date();
  const fmt = today.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });
  $('#todayStr').textContent = fmt.charAt(0).toUpperCase()+fmt.slice(1);

  // Tema
  const theme = loadTheme();
  applyTheme(theme);

  // Editor
  renderEditor();

  // Rotina
  renderSchedule();

  // Weekly
  renderWeekly();

  // Minutes before
  $('#minutesBefore').value = loadRemindBefore();
  scheduleReminders();

  // Eventos UI
  $('#btnNotif').addEventListener('click', requestNotifications);
  $('#btnReprogramar').addEventListener('click', scheduleReminders);

  $('#btnSalvarRotina').addEventListener('click', () => {
    const newSched = readEditor();
    if (!newSched.length) { toast('Nada para salvar.'); return; }
    saveSchedule(newSched);
    renderSchedule();
    renderWeekly();
    scheduleReminders();
    toast('Rotina salva!');
  });
  $('#btnRestaurarPadrao').addEventListener('click', () => {
    saveSchedule(DEFAULT_SCHEDULE);
    renderEditor();
    renderSchedule();
    renderWeekly();
    scheduleReminders();
    toast('Rotina restaurada para o padrão.');
  });

  $('#btnResetDia').addEventListener('click', () => {
    localStorage.removeItem(dayStatusKey());
    renderSchedule();
    renderWeekly();
    toast('Status do dia reiniciado.');
  });

  $('#btnDark').addEventListener('click', () => {
    const now = loadTheme();
    const nxt = now === 'light' ? 'dark' : 'light';
    applyTheme(nxt); saveTheme(nxt);
  });

  $('#btnSugestoes').addEventListener('click', renderSuggestions);

  // Pomodoro
  $('#pomStart').addEventListener('click', startPomodoro);
  $('#pomPause').addEventListener('click', pausePomodoro);
  $('#pomReset').addEventListener('click', resetPomodoro);
  $('#pomMode').addEventListener('change', (e) => {
    pomState.mode = e.target.value;
    pomState.remaining = POM_DUR[pomState.mode];
    renderPomodoro();
  });
  renderPomodoro();
}

window.addEventListener('load', init);
