// State and behaviour for the studio admin. Converted from design/Admin.dc.html, now on live data:
// sign-in by email link, roles from the `staff` table, bookings/packages/sign-ins from Supabase.
// Every action is checked again by the database, so hiding a button is never the only protection.
import DCLogic from '../lib/DCLogic.jsx';
import { supabase } from '../lib/supabase.js';
import { rescheduleBooking, staffCancel } from '../lib/booking.js';
import { sendSignInLink, watchSession, recordSignIn, signOut as authSignOut, signInWithPassword, sendPasswordReset, setPassword, saveProfile } from '../lib/auth.js';

const ROLE_UI = { owner: 'Owner', manager: 'Manager', front_desk: 'Front desk' };
const ROLE_DB = { 'Owner': 'owner', 'Manager': 'manager', 'Front desk': 'front_desk' };
const STATUS_UI = { invited: 'Invited', active: 'Active', paused: 'Paused' };
const ERRORS = {
  owner_only: 'Only the owner can do that.', not_allowed: 'Your role cannot do that.', not_staff: 'You are not on the team.',
  already_on_team: 'That email is already on the team.', cannot_change_owner: 'The owner cannot be changed here.',
};
const errText = (e) => ERRORS[e && e.message] || 'Something went wrong. Please try again.';

function cairoParts(iso) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' })
    .formatToParts(new Date(iso)).reduce((o, p) => { o[p.type] = Number(p.value); return o; }, {});
  return { y: parts.year, m: parts.month, d: parts.day, h: parts.hour };
}

