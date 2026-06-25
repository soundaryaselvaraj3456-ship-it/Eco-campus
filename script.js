/* ── EcoCampus AI · script.js ────────────────────────────────── */

// ── Theme ────────────────────────────────────────────────────────
const html  = document.documentElement;
const btn   = document.getElementById('themeToggle');
const saved = localStorage.getItem('ecoTheme') || 'dark';
html.setAttribute('data-theme', saved);

btn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('ecoTheme', next);
  refreshCharts();
});

// ── Navbar scroll ────────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 40);
});

// ── Mobile menu ──────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));

// ── Particle canvas ──────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  const ICONS = ['⚡','💧','🌿','♻️','🌍','☀️'];

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * W;
      this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.alpha = Math.random() * 0.5 + 0.1;
      this.size  = Math.random() * 12 + 8;
      this.icon  = ICONS[Math.floor(Math.random() * ICONS.length)];
      this.life  = 0;
      this.maxLife = Math.random() * 400 + 200;
    }
    update() {
      this.x += this.vx; this.y += this.vy; this.life++;
      if (this.life > this.maxLife || this.x < -20 || this.x > W+20 || this.y < -20 || this.y > H+20) this.reset();
    }
    draw() {
      const fade = Math.min(1, Math.min(this.life, this.maxLife - this.life) / 40);
      ctx.save();
      ctx.globalAlpha = this.alpha * fade;
      ctx.font = `${this.size}px serif`;
      ctx.fillText(this.icon, this.x, this.y);
      ctx.restore();
    }
  }

  for (let i = 0; i < 35; i++) particles.push(new Particle());

  (function loop() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => { p.update(); p.draw(); });
    requestAnimationFrame(loop);
  })();
})();

// ── Reveal on scroll ─────────────────────────────────────────────
const revealEls = document.querySelectorAll('.reveal');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el  = entry.target;
      const del = parseInt(el.dataset.delay || 0);
      setTimeout(() => el.classList.add('visible'), del);
      observer.unobserve(el);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => observer.observe(el));

// ── Animated counters ────────────────────────────────────────────
function animateCounter(el, target, duration = 1600) {
  const start = performance.now();
  const update = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, parseInt(el.dataset.target));
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.counter, .hstat-num').forEach(el => counterObserver.observe(el));

// ── Green score ring ─────────────────────────────────────────────
(function initGreenScore() {
  const ringFill = document.getElementById('ringFill');
  const gsNum    = document.getElementById('gsNumber');
  if (!ringFill) return;

  const target = 85;
  const circ   = 2 * Math.PI * 50; // ~314

  const scoreObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) {
      // Animate ring
      ringFill.style.strokeDashoffset = circ - (target / 100) * circ;
      // Animate number
      animateCounter(gsNum, target, 1800);
      scoreObserver.disconnect();
    }
  }, { threshold: 0.5 });

  const card = document.querySelector('.green-score-card');
  if (card) scoreObserver.observe(card);
})();

// ── KPI bars ─────────────────────────────────────────────────────
(function initKpiBars() {
  const bars = { kpiE: 78, kpiW: 62, kpiP: 45 };

  const barObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        Object.entries(bars).forEach(([id, pct]) => {
          const el = document.getElementById(id);
          if (el) setTimeout(() => { el.style.setProperty('--pct', pct + '%'); }, 200);
        });
        barObserver.disconnect();
      }
    });
  }, { threshold: 0.3 });

  const kpiSection = document.querySelector('.kpi-stack');
  if (kpiSection) barObserver.observe(kpiSection);
})();

// ── Charts ───────────────────────────────────────────────────────
let charts = {};

function getTheme() { return html.getAttribute('data-theme'); }

function palette() {
  return {
    grid:  getTheme() === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)',
    text:  getTheme() === 'dark' ? '#94a3b8' : '#6b7280',
  };
}

function defaultOpts(extra = {}) {
  const p = palette();
  return {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: { display: false, ...extra.legend },
      tooltip: {
        backgroundColor: getTheme() === 'dark' ? '#172019' : '#fff',
        titleColor: getTheme() === 'dark' ? '#e8f5f0' : '#0f2419',
        bodyColor:  getTheme() === 'dark' ? '#94a3b8'  : '#374151',
        borderColor: 'rgba(52,211,153,0.2)',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      }
    },
    scales: {
      x: { grid: { color: p.grid }, ticks: { color: p.text, font: { size: 11 } } },
      y: { grid: { color: p.grid }, ticks: { color: p.text, font: { size: 11 } }, beginAtZero: true },
      ...(extra.scales || {})
    },
    ...extra
  };
}

