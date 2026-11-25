// State and behaviour for this page. Converted from design/Admin.dc.html; safe to edit.
import DCLogic from '../lib/DCLogic.jsx';

export default class Logic extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      authed: false, email: '', pw: '', loginErr: '', tab: 'overview', range: 7,
      team: [
        { name: 'Studio Owner', email: 'owner@nilepods.com', role: 'Owner', status: 'Active' },
        { name: 'Front Desk', email: 'desk@nilepods.com', role: 'Front desk', status: 'Active' },
        { name: 'Studio Manager', email: 'manager@nilepods.com', role: 'Manager', status: 'Active' }
      ],
      q: '', fStatus: 'all', sel: null, schedOff: 0, tourOff: 0, tourBlocks: {}, ov: {},
      invite: { email: '', role: 'Front desk' }, toast: ''
    };
    this.D = this.build();
  }
  // ---------- sample data ----------
  services() { return { rec: { name: 'Recording Only', short: 'Recording', price: 1150 }, mix: { name: 'Recording + Live Edit', short: 'Live Edit', price: 1450 }, pro: { name: 'Recording + Pro Edit', short: 'Pro Edit', price: 1950 } }; }
  key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  build() {
    var seed = 20261125, rnd = function () { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    var first = ['Mona', 'Omar', 'Youssef', 'Nour', 'Karim', 'Salma', 'Hassan', 'Laila', 'Ahmed', 'Farida', 'Tarek', 'Hana', 'Mostafa', 'Yasmin', 'Ali', 'Mariam', 'Khaled', 'Dina'];
    var last = ['Adel', 'Fathy', 'Samir', 'Hosny', 'Mahmoud', 'Nabil', 'Saad', 'Gamal', 'Ezzat', 'Shawky', 'Ramzy', 'Lotfy'];
    var SV = this.services(), ids = ['rec', 'mix', 'pro'];
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var nowH = new Date().getHours();
    var bookings = [], packs = [], tours = [], n = 0;
    for (var off = -14; off <= 14; off++) {
      var d = new Date(today); d.setDate(today.getDate() + off);
      if (d.getDay() === 5) continue;
      for (var s = 1; s <= 7; s++) {
        var busy = {}, count = rnd() < 0.32 ? 0 : rnd() < 0.72 ? 1 : 2;
        for (var c = 0; c < count; c++) {
          var dur = rnd() < 0.72 ? 1 : 2, start = 15 + Math.floor(rnd() * (9 - dur)), ok = true;
          for (var h = start; h < start + dur; h++) if (busy[h]) ok = false;
          if (!ok) continue;
          for (h = start; h < start + dur; h++) busy[h] = true;
          var svc = ids[Math.floor(rnd() * 3)], cam = rnd() < 0.18 ? 1 : 0, photo = rnd() < 0.1 ? 1 : 0;
          var r = rnd(), method = r < 0.22 ? 'credit' : r < 0.68 ? 'online' : 'onsite';
          var extrasAmt = cam * 90 + photo * 250;
          var amount = method === 'credit' ? SV[svc].price * (dur - 1) + extrasAmt : SV[svc].price * dur + extrasAmt;
          var st, rr = rnd();
          if (off < 0) st = rr < 0.05 ? 'Cancelled' : rr < 0.1 ? 'No-show' : 'Completed';
          else if (off === 0) st = start + dur <= nowH ? 'Completed' : start <= nowH ? 'In studio' : 'Upcoming';
          else st = rr < 0.04 ? 'Cancelled' : 'Upcoming';
          var paid = method !== 'onsite' || st === 'Completed' || st === 'In studio';
          var fn = first[Math.floor(rnd() * first.length)], ln = last[Math.floor(rnd() * last.length)];
          n++;
          var ex = []; if (cam) ex.push('Extra camera'); if (photo) ex.push('Session photographer'); if (dur > 1) ex.push('Extra hour');
          bookings.push({ id: 'NP-' + (40210 + n * 7), off: off, date: d, key: this.key(d), setup: s, start: start, end: start + dur, svc: svc,
            customer: fn + ' ' + ln, phone: '+20 10' + Math.floor(10000000 + rnd() * 89999999), email: fn.toLowerCase() + '.' + ln.toLowerCase() + '@example.com',
            people: 1 + Math.floor(rnd() * 2), extras: ex.length ? ex.join(', ') : 'None', method: method, amount: amount, status: st, paid: paid,
            createdOff: off - 1 - Math.floor(rnd() * 6), createdH: 9 + Math.floor(rnd() * 12) });
        }
      }
      if (off <= 0 && rnd() < 0.55) {
        var tier = ids[Math.floor(rnd() * 3)], cnt = [3, 5, 10, 1][Math.floor(rnd() * 4)], disc = { 1: 0, 3: 0.05, 5: 0.1, 10: 0.15 }[cnt];
        var pf = first[Math.floor(rnd() * first.length)] + ' ' + last[Math.floor(rnd() * last.length)];
        packs.push({ off: off, date: d, customer: pf, svc: tier, count: cnt, amount: Math.round(SV[tier].price * cnt * (1 - disc) / 10) * 10, method: rnd() < 0.8 ? 'Card' : 'At studio', h: 10 + Math.floor(rnd() * 11) });
      }
      if (off >= -3 && off <= 10) {
        var tc = rnd() < 0.4 ? 0 : rnd() < 0.7 ? 1 : 2;
        for (var t = 0; t < tc; t++) {
          var m = 15 * 60 + Math.floor(rnd() * 32) * 15;
          tours.push({ key: this.key(d), off: off, min: m, name: first[Math.floor(rnd() * first.length)] + ' ' + last[Math.floor(rnd() * last.length)], phone: '+20 11' + Math.floor(10000000 + rnd() * 89999999) });
        }
      }
    }
    return { today: today, bookings: bookings, packs: packs, tours: tours };
  }
  // ---------- helpers ----------
  money(v) { return v.toLocaleString('en-US') + ' EGP'; }
  fmtH(h) { var x = h > 12 ? h - 12 : h; return x + ':00 ' + (h >= 12 ? 'PM' : 'AM'); }
  fmtM(m) { var h = Math.floor(m / 60), mm = m % 60, x = h > 12 ? h - 12 : h; return x + ':' + (mm < 10 ? '0' : '') + mm; }
  dayName(d, long) {
    var wl = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], ws = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return (long ? wl[d.getDay()] : ws[d.getDay()]) + ', ' + d.getDate() + ' ' + mo[d.getMonth()];
  }
  rel(off, h) {
    if (off === 0) return 'Today' + (h != null ? ', ' + this.fmtH(h) : '');
    if (off === -1) return 'Yesterday';
    if (off === 1) return 'Tomorrow';
    if (off < 0) return (-off) + ' days ago';
    return 'In ' + off + ' days';
  }
  eff(b) { var o = this.state.ov[b.id]; return o ? Object.assign({}, b, o) : b; }
  showToast(t) { var self = this; this.setState({ toast: t }); clearTimeout(this._tt); this._tt = setTimeout(function () { self.setState({ toast: '' }); }, 2600); }
  setOv(id, o) { var ov = Object.assign({}, this.state.ov); ov[id] = Object.assign({}, ov[id] || {}, o); this.setState({ ov: ov }); }
  canSee(role, tab) {
    if (role === 'Owner') return true;
    if (role === 'Manager') return tab !== 'team';
    return ['schedule', 'bookings', 'tours'].indexOf(tab) >= 0;
  }
  // ---------- render ----------
  renderVals() {
    var self = this, S = this.state, D = this.D, SV = this.services();
    var me = S.team.filter(function (m) { return m.email === S.email.trim().toLowerCase(); })[0] || { name: '', role: 'Front desk', email: '' };
    var all = D.bookings.map(function (b) { return self.eff(b); });
    var pillCls = { 'Upcoming': 'pill p-up', 'In studio': 'pill p-in', 'Completed': 'pill p-done', 'Cancelled': 'pill p-cx', 'No-show': 'pill p-ns' };
    var view = function (b) {
      var pay = b.status === 'Cancelled' ? (b.method === 'online' ? 'Refunded' : '—') : b.method === 'credit' ? (b.amount > 0 ? (b.paid ? 'Credit + paid' : 'Credit + due') : 'Package credit') : b.paid ? 'Paid' : 'Due at studio';
      var payCls = b.status === 'Cancelled' ? 'muted' : b.method === 'credit' && b.amount === 0 ? 'p-cred' : b.paid ? 'p-paid' : 'p-due';
      return { id: b.id, customer: b.customer, setup: 'Setup ' + b.setup, service: SV[b.svc].name, serviceShort: SV[b.svc].short,
        time: self.fmtH(b.start) + ' – ' + self.fmtH(b.end), dateShort: self.dayName(b.date, false), dateLong: self.dayName(b.date, true),
        amountLabel: self.money(b.amount), payLabel: pay, payCls: payCls, status: b.status, pillCls: pillCls[b.status],
        methodLabel: { online: 'Card online', onsite: 'At the studio', credit: 'Package credit' }[b.method],
        people: String(b.people), extras: b.extras, phone: b.phone, email: b.email, created: self.rel(b.createdOff, b.createdH),
        open: function () { self.setState({ sel: b.id }); } };
    };
    // ---- auth ----
    var signIn = function () {
      var e = S.email.trim().toLowerCase(), m = S.team.filter(function (x) { return x.email === e; })[0];
      if (!e || !S.pw) { self.setState({ loginErr: 'Enter your email and password.' }); return; }
      if (!m) { self.setState({ loginErr: "This email doesn't have access. Ask the owner to invite you." }); return; }
      if (m.status !== 'Active') { self.setState({ loginErr: m.status === 'Invited' ? 'Your invite is pending — set your password from the invite email first.' : 'Your access has been paused by the owner.' }); return; }
      var first = ['overview', 'schedule', 'bookings', 'payments', 'tours', 'team'].filter(function (t) { return self.canSee(m.role, t); })[0];
      self.setState({ authed: true, loginErr: '', tab: first, pw: '' });
    };
    // ---- tabs ----
    var tabDefs = [
      ['overview', 'Overview', 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-4H4z'],
      ['schedule', 'Schedule', 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
      ['bookings', 'Bookings', 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'],
      ['payments', 'Payments', 'M3 7h18v10H3zM3 11h18M7 15h3'],
      ['tours', 'Tours', 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7v3l2 1'],
      ['team', 'Team & access', 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8']
    ];
    var tabs = tabDefs.filter(function (t) { return self.canSee(me.role, t[0]); }).map(function (t) {
      return { label: t[1], icon: t[2], cur: S.tab === t[0] ? 'page' : 'false', cls: 'nav' + (S.tab === t[0] ? ' on' : ''),
        go: function () { self.setState({ tab: t[0], sel: null }); if (self.rootEl) self.rootEl.scrollTo({ top: 0 }); } };
    });
    var tab = this.canSee(me.role, S.tab) ? S.tab : (tabs[0] ? tabDefs.filter(function (t) { return self.canSee(me.role, t[0]); })[0][0] : 'schedule');
    // ---- overview ----
    var R = S.range, inR = function (off) { return off <= 0 && off > -R; };
    var live = all.filter(function (b) { return b.status !== 'Cancelled'; });
    var sessIn = live.filter(function (b) { return inR(b.off) && b.paid; }), sessMoney = sessIn.reduce(function (a, b) { return a + b.amount; }, 0);
    var packsIn = D.packs.filter(function (p) { return inR(p.off); }), packMoney = packsIn.reduce(function (a, p) { return a + p.amount; }, 0);
    var bookingsIn = live.filter(function (b) { return inR(b.off); });
    var hoursIn = bookingsIn.reduce(function (a, b) { return a + (b.end - b.start); }, 0);
    var openDays = 0; for (var i = 0; i < R; i++) { var dd = new Date(D.today); dd.setDate(D.today.getDate() - i); if (dd.getDay() !== 5) openDays++; }
    var util = Math.round(hoursIn / (openDays * 7 * 8) * 100);
    var dueUp = live.filter(function (b) { return b.off >= 0 && !b.paid && b.status !== 'No-show'; }), dueAmt = dueUp.reduce(function (a, b) { return a + b.amount; }, 0);
    var upcoming = live.filter(function (b) { return b.off >= 0 && b.status === 'Upcoming'; }).length;
    var rangeLabel = R === 1 ? 'Today' : 'Last ' + R + ' days';
    var k = { revenue: self.money(sessMoney + packMoney), revenueSub: self.money(sessMoney) + ' sessions · ' + self.money(packMoney) + ' packages',
      bookings: String(bookingsIn.length), bookingsSub: upcoming + ' upcoming from today',
      util: util + '%', utilSub: hoursIn + ' of ' + (openDays * 56) + ' studio hours · ' + rangeLabel.toLowerCase(),
      due: self.money(dueAmt), dueSub: dueUp.length + ' bookings to collect on the day',
      packs: String(packsIn.length), packsSub: packsIn.reduce(function (a, p) { return a + p.count; }, 0) + ' session credits sold' };
    var chart = [], maxV = 1, vals = [];
    for (var o = -13; o <= 0; o++) {
      var v = live.filter(function (b) { return b.off === o && b.paid; }).reduce(function (a, b) { return a + b.amount; }, 0) + D.packs.filter(function (p) { return p.off === o; }).reduce(function (a, p) { return a + p.amount; }, 0);
      vals.push({ o: o, v: v }); if (v > maxV) maxV = v;
    }
    vals.forEach(function (x) { var d2 = new Date(D.today); d2.setDate(D.today.getDate() + x.o);
      chart.push({ h: Math.max(2, Math.round(x.v / maxV * 100)), d: x.o === 0 ? 'Today' : String(d2.getDate()), cls: 'bar' + (x.o === 0 ? ' today' : ''), tip: self.dayName(d2) + ': ' + self.money(x.v) }); });
    var chartSum = vals.reduce(function (a, x) { return a + x.v; }, 0);
    var todayB = all.filter(function (b) { return b.off === 0 && b.status !== 'Cancelled'; }).sort(function (a, b) { return a.start - b.start || a.setup - b.setup; });
    var todayList = todayB.map(function (b) { var x = view(b); return { time: self.fmtH(b.start), customer: x.customer, setup: x.setup, service: x.serviceShort, status: x.status, pillCls: x.pillCls, open: x.open }; });
    var svcTotals = ['rec', 'mix', 'pro'].map(function (id) { return { name: SV[id].name, v: sessIn.filter(function (b) { return b.svc === id; }).reduce(function (a, b) { return a + b.amount; }, 0) }; });
    svcTotals.push({ name: 'Packages', v: packMoney });
    var svMax = Math.max.apply(null, svcTotals.map(function (x) { return x.v; }).concat([1]));
    var bySvc = svcTotals.map(function (x) { return { name: x.name, amount: self.money(x.v), pct: Math.round(x.v / svMax * 100) }; });
    var ev = [];
    all.forEach(function (b) {
      if (b.createdOff >= -3 && b.createdOff <= 0) ev.push({ off: b.createdOff, h: b.createdH, text: b.customer + ' booked Setup ' + b.setup + ' · ' + self.dayName(b.date) });
      if (b.status === 'Cancelled' && b.off >= -2) ev.push({ off: Math.min(0, b.off), h: 12, text: b.customer + ' cancelled Setup ' + b.setup + ' · ' + self.dayName(b.date) });
      if (b.off === 0 && b.status === 'In studio') ev.push({ off: 0, h: b.start, text: b.customer + ' checked in to Setup ' + b.setup });
    });
    D.packs.forEach(function (p) { if (p.off >= -3) ev.push({ off: p.off, h: p.h, text: p.customer + ' bought ' + p.count + ' × ' + SV[p.svc].short + ' credits · ' + self.money(p.amount) }); });
    D.tours.forEach(function (t, ti) { if (t.off >= 0 && t.off <= 3 && ti % 2 === 0) ev.push({ off: Math.min(0, Math.max(-2, t.off - 2)), h: 11, text: t.name + ' booked a studio tour · ' + self.fmtM(t.min) + ' PM' }); });
    ev.sort(function (a, b) { return b.off - a.off || b.h - a.h; });
    var activity = ev.slice(0, 8).map(function (e) { return { text: e.text, when: self.rel(e.off, e.h) }; });
    // ---- schedule ----
    var sd = new Date(D.today); sd.setDate(D.today.getDate() + S.schedOff);
    var sKey = this.key(sd), sClosed = sd.getDay() === 5;
    var dayB = all.filter(function (b) { return b.key === sKey && b.status !== 'Cancelled'; });
    var blkCls = { 'Upcoming': 'blk b-up', 'In studio': 'blk b-in', 'Completed': 'blk b-done', 'No-show': 'blk b-ns' };
    var rows = []; for (var su = 1; su <= 7; su++) {
      (function (su) {
        rows.push({ name: 'Setup ' + su, blocks: dayB.filter(function (b) { return b.setup === su; }).map(function (b) { var x = view(b);
          return { customer: b.customer, time: self.fmtH(b.start) + '–' + self.fmtH(b.end), gc: (b.start - 14) + ' / ' + (b.end - 14), cls: blkCls[b.status], open: x.open, aria: b.customer + ', ' + x.time + ', ' + b.status }; }) });
      })(su);
    }
    var sHours = dayB.reduce(function (a, b) { return a + (b.end - b.start); }, 0);
    var sched = { title: S.schedOff === 0 ? 'Today' : this.dayName(sd, true), sub: (S.schedOff === 0 ? this.dayName(sd, true) + ' · ' : '') + dayB.length + ' sessions · ' + sHours + ' of 56 hours booked',
      closed: sClosed, open: !sClosed, rows: rows,
      prev: function () { self.setState({ schedOff: S.schedOff - 1 }); }, next: function () { self.setState({ schedOff: S.schedOff + 1 }); }, today: function () { self.setState({ schedOff: 0 }); } };
    // ---- bookings list ----
    var q = S.q.trim().toLowerCase();
    var list = all.filter(function (b) {
      if (S.fStatus === 'upcoming' && b.status !== 'Upcoming' && b.status !== 'In studio') return false;
      if (S.fStatus === 'today' && b.off !== 0) return false;
      if (S.fStatus === 'due' && (b.paid || b.status === 'Cancelled')) return false;
      if (S.fStatus === 'completed' && b.status !== 'Completed') return false;
      if (S.fStatus === 'cancelled' && b.status !== 'Cancelled' && b.status !== 'No-show') return false;
      if (q && (b.customer + ' ' + b.id + ' setup ' + b.setup).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) { var ua = a.off >= 0 ? 0 : 1, ub = b.off >= 0 ? 0 : 1; if (ua !== ub) return ua - ub; return ua === 0 ? (a.off - b.off || a.start - b.start) : (b.off - a.off || b.start - a.start); });
    var chipDefs = [['all', 'All'], ['today', 'Today'], ['upcoming', 'Upcoming'], ['due', 'Payment due'], ['completed', 'Completed'], ['cancelled', 'Cancelled & no-show']];
    var statusChips = chipDefs.map(function (c) { return { label: c[1], on: S.fStatus === c[0], cls: 'chip' + (S.fStatus === c[0] ? ' on' : ''), go: function () { self.setState({ fStatus: c[0] }); } }; });
    // ---- payments ----
    var txns = [];
    live.filter(function (b) { return inR(b.off) && b.amount > 0; }).forEach(function (b) { txns.push({ off: b.off, h: b.start, date: self.dayName(b.date), customer: b.customer, item: 'Session · Setup ' + b.setup + ' · ' + SV[b.svc].short, method: b.method === 'online' ? 'Card' : b.method === 'credit' ? 'Card (extras)' : 'At studio', amount: self.money(b.amount), status: b.paid ? 'Paid' : 'Due', stCls: b.paid ? 'p-paid' : 'p-due' }); });
    packsIn.forEach(function (p) { txns.push({ off: p.off, h: p.h, date: self.dayName(p.date), customer: p.customer, item: 'Package · ' + p.count + ' × ' + SV[p.svc].short, method: p.method, amount: self.money(p.amount), status: 'Paid', stCls: 'p-paid' }); });
    all.filter(function (b) { return inR(b.off) && b.status === 'Cancelled' && b.method === 'online'; }).forEach(function (b) { txns.push({ off: b.off, h: b.start, date: self.dayName(b.date), customer: b.customer, item: 'Refund · Setup ' + b.setup, method: 'Card', amount: '−' + self.money(b.amount), status: 'Refunded', stCls: 'muted' }); });
    txns.sort(function (a, b) { return b.off - a.off || b.h - a.h; });
    var onlineAmt = sessIn.filter(function (b) { return b.method !== 'onsite'; }).reduce(function (a, b) { return a + b.amount; }, 0) + packsIn.filter(function (p) { return p.method === 'Card'; }).reduce(function (a, p) { return a + p.amount; }, 0);
    var studioAmt = sessIn.filter(function (b) { return b.method === 'onsite'; }).reduce(function (a, b) { return a + b.amount; }, 0) + packsIn.filter(function (p) { return p.method !== 'Card'; }).reduce(function (a, p) { return a + p.amount; }, 0);
    var payTotals = [
      { label: 'Total collected', amount: self.money(sessMoney + packMoney), sub: rangeLabel },
      { label: 'Paid online', amount: self.money(onlineAmt), sub: 'Card payments' },
      { label: 'Paid at studio', amount: self.money(studioAmt), sub: 'Collected on the day' },
      { label: 'Still to collect', amount: self.money(dueAmt), sub: dueUp.length + ' upcoming bookings' }
    ];
    // ---- tours ----
    var td = new Date(D.today); td.setDate(D.today.getDate() + S.tourOff);
    var tKey = this.key(td), tClosed = td.getDay() === 5, blocked = S.tourBlocks[tKey] || [];
    var tb = D.tours.filter(function (t) { return t.key === tKey; });
    var tSlots = [], openN = 0;
    for (var m = 15 * 60; m < 23 * 60; m += 15) {
      (function (m) {
        var booked = tb.some(function (t) { return t.min === m; }), bl = blocked.indexOf(m) >= 0;
        if (!booked && !bl) openN++;
        tSlots.push({ label: self.fmtM(m), booked: booked, state: booked ? 'Booked' : bl ? 'Blocked' : 'Open', cls: 'ts ' + (booked ? 'ts-booked' : bl ? 'ts-blocked' : 'ts-open'),
          aria: self.fmtM(m) + ' PM, ' + (booked ? 'booked' : bl ? 'blocked — tap to open' : 'open — tap to block'),
          toggle: function () { var arr = (self.state.tourBlocks[tKey] || []).slice(), ix = arr.indexOf(m); if (ix >= 0) arr.splice(ix, 1); else arr.push(m); var o = Object.assign({}, self.state.tourBlocks); o[tKey] = arr; self.setState({ tourBlocks: o }); } });
      })(m);
    }
    var allMins = []; for (var mm = 15 * 60; mm < 23 * 60; mm += 15) allMins.push(mm);
    var tour = { dayLabel: S.tourOff === 0 ? 'Today' : this.dayName(td), closed: tClosed, open: !tClosed, slots: tSlots,
      summary: openN + ' open · ' + tb.length + ' booked · ' + (32 - openN - tb.length) + ' blocked. Customers only see open slots.',
      booked: tb.sort(function (a, b) { return a.min - b.min; }).map(function (t) { return { time: self.fmtM(t.min) + ' PM', name: t.name, phone: t.phone, call: function () { self.showToast('Calling ' + t.phone); } }; }),
      none: tb.length === 0,
      prev: function () { self.setState({ tourOff: Math.max(0, S.tourOff - 1) }); }, next: function () { self.setState({ tourOff: S.tourOff + 1 }); },
      openAll: function () { var o = Object.assign({}, S.tourBlocks); o[tKey] = []; self.setState({ tourBlocks: o }); },
      blockAll: function () { var o = Object.assign({}, S.tourBlocks); o[tKey] = allMins.filter(function (x) { return !tb.some(function (t) { return t.min === x; }); }); self.setState({ tourBlocks: o }); } };
    // ---- team ----
    var initials = function (n2) { return n2.split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); };
    var setTeam = function (email, patch) { self.setState({ team: S.team.map(function (x) { return x.email === email ? Object.assign({}, x, patch) : x; }) }); };
    var teamRows = S.team.map(function (m2) {
      var isOwner = m2.role === 'Owner';
      return { name: m2.name, email: m2.email, initials: initials(m2.name), role: m2.role, youTag: m2.email === me.email ? ' (you)' : '',
        status: m2.status, stCls: m2.status === 'Active' ? 'p-paid' : m2.status === 'Invited' ? 'p-due' : 'muted',
        editable: !isOwner, locked: isOwner, roleAria: 'Role for ' + m2.name, toggleLabel: m2.status === 'Paused' ? 'Restore access' : 'Pause access',
        setRole: function (e) { setTeam(m2.email, { role: e.target.value }); self.showToast(m2.name + ' is now ' + e.target.value); },
        toggle: function () { setTeam(m2.email, { status: m2.status === 'Paused' ? 'Active' : 'Paused' }); self.showToast(m2.status === 'Paused' ? 'Access restored for ' + m2.name : 'Access paused for ' + m2.name); },
        remove: function () { self.setState({ team: S.team.filter(function (x) { return x.email !== m2.email; }) }); self.showToast(m2.name + ' can no longer sign in'); } };
    });
    var invEmail = S.invite.email.trim().toLowerCase();
    var invite = { email: S.invite.email, role: S.invite.role, blocked: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail) || S.team.some(function (x) { return x.email === invEmail; }) };
    // ---- drawer ----
    var selB = S.sel ? all.filter(function (b) { return b.id === S.sel; })[0] : null;
    var selV = selB ? view(selB) : {};
    if (selB) {
      selV.canPay = !selB.paid && selB.status !== 'Cancelled' && selB.amount > 0;
      selV.canCheckIn = selB.status === 'Upcoming' && selB.off === 0;
      selV.canComplete = selB.status === 'In studio';
      selV.canNoShow = selB.status === 'Upcoming' && selB.off <= 0;
      selV.canChange = selB.status === 'Upcoming';
    }
    var act = {
      pay: function () { self.setOv(S.sel, { paid: true }); self.showToast('Marked as paid'); },
      checkIn: function () { self.setOv(S.sel, { status: 'In studio' }); self.showToast(selB.customer + ' checked in'); },
      complete: function () { self.setOv(S.sel, { status: 'Completed', paid: true }); self.showToast('Session completed'); },
      noShow: function () { self.setOv(S.sel, { status: 'No-show' }); self.showToast('Marked as no-show'); },
      cancel: function () { self.setOv(S.sel, { status: 'Cancelled' }); self.showToast('Booking cancelled — the slot is free again'); },
      reschedule: function () { self.showToast('Opens the calendar to move this booking'); },
      message: function () { self.showToast('Opens WhatsApp with ' + (selB ? selB.phone : '')); }
    };
    var ranges = [[1, 'Today'], [7, '7 days'], [14, '14 days']].map(function (r2) { return { label: r2[1], cls: S.range === r2[0] ? 'on' : '', go: function () { self.setState({ range: r2[0] }); } }; });
    var nameFirst = (me.name || '').split(' ')[0];
    return {
      setRoot: function (el) { self.rootEl = el; },
      loggedIn: S.authed, loggedOut: !S.authed, email: S.email, pw: S.pw,
      onEmail: function (e) { self.setState({ email: e.target.value, loginErr: '' }); }, onPw: function (e) { self.setState({ pw: e.target.value, loginErr: '' }); },
      hasLoginErr: !!S.loginErr, loginErr: S.loginErr, signIn: signIn,
      signOut: function () { self.setState({ authed: false, sel: null, pw: '' }); },
      me: { name: me.name, role: me.role, initials: me.name ? initials(me.name) : '', first: nameFirst },
      tabs: tabs, is: { overview: tab === 'overview', schedule: tab === 'schedule', bookings: tab === 'bookings', payments: tab === 'payments', tours: tab === 'tours', team: tab === 'team' },
      todayLong: this.dayName(D.today, true), ranges: ranges, rangeLabel: rangeLabel, k: k,
      chart: chart, chartTotal: self.money(chartSum), chartAria: 'Money in per day for the last 14 days, ' + self.money(chartSum) + ' in total',
      todayList: todayList, noToday: todayList.length === 0, noTodayMsg: D.today.getDay() === 5 ? 'Closed today — it is Friday.' : 'No sessions booked today.',
      goSchedule: function () { self.setState({ tab: 'schedule', schedOff: 0 }); },
      bySvc: bySvc, activity: activity,
      hours: ['3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'], sched: sched,
      q: S.q, onQ: function (e) { self.setState({ q: e.target.value }); }, statusChips: statusChips,
      rows: list.map(view), noRows: list.length === 0, listCount: list.length + (list.length === 1 ? ' booking' : ' bookings') + ' · sample data',
      clearFilters: function () { self.setState({ q: '', fStatus: 'all' }); },
      payTotals: payTotals, txns: txns, exportCsv: function () { self.showToast('Exported ' + txns.length + ' transactions to CSV'); },
      tour: tour, teamRows: teamRows, invite: invite,
      onInvEmail: function (e) { self.setState({ invite: { email: e.target.value, role: S.invite.role } }); },
      onInvRole: function (e) { self.setState({ invite: { email: S.invite.email, role: e.target.value } }); },
      sendInvite: function () { var nm = invEmail.split('@')[0].replace(/[._-]+/g, ' ').replace(/\b\w/g, function (c2) { return c2.toUpperCase(); });
        self.setState({ team: S.team.concat([{ name: nm, email: invEmail, role: S.invite.role, status: 'Invited' }]), invite: { email: '', role: S.invite.role } }); self.showToast('Invite sent to ' + invEmail); },
      hasSel: !!selB, sel: selV, closeSel: function () { self.setState({ sel: null }); }, act: act,
      hasToast: !!S.toast, toast: S.toast
    };
  }
}