export default class Logic extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      authed: false, email: '', pw: '', loginErr: '', signInBusy: false, linkSent: '', newPw: '', showPwPanel: false, pwReset: false, hasPw: true, tab: 'overview', range: 7,
      me: null, team: [], rows: [], orders: [], signIns: [], testCount: 0, testArmed: false, testBusy: false, loaded: false,
      q: '', fStatus: 'all', sel: null, schedOff: 0, tourOff: 0, tourBlocks: {},
      invite: { email: '', role: 'Front desk' }, toast: '', mvOpen: false, mvDate: '', mvHour: '', mvBusy: false, pkgs: [], pkSel: null, pkFilter: 'active', pkQ: '', pkArmed: false, pkAlso: true, pkBusy: false
    };
  }
  // ---------- session & data ----------
  componentDidMount() {
    var self = this;
    this._unwatch = watchSession(function (session, event) { self.onSession(session, event); });
  }
  componentWillUnmount() { clearTimeout(this._tt); if (this._unwatch) this._unwatch(); }
  onSession(session, event) {
    var self = this, email = session && session.user && session.user.email;
    if (event === 'PASSWORD_RECOVERY') this.setState({ showPwPanel: true, pwReset: true });
    if (!email) { this.setState({ authed: false, me: null }); return; }
    // Staff who have not saved a password yet see a reminder to set one.
    this.setState({ hasPw: !!(session.user.user_metadata || {}).staff_pw });
    if (this._checked === email && this.state.authed) return;
    this._checked = email;
    recordSignIn().then(function (who) {
      if (!who || !who.role) {
        // Never sign people out here: the sign-in is shared with the customer site (all tabs),
        // so signing out would also log a customer out of My account.
        self.setState({ authed: false, email: '', loginErr: "You're signed in as " + email + " (a customer account), which isn't on the team. To open the admin, sign in below with a team email, or ask the owner to add you." });
        return;
      }
      var first = ['overview', 'schedule', 'bookings', 'packages', 'payments', 'tours', 'auditions', 'team'].filter(function (t) { return self.canSee(ROLE_UI[who.role], t); })[0];
      self.setState({ authed: true, loginErr: '', linkSent: '', me: { name: who.name, email: who.email, role: ROLE_UI[who.role] }, tab: first });
      self.loadAll();
    }).catch(function () { self.setState({ loginErr: 'Could not check your access. Please try again.' }); });
  }
  loadAll() {
    var self = this, from = new Date(), to = new Date();
    from.setDate(from.getDate() - 60); to.setDate(to.getDate() + 90);
    var role = this.state.me && this.state.me.role;
    var money = role === 'Owner' || role === 'Manager';
    var q = [
      supabase.from('bookings').select('*').gte('starts_at', from.toISOString()).lte('starts_at', to.toISOString())
        .in('status', ['confirmed', 'in_studio', 'completed', 'no_show', 'cancelled', 'needs_review']).order('starts_at'),
      supabase.from('staff').select('*').order('created_at'),
      money ? supabase.from('package_orders').select('*').eq('payment_status', 'paid').gte('created_at', from.toISOString()) : Promise.resolve({ data: [] }),
      money ? supabase.from('sign_ins').select('*').order('at', { ascending: false }).limit(25) : Promise.resolve({ data: [] }),
      role === 'Owner' ? supabase.from('bookings').select('ref', { count: 'exact', head: true }).eq('is_test', true) : Promise.resolve({ count: 0 }),
      role === 'Owner' ? supabase.from('package_orders').select('ref', { count: 'exact', head: true }).eq('is_test', true) : Promise.resolve({ count: 0 }),
      money ? supabase.rpc('staff_packages') : Promise.resolve({ data: [] }),
      supabase.from('audition_applications').select('*').order('created_at', { ascending: false }).limit(200),
    ];
    return Promise.all(q).then(function (r) {
      var err = r.filter(function (x) { return x && x.error; })[0];
      if (err) { console.warn(err.error); self.showToast('Some data could not be loaded.'); }
      self.setState({ rows: r[0].data || [], team: r[1].data || [], orders: r[2].data || [], signIns: r[3].data || [],
        testCount: (r[4].count || 0) + (r[5].count || 0), pkgs: r[6].data || [], auditions: r[7].data || [], loaded: true });
    });
  }
  services() { return { rec: { name: 'Recording Only', short: 'Recording', price: 1150 }, mix: { name: 'Recording + Live Edit', short: 'Live Edit', price: 1450 }, pro: { name: 'Recording + Pro Edit', short: 'Pro Edit', price: 1950 }, photo: { name: 'Photo shoot (cyclorama)', short: 'Photo shoot', price: 1000 } }; }
  // Rooms: setups 1-7, and the cyclorama as room 8.
  roomName(n) { return n === 8 ? 'Cyclorama' : 'Setup ' + n; }
  key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  // Turns database rows into the shapes the dashboard design uses.
  build() {
    var self = this, S = this.state;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var dayOff = function (d) { return Math.round((d - today) / 86400000); };
    var created = function (iso) { var c = new Date(iso), cd = new Date(c); cd.setHours(0, 0, 0, 0); return { off: dayOff(cd), h: c.getHours() }; };
    var bookings = S.rows.map(function (r) {
      var a = cairoParts(r.starts_at), e = cairoParts(r.ends_at), d = new Date(a.y, a.m - 1, a.d), off = dayOff(d), c = created(r.created_at);
      var st = { cancelled: 'Cancelled', no_show: 'No-show', completed: 'Completed', in_studio: 'In studio', needs_review: 'Needs review' }[r.status]
        || (off < 0 ? 'Completed' : 'Upcoming');
      var ex = []; if (r.extra_cameras) ex.push('Extra camera × ' + r.extra_cameras); if (r.extra_mics) ex.push('Extra microphone × ' + r.extra_mics);
      if (r.photographer) ex.push('Session photographer'); if (r.extra_hours) ex.push('Extra hour × ' + r.extra_hours);
      return { id: r.ref, off: off, date: d, key: self.key(d), setup: r.setup_id === 'cyc' ? 8 : parseInt(String(r.setup_id).slice(1), 10) || 0, start: a.h, end: e.h || 24, svc: r.service,
        customer: r.first_name + ' ' + r.last_name, phone: r.phone || '—', email: r.email, people: r.people, guests: r.guests || 0, extras: ex.length ? ex.join(', ') : 'None',
        method: r.payment_method || 'card', packageRef: r.package_ref, amount: r.total_egp, status: st, paid: r.payment_status === 'paid', refunded: r.payment_status === 'refunded',
        isTest: r.is_test, createdOff: c.off, createdH: c.h };
    });
    var packs = S.orders.map(function (o) {
      var c = new Date(o.created_at), cd = new Date(c); cd.setHours(0, 0, 0, 0);
      return { off: dayOff(cd), date: cd, customer: o.first_name + ' ' + o.last_name, svc: o.service, count: o.sessions, amount: o.total_egp, method: o.payment_method === 'cash' ? 'At studio' : 'Card', h: c.getHours() };
    });
    return { today: today, bookings: bookings, packs: packs, tours: [] };
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
  ago(iso) {
    var s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
    if (s < 60) return 'Just now'; if (s < 3600) return Math.floor(s / 60) + ' min ago';
    if (s < 86400) return Math.floor(s / 3600) + ' h ago';
    return this.dayName(new Date(iso)) + ', ' + new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  }
  showToast(t) { var self = this; this.setState({ toast: t }); clearTimeout(this._tt); this._tt = setTimeout(function () { self.setState({ toast: '' }); }, 3200); }
  canSee(role, tab) {
    if (role === 'Owner') return true;
    if (role === 'Manager') return tab !== 'team';
    return ['schedule', 'bookings', 'tours', 'auditions'].indexOf(tab) >= 0;
  }
  rpc(name, args, okMsg) {
    var self = this;
    return supabase.rpc(name, args).then(function (res) {
      if (res.error) { self.showToast(errText(res.error)); return false; }
      if (okMsg) self.showToast(okMsg);
      return self.loadAll().then(function () { return true; });
    });
  }
  // ---------- render ----------
  renderVals() {
    var self = this, S = this.state, D = this.build(), SV = this.services();
    var me = S.me || { name: '', role: 'Front desk', email: '' };
    var all = D.bookings;
    var pillCls = { 'Upcoming': 'pill p-up', 'In studio': 'pill p-in', 'Completed': 'pill p-done', 'Cancelled': 'pill p-cx', 'No-show': 'pill p-ns', 'Needs review': 'pill p-ns' };
    var view = function (b) {
      var pay = b.status === 'Cancelled' ? (b.refunded ? 'Refunded' : b.paid ? 'To refund' : '—') : b.paid ? 'Paid' : b.method === 'cash' ? 'Due at studio' : 'Not paid';
      var payCls = b.status === 'Cancelled' ? (b.paid && !b.refunded ? 'p-due' : 'muted') : b.paid ? 'p-paid' : 'p-due';
      var sv = SV[b.svc] || { name: b.svc, short: b.svc };
      return { id: b.id, customer: b.customer + (b.isTest ? ' (test)' : ''), setup: self.roomName(b.setup), service: sv.name, serviceShort: sv.short,
        time: self.fmtH(b.start) + ' – ' + self.fmtH(b.end), dateShort: self.dayName(b.date, false), dateLong: self.dayName(b.date, true),
        amountLabel: self.money(b.amount), payLabel: pay, payCls: payCls, status: b.status, pillCls: pillCls[b.status] || 'pill p-up',
        methodLabel: (b.packageRef ? 'Package credit (' + b.packageRef + ')' + (b.amount > 0 ? ' + ' : '') : '') + (b.packageRef && b.amount === 0 ? '' : b.method === 'cash' ? 'At the studio (cash)' : 'Card (Paymob)'), people: String(b.people), guests: b.guests ? String(b.guests) : 'None', hasGuests: b.guests > 0, guestTag: b.guests ? '+' + b.guests + (b.guests === 1 ? ' guest' : ' guests') : '', extras: b.extras, phone: b.phone, email: b.email, created: self.rel(b.createdOff, b.createdH),
        open: function () { self.setState({ sel: b.id, mvOpen: false }); } };
    };
    // ---- sign-in ----
    var validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(S.email.trim());
    var signIn = function () {
      if (!validEmail) { self.setState({ loginErr: 'Enter your work email.' }); return; }
      if (!S.pw) { self.setState({ loginErr: 'Enter your password. First time here? Tap "Email me a sign-in link" below.' }); return; }
      self.setState({ signInBusy: true, loginErr: '' });
      signInWithPassword(S.email, S.pw).then(function () { self.setState({ signInBusy: false, pw: '' }); })
        .catch(function (err) {
          var msg = err.code === 'invalid' ? 'Wrong email or password. No password yet? Tap "Email me a sign-in link", then set one inside.' : err.message;
          self.setState({ signInBusy: false, loginErr: msg });
        });
    };
    var emailLink = function () {
      if (!validEmail) { self.setState({ loginErr: 'Enter your work email first.' }); return; }
      var em = S.email.trim().toLowerCase();
      self.setState({ loginErr: '' });
      sendSignInLink(em, '/admin/').then(function () { self.setState({ linkSent: em }); })
        .catch(function (err) { self.setState({ loginErr: err.message }); });
    };
    var forgotPw = function () {
      if (!validEmail) { self.setState({ loginErr: 'Enter your work email first, then tap "Forgot password?".' }); return; }
      var em = S.email.trim().toLowerCase();
      sendPasswordReset(em, '/admin/').then(function () { self.setState({ loginErr: '', linkSent: em }); })
        .catch(function (err) { self.setState({ loginErr: err.message }); });
    };
    // ---- tabs ----
    var tabDefs = [
      ['overview', 'Overview', 'M4 13h6V4H4zM14 20h6v-9h-6zM14 4v4h6V4zM4 20h6v-4H4z'],
      ['schedule', 'Schedule', 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z'],
      ['bookings', 'Bookings', 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01'],
      ['packages', 'Packages', 'M4 7l8-4 8 4v10l-8 4-8-4zM4 7l8 4 8-4M12 11v10'],
      ['payments', 'Payments', 'M3 7h18v10H3zM3 11h18M7 15h3'],
      ['tours', 'Tours', 'M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21zM12 7v3l2 1'],
      ['auditions', 'Auditions', 'M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3'],
      ['team', 'Team & access', 'M16 19v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1M9 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM22 19v-1a4 4 0 0 0-3-3.9M16 4.1a3 3 0 0 1 0 5.8']
    ];
    var tabs = tabDefs.filter(function (t) { return self.canSee(me.role, t[0]); }).map(function (t) {
      return { label: t[1], icon: t[2], cur: S.tab === t[0] ? 'page' : 'false', cls: 'nav' + (S.tab === t[0] ? ' on' : ''),
        go: function () { self.setState({ tab: t[0], sel: null }); if (self.rootEl) self.rootEl.scrollTo({ top: 0 }); } };
    });
    var tab = this.canSee(me.role, S.tab) ? S.tab : (tabDefs.filter(function (t) { return self.canSee(me.role, t[0]); })[0] || ['schedule'])[0];
    // ---- overview ----
    var R = S.range, inR = function (off) { return off <= 0 && off > -R; };
    var live = all.filter(function (b) { return b.status !== 'Cancelled'; });
    var sessIn = live.filter(function (b) { return inR(b.createdOff) && b.paid; }), sessMoney = sessIn.reduce(function (a, b) { return a + b.amount; }, 0);
    var packsIn = D.packs.filter(function (p) { return inR(p.off); }), packMoney = packsIn.reduce(function (a, p) { return a + p.amount; }, 0);
    var bookingsIn = live.filter(function (b) { return inR(b.off); });
    var hoursIn = bookingsIn.reduce(function (a, b) { return a + (b.end - b.start); }, 0);
    var openDays = 0; for (var i = 0; i < R; i++) { var dd = new Date(D.today); dd.setDate(D.today.getDate() - i); if (dd.getDay() !== 5) openDays++; }
    var util = openDays ? Math.round(hoursIn / (openDays * 7 * 8) * 100) : 0;
    var dueUp = live.filter(function (b) { return b.off >= 0 && !b.paid && b.status !== 'No-show'; }), dueAmt = dueUp.reduce(function (a, b) { return a + b.amount; }, 0);
    var upcoming = live.filter(function (b) { return b.off >= 0 && b.status === 'Upcoming'; }).length;
    var rangeLabel = R === 1 ? 'Today' : 'Last ' + R + ' days';
    var k = { revenue: self.money(sessMoney + packMoney), revenueSub: self.money(sessMoney) + ' sessions · ' + self.money(packMoney) + ' packages',
      bookings: String(bookingsIn.length), bookingsSub: upcoming + ' upcoming from today',
      util: util + '%', utilSub: hoursIn + ' of ' + (openDays * 56) + ' studio hours · ' + rangeLabel.toLowerCase(),
      due: self.money(dueAmt), dueSub: dueUp.length + ' bookings to collect at the studio',
      packs: String(packsIn.length), packsSub: packsIn.reduce(function (a, p) { return a + p.count; }, 0) + ' sessions sold in packages' };
    var chart = [], maxV = 1, vals = [];
    for (var o = -13; o <= 0; o++) {
      var v = live.filter(function (b) { return b.createdOff === o && b.paid; }).reduce(function (a, b) { return a + b.amount; }, 0) + D.packs.filter(function (p) { return p.off === o; }).reduce(function (a, p) { return a + p.amount; }, 0);
      vals.push({ o: o, v: v }); if (v > maxV) maxV = v;
    }
    vals.forEach(function (x) { var d2 = new Date(D.today); d2.setDate(D.today.getDate() + x.o);
      chart.push({ h: Math.max(2, Math.round(x.v / maxV * 100)), d: x.o === 0 ? 'Today' : String(d2.getDate()), cls: 'bar' + (x.o === 0 ? ' today' : ''), tip: self.dayName(d2) + ': ' + self.money(x.v) }); });
    var chartSum = vals.reduce(function (a, x) { return a + x.v; }, 0);
    var todayB = all.filter(function (b) { return b.off === 0 && b.status !== 'Cancelled'; }).sort(function (a, b) { return a.start - b.start || a.setup - b.setup; });
    var todayList = todayB.map(function (b) { var x = view(b); return { time: self.fmtH(b.start), customer: x.customer, hasGuests: x.hasGuests, guestTag: x.guestTag, setup: x.setup, service: x.serviceShort, status: x.status, pillCls: x.pillCls, open: x.open }; });
    var svcTotals = ['rec', 'mix', 'pro'].map(function (id) { return { name: SV[id].name, v: sessIn.filter(function (b) { return b.svc === id; }).reduce(function (a, b) { return a + b.amount; }, 0) }; });
    svcTotals.push({ name: 'Packages', v: packMoney });
    var svMax = Math.max.apply(null, svcTotals.map(function (x) { return x.v; }).concat([1]));
    var bySvc = svcTotals.map(function (x) { return { name: x.name, amount: self.money(x.v), pct: Math.round(x.v / svMax * 100) }; });
    var ev = [];
    all.forEach(function (b) {
      if (b.createdOff >= -3 && b.createdOff <= 0) ev.push({ t: b.createdOff * 100 + b.createdH, when: self.rel(b.createdOff, b.createdH), text: b.customer + ' booked ' + self.roomName(b.setup) + ' · ' + self.dayName(b.date) });
    });
    D.packs.forEach(function (p) { if (p.off >= -3) ev.push({ t: p.off * 100 + p.h, when: self.rel(p.off, p.h), text: p.customer + ' bought ' + p.count + ' × ' + (SV[p.svc] || {}).short + ' · ' + self.money(p.amount) }); });
    S.signIns.slice(0, 10).forEach(function (s2) {
      var c = new Date(s2.at), cd = new Date(c); cd.setHours(0, 0, 0, 0); var off = Math.round((cd - D.today) / 86400000);
      if (off >= -3) ev.push({ t: off * 100 + c.getHours() + c.getMinutes() / 100, when: self.ago(s2.at), text: s2.email + ' signed in' + (s2.kind === 'staff' ? ' (team)' : '') });
    });
    ev.sort(function (a, b) { return b.t - a.t; });
    var activity = ev.slice(0, 8).map(function (e) { return { text: e.text, when: e.when }; });
    // ---- schedule ----
    var sd = new Date(D.today); sd.setDate(D.today.getDate() + S.schedOff);
    var sKey = this.key(sd), sClosed = sd.getDay() === 5;
    var dayB = all.filter(function (b) { return b.key === sKey && b.status !== 'Cancelled'; });
    var blkCls = { 'Upcoming': 'blk b-up', 'In studio': 'blk b-in', 'Completed': 'blk b-done', 'No-show': 'blk b-ns', 'Needs review': 'blk b-ns' };
    var rows = []; for (var su = 1; su <= 8; su++) {
      (function (su) {
        rows.push({ name: self.roomName(su), blocks: dayB.filter(function (b) { return b.setup === su; }).map(function (b) { var x = view(b);
          return { customer: x.customer, time: self.fmtH(b.start) + '–' + self.fmtH(b.end), gc: (b.start - 14) + ' / ' + (b.end - 14), cls: blkCls[b.status], open: x.open, aria: b.customer + ', ' + x.time + ', ' + b.status }; }) });
      })(su);
    }
    var sHours = dayB.reduce(function (a, b) { return a + (b.end - b.start); }, 0);
    var sched = { title: S.schedOff === 0 ? 'Today' : this.dayName(sd, true), sub: (S.schedOff === 0 ? this.dayName(sd, true) + ' · ' : '') + dayB.length + ' sessions · ' + sHours + ' of 64 hours booked',
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
      if (q && (b.customer + ' ' + b.email + ' ' + b.phone + ' ' + b.id + ' ' + self.roomName(b.setup)).toLowerCase().indexOf(q) < 0) return false;
      return true;
    }).sort(function (a, b) { var ua = a.off >= 0 ? 0 : 1, ub = b.off >= 0 ? 0 : 1; if (ua !== ub) return ua - ub; return ua === 0 ? (a.off - b.off || a.start - b.start) : (b.off - a.off || b.start - a.start); });
    var chipDefs = [['all', 'All'], ['today', 'Today'], ['upcoming', 'Upcoming'], ['due', 'Payment due'], ['completed', 'Completed'], ['cancelled', 'Cancelled & no-show']];
    var statusChips = chipDefs.map(function (c) { return { label: c[1], on: S.fStatus === c[0], cls: 'chip' + (S.fStatus === c[0] ? ' on' : ''), go: function () { self.setState({ fStatus: c[0] }); } }; });
    // ---- payments ----
    var txns = [];
    all.filter(function (b) { return inR(b.createdOff) && b.amount > 0 && b.paid; }).forEach(function (b) { var sv = SV[b.svc] || {}; txns.push({ off: b.createdOff, h: b.createdH, date: self.dayName(b.date), customer: view(b).customer, item: 'Session · ' + self.roomName(b.setup) + ' · ' + sv.short, method: b.method === 'cash' ? 'At studio' : 'Card', amount: self.money(b.amount), status: b.status === 'Cancelled' ? (b.refunded ? 'Refunded' : 'To refund') : 'Paid', stCls: b.status === 'Cancelled' ? 'p-due' : 'p-paid', ref: b.id }); });
    packsIn.forEach(function (p) { txns.push({ off: p.off, h: p.h, date: self.dayName(p.date), customer: p.customer, item: 'Package · ' + p.count + ' × ' + (SV[p.svc] || {}).short, method: p.method, amount: self.money(p.amount), status: 'Paid', stCls: 'p-paid', ref: '' }); });
    txns.sort(function (a, b) { return b.off - a.off || b.h - a.h; });
    var onlineAmt = sessIn.filter(function (b) { return b.method !== 'cash'; }).reduce(function (a, b) { return a + b.amount; }, 0) + packsIn.filter(function (p) { return p.method === 'Card'; }).reduce(function (a, p) { return a + p.amount; }, 0);
    var studioAmt = sessMoney + packMoney - onlineAmt;
    var payTotals = [
      { label: 'Total collected', amount: self.money(sessMoney + packMoney), sub: rangeLabel },
      { label: 'Paid online', amount: self.money(onlineAmt), sub: 'Card payments via Paymob' },
      { label: 'Paid at studio', amount: self.money(studioAmt), sub: 'Cash collected on the day' },
      { label: 'Not paid', amount: self.money(dueAmt), sub: dueUp.length + ' upcoming bookings' }
    ];
    var exportCsv = function () {
      var esc = function (x) { return '"' + String(x == null ? '' : x).replace(/"/g, '""') + '"'; };
      var csv = ['Date,Customer,Item,Method,Amount,Status,Order'].concat(txns.map(function (t) { return [t.date, t.customer, t.item, t.method, t.amount, t.status, t.ref].map(esc).join(','); })).join('\r\n');
      var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv' }));
      a.download = 'nilepods-payments-' + new Date().toISOString().slice(0, 10) + '.csv'; a.click(); URL.revokeObjectURL(a.href);
      self.showToast('Downloaded ' + txns.length + ' transactions');
    };
    // ---- auditions: free pilot applications from the website ----
    var AUD_UI = { 'new': 'New', contacted: 'Contacted', accepted: 'Accepted', declined: 'Declined' };
    var aFilter = S.audFilter || 'open';
    var allApps = (S.auditions || []);
    var setAud = function (id, st) {
      return function () {
        supabase.rpc('staff_update_audition', { p_id: id, p_status: st }).then(function (r) {
          if (r.error) { self.showToast(errText(r.error)); return; }
          self.setState({ auditions: self.state.auditions.map(function (x) { return x.id === id ? Object.assign({}, x, { status: st }) : x; }) });
          self.showToast('Marked as ' + AUD_UI[st].toLowerCase() + '.');
        });
      };
    };
    var audApps = allApps.filter(function (a) { return aFilter === 'all' ? true : aFilter === 'open' ? (a.status === 'new' || a.status === 'contacted') : a.status === aFilter; })
      .map(function (a) {
        return { show: a.show_name, idea: a.idea, audience: a.audience || '', hasAudience: !!a.audience, hosts: (a.hosts || []).join(' · '),
          contact: a.contact_name, phone: a.phone, email: a.email, mail: 'mailto:' + a.email, tel: 'tel:' + a.phone.replace(/[^\d+]/g, ''),
          links: a.links || '', hasLinks: !!a.links,
          when: new Date(a.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          status: AUD_UI[a.status], pill: 'gtag aud-' + a.status,
          contacted: setAud(a.id, 'contacted'), accept: setAud(a.id, 'accepted'), decline: setAud(a.id, 'declined') };
      });
    var audTabs = [['open', 'To review'], ['accepted', 'Accepted'], ['declined', 'Declined'], ['all', 'All']].map(function (t) {
      var n = allApps.filter(function (a) { return t[0] === 'all' ? true : t[0] === 'open' ? (a.status === 'new' || a.status === 'contacted') : a.status === t[0]; }).length;
      return { label: t[1] + ' (' + n + ')', cls: 'btn-ghost' + (aFilter === t[0] ? ' on' : ''), go: function () { self.setState({ audFilter: t[0] }); } };
    });
    var auditions = { list: audApps, none: audApps.length === 0, tabs: audTabs,
      newCount: allApps.filter(function (a) { return a.status === 'new'; }).length };

    // ---- tours (not stored online yet: blocking here only lasts for this visit) ----
    var td = new Date(D.today); td.setDate(D.today.getDate() + S.tourOff);
    var tKey = this.key(td), tClosed = td.getDay() === 5, blocked = S.tourBlocks[tKey] || [];
    var tSlots = [], openN = 0;
    for (var m = 15 * 60; m < 23 * 60; m += 15) {
      (function (m) {
        var bl = blocked.indexOf(m) >= 0;
        if (!bl) openN++;
        tSlots.push({ label: self.fmtM(m), booked: false, state: bl ? 'Blocked' : 'Open', cls: 'ts ' + (bl ? 'ts-blocked' : 'ts-open'),
          aria: self.fmtM(m) + ' PM, ' + (bl ? 'blocked — tap to open' : 'open — tap to block'),
          toggle: function () { var arr = (self.state.tourBlocks[tKey] || []).slice(), ix = arr.indexOf(m); if (ix >= 0) arr.splice(ix, 1); else arr.push(m); var o2 = Object.assign({}, self.state.tourBlocks); o2[tKey] = arr; self.setState({ tourBlocks: o2 }); } });
      })(m);
    }
    var allMins = []; for (var mm = 15 * 60; mm < 23 * 60; mm += 15) allMins.push(mm);
    var tour = { dayLabel: S.tourOff === 0 ? 'Today' : this.dayName(td), closed: tClosed, open: !tClosed, slots: tSlots,
      summary: 'Tour requests from the website are not saved online yet, so this calendar is a preview and changes here are not kept.',
      booked: [], none: true,
      prev: function () { self.setState({ tourOff: Math.max(0, S.tourOff - 1) }); }, next: function () { self.setState({ tourOff: S.tourOff + 1 }); },
      openAll: function () { var o2 = Object.assign({}, S.tourBlocks); o2[tKey] = []; self.setState({ tourBlocks: o2 }); },
      blockAll: function () { var o2 = Object.assign({}, S.tourBlocks); o2[tKey] = allMins.slice(); self.setState({ tourBlocks: o2 }); } };
    // ---- team ----
    var initials = function (n2) { return (n2 || '?').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase(); };
    var isOwnerMe = me.role === 'Owner';
    var teamRows = S.team.map(function (m2) {
      var role = ROLE_UI[m2.role], status = STATUS_UI[m2.status] || m2.status, isOwner = m2.role === 'owner';
      return { name: m2.name, email: m2.email, initials: initials(m2.name), role: role, youTag: m2.email === me.email ? ' (you)' : '',
        status: status + (m2.last_sign_in_at ? ' · last sign-in ' + self.ago(m2.last_sign_in_at) : ''), stCls: m2.status === 'active' ? 'p-paid' : m2.status === 'invited' ? 'p-due' : 'muted',
        editable: !isOwner && isOwnerMe, locked: isOwner, roleAria: 'Role for ' + m2.name, toggleLabel: m2.status === 'paused' ? 'Restore access' : 'Pause access',
        setRole: function (e) { self.rpc('staff_change', { p_email: m2.email, p_role: ROLE_DB[e.target.value] }, m2.name + ' is now ' + e.target.value); },
        toggle: function () { var to = m2.status === 'paused' ? 'active' : 'paused'; self.rpc('staff_change', { p_email: m2.email, p_status: to }, to === 'active' ? 'Access restored for ' + m2.name : 'Access paused for ' + m2.name); },
        remove: function () { self.rpc('staff_change', { p_email: m2.email, p_remove: true }, m2.name + ' can no longer sign in'); } };
    });
    var invEmail = S.invite.email.trim().toLowerCase();
    var invite = { email: S.invite.email, role: S.invite.role, blocked: !isOwnerMe || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invEmail) || S.team.some(function (x) { return x.email === invEmail; }) };
    var logins = S.signIns.map(function (s2) { return { who: s2.email, kind: s2.kind === 'staff' ? 'Team' : 'Customer', when: self.ago(s2.at) }; });
    // ---- test data (owner only) ----
    var clearTest = function () {
      if (!S.testArmed) { self.setState({ testArmed: true }); return; }
      self.setState({ testBusy: true });
      supabase.rpc('clear_test_data').then(function (res) {
        self.setState({ testBusy: false, testArmed: false });
        if (res.error) { self.showToast(errText(res.error)); return; }
        var r0 = (res.data && res.data[0]) || {};
        self.showToast('Deleted ' + (r0.bookings_deleted || 0) + ' test bookings and ' + (r0.orders_deleted || 0) + ' test package orders');
        self.loadAll();
      });
    };
    // ---- drawer ----
    var selB = S.sel ? all.filter(function (b) { return b.id === S.sel; })[0] : null;
    var selV = selB ? view(selB) : {};
    if (selB) {
      selV.canPay = !selB.paid && selB.status !== 'Cancelled' && selB.amount > 0;
      selV.canCheckIn = selB.status === 'Upcoming' && selB.off === 0;
      selV.canComplete = selB.status === 'In studio';
      selV.canNoShow = selB.status === 'Upcoming' && selB.off <= 0;
      selV.canChange = selB.status === 'Upcoming' && me.role !== 'Front desk';
      selV.canMove = selB.status === 'Upcoming';
    }
    var act = {
      pay: function () { self.rpc('staff_update_booking', { p_ref: S.sel, p_mark_paid: true }, 'Marked as paid'); },
      checkIn: function () { self.rpc('staff_update_booking', { p_ref: S.sel, p_status: 'in_studio' }, selB.customer + ' checked in'); },
      complete: function () { self.rpc('staff_update_booking', { p_ref: S.sel, p_status: 'completed' }, 'Session completed'); },
      noShow: function () { self.rpc('staff_update_booking', { p_ref: S.sel, p_status: 'no_show' }, 'Marked as no-show'); },
      cancel: function () {
        supabase.auth.getSession().then(function (r) {
          var token = r.data.session && r.data.session.access_token;
          if (!token) throw new Error('Please sign in again.');
          return staffCancel('booking', S.sel, {}, token);
        }).then(function () {
          self.showToast('Booking cancelled and the customer was emailed. The slot is free again. Refund in Paymob if they paid by card.');
          self.loadAll();
        }).catch(function (err) { self.showToast(err.message); });
      },
      reschedule: function () { self.setState({ mvOpen: !S.mvOpen, mvDate: '', mvHour: '' }); },
      message: function () { var digits = String(selB ? selB.phone : '').replace(/\D/g, '').replace(/^0/, '20'); if (digits.length > 6) window.open('https://wa.me/' + digits, '_blank', 'noopener'); else self.showToast('No phone number on this booking'); }
    };
    // Staff reschedule: any time, same setup and length; the server checks the slot is free.
    var hh12 = function (h) { var x = h % 12 || 12; return x + ':00 ' + (h % 24 < 12 ? 'AM' : 'PM'); };
    var mvDur = selB ? selB.end - selB.start : 1, mvHours = [{ v: '', label: 'Pick a time' }];
    for (var mh = 15; mh + mvDur <= 23; mh++) mvHours.push({ v: String(mh), label: hh12(mh) + ' – ' + hh12(mh + mvDur) });
    var mv = { open: !!selB && S.mvOpen, label: S.mvOpen ? 'Close' : 'Reschedule', date: S.mvDate, hour: S.mvHour, hours: mvHours,
      onDate: function (e) { self.setState({ mvDate: e.target.value }); }, onHour: function (e) { self.setState({ mvHour: e.target.value }); },
      blocked: S.mvBusy || !S.mvDate || !S.mvHour, btn: S.mvBusy ? 'Moving\u2026' : 'Move booking',
      go: function () {
        self.setState({ mvBusy: true });
        supabase.auth.getSession().then(function (r) {
          var token = r.data.session && r.data.session.access_token;
          if (!token) throw new Error('Please sign in again.');
          return rescheduleBooking(S.sel, S.mvDate, parseInt(S.mvHour, 10), token);
        }).then(function () {
          self.setState({ mvBusy: false, mvOpen: false, mvDate: '', mvHour: '' });
          self.showToast('Booking moved. The customer was emailed the new time.');
          self.loadAll();
        }).catch(function (err) { self.setState({ mvBusy: false }); self.showToast(err.message); });
      } };
    // ----- packages -----
    var PN = { 3: 'Pilot', 5: 'Series', 10: 'Season', 20: 'Full Season' }, SVN = this.services();
    var dmy = function (iso) { var d = new Date(iso); return d.getDate() + ' ' + ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][d.getMonth()] + ' ' + d.getFullYear(); };
    var pkQ = (S.pkQ || '').trim().toLowerCase();
    var pkAll = S.pkgs.map(function (o) {
      var expired = o.status === 'active' && new Date(o.expires_at) < new Date();
      var st = o.status === 'cancelled' ? ['Cancelled', 'pill p-cx'] : expired ? ['Expired', 'pill p-ns'] : o.remaining === 0 ? ['Used up', 'pill p-done'] : ['Active', 'pill p-up'];
      return { ref: o.ref, customer: o.first_name + ' ' + o.last_name, email: o.email, phone: o.phone || '—',
        pack: (PN[o.sessions] ? PN[o.sessions] + ' · ' : '') + o.sessions + ' sessions', svc: (SVN[o.service] || { name: o.service }).name,
        usedLabel: o.used + ' of ' + o.sessions + ' used', left: o.remaining, upcoming: o.upcoming,
        amountLabel: self.money(o.total_egp), paid: o.payment_status === 'paid',
        payLabel: o.payment_status === 'paid' ? 'Paid' : 'Due at studio', payCls: o.payment_status === 'paid' ? 'p-paid' : 'p-due',
        method: o.payment_method === 'cash' ? 'At the studio' : 'Card (Paymob)',
        bought: dmy(o.created_at), expires: dmy(o.expires_at), statusLabel: st[0], statusCls: st[1], active: o.status === 'active', isTest: o.is_test };
    });
    var pkRows = pkAll.filter(function (p) {
      if (S.pkFilter === 'active' && !p.active) return false;
      if (S.pkFilter === 'cancelled' && p.active) return false;
      return !pkQ || (p.customer + ' ' + p.email + ' ' + p.ref).toLowerCase().indexOf(pkQ) >= 0;
    }).map(function (p) { return Object.assign({}, p, { open: function () { self.setState({ pkSel: p.ref, pkArmed: false, pkAlso: true }); } }); });
    var pkS = S.pkSel ? pkAll.filter(function (p) { return p.ref === S.pkSel; })[0] : null;
    var callStaffCancel = function (opts, okMsg) {
      self.setState({ pkBusy: true });
      supabase.auth.getSession().then(function (r) {
        var token = r.data.session && r.data.session.access_token;
        if (!token) throw new Error('Please sign in again.');
        return staffCancel('package', S.pkSel, opts, token);
      }).then(function (res) {
        self.setState({ pkBusy: false, pkArmed: false });
        self.showToast(okMsg(res));
        self.loadAll();
      }).catch(function (err) { self.setState({ pkBusy: false }); self.showToast(err.message); });
    };
    var pk = {
      rows: pkRows, none: pkRows.length === 0, count: pkRows.length + (pkRows.length === 1 ? ' package' : ' packages'),
      q: S.pkQ, onQ: function (e) { self.setState({ pkQ: e.target.value }); },
      chips: [['active', 'Active'], ['cancelled', 'Cancelled'], ['all', 'All']].map(function (c) {
        var on = S.pkFilter === c[0]; return { label: c[1], on: on, cls: 'chip' + (on ? ' on' : ''), go: function () { self.setState({ pkFilter: c[0] }); } }; }),
      hasSel: !!pkS, sel: pkS || {},
      close: function () { self.setState({ pkSel: null, pkArmed: false }); },
      canPay: !!pkS && pkS.active && !pkS.paid,
      markPaid: function () { self.rpc('staff_mark_order_paid', { p_ref: S.pkSel }, 'Package marked as paid'); },
      canCancel: !!pkS && pkS.active,
      hasUpcoming: !!pkS && pkS.upcoming > 0,
      upcomingLabel: pkS ? 'Also cancel the ' + (pkS.upcoming === 1 ? 'session' : pkS.upcoming + ' sessions') + ' already booked with it' : '',
      also: S.pkAlso, toggleAlso: function () { self.setState({ pkAlso: !S.pkAlso }); },
      armed: S.pkArmed, busy: S.pkBusy,
      cancelLabel: S.pkBusy ? 'Cancelling\u2026' : S.pkArmed ? 'Yes, cancel this package' : 'Cancel package',
      cancel: function () {
        if (!S.pkArmed) { self.setState({ pkArmed: true }); return; }
        var also = !!(pkS && pkS.upcoming > 0 && S.pkAlso);
        callStaffCancel({ cancelBookings: also }, function (res) {
          return 'Package cancelled' + (res.cancelledSessions ? ' with ' + res.cancelledSessions + ' booked session' + (res.cancelledSessions === 1 ? '' : 's') : '') + '. The customer was emailed.';
        });
      },
      keep: function () { self.setState({ pkArmed: false }); }
    };
    var ranges = [[1, 'Today'], [7, '7 days'], [14, '14 days']].map(function (r2) { return { label: r2[1], cls: S.range === r2[0] ? 'on' : '', go: function () { self.setState({ range: r2[0] }); } }; });
    var nameFirst = (me.name || '').split(' ')[0];
    var testInData = all.some(function (b) { return b.isTest; });
    return {
      setRoot: function (el) { self.rootEl = el; },
      loggedIn: S.authed, loggedOut: !S.authed, email: S.email,
      onEmail: function (e) { self.setState({ email: e.target.value, loginErr: '' }); },
      hasLoginErr: !!S.loginErr, loginErr: S.loginErr, signIn: signIn,
      pw: S.pw, onPw: function (e) { self.setState({ pw: e.target.value, loginErr: '' }); },
      pwKey: function (e) { if (e.key === 'Enter') signIn(); },
      signInBusy: S.signInBusy || !validEmail, signInLabel: S.signInBusy ? 'Signing in…' : 'Sign in',
      forgotPw: forgotPw, emailLink: emailLink, linkLabel: S.linkSent ? 'Send the link again' : 'Email me a sign-in link',
      loginNote: S.linkSent ? 'We sent an email to ' + S.linkSent + '. Open the link on this device. It can take a minute; check spam too.' : 'First time? Tap "Email me a sign-in link", then set your password inside. Only people the owner has added can open the dashboard.',
      showPwNudge: S.authed && !S.hasPw && !S.showPwPanel,
      showPwPanel: S.authed && S.showPwPanel, pwPanelLabel: S.showPwPanel ? 'Close' : (S.hasPw ? 'Change password' : 'Set password'),
      pwPanelTitle: S.pwReset ? 'Choose a new password' : S.hasPw ? 'New password' : 'Create a password',
      togglePwPanel: function () { self.setState({ showPwPanel: !S.showPwPanel, pwReset: false, newPw: '' }); },
      newPw: S.newPw, onNewPw: function (e) { self.setState({ newPw: e.target.value }); }, newPwBlocked: (S.newPw || '').length < 8,
      saveNewPw: function () {
        setPassword(S.newPw).then(function () { return saveProfile({ staff_pw: true }); })
          .then(function () { self.setState({ showPwPanel: false, pwReset: false, newPw: '', hasPw: true }); self.showToast('Password saved. Next time, sign in with your email and password.'); })
          .catch(function (err) { self.showToast(err.message); });
      },
      signOut: function () { authSignOut().then(function () { self._checked = null; self.setState({ authed: false, sel: null, me: null, linkSent: '', showPwPanel: false }); }); },
      me: { name: me.name, role: me.role, initials: me.name ? initials(me.name) : '', first: nameFirst },
      mv: mv, pk: pk,
      tabs: tabs, is: { overview: tab === 'overview', schedule: tab === 'schedule', bookings: tab === 'bookings', packages: tab === 'packages', payments: tab === 'payments', tours: tab === 'tours', auditions: tab === 'auditions', team: tab === 'team' },
      todayLong: this.dayName(D.today, true), ranges: ranges, rangeLabel: rangeLabel, k: k,
      dataNote: !S.loaded ? 'loading…' : testInData ? 'live data, includes test bookings' : 'live data',
      chart: chart, chartTotal: self.money(chartSum), chartAria: 'Money in per day for the last 14 days, ' + self.money(chartSum) + ' in total',
      todayList: todayList, noToday: todayList.length === 0, noTodayMsg: D.today.getDay() === 5 ? 'Closed today — it is Friday.' : 'No sessions booked today.',
      goSchedule: function () { self.setState({ tab: 'schedule', schedOff: 0 }); },
      bySvc: bySvc, activity: activity,
      hours: ['3 PM', '4 PM', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM'], sched: sched,
      q: S.q, onQ: function (e) { self.setState({ q: e.target.value }); }, statusChips: statusChips,
      rows: list.map(view), noRows: list.length === 0, listCount: list.length + (list.length === 1 ? ' booking' : ' bookings'),
      clearFilters: function () { self.setState({ q: '', fStatus: 'all' }); },
      payTotals: payTotals, txns: txns, exportCsv: exportCsv,
      auditions: auditions, tour: tour, teamRows: teamRows, invite: invite,
      onInvEmail: function (e) { self.setState({ invite: { email: e.target.value, role: S.invite.role } }); },
      onInvRole: function (e) { self.setState({ invite: { email: S.invite.email, role: e.target.value } }); },
      sendInvite: function () {
        self.rpc('staff_invite', { p_email: invEmail, p_role: ROLE_DB[S.invite.role] },
          invEmail + ' added. Ask them to sign in at ' + window.location.origin + '/admin/ with this email.')
          .then(function (ok) { if (ok) self.setState({ invite: { email: '', role: S.invite.role } }); });
      },
      logins: logins, noLogins: logins.length === 0,
      canClearTest: isOwnerMe, testBusy: S.testBusy || S.testCount === 0,
      testNote: S.testCount === 0 ? 'There is no test data right now.' : S.testCount + ' test bookings and package orders (made while Paymob is in test mode). Real customer bookings are never deleted.',
      clearTestLabel: S.testBusy ? 'Deleting…' : S.testArmed ? 'Click again to delete ' + S.testCount + ' test items' : 'Delete test data',
      clearTest: clearTest,
      hasSel: !!selB, sel: selV, closeSel: function () { self.setState({ sel: null }); }, act: act,
      hasToast: !!S.toast, toast: S.toast
    };
  }
}