function destroyCharts() {
  Object.values(charts).forEach(c => c && c.destroy());
  charts = {};
}

function refreshCharts() { destroyCharts(); initCharts(); }

function initCharts() {
  // Energy line chart
  const ectx = document.getElementById('energyChart');
  if (ectx) {
    charts.energy = new Chart(ectx, {
      type: 'line',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          label: 'Usage (kWh)',
          data: [420, 380, 510, 460, 490, 310, 270],
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: '#f59e0b',
        }]
      },
      options: defaultOpts()
    });
  }

  // Water bar chart
  const wctx = document.getElementById('waterChart');
  if (wctx) {
    charts.water = new Chart(wctx, {
      type: 'bar',
      data: {
        labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
        datasets: [{
          label: 'Usage (kL)',
          data: [12, 15, 11, 18, 14, 8, 7],
          backgroundColor: 'rgba(59,130,246,0.6)',
          borderColor: '#3b82f6',
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: defaultOpts()
    });
  }

  // Carbon line chart
  const cctx = document.getElementById('carbonChart');
  if (cctx) {
    charts.carbon = new Chart(cctx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [{
          label: 'CO₂ (kg)',
          data: [180,165,155,140,135,128,120,118,125,130,122,115],
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.08)',
          fill: true,
          tension: 0.4,
          pointRadius: 3,
          pointBackgroundColor: '#ef4444',
        }]
      },
      options: defaultOpts()
    });
  }

  // Department radar / horizontal bar
  const dctx = document.getElementById('deptChart');
  if (dctx) {
    charts.dept = new Chart(dctx, {
      type: 'bar',
      data: {
        labels: ['Engineering','Science','Arts','Commerce','Medical','Admin'],
        datasets: [{
          label: 'Score',
          data: [88, 82, 91, 75, 85, 70],
          backgroundColor: [
            'rgba(52,211,153,0.7)',
            'rgba(52,211,153,0.55)',
            'rgba(52,211,153,0.85)',
            'rgba(52,211,153,0.45)',
            'rgba(52,211,153,0.65)',
            'rgba(52,211,153,0.35)',
          ],
          borderColor: '#34d399',
          borderWidth: 1,
          borderRadius: 6,
        }]
      },
      options: defaultOpts({ indexAxis: 'y', scales: {
        x: { ...defaultOpts().scales.x, max: 100 },
        y: { ...defaultOpts().scales.y, beginAtZero: false },
      }})
    });
  }
}

// Init charts when dashboard section enters view
const dashSection = document.getElementById('dashboard');
if (dashSection) {
  const chartObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting) { initCharts(); chartObserver.disconnect(); }
  }, { threshold: 0.1 });
  chartObserver.observe(dashSection);
}

// ── Chatbot ──────────────────────────────────────────────────────
const chatMessages = document.getElementById('chatMessages');
const chatInput    = document.getElementById('chatInput');
const chatSend     = document.getElementById('chatSend');

const BOT_REPLIES = {
  'electricity': {
    text: `Here are the top ways to cut classroom electricity usage:\n\n• Switch off lights when rooms are unoccupied\n• Replace fluorescent bulbs with LED (saves up to 60% energy)\n• Enable sleep/hibernate mode on all PCs and displays\n• Install occupancy sensors for automatic light control\n• Schedule AC and HVAC based on timetable data`,
    savings: '12–18% estimated savings'
  },
  'water': {
    text: `Smart water conservation strategies for campus:\n\n• Install sensor-based taps in washrooms\n• Fix all leaking pipes within 48 hrs of detection\n• Switch to drip irrigation for campus gardens\n• Harvest rooftop rainwater for non-potable uses\n• Display real-time usage dashboards near water points`,
    savings: '25–30% estimated savings'
  },
  'paper': {
    text: `Reducing paper waste in the library:\n\n• Enable digital borrowing and e-book platforms\n• Implement print quota system (5 pages/day free)\n• Move notices and announcements to the EcoCampus portal\n• Set default printer settings to double-sided B&W\n• Reward paperless classrooms with Green Stars`,
    savings: '55–70% estimated savings'
  },
  'carbon': {
    text: `Your campus carbon footprint trend:\n\n📉 Down 18% year-over-year\n📊 Current: 125 kg CO₂/month\n🎯 Target: 80 kg CO₂/month by Q3\n\nTop contributors:\n• HVAC systems (38%)\n• Laboratory equipment (27%)\n• Transportation (19%)\n• Lighting (16%)\n\nRecommended next action: upgrade HVAC to inverter-grade units.`,
    savings: 'On track for 35% annual reduction'
  },
  'score': {
    text: `Current department sustainability rankings:\n\n🥇 Arts Faculty — 91/100\n🥈 Engineering — 88/100\n🥉 Medical — 85/100\n4. Science — 82/100\n5. Commerce — 75/100\n6. Admin Block — 70/100\n\nArts Faculty leads due to paperless classrooms and LED retrofits completed last semester.`,
    savings: 'Campus average: 85/100'
  },
  'default': {
    text: `I'm EcoCampus AI, powered by IBM Granite. Here's what I can help you with:\n\n• Real-time electricity, water & paper usage insights\n• Carbon footprint analysis and reduction plans\n• Department-level sustainability scores\n• Eco-certification roadmaps\n• SDG alignment recommendations\n\nTry asking about a specific resource or department!`,
    savings: null
  }
};

