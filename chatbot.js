(function () {
  if (document.getElementById('kashian-chat-widget')) return;

  // =========================
  // CONFIG
  // =========================
  var CHAT_URL = 'https://warm-dolphin-79489e.netlify.app/.netlify/functions/chat';
  var AVAIL_URL = '/.netlify/functions/availability';
  var BOOKING_URL = '/.netlify/functions/booking';

  var SP = "You are Kay, a warm expert customer service rep for Kashian Bros, family-owned floor covering, Remodeling and cleaning company serving North Shore Chicago since 1910. Genuine warmth, real expertise. Use we and our team naturally. Keep responses SHORT - 2 sentences max unless answering a specific question. Never say morning or afternoon when discussing availability - always use specific times like 9:00 AM or 1:00 PM.\n\nABOUT: Founded 1910 by Haig and Greg Kashian. Owner Doug Stein since 2006. NextDoor Neighborhood Favorite.\nWILMETTE: 1107 Greenleaf Ave Wilmette IL 60091 Mon-Fri 8:30am-5pm Sat 10am-3pm (847) 251-1200\nLAKE FOREST: 838 N Western Ave Lake Forest IL 60045 Mon-Fri 9am-5pm Sat 10am-3pm (847) 295-3737\nPHONE: Use (847) 80-Stain for cleaning services. Use (847) 251-1200 for all other topics. EMAIL: info@kashianbros.com\n\nBUSINESS HOURS: CLOSED all day Sunday. CLOSED Saturday after 3pm.\n\nDROP-OFF: Customers can drop off rugs OR upholstery at WILMETTE LOCATION ONLY - no appointment needed. Rug over 5x8 Wilmette only or pickup.\n\nIN-HOME RUG CLEANING: Price $2 per sqft $199 min. Fiber protectant $2 per sqft. Enzyme for pets $2 per sqft.\n\nRUG PAD: Pad 2 inches shorter each dimension. Price = width x length x $2. $48 min. Default FIRMGRIP.\nExamples: 9x12 rug = 12ft roll 12x12x2=$288. 6x9 rug = 6ft roll 6x9x2=$108.\n\nCARPET CLEANING: NEVER quote prices. Pricing done on-site. $199 minimum. Our team will measure and give you a quote when they arrive. You can also call (847) 251-1200 and ask for Adolfo for a rough estimate.\n\nUPHOLSTERY: Sofa up to 7ft $245. Love Seat up to 5ft $175. Chair $100. Wing chair $70. Ottoman $75. Sectional $35 per linear ft. Dining chair $40. Pillows $15. $199 min.\n\nRUG PLANT: Drop-off $3.25 per sqft. Pickup delivery $4.00 per sqft. $199 min per pickup. 7-10 days.\n\nWOOD FLOORS: We move ALL furniture ourselves. Dust Free sanding. Water-based polyurethane only. Free in-home estimate always.\n\nREMODELING: Full service kitchen and bathroom. Free consultation. Dedicated project manager.\n\nVINYL: Water resistant scratch resistant.\n\nSTAIN: Blot never scrub. Pet blot warm water dish soap vinegar. Wine blot club soda. Mud let dry first. Blood cold water.\n\nCHICAGO SURCHARGES - SOUTH OF IRVING PARK: Carpet and upholstery cleaning has a $450 minimum and $150 trip charge. Rug pickup and delivery has a $250 trip charge.\n\nRUG CLEANING PRICING FLOW: When you answer a rug pricing question, after giving the price always end with: [BUTTONS:Schedule a Pickup|I have more questions]\n\nFor questions about pricing or services not listed, invite them to call (847) 251-1200 or visit a showroom.";

  var TODAY = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'America/Chicago' });
  SP = 'TODAY IS: ' + TODAY + '. Use this to understand relative terms like tomorrow, next week etc.\n\n' + SP;

  var hist = [], cnt = 1, availCache = null;
  var flow = { active: false, type: null, step: null, service: null, duration: 0, awaitingText: false, scope: null, customerInfo: null, timeChoice: null };

  // =========================
  // STYLES
  // =========================
  var style = document.createElement('style');
  style.innerHTML = [
    '#kb-chat-btn{position:fixed;bottom:24px;right:24px;width:60px;height:60px;border-radius:50%;border:none;background:#88EAE4;color:#fff;font-size:24px;cursor:pointer;z-index:999998;box-shadow:0 8px 30px rgba(0,0,0,0.2);transition:transform .2s ease;display:flex;align-items:center;justify-content:center;}',
    '#kb-chat-btn:hover{transform:scale(1.07);}',
    '#kb-chat-widget{position:fixed;bottom:96px;right:24px;width:400px;height:680px;background:#fff;border-radius:16px;overflow:hidden;display:none;flex-direction:column;z-index:999998;box-shadow:0 20px 60px rgba(0,0,0,0.22);border:1px solid #b8eeeb;font-family:Raleway,Arial,sans-serif;color:#111;letter-spacing:0.02em;}',
    '#kb-chat-widget *{box-sizing:border-box;}',
    '@keyframes kb-bounce{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-5px)}}',
    '.kb-hdr{background:#5bcdc7;padding:13px 16px;display:flex;align-items:center;gap:10px;border-bottom:1px solid #9de8e4;flex-shrink:0;}',
    '.kb-av{width:38px;height:38px;background:#7ddbd6;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}',
    '.kb-ht{color:#111;font-size:14px;font-weight:700;}',
    '.kb-hs{color:#1a1a1a;font-size:11px;margin-top:1px;}',
    '.kb-dot{width:8px;height:8px;background:#4ade80;border-radius:50%;margin-left:auto;flex-shrink:0;}',
    '.kb-close{background:none;border:none;cursor:pointer;font-size:20px;color:#111;margin-left:8px;padding:2px 6px;flex-shrink:0;line-height:1;}',
    '.kb-msgs{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:12px;background:#fff;}',
    '.kb-row{display:flex;gap:8px;max-width:95%;}',
    '.kb-row.u{flex-direction:row-reverse;align-self:flex-end;}',
    '.kb-row.b{align-self:flex-start;}',
    '.kb-ic{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;flex-shrink:0;margin-top:2px;}',
    '.kb-ic.b{background:#b8eeeb;}.kb-ic.u{background:#e0eaff;}',
    '.kb-bub{padding:10px 13px;font-size:13px;line-height:1.65;color:#111;word-wrap:break-word;}',
    '.kb-bub *{color:#111!important;}',
    '.kb-bub.b{background:#f0fafa;border-radius:3px 14px 14px 14px;}',
    '.kb-bub.u{background:#5bcdc7;border-radius:14px 3px 14px 14px;}',
    '.kb-bub p{margin:0 0 5px;}.kb-bub p:last-child{margin:0;}',
    '.kb-bub ul{padding-left:16px;margin:5px 0;}.kb-bub li{margin-bottom:3px;}',
    '.kb-typing{display:flex;gap:4px;padding:12px 14px;background:#f0fafa;border-radius:3px 14px 14px 14px;align-items:center;}',
    '.kb-typing div{width:7px;height:7px;border-radius:50%;background:#5bcdc7;animation:kb-bounce 1.2s infinite;}',
    '.kb-typing div:nth-child(2){animation-delay:.2s;}.kb-typing div:nth-child(3){animation-delay:.4s;}',
    '.kb-ir{background:#fff;border-top:1px solid #b8eeeb;padding:10px 12px;display:flex;gap:8px;align-items:flex-end;flex-shrink:0;}',
    '.kb-inp{flex:1;border:1.5px solid #9de8e4;border-radius:10px;padding:9px 11px;font-size:13px;font-family:inherit;resize:none;outline:none;line-height:1.5;max-height:80px;overflow-y:auto;color:#111;}',
    '.kb-sb{width:36px;height:36px;background:#5bcdc7;border:none;border-radius:9px;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;}',
    '.kb-sb:disabled{background:#94a3b8;cursor:not-allowed;}',
    '.kb-inline-btns{display:flex;flex-wrap:wrap;gap:5px;margin-top:8px;}',
    '.kb-inline-btn{font-family:inherit;cursor:pointer;background:#fff;border:1.5px solid #0891b2;color:#0891b2;border-radius:6px;padding:5px 10px;font-size:12px;font-weight:500;white-space:normal;line-height:1.3;text-align:center;text-shadow:none!important;-webkit-text-stroke:0!important;filter:none!important;}',
    '.kb-inline-btn:hover{background:#0891b2;color:#fff;}',
    '.kb-inline-btn:disabled{opacity:0.4;cursor:not-allowed;}',
    '.kb-menu-title{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:3px;padding-bottom:2px;border-bottom:1px solid #e2e8f0;}',
    '.kb-form{background:#fff;border:2px solid #5bcdc7;border-radius:10px;padding:14px;margin-top:6px;font-size:13px;}',
    '.kb-form h3{color:#111;font-size:13px;margin-bottom:10px;font-weight:700;}',
    '.kb-note{background:#fffbeb;border:1px solid #fcd34d;border-radius:6px;padding:8px 10px;margin-bottom:9px;font-size:11.5px;color:#92400e;line-height:1.5;}',
    '.kb-row-2{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px;}',
    '.kb-frow{margin-bottom:8px;}',
    '.kb-label{display:block;font-size:11px;font-weight:700;color:#333;margin-bottom:3px;}',
    '.kb-input{width:100%;border:1.5px solid #9de8e4;border-radius:7px;padding:7px 9px;font-size:12.5px;font-family:inherit;outline:none;color:#111;background:#fff;}',
    '.kb-input:focus{border-color:#5bcdc7;}',
    '.kb-textarea{width:100%;border:1.5px solid #9de8e4;border-radius:7px;padding:7px 9px;font-size:12.5px;font-family:inherit;outline:none;color:#111;resize:vertical;}',
    '.kb-check{display:flex;align-items:center;gap:6px;margin-bottom:7px;cursor:pointer;font-size:12.5px;color:#111;}',
    '.kb-check input{width:14px;height:14px;accent-color:#5bcdc7;}',
    '.kb-submit{background:#5bcdc7;color:#111;border:none;border-radius:8px;padding:10px 16px;font-size:13px;font-weight:700;cursor:pointer;width:100%;margin-top:4px;font-family:inherit;}',
    '.kb-submit:hover{background:#7ddbd6;}.kb-submit:disabled{opacity:0.4;cursor:not-allowed;}',
    '.kb-cancel{background:none;border:1px solid #9de8e4;color:#333;border-radius:8px;padding:7px 12px;font-size:12px;cursor:pointer;width:100%;margin-top:6px;font-family:inherit;}',
    '.kb-section{border:1.5px solid #9de8e4;border-radius:8px;margin-bottom:9px;overflow:hidden;}',
    '.kb-section-hdr{background:#f0fafa;padding:9px 12px;font-size:12.5px;font-weight:700;color:#111;cursor:pointer;display:flex;justify-content:space-between;align-items:center;}',
    '.kb-section-hdr:hover{background:#e0f7f5;}',
    '.kb-section-body{padding:10px;}',
    '.kb-duration-box{background:#eff6ff;border:1.5px solid #60a5fa;border-radius:8px;padding:9px 12px;margin-top:6px;font-size:12.5px;color:#1e40af;text-align:center;}',
    '.kb-price-box{background:#f0fdf4;border:1.5px solid #86efac;border-radius:8px;padding:10px 12px;margin:8px 0;font-size:12.5px;color:#14532d;}',
    '.kb-price-line{padding:2px 0;display:flex;justify-content:space-between;}',
    '.kb-price-line strong{color:#14532d;font-weight:600;}',
    '.kb-price-total{margin-top:7px;padding-top:7px;border-top:1px solid #bbf7d0;font-size:13px;display:flex;justify-content:space-between;color:#14532d;font-weight:700;}',
    '.kb-price-note{margin-top:5px;font-size:11px;color:#166534;font-style:italic;}',
    '.kb-pricing-note{background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:6px;padding:9px 11px;margin:9px 0;font-size:11.5px;color:#7c2d12;line-height:1.55;}',
    '.kb-qty-table{width:100%;border-collapse:collapse;font-size:12px;margin-bottom:8px;}',
    '.kb-qty-table th{text-align:left;padding:5px 7px;background:#f0fafa;font-size:11px;color:#333;border-bottom:1px solid #9de8e4;}',
    '.kb-qty-table td{padding:4px 7px;border-bottom:1px solid #f0fafa;vertical-align:middle;}',
    '.kb-qty{display:flex;align-items:center;gap:6px;}',
    '.kb-qty button{width:22px;height:22px;border:1.5px solid #9de8e4;border-radius:5px;background:#fff;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;color:#111;font-family:inherit;}',
    '.kb-qty button:hover{background:#5bcdc7;}',
    '.kb-qty span{min-width:18px;text-align:center;font-weight:700;font-size:13px;}',
    '.kb-addons{margin:7px 0;display:flex;flex-wrap:wrap;gap:5px;}',
    '.kb-extra-tag{font-size:10px;color:#92400e;background:#fef9c3;padding:1px 5px;border-radius:4px;margin-left:2px;font-weight:700;}',
    '.kb-rug-row{display:flex;align-items:center;gap:3px;margin-bottom:5px;flex-wrap:wrap;}',
    '.kb-rug-row input{width:48px!important;text-align:center;padding:6px 3px!important;}',
    '.kb-flow-top{background:#f8fafc;border-bottom:1px solid #e2e8f0;padding:9px 12px;margin:-14px -14px 12px -14px;border-radius:8px 8px 0 0;}',
    '.kb-flow-row{display:flex;justify-content:space-between;align-items:center;gap:8px;font-size:12px;color:#111;padding:2px 0;}',
    '.kb-flow-row+.kb-flow-row{border-top:1px solid #e2e8f0;margin-top:5px;padding-top:7px;}',
    '.kb-flow-check{color:#16a34a;font-weight:700;margin-right:3px;}',
    '.kb-flow-edit{background:none;border:none;color:#0891b2;cursor:pointer;font-size:11px;font-family:inherit;text-decoration:underline;}',
    '.kb-stage-2,.kb-stage-3{padding-top:12px;margin-top:12px;border-top:2px dashed #cbd5e1;}',
    '.kb-stage-hdr{font-size:10px;font-weight:700;color:#475569;text-transform:uppercase;letter-spacing:0.06em;margin-bottom:8px;}',
    '.kb-times-grid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:6px;}',
    '.kb-time-btn{font-family:inherit;cursor:pointer;background:#fff;border:1.5px solid #5bcdc7;color:#0e7490;border-radius:8px;padding:9px 10px;font-size:12px;font-weight:500;text-align:center;line-height:1.3;}',
    '.kb-time-btn:hover{background:#5bcdc7;color:#111;}',
    '.kb-time-other{font-family:inherit;cursor:pointer;background:none;border:none;color:#0891b2;font-size:12px;text-decoration:underline;padding:5px 0;margin-top:3px;display:block;width:100%;text-align:center;}',
    '.kb-review-block{background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;margin:7px 0;}',
    '.kb-review-line{display:flex;gap:8px;padding:4px 0;font-size:12px;color:#111;border-bottom:1px solid #f1f5f9;}',
    '.kb-review-line:last-child{border-bottom:none;}',
    '.kb-review-label{min-width:60px;font-size:10.5px;color:#64748b;font-weight:700;text-transform:uppercase;letter-spacing:0.04em;padding-top:1px;}',
    '.kb-success{background:#f0fdf4;border:2px solid #16a34a;border-radius:10px;padding:14px;margin-top:6px;}',
    '.kb-success h3{color:#15803d;margin-bottom:5px;font-size:14px;}',
    '.kb-success p{font-size:12.5px;color:#166534;margin-top:5px;}',
    '.kb-uphol-note{background:#fffbeb;border:1px solid #fcd34d;border-left:4px solid #f59e0b;border-radius:6px;padding:8px 10px;margin-bottom:8px;font-size:11.5px;color:#7c2d12;line-height:1.5;font-style:italic;}',
    '.kb-contact-hide{display:none;}',
    '#kb-chat-widget .kb-inline-btn *{text-shadow:none!important;}',
    '#kb-chat-widget .kb-inline-btn{text-shadow:none!important;}',
    '#kb-chat-widget button{text-shadow:none!important;}',
    '@media(max-width:480px){#kb-chat-widget{width:calc(100vw - 20px);height:calc(100vh - 110px);right:10px;bottom:84px;}.kb-times-grid{grid-template-columns:1fr;}.kb-inline-btn{font-size:11px;padding:4px 8px;}}'
  ].join('');
  document.head.appendChild(style);

  // =========================
  // BUILD WIDGET
  // =========================
  var btn = document.createElement('button');
  btn.id = 'kb-chat-btn';
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/><circle cx="8" cy="11" r="1.2" fill="#5bcdc7"/><circle cx="12" cy="11" r="1.2" fill="#5bcdc7"/><circle cx="16" cy="11" r="1.2" fill="#5bcdc7"/></svg>';
  btn.title = 'Chat with Kay';

  var widget = document.createElement('div');
  widget.id = 'kb-chat-widget';
  widget.innerHTML =
    '<div class="kb-hdr">' +
      '<div class="kb-av">&#x1F9F9;</div>' +
      '<div><div class="kb-ht">Kay &mdash; Kashian Bros</div><div class="kb-hs">Flooring, Remodeling &amp; Cleaning</div></div>' +
      '<div class="kb-dot"></div>' +
      '<button class="kb-close" id="kb-close-btn">&times;</button>' +
    '</div>' +
    '<div class="kb-msgs" id="kb-msgs"></div>' +
    '<div class="kb-ir">' +
      '<textarea id="kb-inp" class="kb-inp" rows="1" placeholder="Ask Kay anything..."></textarea>' +
      '<button class="kb-sb" id="kb-sb"><svg width="15" height="15" viewBox="0 0 24 24" fill="#111"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>' +
    '</div>';

  document.body.appendChild(btn);
  document.body.appendChild(widget);

  var msgsEl = document.getElementById('kb-msgs');
  var inpEl = document.getElementById('kb-inp');
  var sbEl = document.getElementById('kb-sb');

  btn.onclick = function () { widget.style.display = widget.style.display === 'flex' ? 'none' : 'flex'; };
  document.getElementById('kb-close-btn').onclick = function () { widget.style.display = 'none'; };

  // =========================
  // HELPERS
  // =========================
  function scrollBottom() { msgsEl.scrollTop = msgsEl.scrollHeight; }

  function scrollNice(el, offset) {
    if (!el) return;
    offset = offset || 40;
    setTimeout(function () {
      var rect = msgsEl.getBoundingClientRect();
      var elRect = el.getBoundingClientRect();
      msgsEl.scrollTo({ top: msgsEl.scrollTop + (elRect.top - rect.top) - offset, behavior: 'smooth' });
    }, 80);
  }

  function nl2html(t) {
    var extra = '';
    t = t.replace(/\[BUTTONS:([^\]]+)\]/g, function (m, labels) {
      extra += '<div class="kb-inline-btns">' + labels.split('|').map(function (l) {
        return '<button class="kb-inline-btn" onclick="kbHandleInput(this.textContent,this)">' + l.trim() + '</button>';
      }).join('') + '</div>';
      return '';
    });
    var html = t.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/#{1,3} (.*)/g, '<strong>$1</strong>')
      .split('\n').map(function (l) { var b = l.match(/^- (.*)/); return b ? '<li>' + b[1] + '</li>' : (l.trim() ? '<p>' + l + '</p>' : ''); })
      .join('').replace(/(<li>.*?<\/li>)+/g, function (m) { return '<ul>' + m + '</ul>'; });
    return html + extra;
  }

  function getConfirmTiming() {
    var now = new Date(), d = now.getDay(), h = now.getHours(), tv = h + now.getMinutes() / 60;
    if (d === 0) return 'Our team is closed today. Adolfo will confirm your booking first thing Monday morning.';
    if (d === 6) { if (tv < 10) return 'Our team opens at 10am on Saturdays. Adolfo will confirm your booking by then.'; if (tv < 15) return 'Adolfo will confirm your booking within about an hour, before we close at 3pm today.'; return 'Our Saturday hours have ended. Adolfo will confirm your booking first thing Monday morning.'; }
    if (tv < 9) return 'Our team starts at 9am. Adolfo will confirm your booking by then this morning.';
    if (tv < 17) return 'Adolfo will confirm your booking within about an hour, and always before 5pm today.';
    return 'Our team has closed for the day. Adolfo will confirm your booking first thing tomorrow morning.';
  }

  function fmtDuration(m) { if (!m) return '0 min'; if (m < 60) return m + ' min'; var h = Math.floor(m / 60), r = m % 60; return r ? h + 'h ' + r + 'm' : h + (h === 1 ? ' hour' : ' hours'); }
  function fmtRange(lo, hi) { var mid = Math.round(((lo + hi) / 2) / 30) * 30; if (mid < 60) mid = 60; var l = Math.max(60, mid - 30), h2 = mid + 30; function asH(x) { var v = x / 60; return v === Math.floor(v) ? v + '' : v.toFixed(1); } return l === h2 ? fmtDuration(l) : asH(l) + '-' + asH(h2) + ' hours'; }
  function fmtRounded(m) { return fmtDuration(Math.ceil((m || 0) / 10) * 10); }
  function getQty(id) { var el = document.getElementById(id); return el ? parseInt(el.textContent || '0') : 0; }

  // =========================
  // PRICING DATA
  // =========================
  var CR = { 'c-liv': { n: 'Living / Family Room', d: 30 }, 'c-din': { n: 'Dining Room', d: 30 }, 'c-mbd': { n: 'Master Bedroom', d: 50 }, 'c-bed': { n: 'Bedroom', d: 30 }, 'c-off': { n: 'Office / Den', d: 30 }, 'c-bsm': { n: 'Small Basement', d: 45 }, 'c-bml': { n: 'Large Basement', d: 75 }, 'c-hal': { n: 'Hallway', d: 20 }, 'c-sta': { n: 'Stairs (per flight)', d: 20 } };
  var UI = { 'u-sof': { n: "Sofa (up to 7')", p: 245, d: 45 }, 'u-lov': { n: "Love Seat (up to 5')", p: 175, d: 35 }, 'u-cha': { n: 'Chair', p: 100, d: 20 }, 'u-win': { n: 'Wing Chair', p: 70, d: 20 }, 'u-ott': { n: 'Ottoman', p: 75, d: 15 }, 'u-sec': { n: 'Sectional (linear ft)', p: 35, d: 100 }, 'u-din': { n: 'Dining Chair', p: 40, d: 15 }, 'u-pil': { n: 'Pillow / Cushion', p: 15, d: 5 } };

  function calcJobDuration(mid) {
    var total = 0, has = false;
    Object.keys(CR).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) { total += q * CR[k].d; has = true; } });
    Object.keys(UI).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) { total += q * UI[k].d; has = true; } });
    if (has) total += 20;
    return total > 0 && total < 60 ? 60 : total;
  }

  function adjQty(id, delta, mid) {
    var el = document.getElementById(id); if (!el) return;
    el.textContent = Math.max(0, parseInt(el.textContent || '0') + delta);
    updateScopeDuration(mid);
  }

  function updateScopeDuration(mid) {
    var box = document.getElementById('kb-scdur-' + mid);
    var findBtn = document.getElementById('kb-scfind-' + mid);
    var mins = calcJobDuration(mid);
    if (!box) return;
    if (!mins) {
      box.innerHTML = '<small style="color:#1e40af">Pick at least one room or item to see your job time</small>';
      box.style.background = '#f1f5f9'; box.style.borderColor = '#cbd5e1';
      if (findBtn) { findBtn.disabled = true; findBtn.style.opacity = '0.4'; findBtn.style.cursor = 'not-allowed'; }
    } else {
      var lo = Math.max(60, mins - 30), hi = mins + 30;
      var hasCarpet = false, hasUphol = false;
      Object.keys(CR).forEach(function (k) { if (getQty(k + '-' + mid)) hasCarpet = true; });
      Object.keys(UI).forEach(function (k) { if (getQty(k + '-' + mid)) hasUphol = true; });
      var subj = []; if (hasCarpet) subj.push('carpet'); if (hasUphol) subj.push('upholstery');
      box.innerHTML = 'Estimated time: <strong>' + fmtRange(lo, hi) + '</strong><br><small style="color:#1e40af;font-style:italic">Times may vary based on furniture and condition of your ' + subj.join(' and ') + '.</small>';
      box.style.background = '#eff6ff'; box.style.borderColor = '#60a5fa';
      if (findBtn) { findBtn.disabled = false; findBtn.style.opacity = '1'; findBtn.style.cursor = 'pointer'; }
    }
  }

  window.kbToggleSection = function (bodyId, arrowId) {
    var b = document.getElementById(bodyId), a = arrowId ? document.getElementById(arrowId) : null;
    if (!b) return;
    var open = b.style.display !== 'none';
    b.style.display = open ? 'none' : 'block';
    if (a) a.textContent = open ? '+' : '\u2212';
  };

  // =========================
  // ADDRESS AUTOCOMPLETE
  // =========================
  function setupAC(input) {
    if (input.dataset.ac) return; input.dataset.ac = '1';
    var dd = document.createElement('div');
    dd.style.cssText = 'position:absolute;background:#fff;border:1px solid #9de8e4;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,.1);z-index:9999999;width:100%;max-height:180px;overflow-y:auto;display:none;font-family:inherit;font-size:12.5px';
    input.parentNode.style.position = 'relative'; input.parentNode.appendChild(dd);
    var t = null;
    input.addEventListener('input', function () {
      clearTimeout(t); var v = input.value.trim(); if (v.length < 3) { dd.style.display = 'none'; return; }
      t = setTimeout(function () {
        fetch('/.netlify/functions/placesearch?input=' + encodeURIComponent(v)).then(function (r) { return r.json(); }).then(function (d) {
          dd.innerHTML = ''; if (!d.suggestions || !d.suggestions.length) { dd.style.display = 'none'; return; }
          d.suggestions.forEach(function (s) {
            var item = document.createElement('div'); item.textContent = s;
            item.style.cssText = 'padding:9px 12px;cursor:pointer;border-bottom:1px solid #f0fafa;color:#111';
            item.addEventListener('mousedown', function (e) { e.preventDefault(); input.value = s; dd.style.display = 'none'; });
            item.addEventListener('mouseover', function () { item.style.background = '#f0fafa'; });
            item.addEventListener('mouseout', function () { item.style.background = '#fff'; });
            dd.appendChild(item);
          }); dd.style.display = 'block';
        }).catch(function () { dd.style.display = 'none'; });
      }, 300);
    });
    input.addEventListener('blur', function () { setTimeout(function () { dd.style.display = 'none'; }, 200); });
  }
  function setupAllAC() { document.querySelectorAll('[data-addr="1"]').forEach(setupAC); }
  new MutationObserver(setupAllAC).observe(widget, { childList: true, subtree: true });

  // =========================
  // TABLES
  // =========================
  function mkQtyBtn(txt, k, mid, delta) {
    var b = document.createElement('button'); b.type = 'button'; if (delta > 0) b.textContent = '+'; else b.innerHTML = '&minus;';
    b.onclick = function () { adjQty(k + '-' + mid, delta, mid); }; return b;
  }
  function buildCarpetTable(mid) {
    var tbl = document.createElement('table'); tbl.className = 'kb-qty-table';
    tbl.innerHTML = '<tr><th>Room</th><th>Qty</th></tr>';
    [['c-liv','Living / Family Room'],['c-din','Dining Room'],['c-mbd','Master Bedroom'],['c-bed','Bedroom'],['c-off','Office / Den'],['c-bsm','Small Basement'],['c-bml','Large Basement'],['c-hal','Hallway'],['c-sta','Stairs (per flight)']].forEach(function (r) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td'); td1.textContent = r[1];
      var td2 = document.createElement('td'); var div = document.createElement('div'); div.className = 'kb-qty';
      var sp = document.createElement('span'); sp.id = r[0] + '-' + mid; sp.textContent = '0';
      div.appendChild(mkQtyBtn('+', r[0], mid, 1)); div.appendChild(sp); div.appendChild(mkQtyBtn('-', r[0], mid, -1));
      td2.appendChild(div); tr.appendChild(td1); tr.appendChild(td2); tbl.appendChild(tr);
    });
    return tbl;
  }
  function buildUpholTable(mid) {
    var tbl = document.createElement('table'); tbl.className = 'kb-qty-table';
    tbl.innerHTML = '<tr><th>Item</th><th>Price</th><th>Qty</th></tr>';
    [['u-sof',"Sofa (up to 7')","$245"],['u-lov',"Love Seat (up to 5')","$175"],['u-cha','Chair','$100'],['u-win','Wing Chair','$70'],['u-ott','Ottoman','$75'],['u-sec','Sectional (linear ft)','$35/ft'],['u-din','Dining Chair','$40'],['u-pil','Pillow / Cushion','$15']].forEach(function (r) {
      var tr = document.createElement('tr');
      var td1 = document.createElement('td'); td1.textContent = r[1];
      var td2 = document.createElement('td'); td2.textContent = r[2];
      var td3 = document.createElement('td'); var div = document.createElement('div'); div.className = 'kb-qty';
      var sp = document.createElement('span'); sp.id = r[0] + '-' + mid; sp.textContent = '0';
      div.appendChild(mkQtyBtn('+', r[0], mid, 1)); div.appendChild(sp); div.appendChild(mkQtyBtn('-', r[0], mid, -1));
      td3.appendChild(div); tr.appendChild(td1); tr.appendChild(td2); tr.appendChild(td3); tbl.appendChild(tr);
    });
    return tbl;
  }

  // =========================
  // RUG SIZE ROWS
  // =========================
  function addRugRow(containerId, mid, prefix) {
    var container = document.getElementById(containerId); if (!container) return;
    var n = container.querySelectorAll('.kb-rug-row').length + 1;
    var row = document.createElement('div'); row.className = 'kb-rug-row';
    function mkIn(sfx, ph) {
      var el = document.createElement('input'); el.className = 'kb-input';
      el.style.cssText = 'width:48px;text-align:center;padding:6px 3px';
      el.placeholder = ph; el.id = prefix + sfx + n + '-' + mid; el.type = 'number'; el.min = '0';
      el.dataset.mid = mid; el.dataset.prefix = prefix;
      el.addEventListener('input', function () { calcRugPrice(mid, prefix); }); return el;
    }
    function mkSp(t) { var s = document.createElement('span'); s.style.cssText = 'font-size:10.5px;color:#666'; s.textContent = t; return s; }
    var del = document.createElement('button'); del.type = 'button';
    del.style.cssText = 'background:none;border:none;color:#dc2626;cursor:pointer;font-size:16px;padding:0 3px;margin-left:2px';
    del.textContent = '\u00d7'; del.onclick = function () { row.remove(); calcRugPrice(mid, prefix); };
    row.appendChild(mkIn('wft', '8')); row.appendChild(mkSp('ft'));
    row.appendChild(mkIn('win', '0')); row.appendChild(mkSp('in \u00d7'));
    row.appendChild(mkIn('hft', '10')); row.appendChild(mkSp('ft'));
    row.appendChild(mkIn('hin', '0')); row.appendChild(mkSp('in'));
    row.appendChild(del); container.appendChild(row);
  }
  window.kbAddRugRow = function (mid, prefix) { addRugRow('kb-rugrows-' + mid, mid, prefix); };

  function calcRugPrice(mid, prefix) {
    var container = document.getElementById('kb-rugrows-' + mid); if (!container) return;
    var totalSqft = 0, rugCount = 0, oversizeCount = 0, rugDesc = [];
    function rnd(ft, inches) { return (parseInt(ft) || 0) + ((parseInt(inches) || 0) >= 6 ? 1 : 0); }
    container.querySelectorAll('.kb-rug-row').forEach(function (row, i) {
      var n = i + 1;
      var wft = document.getElementById(prefix + 'wft' + n + '-' + mid);
      var win = document.getElementById(prefix + 'win' + n + '-' + mid);
      var hft = document.getElementById(prefix + 'hft' + n + '-' + mid);
      var hin = document.getElementById(prefix + 'hin' + n + '-' + mid);
      if (!wft || !hft) return;
      var w = rnd(wft.value, win ? win.value : 0), h = rnd(hft.value, hin ? hin.value : 0);
      if (!w || !h) return;
      rugCount++; totalSqft += w * h;
      if (Math.max(w, h) > 15 || Math.min(w, h) > 10) oversizeCount++;
      rugDesc.push((parseInt(wft.value)||0) + 'ft \u00d7 ' + (parseInt(hft.value)||0) + 'ft (billed as ' + w + 'x' + h + ')');
    });
    var pb = document.getElementById('kb-rugprice-' + mid);
    var db = document.getElementById('kb-rugdur-' + mid);
    var fb = document.getElementById('kb-rugfind-' + mid);
    if (!rugCount) {
      if (pb) pb.style.display = 'none';
      if (db) { db.innerHTML = '<small style="color:#1e40af">Add at least one rug to see your estimate</small>'; db.style.background = '#f1f5f9'; db.style.borderColor = '#cbd5e1'; }
      if (fb) { fb.disabled = true; fb.style.opacity = '0.4'; fb.style.cursor = 'not-allowed'; }
      return;
    }
    var base = Math.max(199, totalSqft * 4);
    var pEl = document.getElementById(prefix + 'protect-' + mid), eEl = document.getElementById(prefix + 'enzyme-' + mid);
    var protect = (pEl && pEl.checked) ? totalSqft * 2 : 0;
    var enzyme = (eEl && eEl.checked) ? totalSqft * 2 : 0;
    var total = base + protect + enzyme;
    var html = '<div class="kb-price-line">Rug Cleaning (' + totalSqft + ' sq ft): <strong>$' + base.toFixed(2) + '</strong></div>';
    if (protect) html += '<div class="kb-price-line">Fiber Protectant: <strong>$' + protect.toFixed(2) + '</strong></div>';
    if (enzyme) html += '<div class="kb-price-line">Enzyme Treatment: <strong>$' + enzyme.toFixed(2) + '</strong></div>';
    html += '<div class="kb-price-total">Estimated Total: <strong>$' + total.toFixed(2) + '</strong></div><div class="kb-price-note">$199 minimum. 7-10 day turnaround.</div>';
    if (pb) { pb.innerHTML = html; pb.style.display = 'block'; }
    var pickMin = (rugCount === 1 ? 15 : rugCount <= 3 ? 25 : 45) + oversizeCount * 15;
    if (db) { db.innerHTML = 'Estimated pickup time: <strong>' + fmtRounded(pickMin) + '</strong>'; db.style.background = '#eff6ff'; db.style.borderColor = '#60a5fa'; }
    if (fb) { fb.disabled = false; fb.style.opacity = '1'; fb.style.cursor = 'pointer'; }
    var fe = document.getElementById('kb-rugscope-' + mid);
    if (fe) { fe.dataset.rc = rugCount; fe.dataset.rs = totalSqft; fe.dataset.rt = total.toFixed(2); fe.dataset.rb = base.toFixed(2); fe.dataset.rp = protect.toFixed(2); fe.dataset.re = enzyme.toFixed(2); fe.dataset.rd = pickMin; fe.dataset.rdesc = rugDesc.join(', '); }
  }
  window.kbCalcRug = function (mid, prefix) { calcRugPrice(mid, prefix); };

  // =========================
  // INFO FORM
  // =========================
  function buildInfoForm(mid, nextType) {
    var f = document.createElement('div'); f.className = 'kb-form'; f.id = 'kb-info-' + mid;
    f.innerHTML =
      '<h3>Your Information</h3>' +
      '<div class="kb-note">We will use this to confirm your appointment.</div>' +
      '<div class="kb-row-2">' +
        '<div class="kb-frow"><label class="kb-label">First Name *</label><input class="kb-input" id="kb-ifn-' + mid + '" placeholder="Jane"/></div>' +
        '<div class="kb-frow"><label class="kb-label">Last Name *</label><input class="kb-input" id="kb-iln-' + mid + '" placeholder="Smith"/></div>' +
      '</div>' +
      '<div class="kb-row-2">' +
        '<div class="kb-frow"><label class="kb-label">Phone *</label><input class="kb-input" id="kb-iph-' + mid + '" placeholder="(847) 555-1234" type="tel"/></div>' +
        '<div class="kb-frow"><label class="kb-label">Email *</label><input class="kb-input" id="kb-iem-' + mid + '" placeholder="you@email.com" type="email"/></div>' +
      '</div>' +
      '<div class="kb-frow"><label class="kb-label">Full Address (include city) *</label><input class="kb-input" id="kb-iad-' + mid + '" placeholder="123 Main St, Wilmette, IL 60091" data-addr="1" autocomplete="off"/></div>' +
      '<label class="kb-check"><input type="checkbox" id="kb-isp-' + mid + '" onchange="kbTogCtx(\'i\',\'' + mid + '\',this.checked)" checked/> I will be there to let your crew in</label>' +
      '<div id="kb-ictx-' + mid + '" class="kb-contact-hide">' +
        '<div class="kb-note" style="margin-bottom:7px">Provide the on-site contact:</div>' +
        '<div class="kb-row-2">' +
          '<div class="kb-frow"><label class="kb-label">Contact Name *</label><input class="kb-input" id="kb-icn-' + mid + '" placeholder="Name"/></div>' +
          '<div class="kb-frow"><label class="kb-label">Contact Phone *</label><input class="kb-input" id="kb-icp-' + mid + '" placeholder="Phone"/></div>' +
        '</div>' +
      '</div>' +
      '<div class="kb-frow"><label class="kb-label">Additional Notes</label><textarea class="kb-textarea" id="kb-ino-' + mid + '" rows="2" placeholder="Anything else..."></textarea></div>' +
      '<button class="kb-submit" onclick="kbSubmitInfo(\'' + mid + '\',\'' + nextType + '\')">Continue &rarr;</button>' +
      '<button class="kb-cancel" onclick="kbCancelInfo(\'' + mid + '\')">Never mind, I will call instead</button>';
    return f;
  }

  window.kbTogCtx = function (pfx, mid, checked) { var b = document.getElementById('kb-' + pfx + 'ctx-' + mid); if (b) b.style.display = checked ? 'none' : 'block'; };
  window.kbCancelInfo = function (mid) { var f = document.getElementById('kb-info-' + mid); if (f) f.innerHTML = '<p style="color:#333;font-size:12.5px">No problem! Call us at <strong>(847) 251-1200</strong> or email <strong>info@kashianbros.com</strong>!</p>'; flow.active = false; };

  window.kbSubmitInfo = function (mid, nextType) {
    var fn = v('kb-ifn-' + mid), ln = v('kb-iln-' + mid), ph = v('kb-iph-' + mid), em = v('kb-iem-' + mid), ad = v('kb-iad-' + mid);
    var sp = document.getElementById('kb-isp-' + mid).checked;
    var no = v('kb-ino-' + mid);
    var cn = sp ? '' : v('kb-icn-' + mid), cp = sp ? '' : v('kb-icp-' + mid);
    if (!fn || !ln || !ph || !em || !ad) { alert('Please fill in all required fields.'); return; }
    if (!sp && (!cn || !cp)) { alert('Please provide the on-site contact, or check that you will be there yourself.'); return; }
    flow.customerInfo = { fname: fn, lname: ln, phone: ph, email: em, addr: ad, selfP: sp, cname: cn, cphone: cp, notes: no, cardId: mid };
    document.getElementById('kb-info-' + mid).style.display = 'none';
    flowMsg(nextType === 'RUG' ? 'Great! Now tell us about your rugs.\n[SHOW_RUG_SCOPE]' : 'Great! Now pick what needs cleaning.\n[SHOW_SCOPE]');
    setTimeout(function () { scrollNice(document.getElementById('kb-scope-' + (cnt - 1)) || document.getElementById('kb-rugscope-' + (cnt - 1))); }, 150);
  };

  function v(id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; }

  window.kbEditInfo = function (mid) {
    var ic = flow.customerInfo ? document.getElementById('kb-info-' + flow.customerInfo.cardId) : null;
    if (ic) {
      ic.style.display = '';
      var sc = document.getElementById('kb-scope-' + mid) || document.getElementById('kb-rugscope-' + mid);
      if (sc) { var row = sc.closest('.kb-row'); (row || sc).remove(); }
      flow.scope = null; flow.timeChoice = null;
      ic.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // =========================
  // SCOPE FORM (carpet/uphol)
  // =========================
  function buildScopeForm(mid) {
    var f = document.createElement('div'); f.className = 'kb-form'; f.id = 'kb-scope-' + mid;
    f.innerHTML =
      '<div id="kb-sctop-' + mid + '" style="display:none" class="kb-flow-top"></div>' +
      '<div id="kb-scs1-' + mid + '">' +
        '<h3>Tell us about your job</h3>' +
        '<div class="kb-note">Pick the rooms and items you need cleaned.</div>' +
        '<div class="kb-section"><div class="kb-section-hdr" onclick="kbToggleSection(\'kb-sccarpet-' + mid + '\',\'kb-scarrow-' + mid + '\')">Carpet Cleaning <span id="kb-scarrow-' + mid + '">\u2212</span></div>' +
        '<div id="kb-sccarpet-' + mid + '" class="kb-section-body"><div id="kb-sctblc-' + mid + '"></div>' +
        '<div class="kb-addons"><label class="kb-check"><input type="checkbox" id="c-protect-' + mid + '"/> Fiber Protectant <span class="kb-extra-tag">extra</span></label><label class="kb-check"><input type="checkbox" id="c-enzyme-' + mid + '"/> Enzyme Treatment <span class="kb-extra-tag">extra</span></label></div>' +
        '</div></div>' +
        '<div class="kb-section"><div class="kb-section-hdr" onclick="kbToggleSection(\'kb-scuphol-' + mid + '\',\'kb-suarrow-' + mid + '\')">Upholstery Cleaning <span id="kb-suarrow-' + mid + '">+</span></div>' +
        '<div id="kb-scuphol-' + mid + '" class="kb-section-body" style="display:none"><div class="kb-uphol-note">Prices are rough estimates. Final quote given on-site.</div><div id="kb-sctblu-' + mid + '"></div>' +
        '<div class="kb-addons"><label class="kb-check"><input type="checkbox" id="u-protect-' + mid + '"/> Fiber Protectant <span class="kb-extra-tag">extra</span></label><label class="kb-check"><input type="checkbox" id="u-enzyme-' + mid + '"/> Deodorize/Enzyme <span class="kb-extra-tag">extra</span></label><label class="kb-check"><input type="checkbox" id="u-antibac-' + mid + '"/> Antibacterial <span class="kb-extra-tag">extra</span></label></div>' +
        '</div></div>' +
        '<div class="kb-duration-box" id="kb-scdur-' + mid + '"><small style="color:#1e40af">Pick at least one room or item to see your job time</small></div>' +
        '<div class="kb-pricing-note"><strong>Pricing:</strong> Final quote given on-site. Want an estimate first? Call <strong>(847) 251-1200</strong> and ask for Adolfo.</div>' +
        '<button class="kb-submit" id="kb-scfind-' + mid + '" disabled style="opacity:0.4;cursor:not-allowed" onclick="kbSubmitScope(\'' + mid + '\')">Find Available Times &rarr;</button>' +
        '<button class="kb-cancel" onclick="kbCancelScope(\'' + mid + '\')">Never mind, I will call instead</button>' +
      '</div>' +
      '<div class="kb-stage-2" id="kb-scs2-' + mid + '" style="display:none"></div>' +
      '<div class="kb-stage-3" id="kb-scs3-' + mid + '" style="display:none"></div>';
    setTimeout(function () {
      var c = document.getElementById('kb-sctblc-' + mid); if (c) c.appendChild(buildCarpetTable(mid));
      var u = document.getElementById('kb-sctblu-' + mid); if (u) u.appendChild(buildUpholTable(mid));
    }, 50);
    return f;
  }

  window.kbCancelScope = function (mid) { var f = document.getElementById('kb-scope-' + mid) || document.getElementById('kb-rugscope-' + mid); if (f) f.innerHTML = '<p style="color:#333;font-size:12.5px">No problem! Call us at <strong>(847) 251-1200</strong> or email <strong>info@kashianbros.com</strong>!</p>'; flow.active = false; };

  window.kbSubmitScope = function (mid) {
    var mins = calcJobDuration(mid); if (!mins) { alert('Please pick at least one room or upholstery item.'); return; }
    var cL = [], uL = [], uSub = 0;
    Object.keys(CR).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) cL.push(q + 'x ' + CR[k].n); });
    Object.keys(UI).forEach(function (k) { var q = getQty(k + '-' + mid); if (q) { uL.push(q + 'x ' + UI[k].n); uSub += q * UI[k].p; } });
    var lo = Math.max(60, mins - 30), hi = mins + 30;
    flow.scope = { isRug: false, carpetLines: cL, upholLines: uL, cProtect: !!chk('c-protect-' + mid), cEnzyme: !!chk('c-enzyme-' + mid), uProtect: !!chk('u-protect-' + mid), uEnzyme: !!chk('u-enzyme-' + mid), uAntibac: !!chk('u-antibac-' + mid), durationMin: mins, durationLow: lo, durationHigh: hi, upholSubtotal: uSub, cardId: mid };
    flow.service = cL.length && uL.length ? 'both' : cL.length ? 'carpet' : 'upholstery';
    flow.duration = mins;
    advStage2('scope', mid);
    fetchSlots('scope', mid, 'CARPET');
  };

  function chk(id) { var el = document.getElementById(id); return el && el.checked; }

  window.kbEditScope = function (mid) {
    var isRug = !!document.getElementById('kb-rugscope-' + mid);
    var pfx = isRug ? 'kb-rugscope-' : 'kb-scope-';
    var top = document.getElementById(pfx + 'top-' + mid); if (top) top.style.display = 'none';
    var s1 = document.getElementById(pfx + 's1-' + mid); if (s1) s1.style.display = '';
    var s2 = document.getElementById(pfx + 's2-' + mid); if (s2) { s2.style.display = 'none'; s2.innerHTML = ''; }
    var s3 = document.getElementById(pfx + 's3-' + mid); if (s3) { s3.style.display = 'none'; s3.innerHTML = ''; }
    flow.timeChoice = null; flow.scope = null;
    if (!isRug) updateScopeDuration(mid);
  };

  // =========================
  // RUG SCOPE FORM
  // =========================
  function buildRugScopeForm(mid) {
    var f = document.createElement('div'); f.className = 'kb-form'; f.id = 'kb-rugscope-' + mid;
    var PFX = 'rs';
    f.innerHTML =
      '<div id="kb-rugscope-top-' + mid + '" style="display:none" class="kb-flow-top"></div>' +
      '<div id="kb-rugscope-s1-' + mid + '">' +
        '<h3>Tell us about your rugs</h3>' +
        '<div class="kb-note">We pick up, clean at our plant, and deliver back in 7-10 days. Pickup days are <strong>Tuesdays and Thursdays only</strong>.</div>' +
        '<div style="font-size:11px;color:#666;margin-bottom:6px">Enter feet and inches. Rounds up at 6+ inches.</div>' +
        '<div id="kb-rugrows-' + mid + '">' +
          '<div class="kb-rug-row">' +
            '<input class="kb-input" style="width:48px;text-align:center;padding:6px 3px" placeholder="8" id="' + PFX + 'wft1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">ft</span>' +
            '<input class="kb-input" style="width:44px;text-align:center;padding:6px 3px" placeholder="0" id="' + PFX + 'win1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" max="11" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">in \u00d7</span>' +
            '<input class="kb-input" style="width:48px;text-align:center;padding:6px 3px" placeholder="10" id="' + PFX + 'hft1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">ft</span>' +
            '<input class="kb-input" style="width:44px;text-align:center;padding:6px 3px" placeholder="0" id="' + PFX + 'hin1-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" type="number" min="0" max="11" oninput="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/>' +
            '<span style="font-size:10.5px;color:#666">in</span>' +
          '</div>' +
        '</div>' +
        '<button type="button" class="kb-cancel" style="width:auto;padding:5px 10px;font-size:11.5px;margin:5px 0" onclick="kbAddRugRow(\'' + mid + '\',\'' + PFX + '\')">+ Add another rug</button>' +
        '<div class="kb-addons" style="margin-top:8px">' +
          '<label class="kb-check"><input type="checkbox" id="' + PFX + 'protect-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" onchange="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/> Fiber Protectant <span class="kb-extra-tag">$2/sq ft</span></label>' +
          '<label class="kb-check"><input type="checkbox" id="' + PFX + 'enzyme-' + mid + '" data-mid="' + mid + '" data-prefix="' + PFX + '" onchange="kbCalcRug(this.dataset.mid,this.dataset.prefix)"/> Enzyme Treatment <span class="kb-extra-tag">$2/sq ft</span></label>' +
        '</div>' +
        '<div class="kb-price-box" id="kb-rugprice-' + mid + '" style="display:none"></div>' +
        '<div class="kb-duration-box" id="kb-rugdur-' + mid + '"><small style="color:#1e40af">Add at least one rug to see your estimate</small></div>' +
        '<button class="kb-submit" id="kb-rugfind-' + mid + '" disabled style="opacity:0.4;cursor:not-allowed" onclick="kbSubmitRugScope(\'' + mid + '\')">Find Available Pickup Times &rarr;</button>' +
        '<button class="kb-cancel" onclick="kbCancelScope(\'' + mid + '\')">Never mind, I will call instead</button>' +
      '</div>' +
      '<div class="kb-stage-2" id="kb-rugscope-s2-' + mid + '" style="display:none"></div>' +
      '<div class="kb-stage-3" id="kb-rugscope-s3-' + mid + '" style="display:none"></div>';
    return f;
  }

  window.kbSubmitRugScope = function (mid) {
    var fe = document.getElementById('kb-rugscope-' + mid);
    if (!fe || !parseInt(fe.dataset.rc)) { alert('Please add at least one rug.'); return; }
    var PFX = 'rs';
    flow.scope = { isRug: true, rugDesc: fe.dataset.rdesc, rugCount: parseInt(fe.dataset.rc), rugSqft: parseInt(fe.dataset.rs), rugTotal: parseFloat(fe.dataset.rt), rugBase: parseFloat(fe.dataset.rb), rugProtect: parseFloat(fe.dataset.rp), rugEnzyme: parseFloat(fe.dataset.re), cProtect: chk(PFX + 'protect-' + mid), cEnzyme: chk(PFX + 'enzyme-' + mid), durationMin: parseInt(fe.dataset.rd), cardId: mid, carpetLines: [], upholLines: [], upholSubtotal: 0, uProtect: false, uEnzyme: false, uAntibac: false };
    flow.duration = flow.scope.durationMin;
    advStage2('rugscope', mid);
    fetchSlots('rugscope', mid, 'RUG');
  };

  // =========================
  // STAGES 2 + 3
  // =========================
  function infoLine(mid) {
    if (!flow.customerInfo) return '';
    var ci = flow.customerInfo, disp = ci.fname + ' ' + ci.lname + ' \u2014 ' + ci.addr;
    if (disp.length > 62) disp = ci.fname + ' ' + ci.lname + ' \u2014 ' + ci.addr.substring(0, 45) + '...';
    return '<div class="kb-flow-row"><div><span class="kb-flow-check">\u2713</span>' + disp + '</div><button class="kb-flow-edit" onclick="kbEditInfo(\'' + mid + '\')">edit</button></div>';
  }

  function scopeLine(mid) {
    if (!flow.scope) return '';
    var sc = flow.scope, txt = '';
    if (sc.isRug) { txt = sc.rugCount + (sc.rugCount === 1 ? ' rug' : ' rugs') + ' (' + sc.rugSqft + ' sq ft) \u2014 <strong>$' + sc.rugTotal.toFixed(2) + '</strong>'; }
    else { var lines = sc.carpetLines.concat(sc.upholLines); var sum = lines.join(', '); if (sum.length > 55) sum = lines.length + ' items'; txt = '<strong>' + fmtRange(sc.durationLow, sc.durationHigh) + '</strong> \u2014 ' + sum; }
    return '<div class="kb-flow-row"><div><span class="kb-flow-check">\u2713</span>' + txt + '</div><button class="kb-flow-edit" onclick="kbEditScope(\'' + mid + '\')">edit</button></div>';
  }

  function timeLine() { return '<div class="kb-flow-row"><div><span class="kb-flow-check">\u2713</span>' + (flow.timeChoice || '') + '</div></div>'; }

  function advStage2(pfx, mid) {
    var card = document.getElementById('kb-' + pfx + '-' + mid); if (!card) return;
    var s1 = document.getElementById('kb-' + pfx + '-s1-' + mid) || card.querySelector('[id^="kb-scs1-"],[id^="kb-rugscope-s1-"]');
    if (s1) s1.style.display = 'none';
    var top = document.getElementById('kb-' + pfx + '-top-' + mid) || document.getElementById('kb-sctop-' + mid) || document.getElementById('kb-rugscope-top-' + mid);
    if (top) { top.style.display = 'block'; top.innerHTML = infoLine(mid) + scopeLine(mid); }
    var s2 = document.getElementById('kb-' + pfx + '-s2-' + mid); if (s2) s2.style.display = 'block';
    scrollNice(top || s2);
  }

  async function fetchSlots(pfx, mid, type) {
    // resolve the actual s2 element (two possible naming schemes)
    var s2 = document.getElementById('kb-' + pfx + '-s2-' + mid);
    if (!s2) return;
    s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="font-size:12.5px;color:#64748b;font-style:italic;padding:6px 0">Checking our schedule...</div>';
    try {
      var r = await fetch(AVAIL_URL + '?duration=' + flow.duration + '&type=' + type);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      var d = await r.json();
      if (d.slots && d.slots.length) {
        var html = '<div class="kb-stage-hdr">Pick a time</div><div class="kb-times-grid">';
        d.slots.slice(0, 4).forEach(function (s) { html += '<button class="kb-time-btn" onclick="kbPickTime(\'' + mid + '\',\'' + s.label.replace(/'/g, "\\'") + '\',\'' + pfx + '\')">' + s.label + '</button>'; });
        html += '</div><button class="kb-time-other" onclick="kbCustomTime(\'' + mid + '\',\'' + pfx + '\')">I have a different time in mind</button>';
        s2.innerHTML = html;
      } else {
        s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="font-size:12.5px;color:#475569;padding:6px 0;line-height:1.5">Our schedule is quite full right now. Please call us at <strong>(847) 251-1200</strong>!</div>';
      }
    } catch (e) {
      s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="font-size:12.5px;color:#475569;padding:6px 0">Connection error. Please call <strong>(847) 251-1200</strong>.</div>';
    }
  }

  window.kbPickTime = function (mid, label, pfx) {
    flow.timeChoice = label;
    var s2 = document.getElementById('kb-' + pfx + '-s2-' + mid); if (s2) s2.style.display = 'none';
    var top = document.getElementById('kb-' + pfx + '-top-' + mid) || document.getElementById('kb-sctop-' + mid) || document.getElementById('kb-rugscope-top-' + mid);
    if (top) top.innerHTML = infoLine(mid) + scopeLine(mid) + timeLine();
    advStage3(pfx, mid);
  };

  window.kbCustomTime = function (mid, pfx) {
    var s2 = document.getElementById('kb-' + pfx + '-s2-' + mid); if (!s2) return;
    s2.innerHTML = '<div class="kb-stage-hdr">Pick a time</div><div style="display:flex;flex-direction:column;gap:7px"><label class="kb-label">What date and time works for you?</label><input class="kb-input" id="kb-ct-' + mid + '" placeholder="e.g. Monday May 12 at 10:00 AM"/><button class="kb-submit" onclick="kbSubmitCustomTime(\'' + mid + '\',\'' + pfx + '\')">Use this time</button><button class="kb-cancel" onclick="fetchSlots(\'' + pfx + '\',\'' + mid + '\',\'CARPET\')">&larr; Back</button></div>';
    setTimeout(function () { var inp = document.getElementById('kb-ct-' + mid); if (inp) inp.focus(); }, 80);
  };
  window.kbSubmitCustomTime = function (mid, pfx) { var inp = document.getElementById('kb-ct-' + mid); if (!inp || !inp.value.trim()) { alert('Please enter a date and time.'); return; } kbPickTime(mid, inp.value.trim(), pfx); };

  function advStage3(pfx, mid) {
    var s3 = document.getElementById('kb-' + pfx + '-s3-' + mid); if (!s3) return;
    s3.style.display = 'block'; s3.innerHTML = ''; s3.appendChild(buildReviewForm(mid));
    var top = document.getElementById('kb-' + pfx + '-top-' + mid) || document.getElementById('kb-sctop-' + mid) || document.getElementById('kb-rugscope-top-' + mid);
    scrollNice(top || s3);
  }

  function buildReviewForm(mid) {
    var div = document.createElement('div');
    var ci = flow.customerInfo || {}, sc = flow.scope || {};
    var html = '<div class="kb-stage-hdr">Review &amp; Submit</div><div class="kb-review-block">';
    if (sc.isRug) {
      html += '<div class="kb-review-line"><span class="kb-review-label">Service</span><span>Rug Pickup &amp; Delivery</span></div>';
      html += '<div class="kb-review-line"><span class="kb-review-label">Rugs</span><span>' + (sc.rugDesc || '') + ' (' + sc.rugSqft + ' sq ft)</span></div>';
      var ra = []; if (sc.cProtect) ra.push('Fiber Protectant'); if (sc.cEnzyme) ra.push('Enzyme');
      if (ra.length) html += '<div class="kb-review-line"><span class="kb-review-label">Add-ons</span><span>' + ra.join(', ') + '</span></div>';
      html += '<div class="kb-review-line"><span class="kb-review-label">Estimate</span><span><strong>$' + sc.rugTotal.toFixed(2) + '</strong> <small style="color:#64748b">($199 min, 7-10 days)</small></span></div>';
    } else {
      var hasC = sc.carpetLines && sc.carpetLines.length, hasU = sc.upholLines && sc.upholLines.length;
      html += '<div class="kb-review-line"><span class="kb-review-label">Service</span><span>' + (hasC && hasU ? 'Carpet &amp; Upholstery Cleaning' : hasC ? 'Carpet Cleaning' : 'Upholstery Cleaning') + '</span></div>';
      if (hasC) { var ca = []; if (sc.cProtect) ca.push('Protectant'); if (sc.cEnzyme) ca.push('Enzyme'); html += '<div class="kb-review-line"><span class="kb-review-label">Carpet</span><span>' + sc.carpetLines.join(', ') + (ca.length ? ' <small style="color:#64748b">+ ' + ca.join(', ') + '</small>' : '') + '</span></div>'; }
      if (hasU) { var ua = []; if (sc.uProtect) ua.push('Protectant'); if (sc.uEnzyme) ua.push('Enzyme'); if (sc.uAntibac) ua.push('Antibacterial'); html += '<div class="kb-review-line"><span class="kb-review-label">Upholstery</span><span>' + sc.upholLines.join(', ') + (ua.length ? ' <small style="color:#64748b">+ ' + ua.join(', ') + '</small>' : '') + '</span></div>'; }
      html += '<div class="kb-review-line"><span class="kb-review-label">Est. time</span><span>' + fmtRange(sc.durationLow, sc.durationHigh) + '</span></div>';
    }
    html += '<div class="kb-review-line"><span class="kb-review-label">When</span><span><strong>' + (flow.timeChoice || '') + '</strong></span></div></div>';
    html += '<div class="kb-review-block">';
    html += '<div class="kb-review-line"><span class="kb-review-label">Name</span><span>' + (ci.fname || '') + ' ' + (ci.lname || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">Phone</span><span>' + (ci.phone || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">Email</span><span>' + (ci.email || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">Address</span><span>' + (ci.addr || '') + '</span></div>';
    html += '<div class="kb-review-line"><span class="kb-review-label">On-site</span><span>' + (ci.selfP ? 'Customer present' : (ci.cname || '') + ' \u2014 ' + (ci.cphone || '')) + '</span></div>';
    if (ci.notes) html += '<div class="kb-review-line"><span class="kb-review-label">Notes</span><span>' + ci.notes.replace(/</g, '&lt;') + '</span></div>';
    html += '</div>';
    if (!sc.isRug) { var subj = []; if (sc.carpetLines && sc.carpetLines.length) subj.push('carpet'); if (sc.upholLines && sc.upholLines.length) subj.push('upholstery'); html += '<div class="kb-pricing-note"><strong>Reminder:</strong> Final quote given on-site once our crew measures. Times may vary based on furniture and condition of your ' + subj.join(' and ') + '.</div>'; }
    html += '<button class="kb-submit" onclick="kbFinalBooking(\'' + mid + '\')">Send Booking Request &#x2713;</button>';
    div.innerHTML = html; return div;
  }

  window.kbFinalBooking = function (mid) {
    var ci = flow.customerInfo; if (!ci) { alert('Missing customer info. Please start over.'); return; }
    var sc = flow.scope || {}, name = (ci.fname + ' ' + ci.lname).trim();
    var svc = 'CARPET', lbl = 'Carpet Cleaning', detail = '', priceInfo = '';
    if (sc.isRug) {
      svc = 'RUG_PICKUP'; lbl = 'Rug Pickup and Delivery'; detail = sc.rugDesc || '';
      priceInfo = 'Rugs: ' + sc.rugDesc + ' (' + sc.rugSqft + ' sq ft) | Base: $' + sc.rugBase.toFixed(2) + (sc.rugProtect > 0 ? ' + Protectant: $' + sc.rugProtect.toFixed(2) : '') + (sc.rugEnzyme > 0 ? ' + Enzyme: $' + sc.rugEnzyme.toFixed(2) : '') + ' | Total: $' + sc.rugTotal.toFixed(2) + ' | Est. pickup: ' + fmtDuration(sc.durationMin);
    } else {
      var hasC = sc.carpetLines && sc.carpetLines.length, hasU = sc.upholLines && sc.upholLines.length;
      if (hasC && hasU) { lbl = 'Carpet & Upholstery Cleaning'; } else if (hasU) { svc = 'UPHOLSTERY'; lbl = 'Upholstery Cleaning'; }
      detail = (sc.carpetLines || []).concat(sc.upholLines || []).join(', ');
      priceInfo = 'Job: ' + detail + ' (Est. ' + fmtDuration(sc.durationMin) + ')' + (sc.upholSubtotal > 0 ? ' | Upholstery subtotal: $' + sc.upholSubtotal.toFixed(2) : '');
    }
    var isChicago = /\bchicago\b/i.test(ci.addr);
    var truck = svc === 'UPHOLSTERY' ? 'Truck 1 preferred' : svc === 'RUG_PICKUP' ? 'Rug Pickup Calendar - Tues and Thurs only' : 'Truck 1 or Truck 2';
    var eb = 'NEW BOOKING - KASHIAN BROS KAY\nSERVICE: ' + lbl + '\nCALENDAR: ' + truck + '\n' + (isChicago ? '*** CHICAGO - Adolfo must book manually ***\n' : '') + '\nName: ' + name + '\nPhone: ' + ci.phone + '\nEmail: ' + ci.email + '\nAddress: ' + ci.addr + (detail ? '\nDetails: ' + detail : '') + (priceInfo ? '\nPrice/Duration: ' + priceInfo : '') + '\nAppointment: ' + (flow.timeChoice || '') + '\nOn-site: ' + (ci.selfP ? 'Customer present' : 'Contact: ' + ci.cname + ' ' + ci.cphone) + (ci.notes ? '\nNotes: ' + ci.notes : '') + '\nSubmitted: ' + new Date().toLocaleString();
    fetch(BOOKING_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: name, phone: ci.phone, email: ci.email, addr: ci.addr, svc: svc, lbl: lbl, detail: detail, stairs: '', date: flow.timeChoice || '', time: '', selfP: ci.selfP, cname: ci.cname, cphone: ci.cphone, pets: '', notes: (ci.notes || '') + (priceInfo ? '\nPrice/Duration: ' + priceInfo : ''), isChicago: isChicago, truck: truck, emailBody: eb }) }).catch(function () {});
    var timing = getConfirmTiming();
    var card = document.getElementById('kb-scope-' + mid) || document.getElementById('kb-rugscope-' + mid);
    if (card) {
      card.className = 'kb-success';
      card.innerHTML = '<h3>Booking Request Sent! \u2713</h3><p><strong>Thank you, ' + ci.fname + '!</strong></p><p>Your booking request for <strong>' + lbl + '</strong> has been sent.</p><p style="margin-top:8px;background:#dcfce7;border-radius:6px;padding:8px"><strong>' + timing + '</strong></p><p>Confirmation will go to <strong>' + ci.email + '</strong>. Questions? Call <strong>(847) 251-1200</strong>.</p>' + (isChicago ? '<p style="margin-top:7px;background:#fef9c3;border-radius:6px;padding:8px">Chicago bookings are handled personally by our cleaning manager.</p>' : '');
      scrollNice(card);
    }
    if (ci.cardId) { var ic = document.getElementById('kb-info-' + ci.cardId); if (ic) ic.style.display = 'none'; }
    hist.push({ role: 'user', content: 'BOOKING SUBMITTED: ' + name + ' for ' + lbl + ' on ' + (flow.timeChoice || '') });
    hist.push({ role: 'assistant', content: 'Booking sent! ' + timing });
    flow.scope = null; flow.customerInfo = null; flow.timeChoice = null; flow.active = false;
  };

  // =========================
  // ADD MESSAGE
  // =========================
  function addMsg(role, content, id) {
    var isBot = role === 'assistant';
    var showScope = content.indexOf('[SHOW_SCOPE]') !== -1;
    var showRug = content.indexOf('[SHOW_RUG_SCOPE]') !== -1;
    var infoMatch = content.match(/\[SHOW_INFO_FORM:(CARPET|RUG)\]/);
    var clean = content.replace(/\[SHOW_SCOPE\]/g, '').replace(/\[SHOW_RUG_SCOPE\]/g, '').replace(/\[SHOW_INFO_FORM:(CARPET|RUG)\]/g, '').trim();

    var row = document.createElement('div'); row.className = 'kb-row ' + (isBot ? 'b' : 'u'); row.id = 'kbr' + id;
    var ic = document.createElement('div'); ic.className = 'kb-ic ' + (isBot ? 'b' : 'u'); ic.innerHTML = isBot ? '&#x1F9F9;' : '&#x1F464;';
    var wrap = document.createElement('div'); wrap.style.maxWidth = '100%';
    var bub = document.createElement('div'); bub.className = 'kb-bub ' + (isBot ? 'b' : 'u');
    bub.innerHTML = isBot ? nl2html(clean) : '<p>' + content + '</p>';
    wrap.appendChild(bub);
    if (infoMatch && isBot) wrap.appendChild(buildInfoForm(id, infoMatch[1]));
    if (showScope && isBot) wrap.appendChild(buildScopeForm(id));
    if (showRug && isBot) wrap.appendChild(buildRugScopeForm(id));
    row.appendChild(ic); row.appendChild(wrap);
    msgsEl.appendChild(row); scrollBottom(); cnt++;
  }

  function addTyping() {
    var row = document.createElement('div'); row.className = 'kb-row b'; row.id = 'kb-typing';
    var ic = document.createElement('div'); ic.className = 'kb-ic b'; ic.innerHTML = '&#x1F9F9;';
    var td = document.createElement('div'); td.className = 'kb-typing';
    [0, .2, .4].forEach(function (s) { var d = document.createElement('div'); d.style.animationDelay = s + 's'; td.appendChild(d); });
    row.appendChild(ic); row.appendChild(td); msgsEl.appendChild(row); scrollBottom();
  }
  function removeTyping() { var t = document.getElementById('kb-typing'); if (t) t.remove(); }

  // =========================
  // FLOW
  // =========================
  function flowMsg(text) { hist.push({ role: 'assistant', content: text }); addMsg('assistant', text, cnt); }

  window.kbHandleInput = function (text, btn) {
    if (btn) { var par = btn.parentNode; if (par) par.querySelectorAll('.kb-inline-btn').forEach(function (b) { b.disabled = true; b.style.opacity = '0.4'; }); }
    if (text === 'Schedule a Pickup') { addMsg('user', text, cnt); hist.push({ role: 'user', content: text }); startRugFlow(); return; }
    if (flow.active) { handleFlowBtn(text); } else { kbSend(text); }
  };

  function handleFlowBtn(text) {
    if (flow.step === 'time_choice') {
      addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
      if (text === 'I have a different time in mind') { flow.step = 'custom_time'; flow.awaitingText = true; flowMsg('What date and time works for you? For example: Monday May 5 at 10:00 AM'); }
      else { flow.active = false; }
    }
  }

  function startCarpetFlow() {
    flow = { active: true, type: 'carpet_upholstery', step: 'info', service: null, duration: 0, awaitingText: false, scope: null, customerInfo: null, timeChoice: null };
    addMsg('user', 'Schedule Carpet & Upholstery Cleaning', cnt);
    hist.push({ role: 'user', content: 'Schedule Carpet & Upholstery Cleaning' });
    flowMsg("Happy to help! Let's get you scheduled. First, tell us a bit about you.\n[SHOW_INFO_FORM:CARPET]");
  }

  function startRugFlow() {
    flow = { active: true, type: 'rug', step: 'info', service: 'rug', duration: 0, awaitingText: false, scope: null, customerInfo: null, timeChoice: null };
    addMsg('user', 'Schedule Rug Pickup', cnt);
    hist.push({ role: 'user', content: 'Schedule Rug Pickup' });
    flowMsg("Happy to help with your rug pickup! Let's get you scheduled. First, tell us a bit about you.\n[SHOW_INFO_FORM:RUG]");
  }

  // =========================
  // MAIN MENU
  // =========================
  function showMainButtons() {
    var lastRow = msgsEl.lastElementChild; if (!lastRow) return;
    var bub = lastRow.querySelector('.kb-bub'); if (!bub) return;
    var container = document.createElement('div'); container.style.cssText = 'margin-top:10px;display:flex;flex-direction:column;gap:11px';
    var sections = [
      { t: 'Schedule', b: [{ l: 'Schedule Carpet & Upholstery Cleaning', a: 'carpet' }, { l: 'Schedule Rug Pickup', a: 'rug' }] },
      { t: 'Carpet & Rugs', b: [{ l: 'Custom Carpet', m: 'Tell me about custom carpet' }, { l: 'In-stock Carpets', m: 'Tell me about your in-stock carpets' }, { l: 'Custom Area Rugs', m: 'Tell me about custom area rugs' }, { l: 'Quick Ship Area Rugs', m: 'Tell me about quick ship area rugs' }, { l: 'Custom Stair Runners', m: 'Tell me about custom stair runners' }, { l: 'Rug Repair & Restoration', m: 'Tell me about rug repair and restoration' }] },
      { t: 'Hard Surface Flooring', b: [{ l: 'Wood Flooring', m: 'Tell me about wood flooring' }, { l: 'Hardwood Floor Refinishing', m: 'Tell me about hardwood floor refinishing' }, { l: 'Vinyl Flooring', m: 'Tell me about vinyl flooring' }, { l: 'Tile & Backsplash', m: 'Tell me about tile and backsplash' }] },
      { t: 'Kitchen & Bath', b: [{ l: 'Kitchen Remodeling', m: 'Tell me about kitchen remodeling' }, { l: 'Bathroom Remodeling', m: 'Tell me about bathroom remodeling' }, { l: 'Wood Cabinets', m: 'Tell me about wood cabinets' }, { l: 'Countertops', m: 'Tell me about countertops' }] },
      { t: 'Questions', b: [{ l: 'Rug Cleaning Prices', m: 'I would like to know about rug cleaning prices' }, { l: 'My Dog Had an Accident on My Rug', m: 'My dog had an accident on my rug' }, { l: "I Spilled Red Wine \u2014 What Do I Do?", m: 'I spilled red wine - what do I do?' }, { l: 'How Much Is a Rug Pad?', m: 'How much is a rug pad?' }, { l: 'Ask Another Question', m: 'I have a question' }] }
    ];
    sections.forEach(function (group) {
      var titleEl = document.createElement('div'); titleEl.className = 'kb-menu-title'; titleEl.textContent = group.t; container.appendChild(titleEl);
      var wrap = document.createElement('div'); wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:5px';
      group.b.forEach(function (b) {
        var btn = document.createElement('button'); btn.className = 'kb-inline-btn'; btn.textContent = b.l;
        btn.onclick = function () {
          container.querySelectorAll('.kb-inline-btn').forEach(function (x) { x.disabled = true; x.style.opacity = '0.4'; });
          if (b.a === 'carpet') startCarpetFlow();
          else if (b.a === 'rug') startRugFlow();
          else kbSend(b.m);
        };
        wrap.appendChild(btn);
      });
      container.appendChild(wrap);
    });
    bub.appendChild(container);
  }

  // =========================
  // SEND
  // =========================
  function kbSend(text) {
    if (!text || !text.trim()) return;
    if (flow.active && flow.awaitingText) {
      flow.awaitingText = false;
      if (flow.step === 'custom_time') {
        addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
        flowMsg('Let me check if that time is available...');
        (async function () {
          try {
            var r = await fetch(AVAIL_URL + '?duration=' + flow.duration + '&type=' + (flow.type === 'rug' ? 'RUG' : 'CARPET'));
            var d = await r.json();
            if (d.slots && d.slots.length) { flowMsg('Sorry, that time is not available. Here are our next open slots:\n[BUTTONS:' + d.slots.slice(0, 4).map(function (s) { return s.label; }).concat(['I have a different time in mind']).join('|') + ']'); flow.step = 'time_choice'; }
            else { flowMsg('Our schedule is quite full. Please call us at (847) 251-1200!'); flow.active = false; }
          } catch (e) { flowMsg('I had trouble checking the schedule. Please call (847) 251-1200!'); flow.active = false; }
        })();
        inpEl.value = ''; return;
      }
    }
    inpEl.value = ''; sbEl.disabled = true;
    addMsg('user', text, cnt); hist.push({ role: 'user', content: text });
    addTyping();
    fetch(CHAT_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 800, system: SP + (availCache ? '\n\n' + availCache : ''), messages: hist }) })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var reply = data.content && data.content[0] ? data.content[0].text : "I had trouble with that. Please call (847) 251-1200!";
        removeTyping(); hist.push({ role: 'assistant', content: reply }); addMsg('assistant', reply, cnt);
      }).catch(function () {
        removeTyping(); addMsg('assistant', "I'm having trouble connecting right now. Please call (847) 251-1200 or email info@kashianbros.com!", cnt);
      }).finally(function () { sbEl.disabled = false; });
  }
  window.kbSend = kbSend;

  // =========================
  // EVENTS
  // =========================
  sbEl.onclick = function () { kbSend(inpEl.value); };
  inpEl.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); kbSend(inpEl.value); } });

  // =========================
  // PREFETCH AVAILABILITY
  // =========================
  (async function () { try { var r = await fetch(AVAIL_URL); var d = await r.json(); if (d.summary) availCache = d.summary; } catch (e) {} })();

  // =========================
  // WELCOME + MENU
  // =========================
  addMsg('assistant', "Hi! I'm Kay from Kashian Bros. How can I help you today?", 0);
  showMainButtons();

})();