function getReply(q) {
  const lower = q.toLowerCase();
  if (lower.includes('electric') || lower.includes('light') || lower.includes('power') || lower.includes('energy')) return BOT_REPLIES.electricity;
  if (lower.includes('water') || lower.includes('leak') || lower.includes('irrigat')) return BOT_REPLIES.water;
  if (lower.includes('paper') || lower.includes('print') || lower.includes('librar')) return BOT_REPLIES.paper;
  if (lower.includes('carbon') || lower.includes('co2') || lower.includes('emission') || lower.includes('footprint')) return BOT_REPLIES.carbon;
  if (lower.includes('score') || lower.includes('department') || lower.includes('best') || lower.includes('rank')) return BOT_REPLIES.score;
  return BOT_REPLIES.default;
}

function timeStr() {
  const d = new Date();
  return d.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function addMessage(text, role, savings) {
  const msg = document.createElement('div');
  msg.className = `msg msg-${role}`;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;

  const meta = document.createElement('div');
  meta.className = 'msg-meta';
  meta.textContent = role === 'user' ? `You · ${timeStr()}` : `EcoCampus AI · ${timeStr()}`;

  msg.appendChild(bubble);

  if (savings && role === 'bot') {
    const savPill = document.createElement('div');
    savPill.style.cssText = 'margin-top:6px;display:inline-block;background:rgba(52,211,153,0.12);border:1px solid rgba(52,211,153,0.25);border-radius:99px;padding:4px 12px;font-size:0.75rem;color:#34d399;font-family:monospace;';
    savPill.textContent = '💡 ' + savings;
    msg.appendChild(savPill);
  }

  msg.appendChild(meta);
  chatMessages.appendChild(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTyping() {
  const t = document.createElement('div');
  t.className = 'msg msg-bot';
  t.id = 'typingIndicator';
  t.innerHTML = `<div class="chat-typing"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div>`;
  chatMessages.appendChild(t);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTyping() {
  const t = document.getElementById('typingIndicator');
  if (t) t.remove();
}

function sendMessage(text) {
  const q = text.trim();
  if (!q) return;
  chatInput.value = '';
  addMessage(q, 'user');
  showTyping();

  setTimeout(() => {
    hideTyping();
    const reply = getReply(q);
    addMessage(reply.text, 'bot', reply.savings);
  }, 900 + Math.random() * 500);
}

chatSend.addEventListener('click', () => sendMessage(chatInput.value));
chatInput.addEventListener('keydown', e => { if (e.key === 'Enter') sendMessage(chatInput.value); });

document.querySelectorAll('.sugg-btn').forEach(btn => {
  btn.addEventListener('click', () => sendMessage(btn.dataset.q));
});

// Demo conversation on load
function initDemoChat() {
  const DEMO = [
    { role: 'bot',  text: '👋 Welcome to EcoCampus AI! I\'m powered by IBM Granite and ready to help your campus go green. Ask me about electricity, water, paper usage, carbon footprint, or sustainability scores.', savings: null, delay: 600 },
    { role: 'user', text: 'How can we reduce electricity usage in classrooms?', delay: 1500 },
  ];

  DEMO.forEach(m => {
    setTimeout(() => {
      if (m.role === 'user') {
        addMessage(m.text, 'user');
        showTyping();
        setTimeout(() => {
          hideTyping();
          const reply = getReply(m.text);
          addMessage(reply.text, 'bot', reply.savings);
        }, 900);
      } else {
        addMessage(m.text, 'bot', m.savings);
      }
    }, m.delay);
  });
}

// Init chat only when section is in view
const chatSection = document.getElementById('chatbot');
if (chatSection) {
  let chatInited = false;
  const chatObserver = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !chatInited) {
      chatInited = true;
      initDemoChat();
      chatObserver.disconnect();
    }
  }, { threshold: 0.2 });
  chatObserver.observe(chatSection);
}

// ── Smooth scroll for anchor links ───────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
