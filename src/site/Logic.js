// State and behaviour for this page. Converted from design/Main.dc.html; safe to edit.
import DCLogic from '../lib/DCLogic.jsx';
import { loadBusySlots, startCheckout, getPaymentStatus, isoDate, forwardPaymobResult, rescheduleBooking } from '../lib/booking.js';
import { sendSignInLink, watchSession, recordSignIn, signOut as authSignOut, signInWithPassword, signUpWithPassword, sendPasswordReset, setPassword, saveProfile } from '../lib/auth.js';
import { supabase } from '../lib/supabase.js';

// Date and hour of a timestamp in studio time (Cairo), whatever the visitor's own time zone.
function cairoParts(iso) {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Cairo', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', hourCycle: 'h23' })
    .formatToParts(new Date(iso)).reduce((o, p) => { o[p.type] = Number(p.value); return o; }, {});
  return { y: parts.year, m: parts.month, d: parts.day, h: parts.hour };
}
const STATUS_LABELS = {
  confirmed: ['Confirmed', 'pill-ok'], in_studio: ['In studio', 'pill-ok'], completed: ['Completed', 'pill-ok'],
  no_show: ['Missed', 'pill-due'], cancelled: ['Cancelled', 'pill-cx'], needs_review: ['Being reviewed', 'pill-due'],
  active: ['Paid', 'pill-ok'],
};

// Wizard fields kept while the customer is on Paymob's page, so a failed payment can be retried.
const PAGES = ['home', 'packages', 'pkgDetail', 'studios', 'cyclorama', 'audio', 'services', 'contact', 'tour', 'account', 'legal', 'book', 'confirm'];

// Address for a page, e.g. /?p=packages, /?p=legal&doc=terms, /?p=pkgDetail&tier=mix&n=3
function pageUrl(S) {
  if (S.screen === 'home' || PAGES.indexOf(S.screen) < 0) return window.location.pathname;
  var q = '?p=' + S.screen;
  if (S.screen === 'legal') q += '&doc=' + S.legal;
  if (S.screen === 'pkgDetail') q += '&tier=' + S.detail.tier + '&n=' + S.detail.count;
  return window.location.pathname + q;
}
// Page state from an address (used on first load and on browser Back/Forward).
function pageFromUrl() {
  var qs = new URLSearchParams(window.location.search), p = qs.get('p');
  if (!p || PAGES.indexOf(p) < 0) return { screen: 'home' };
  var s = { screen: p === 'confirm' ? 'home' : p };
  if (p === 'legal') s.legal = ['privacy', 'terms', 'refund'].indexOf(qs.get('doc')) >= 0 ? qs.get('doc') : 'privacy';
  if (p === 'pkgDetail') s.detail = { tier: ['rec', 'mix', 'pro'].indexOf(qs.get('tier')) >= 0 ? qs.get('tier') : 'mix', count: [3, 5, 10, 20].indexOf(+qs.get('n')) >= 0 ? +qs.get('n') : 3 };
  if (p === 'book') { s.w = 1; s.mode = 'session'; }
  return s;
}

const WIZARD_KEYS = ['mode', 'svc', 'setup', 'people', 'ex', 'dateKey', 'start', 'bTier', 'bCount', 'info', 'monthOff'];

export default class Logic extends DCLogic {
  constructor(props) {
    super(props);
    this.state = {
      screen: 'home', prevScreen: 'home', hist: [],
      mode: 'session', w: 1, svc: 'mix', setup: null, people: 1,
      ex: { hour: 0, cam: 0, mic: 0, photo: 0 }, monthOff: 0, dateKey: null, start: null,
      bTier: 'mix', bCount: 3,
      fSvc: [], pkCount: 5, detail: { tier: 'mix', count: 3 }, carIdx: 0,
      info: { first: '', last: '', email: '', phone: '', wa: false, pw: '' }, showErr: false, editInfo: false,
      method: 'card', card: { holder: '', num: '', exp: '', cvc: '' }, agreed: false, paying: false, useCredit: true,
      bookings: [], credits: [], last: null, signedIn: false, acctEmail: '', menu: false, toast: '',
      legal: 'privacy', cf: { name: '', phone: '', email: '', msg: '' }, contactSent: false,
      tf: { name: '', phone: '', note: '' }, tourSent: false, tDate: null, tOff: 0, tSlot: null,
      busy: {}, moveRef: null, moveDate: '', moveStart: null, moveBusy: false, signInBusy: false, signInNote: '', acctPw: '', newPw: '', showPwPanel: false, pwReset: false
    };
  }
  // ---------- live data (Supabase + Paymob) ----------
  componentDidMount() {
    var self = this;
    this.loadBusy();
    this.checkPaymentReturn();
    var qs = new URLSearchParams(window.location.search);
    if (qs.get('p')) this.setState(pageFromUrl());
    if (qs.get('account')) this.setState({ screen: 'account' });
    this._onPop = function () { self._fromPop = true; self.setState(Object.assign({ menu: false }, pageFromUrl())); self.scrollTop(); };
    window.addEventListener('popstate', this._onPop);
    if (qs.get('reset')) this.setState({ showPwPanel: true, pwReset: true });
    this._unwatch = watchSession(function (session, event) { self.onSession(session, event); });
  }
  componentWillUnmount() { clearTimeout(this._poll); clearTimeout(this._tt); if (this._unwatch) this._unwatch(); window.removeEventListener('popstate', this._onPop); }
  // Give every page its own address, so browser Back/Forward and refresh work.
  componentDidUpdate(prevProps, prevState) {
    var S = this.state;
    var changed = prevState.screen !== S.screen || (S.screen === 'legal' && prevState.legal !== S.legal) ||
      (S.screen === 'pkgDetail' && (prevState.detail.tier !== S.detail.tier || prevState.detail.count !== S.detail.count));
    if (!changed) return;
    if (this._fromPop) { this._fromPop = false; return; }
    var url = pageUrl(S);
    if (url !== window.location.pathname + window.location.search) window.history.pushState({ p: S.screen }, '', url);
  }
  onSession(session, event) {
    var self = this, email = session && session.user && session.user.email;
    // A saved login can outlive its account (e.g. deleted by staff). Check once on load and sign out if so.
    if (event === 'INITIAL' && email && supabase) {
      supabase.auth.getUser().then(function (r) {
        if (r.error && /not exist|not found|invalid/i.test(r.error.message || '')) {
          authSignOut().then(function () { self.setState({ signedIn: false, bookings: [], credits: [], acctEmail: '' }); self.showToast('Please sign in again.'); });
        }
      });
    }
    if (event === 'PASSWORD_RECOVERY') this.setState({ screen: 'account', showPwPanel: true, pwReset: true });
    if (!email) { this._recorded = null; this.setState({ signedIn: false, bookings: [], credits: [] }); return; }
    if (window.location.search.indexOf('account=') >= 0) window.history.replaceState(null, '', window.location.pathname);
    // Fill the booking form from the account, so signed-in customers skip "Your information".
    var md = (session.user.user_metadata) || {}, I0 = this.state.info;
    var info = { first: I0.first || md.first || '', last: I0.last || md.last || '', email: email,
      phone: I0.phone || md.phone || '', wa: I0.wa || !!md.wa, pw: '' };
    this.setState({ signedIn: true, acctEmail: email, signInNote: '', acctPw: '', info: info });
    if (this._recorded !== email) { this._recorded = email; recordSignIn().catch(function (e) { console.warn('sign-in not recorded', e); }); }
    this.loadMyBookings();
  }
  loadMyBookings() {
    var self = this;
    if (!supabase) return;
    supabase.rpc('my_bookings').then(function (res) {
      if (res.error) { console.warn('Could not load bookings', res.error); return; }
      var pk = self.pkgData(), SU = self.setupData();
      var byId = function (id) { return pk.filter(function (p) { return p.id === id; })[0] || { name: 'Studio session', tier: '' }; };
      var bookings = [], credits = [];
      (res.data || []).forEach(function (r) {
        var st = STATUS_LABELS[r.status] || ['Confirmed', 'pill-ok'];
        if ((r.status === 'confirmed' || r.status === 'active') && r.payment_status !== 'paid') st = [r.kind === 'package' ? 'Reserved · pay at studio' : 'Confirmed · pay at studio', 'pill-due'];
        if (r.kind === 'session') {
          var a = cairoParts(r.starts_at), e = cairoParts(r.ends_at), d = new Date(a.y, a.m - 1, a.d);
          var su = SU.filter(function (x) { return x.id === r.setup_id; })[0];
          bookings.push({ ref: r.ref, key: a.y + '-' + a.m + '-' + a.d, setup: r.setup_id, start: a.h, end: e.h || 24,
            pkgName: byId(r.service).name, setupLabel: su ? su.n : r.setup_id, dateLabel: self.longDate(d) + ' ' + a.y,
            timeLabel: self.range(a.h, e.h || 24), totalLabel: self.money(r.total_egp), statusLabel: st[0], statusCls: st[1],
            // Customers may move a confirmed session themselves until 48 hours before it starts.
            upcoming: r.status === 'confirmed' && new Date(r.starts_at).getTime() > Date.now(),
            canMove: r.status === 'confirmed' && new Date(r.starts_at).getTime() - Date.now() >= 48 * 3600 * 1000 });
        }
      });
      // my_bookings returns newest first; the page shows the list reversed
      self.setState({ bookings: bookings.reverse() });
    });
    // Packages and the sessions left on each (spent when booking while signed in).
    supabase.rpc('my_packages').then(function (res) {
      if (res.error) { console.warn('Could not load packages', res.error); return; }
      var pk = self.pkgData();
      var credits = (res.data || []).map(function (o) {
        var P = pk.filter(function (p) { return p.id === o.service; })[0] || { name: o.service, tier: '' };
        return { id: o.ref, svc: o.service, tier: P.tier, name: P.name, pack: self.packName(o.sessions), count: o.sessions, left: o.remaining,
          expires: self.shortDate(new Date(o.expires_at)), unpaid: o.payment_status !== 'paid' };
      });
      self.setState({ credits: credits.reverse() });
    });
  }
  loadBusy() {
    var self = this, from = new Date(), to = new Date();
    from.setHours(0, 0, 0, 0); to.setDate(to.getDate() + 62);
    return loadBusySlots(from, to).then(function (busy) { self.setState({ busy: busy }); })
      .catch(function (e) { console.warn('Could not load availability', e); });
  }
  checkPaymentReturn() {
    var self = this, params = new URLSearchParams(window.location.search), ref = params.get('payment');
    if (!ref) return;
    // Paymob's redirect carries a signed result; pass it on so the server can confirm right away.
    if (params.get('hmac') && params.get('id')) forwardPaymobResult(window.location.search);
    window.history.replaceState(null, '', window.location.pathname);
    var draft = null, wizard = null;
    try { draft = JSON.parse(sessionStorage.getItem('np_pending') || 'null'); wizard = JSON.parse(sessionStorage.getItem('np_wizard') || 'null'); } catch (e) { /* ignore */ }
    if (!draft || draft.ref !== ref) { draft = null; wizard = null; }
    var base = draft || { kind: 'order', ref: ref, email: 'you', headline: 'Payment received', kicker: 'Order', big: ref, sub: '', totalLabel: '', rows: [], note: '', start: 0, end: 0 };
    this.setState({ screen: 'confirm', last: Object.assign({}, base, { headline: 'Confirming your payment…', payState: 'Checking', payCls: 'pill-due' }) });
    var tries = 0;
    var check = function () {
      tries++;
      getPaymentStatus(ref).then(function (st) {
        var paid = st && st.payment_status === 'paid';
        var failed = st && (st.payment_status === 'failed' || st.status === 'expired' || st.status === 'cancelled');
        if (paid) {
          sessionStorage.removeItem('np_pending'); sessionStorage.removeItem('np_wizard');
          var s = { last: Object.assign({}, base, { payState: 'Paid', payCls: 'pill-ok' }) };
          if (st.status === 'needs_review') s.last.note = 'Your payment went through, but our team needs to confirm your time. We will contact you shortly.';
          if (self.state.signedIn) self.loadMyBookings();
          self.setState(s); self.loadBusy();
        } else if (failed) {
          sessionStorage.removeItem('np_pending');
          var back = { screen: 'home', agreed: false, paying: false };
          if (wizard) { WIZARD_KEYS.forEach(function (k) { if (k in wizard) back[k] = wizard[k]; }); back.screen = 'book'; back.start = null; back.w = wizard.mode === 'bundle' ? 3 : 5; }
          self.setState(back); self.loadBusy();
          self.showToast(wizard && wizard.mode !== 'bundle' ? 'Payment did not go through. Please pick your time again and retry.' : 'Payment did not go through. Please try again.');
        } else if (tries < 12) {
          self._poll = setTimeout(check, 2500);
        } else {
          self.setState({ last: Object.assign({}, base, { headline: 'Payment processing', payState: 'Processing', payCls: 'pill-due',
            note: 'Paymob is still confirming your payment. Keep your order number ' + ref + '; we will contact you if anything is needed.' }) });
        }
      }).catch(function () { if (tries < 12) self._poll = setTimeout(check, 2500); });
    };
    check();
  }
  // ---------- data ----------
  img() { return { hero: '/images/f6b9c2ee7028884a47a15ded2f51d19c.jpg', s2: '/images/d8c0cf460707998f2db0c832d04b3efa.jpg', win: '/images/af9913323450fa5d63be56608814e9f8.jpg', mics: '/images/f581ffd019d17d8bd60d3ad415345ac9.jpg', shelves: '/images/aaf9baac82ee885ac1f32de79de265ad.jpg', frames: '/images/cb531de9b27e823b4dfd14bf775f7b49.jpg' }; }
  pkgData() {
    return [
      { id: 'rec', tier: 'Recording Only', name: 'Recording Only', price: 1150, blurb: 'Record in a fully equipped setup and take your raw files home.',
        inc: ['1 hour of recording', '3 cameras & 2 microphones', 'Raw audio and video files delivered right after your session'],
        items: ['Fully equipped studio setup', 'Professional operator, 3 cameras & 2 microphones', 'Professional audio recording', 'Raw audio and video files delivered right after your session'] },
      { id: 'mix', tier: 'Recording + Live Edit', name: 'Recording + Live Edit', price: 1450, badge: 'Live-mixed', blurb: 'Leave the studio with a live-mixed episode, switched and edited as you record.',
        inc: ['1 hour of recording', '3 cameras & 2 microphones', 'Live-mixed episode delivered right after your session'],
        items: ['Everything in Recording Only', 'Live video switching and editing', 'Synced cameras and audio', 'Live-mixed episode delivered right after your session'] },
      { id: 'pro', tier: 'Recording + Pro Edit', name: 'Recording + Pro Edit', price: 1950, blurb: 'A dedicated podcast editor takes your episode through full post-production.',
        inc: ['1 hour of recording', '3 cameras & 2 microphones', 'Full post-production editing'],
        items: ['Everything in Recording Only', 'Dedicated podcast editor', 'Full post-production editing', '2 revision rounds', '14-day raw footage backup'] }
    ];
  }
  setupData() {
    var im = this.img(), B = '/images/';
    return [
      { id: 's1', n: 'Setup 1', name: 'Setup 1', cap: 1, img: B + '208c4f23dfdfe4243df4a86635203f37.jpg', alt: 'Setup 1: a beige armchair beside a wooden shelf with a rope lamp, a palm and an alarm clock',
        desc: 'A soft armchair, a warm rope lamp and a tall palm against a dark wall — made for one voice.' },
      { id: 's2', n: 'Setup 2', name: 'Setup 2', cap: 1, img: B + '038dec353b5bd702311097efb1b9228d.jpg', alt: 'Setup 2: an armchair in front of a deep green velvet curtain between a table lamp and a floor lamp',
        desc: 'Deep green velvet, two warm lamps and a single armchair — made for one-person content.' },
      { id: 's3', n: 'Setup 3', name: 'Setup 3', cap: 2, img: B + '113ecd6e6a3d2de8944e3757f1945c32.jpg', alt: 'Setup 3: a round wooden table with two mesh chairs in front of lit shelves and a green-lit plant',
        desc: 'A round wooden table, two studio chairs and glowing shelves behind — built for conversations.' },
      { id: 's4', n: 'Setup 4', name: 'Setup 4', cap: 1, img: B + '2ac233ffaa36829ee7a6988f671bcf5f.jpg', alt: 'Setup 4: a single mesh chair across a wooden table, with a bookshelf, a small guitar and a plant',
        desc: 'One chair across the table, framed by dark curtains and a lit shelf — for solo takes and talking-head videos.' },
      { id: 's5', n: 'Setup 5', name: 'Setup 5', cap: 2, img: B + 'dd85524628dcc9ee4b96e61cac0a9b34.jpg', alt: 'Setup 5: two beige armchairs facing a side table with a lamp, in front of a blue velvet curtain',
        desc: 'Two armchairs, a lamp-lit side table and a rich blue velvet backdrop.' },
      { id: 's6', n: 'Setup 6', name: 'Setup 6', cap: 2, img: B + 'b898d02d75c253e89b08c320c1cad962.jpg', alt: 'Setup 6: two beige armchairs in front of lit bookshelves with a tall plant',
        desc: 'Two armchairs in front of softly lit bookshelves, with greenery on the side.' },
      { id: 's7', n: 'Setup 7', name: 'Setup 7', cap: 1, img: B + 'fdcfcc88f60a0534d61a1283ace3c717.jpg', alt: 'Setup 7: an armchair with a green cushion against brown velvet and lace curtains, beside a lamp and a small guitar',
        desc: 'Brown velvet and lace curtains, a warm lamp and a single armchair — cosy and intimate.' }
    ];
  }
  disc() { return { 3: 0.05, 5: 0.10, 10: 0.15, 20: 0.20 }; }
  // Pack sizes and names. Full Season (20) is valid 180 days, the others 90.
  validFor(n) { return n >= 20 ? 180 : 90; }
  packName(n) { return { 3: 'Pilot', 5: 'Series', 10: 'Season', 20: 'Full Season' }[n] || ''; }
  packLabel(n) { return this.packName(n) + ' · ' + n + ' sessions'; }
  validDays() { return 90; }
  extraData(rate) {
    return [
      { id: 'hour', name: 'Extra hour', price: rate, basis: 'per hour', max: 3 },
      { id: 'cam', name: 'Extra camera', price: 90, basis: 'each', max: 2 },
      { id: 'mic', name: 'Extra microphone', price: 100, basis: 'each', max: 2 },
      { id: 'photo', name: 'Session photographer', price: 250, basis: 'per session', max: 1 }
    ];
  }
  bundlePrice(p, n) {
    var full = p.price * n, d = this.disc()[n] || 0;
    var total = Math.round(full * (1 - d) / 10) * 10;
    return { full: full, total: total, per: Math.round(total / n), saved: full - total, pct: Math.round(d * 100) };
  }
  // ---------- helpers ----------
  money(n) { return n.toLocaleString('en-US') + ' EGP'; }
  fmtH(h) { var x = h > 12 ? h - 12 : h; return x + ':00 ' + (h >= 12 ? 'PM' : 'AM'); }
  range(s, e) { return this.fmtH(s) + ' – ' + this.fmtH(e); }
  key(d) { return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
  fromKey(k) { var p = k.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  longDate(d) {
    var wl = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return wl[d.getDay()] + ', ' + d.getDate() + ' ' + mo[d.getMonth()];
  }
  shortDate(d) { var mo = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']; return d.getDate() + ' ' + mo[d.getMonth()] + ' ' + d.getFullYear(); }
  hourStatus(d, h, setup) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    if (d.getTime() === today.getTime() && h <= new Date().getHours()) return 'passed';
    var ranges = this.state.busy[this.key(d) + '|' + setup] || [];
    var taken = ranges.some(function (r) { return h >= r[0] && h < r[1]; });
    return taken ? 'booked' : 'free';
  }
  scrollTop(id) {
    var self = this;
    setTimeout(function () {
      if (!self.rootEl) return;
      if (id) { var el = self.rootEl.querySelector('#' + id); if (el) { self.rootEl.scrollTo({ top: el.offsetTop - 70, behavior: 'smooth' }); return; } }
      self.rootEl.scrollTo({ top: 0, behavior: 'auto' });
    }, 30);
  }
  go(screen, extra, anchor) {
    var cur = this.state.screen, hist = this.state.hist || [];
    if (screen === 'home') hist = [];
    else if (cur !== screen && cur !== 'book' && cur !== 'confirm') hist = hist.concat([{ screen: cur, detail: this.state.detail }]);
    var s = Object.assign({ screen: screen, menu: false, prevScreen: cur, carIdx: 0, hist: hist }, extra || {});
    if (screen === 'contact') { s.contactSent = false; }
    if (screen === 'tour') { s.tourSent = false; s.tSlot = null; }
    this.setState(s);
    this.scrollTop(anchor);
  }
  startSession(extra) { this.go('book', Object.assign({ mode: 'session', w: 1, showErr: false, agreed: false, useCredit: true }, extra || {})); }
  startBundle(tier, count) { this.go('book', { mode: 'bundle', w: 1, bTier: tier, bCount: count, showErr: false, agreed: false }); }
  goBack() {
    var h = (this.state.hist || []).slice(), p = h.pop();
    var s = { screen: p ? p.screen : 'home', hist: h, menu: false, carIdx: 0 };
    if (p && p.detail) s.detail = p.detail;
    this.setState(s); this.scrollTop();
  }
  showToast(t) {
    var self = this; this.setState({ toast: t });
    clearTimeout(this._tt); this._tt = setTimeout(function () { self.setState({ toast: '' }); }, 2600);
  }
  setF(group, field, v) { var o = Object.assign({}, this.state[group]); o[field] = v; var s = {}; s[group] = o; this.setState(s); }
  setW(n) { this.setState({ w: n, showErr: false, carIdx: 0 }); this.scrollTop(); }
  fx(el) {
    if (!el || !el.classList || !el.classList.contains('hs-track')) return;
    var mid = el.scrollLeft + el.clientWidth / 2;
    for (var k = 0; k < el.children.length; k++) {
      var c = el.children[k], cw = c.offsetWidth || 1;
      var d = (c.offsetLeft + cw / 2 - mid) / cw, a = Math.min(Math.abs(d), 1);
      c.style.transform = 'scale(' + (1 - 0.06 * a).toFixed(4) + ')';
      c.style.opacity = (1 - 0.55 * a).toFixed(3);
      var img = c.querySelector('.hs-img');
      if (img) img.style.transform = 'translateX(' + (Math.max(-1.2, Math.min(1.2, d)) * -9).toFixed(2) + '%) scale(1.18)';
    }
  }
  carTo(i) {
    var el = this.carEl; if (!el || !el.children.length) return;
    var w = el.children[0].offsetWidth + Number(el.getAttribute('data-gap') || 0);
    var n = el.children.length;
    i = Math.max(0, Math.min(n - 1, i));
    el.scrollTo({ left: i * w, behavior: 'smooth' });
    this.setState({ carIdx: i });
  }
  // ---------- render ----------
  renderVals() {
    var self = this, S = this.state, IM = this.img();
    var pk = this.pkgData(), SU = this.setupData();
    var byId = function (id) { return pk.filter(function (p) { return p.id === id; })[0]; };
    var isBundle = S.mode === 'bundle';
    var P = byId(isBundle ? S.bTier : S.svc);
    var SET = SU.filter(function (s) { return s.id === S.setup; })[0] || null;
    var cap = SET ? SET.cap : 2;
    var dur = 1 + S.ex.hour;
    var hoursText = dur === 1 ? '1 hour' : dur + ' hours';
    var X = this.extraData(P.price);
    var date = S.dateKey ? this.fromKey(S.dateKey) : null;
    var I = S.info, C = S.card;
    var errs = { first: !I.first.trim(), last: !I.last.trim(), email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(I.email.trim()),
      pw: !S.signedIn && (I.pw || '').length < 8, phone: !!I.wa && !(I.phone || '').trim() };
    var infoOk = !errs.first && !errs.last && !errs.email && !errs.pw && !errs.phone;
    var cardOk = C.holder.trim().length > 1 && C.num.replace(/\D/g, '').length === 16 && /^\d\d\/\d\d$/.test(C.exp) && C.cvc.length >= 3;
    var validDays = this.validDays();

    // credits for chosen session service
    var credit = S.credits.filter(function (c) { return c.svc === S.svc && c.left > 0; })[0] || null;
    var creditsFor = function (id) { return S.credits.filter(function (c) { return c.svc === id; }).reduce(function (a, c) { return a + c.left; }, 0); };
    // A package credit covers the first hour; only for signed-in customers (checked again on the server).
    var usingCredit = !isBundle && S.signedIn && !!credit && S.useCredit;

    // ----- quote -----
    var lines = [], total = 0, extrasNames = [], BP = null;
    if (isBundle) {
      BP = this.bundlePrice(P, S.bCount);
      lines.push({ k: self.packName(S.bCount) + ' · ' + P.tier + ' · ' + S.bCount + ' sessions', v: self.money(BP.full) });
      if (BP.saved) lines.push({ k: 'Package saving (' + BP.pct + '%)', v: '−' + self.money(BP.saved) });
      total = BP.total;
    } else {
      if (usingCredit) {
        lines.push({ k: P.name + ' · 1 hour', v: 'Package credit' });
        if (dur > 1) { lines.push({ k: 'Extra hours × ' + (dur - 1), v: self.money(P.price * (dur - 1)) }); total += P.price * (dur - 1); }
      } else {
        lines.push({ k: P.name + ' · ' + hoursText, v: self.money(P.price * dur) }); total += P.price * dur;
      }
      X.forEach(function (x) { if (x.id !== 'hour' && S.ex[x.id] > 0) { var a = x.price * S.ex[x.id]; total += a; lines.push({ k: x.name + ' × ' + S.ex[x.id], v: self.money(a) }); extrasNames.push(x.name + ' × ' + S.ex[x.id]); } });
    }
    var needsPay = total > 0;

    // ----- navigation -----
    var goTo = function (sc, anchor) { return function (e) { if (e && e.preventDefault) e.preventDefault(); self.go(sc, null, anchor); }; };
    var bookNow = function () { self.startSession(); };
    var navDefs = [['Packages', 'packages'], ['Studios', 'studios'], ['Cyclorama', 'cyclorama'], ['Services', 'services'], ['Contact Us', 'contact']];
    var navItems = navDefs.map(function (n) {
      var active = S.screen === n[1] || (n[1] === 'packages' && S.screen === 'pkgDetail');
      return { label: n[0], go: goTo(n[1]), cls: 'navlink' + (active ? ' active' : ''), mcls: 'mlink' + (active ? ' active' : '') };
    });

    var pkgs = pk.map(function (p) {
      var on = S.svc === p.id, cr = creditsFor(p.id);
      return { name: p.name, priceLabel: p.price.toLocaleString('en-US'), blurb: p.blurb, items: p.items,
        featured: !!p.badge, badge: p.badge || '', on: on,
        cardCls: 'card pkg lift' + (p.badge ? ' featured' : ''), btnCls: p.badge ? 'btn-gold' : 'btn-ghost',
        optCls: 'opt' + (on ? ' on' : ''), radio: 'radio' + (on ? ' on' : ''),
        hasCredit: cr > 0, creditLabel: cr + (cr === 1 ? ' package credit left' : ' package credits left'),
        choose: function () { self.startSession({ svc: p.id, w: 2 }); },
        pick: function () { self.setState({ svc: p.id }); } };
    });

    // ----- catalog -----
    var counts = [3, 5, 10, 20];
    var catImg = { rec: '/images/dd85524628dcc9ee4b96e61cac0a9b34.jpg', mix: IM.hero, pro: '/images/113ecd6e6a3d2de8944e3757f1945c32.jpg' };
    var pkN = counts.indexOf(S.pkCount) >= 0 ? S.pkCount : 5;
    var catalog = pk.map(function (p) {
      var bp = self.bundlePrice(p, pkN), pop = p.id === 'mix';
      return { tier: p.tier, svc: p.name, img: catImg[p.id], inc: p.inc, pop: pop, cls: 'pcard' + (pop ? ' pop' : ''),
        countLabel: self.packLabel(pkN),
        hasSave: bp.saved > 0, savePct: bp.pct + '%', full: self.money(bp.full), total: self.money(bp.total),
        per: self.money(bp.per) + ' per session', buyLabel: 'Purchase Now',
        details: function () { self.go('pkgDetail', { detail: { tier: p.id, count: pkN } }); },
        buy: function () { self.startBundle(p.id, pkN); } };
    });
    var fCount = counts.map(function (v) { var on = pkN === v; return { name: self.packName(v), sub: v + ' sessions', save: 'save ' + Math.round(self.disc()[v] * 100) + '%', on: on, cls: 'frad' + (on ? ' on' : ''), pick: function () { self.setState({ pkCount: v }); } }; });
    var D = this.disc();

    // ----- details -----
    var DP = byId(S.detail.tier), dbp = this.bundlePrice(DP, S.detail.count);
    var segFor = function (p, cur, onPick) {
      return counts.map(function (n) { var b = self.bundlePrice(p, n); return { label: String(n), on: cur === n, cls: 'seg' + (cur === n ? ' on' : ''), hasSave: b.pct > 0, save: b.pct + '%', pick: function () { onPick(n); } }; });
    };
    var pd = { tier: DP.tier, svc: DP.name, img: catImg[DP.id], items: DP.items,
      counts: segFor(DP, S.detail.count, function (n) { self.setState({ detail: { tier: S.detail.tier, count: n } }); }),
      hasSave: dbp.saved > 0, full: self.money(dbp.full), total: self.money(dbp.total), saved: self.money(dbp.saved),
      per: self.money(dbp.per) + ' per session', countLabel: self.packLabel(S.detail.count), valid: String(self.validFor(S.detail.count)),
      buy: function () { self.startBundle(S.detail.tier, S.detail.count); } };

    // ----- setups carousel -----
    var setupList = SU.map(function (s, si) {
      var on = S.setup === s.id;
      return { hcls: 'hs-card' + (S.carIdx === si ? ' on' : ''), n: s.n, name: s.name, desc: s.desc, cap: String(s.cap), img: s.img, alt: s.alt, on: on,
        cls: 'slide-card' + (on ? ' on' : ''), btnCls: 'btn-sel' + (on ? ' on' : ''), btnLabel: on ? 'Selected ✓' : 'Choose ' + s.n,
        pick: function () { self.setState({ setup: on ? null : s.id, people: Math.min(S.people, s.cap), start: null }); },
        choose: function () { self.setState({ setup: s.id, people: Math.min(S.people, s.cap), start: null, w: S.w + 1, showErr: false, carIdx: 0 }); self.scrollTop(); },
        book: function () { if (self._justDragged) return; self.startSession({ setup: s.id, people: Math.min(S.people, s.cap), start: null }); } };
    });
    var carDots = SU.map(function (s, i) { return { cls: 'dot' + (S.carIdx === i ? ' on' : ''), label: 'Go to slide ' + (i + 1), go: function () { self.carTo(i); } }; });

    // ----- extras -----
    var extraList = X.map(function (x) {
      var q = S.ex[x.id];
      var bump = function (d) { return function () {
        var ex = Object.assign({}, S.ex); ex[x.id] = Math.max(0, Math.min(x.max, q + d));
        var s = { ex: ex }; if (x.id === 'hour') s.start = null; self.setState(s); }; };
      return { name: x.name, qty: q, priceLabel: '+' + self.money(x.price), basis: x.basis,
        cls: 'xrow' + (q > 0 ? ' on' : ''), atMin: q <= 0, atMax: q >= x.max,
        minusLabel: 'Remove one ' + x.name.toLowerCase(), plusLabel: 'Add one ' + x.name.toLowerCase(),
        down: bump(-1), up: bump(1) };
    });

    // ----- calendar -----
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var horizon = new Date(today); horizon.setDate(today.getDate() + 60);
    var mStart = new Date(today.getFullYear(), today.getMonth() + S.monthOff, 1);
    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    var lead = (mStart.getDay() + 1) % 7;
    var dim = new Date(mStart.getFullYear(), mStart.getMonth() + 1, 0).getDate();
    var cells = [];
    for (var i = 0; i < lead; i++) cells.push({ label: '', cls: 'cd empty', dis: true, aria: '', pick: null });
    for (var dn = 1; dn <= dim; dn++) {
      (function (dn) {
        var d = new Date(mStart.getFullYear(), mStart.getMonth(), dn);
        var k = self.key(d), fri = d.getDay() === 5, past = d < today, far = d > horizon;
        var on = S.dateKey === k;
        cells.push({ label: String(dn), dis: fri || past || far,
          cls: 'cd' + (fri ? ' fri' : '') + (d.getTime() === today.getTime() ? ' today' : '') + (on ? ' on' : ''),
          aria: self.longDate(d) + (fri ? ', closed' : past ? ', past' : ''),
          pick: function () { self.setState({ dateKey: k, start: null }); } });
      })(dn);
    }
    while (cells.length % 7) cells.push({ label: '', cls: 'cd empty', dis: true, aria: '', pick: null });
    var cal = { title: monthNames[mStart.getMonth()] + ' ' + mStart.getFullYear(), cells: cells,
      noPrev: S.monthOff <= 0, noNext: new Date(mStart.getFullYear(), mStart.getMonth() + 1, 1) > horizon,
      prev: function () { self.setState({ monthOff: S.monthOff - 1 }); }, next: function () { self.setState({ monthOff: S.monthOff + 1 }); } };
    var slotList = [];
    if (date) {
      for (var h = 15; h + dur <= 23; h++) {
        (function (h) {
          var st = 'free';
          for (var j = h; j < h + dur; j++) { var s1 = self.hourStatus(date, j, S.setup); if (s1 !== 'free') { st = s1; break; } }
          var on = S.start === h;
          slotList.push({ label: self.range(h, h + dur), on: on, disabled: st !== 'free',
            cls: 'slot slot-' + (on ? 'selected' : st === 'free' ? 'available' : st),
            status: on ? 'Selected' : st === 'booked' ? 'Taken' : st === 'passed' ? 'Passed' : 'Free',
            pick: function () { self.setState({ start: on ? null : h }); } });
        })(h);
      }
    }
    var freeCount = slotList.filter(function (s) { return !s.disabled; }).length;

    // ----- wizard -----
    // Signed-in customers with a name on file skip "Your information" (they can still edit it).
    var profileOk = S.signedIn && !!I.first.trim() && !!I.last.trim();
    var steps = (isBundle ? ['bundle', 'info', 'pay'] : ['service', 'setup', 'people', 'extras', 'time', 'info', 'pay'])
      .filter(function (t) { return t !== 'info' || !profileOk || S.editInfo; });
    var titleMap = { service: 'Choose a service', bundle: 'Your package', setup: isBundle ? 'Your preferred setup' : 'Choose your setup', people: 'Who is on camera?', extras: 'Add extras', time: 'Pick a date & time', info: 'Your information', pay: 'Review & pay' };
    var backMap = { service: 'Back', bundle: 'Back', setup: isBundle ? 'Back to package' : 'Back to service', people: 'Back to setup', extras: 'Back to people', time: 'Back to extras', info: isBundle ? 'Back to package' : 'Back to date & time', pay: steps.indexOf('info') >= 0 ? 'Back to your information' : isBundle ? 'Back to package' : 'Back to date & time' };
    var cur = steps[Math.min(S.w, steps.length) - 1];
    var st = {}; ['service', 'bundle', 'setup', 'people', 'extras', 'time', 'info', 'pay'].forEach(function (k) { st[k] = cur === k; });
    var progBars = steps.map(function (t, i) { return i + 1 < S.w ? 'on' : i + 1 === S.w ? 'cur' : ''; });
    var blockedMap = { service: false, bundle: false, setup: !S.setup, people: false, extras: false, time: !(date && S.start != null), info: false,
      pay: !S.agreed || S.paying };
    var payLabel = S.paying ? 'Processing…' : !needsPay ? 'Confirm booking' : S.method === 'card' ? 'Pay ' + self.money(total) + (isBundle ? ' & buy package' : ' & book') : 'Confirm — pay at the studio';
    var nextLabel = cur === 'pay' ? payLabel : cur === 'info' ? 'Continue to payment' : 'Continue';
    var nextShort = cur === 'pay' ? (S.paying ? 'Processing…' : !needsPay ? 'Confirm' : S.method === 'card' ? (isBundle ? 'Pay & buy' : 'Pay & book') : 'Confirm') : 'Continue';

    var pay = function () {
      self.setState({ paying: true });
      var profile = { first: I.first.trim(), last: I.last.trim(), phone: (I.phone || '').trim(), wa: !!I.wa };
      var accountP = Promise.resolve(null);
      if (!S.signedIn) {
        // New customers create their account (email + password) as part of the booking.
        accountP = signUpWithPassword(I.email, I.pw, profile).then(function (res) {
          if (res !== 'exists') return res;
          return signInWithPassword(I.email, I.pw).then(function () { return 'signed_in'; }).catch(function (e) {
            if (e.code === 'not_confirmed') return 'unconfirmed';
            var err = new Error('This email already has an account. Sign in at My account first (use "Forgot password?" if needed), then book.');
            err.code = 'account_exists'; throw err;
          });
        });
      } else {
        saveProfile(profile).catch(function () {});
      }
      accountP.then(function (acct) { book(acct); }).catch(function (err) { self.setState({ paying: false }); self.showToast(err.message); });
    };
    var book = function (acct) {
      var name = I.first.trim() + ' ' + I.last.trim(), email = I.email.trim();
      var info = { first: I.first.trim(), last: I.last.trim(), email: email, phone: (I.phone || '').trim(), wa: !!I.wa };
      var payload, draft;
      if (usingCredit && email.toLowerCase() !== (S.acctEmail || '').toLowerCase()) {
        self.setState({ paying: false });
        self.showToast('To use your package, enter the email you are signed in with (' + S.acctEmail + ').');
        return;
      }
      var payLabelRow = usingCredit ? ('Package credit' + (needsPay ? ' + extras ' + (S.method === 'cash' ? 'at the studio' : 'by card') + ' (' + self.money(total) + ')' : '')) : (S.method === 'cash' ? 'Pay at the studio' : 'Card (Paymob)');
      if (isBundle) {
        payload = { kind: 'package', service: P.id, sessions: S.bCount, info: info, payment: S.method };
        draft = { kind: 'bundle', email: email, headline: 'Package confirmed', kicker: 'Package', big: self.packName(S.bCount) + ' · ' + P.tier + ' · ' + S.bCount + ' sessions',
          sub: 'Valid for ' + self.validFor(S.bCount) + ' days', totalLabel: self.money(total), svc: P.id,
          rows: [{ k: 'Service', v: P.name }, { k: 'Per session', v: self.money(BP.per) }, { k: 'Name', v: name }, { k: 'Payment', v: S.method === 'cash' ? 'Pay at the studio' : 'Card (Paymob)' }],
          note: 'Sign in at My account with ' + email + ' to book your ' + (S.bCount === 1 ? 'session' : S.bCount + ' sessions') + ' with this package. Valid for ' + self.validFor(S.bCount) + ' days.' };
      } else {
        payload = { kind: 'session', service: S.svc, setup: S.setup, date: isoDate(date), start: S.start, people: S.people, extras: S.ex, info: info,
          payment: needsPay ? S.method : 'cash', credit: usingCredit ? credit.id : undefined };
        var b = { kind: 'session', key: S.dateKey, setup: S.setup, start: S.start, end: S.start + dur, pkgName: P.name,
          setupLabel: SET.n, dateLabel: self.longDate(date), timeLabel: self.range(S.start, S.start + dur), totalLabel: self.money(total) };
        draft = { kind: 'session', email: email, headline: "You're booked!", kicker: 'Your session', big: b.dateLabel, sub: b.timeLabel + ' · ' + hoursText,
          totalLabel: self.money(total), start: b.start, end: b.end, booking: b,
          rows: [{ k: 'Service', v: P.name }, { k: 'Setup', v: b.setupLabel }, { k: 'People on camera', v: String(S.people) }, { k: 'Extras', v: extrasNames.length ? extrasNames.join(', ') : 'None' }, { k: 'Name', v: name }, { k: 'Payment', v: payLabelRow }],
          note: 'Your hours are locked in ' + SET.n + '. Please arrive 10 minutes early.' };
      }
      if (acct === 'created' || acct === 'unconfirmed') draft.note = 'We sent a confirmation email to ' + email + '. Tap the link in it to activate your account, then sign in with your email and password to see your bookings. ' + draft.note;
      var tokenP = usingCredit && supabase ? supabase.auth.getSession().then(function (r) { return r.data.session && r.data.session.access_token; }) : Promise.resolve(null);
      tokenP.then(function (token) { return startCheckout(payload, token); }).then(function (r) {
        draft.ref = r.ref; if (draft.booking) draft.booking.ref = r.ref;
        if (r.cash) {
          // Pay at the studio, or fully covered by a package credit: confirmed right away, no payment page.
          if (isBundle) draft.headline = 'Package reserved';
          var covered = r.credit && r.total === 0;
          self.setState({ paying: false, screen: 'confirm', w: 1, agreed: false, start: null, editInfo: false,
            last: Object.assign({}, draft, covered ? { payState: 'Covered by package', payCls: 'pill-ok' } : { payState: 'Due at studio', payCls: 'pill-due' }) });
          self.scrollTop(); self.loadBusy(); if (self.state.signedIn) self.loadMyBookings();
          return;
        }
        var wizard = {}; WIZARD_KEYS.forEach(function (k) { wizard[k] = S[k]; });
        try { sessionStorage.setItem('np_pending', JSON.stringify(draft)); sessionStorage.setItem('np_wizard', JSON.stringify(wizard)); } catch (e) { /* ignore */ }
        window.location.assign(r.url);
      }).catch(function (err) {
        var s = { paying: false };
        if (err.code === 'slot_taken' || err.code === 'in_the_past') { s.start = null; s.w = 5; }
        if (err.code === 'session_expired') { authSignOut().catch(function () {}); s.signedIn = false; s.screen = 'account'; }
        self.setState(s);
        self.showToast(err.message);
        if (err.code === 'slot_taken') self.loadBusy();
      });
    };
    var wzNext = function () {
      if (cur === 'info') {
        if (!infoOk) {
          self.setState({ showErr: true });
          var first = errs.first ? 'i-first' : errs.last ? 'i-last' : errs.email ? 'i-email' : errs.phone ? 'i-phone' : 'i-pw';
          setTimeout(function () { var el = self.rootEl && self.rootEl.querySelector('#' + first); if (el) el.focus(); }, 40);
          return;
        }
      }
      if (cur === 'pay') { if (!blockedMap.pay) pay(); return; }
      if (cur === 'service' && S.setup && !isBundle) { self.setW(S.w + 2); return; }
      if (!blockedMap[cur]) self.setW(S.w + 1);
    };
    var wzBack = function () { if (S.w > 1) self.setW(S.w - 1); else self.goBack(); };

    // ----- side panel -----
    var q;
    if (isBundle) {
      q = { img: catImg[P.id], label: 'Your package', title: self.packName(S.bCount) + ' · ' + P.tier, meta: S.bCount + ' sessions · ' + self.money(BP.per) + ' each',
        whenK: 'How it works', when: 'After you buy, sign in at My account and book each session yourself — the studio hour is covered by your package.', lines: lines, total: self.money(total), onsite: S.method === 'cash' && cur === 'pay',
        foot: 'Valid ' + self.validFor(S.bCount) + ' days. Book each session whenever you like — extras are added per session.' };
    } else {
      q = { img: SET ? SET.img : IM.hero, label: 'Your session', title: P.name,
        meta: (SET ? SET.n : 'Setup not chosen') + ' · ' + S.people + (S.people === 1 ? ' person' : ' people') + ' · ' + hoursText,
        whenK: 'When', when: date ? self.longDate(date) + (S.start != null ? ' · ' + self.range(S.start, S.start + dur) : ' · pick a time') : 'Pick a date & time',
        lines: lines, total: self.money(total), onsite: S.method === 'cash' && cur === 'pay' && needsPay,
        foot: 'Free to reschedule up to 48 hours before your session.' };
    }

    // ----- tour: calendar + 15-minute slots (availability set by admin; mocked here) -----
    var tStart = new Date(today.getFullYear(), today.getMonth() + S.tOff, 1);
    var tLead = (tStart.getDay() + 1) % 7, tDim = new Date(tStart.getFullYear(), tStart.getMonth() + 1, 0).getDate(), tCells = [];
    for (var ti = 0; ti < tLead; ti++) tCells.push({ label: '', cls: 'cd empty', dis: true, aria: '', pick: null });
    for (var td = 1; td <= tDim; td++) {
      (function (td) {
        var d = new Date(tStart.getFullYear(), tStart.getMonth(), td), k = self.key(d), fri = d.getDay() === 5, past = d < today, far = d > horizon;
        tCells.push({ label: String(td), dis: fri || past || far, cls: 'cd' + (fri ? ' fri' : '') + (d.getTime() === today.getTime() ? ' today' : '') + (S.tDate === k ? ' on' : ''),
          aria: self.longDate(d) + (fri ? ', closed' : ''), pick: function () { self.setState({ tDate: k, tSlot: null }); } });
      })(td);
    }
    while (tCells.length % 7) tCells.push({ label: '', cls: 'cd empty', dis: true, aria: '', pick: null });
    var tcal = { title: monthNames[tStart.getMonth()] + ' ' + tStart.getFullYear(), cells: tCells, noPrev: S.tOff <= 0,
      noNext: new Date(tStart.getFullYear(), tStart.getMonth() + 1, 1) > horizon,
      prev: function () { self.setState({ tOff: S.tOff - 1 }); }, next: function () { self.setState({ tOff: S.tOff + 1 }); } };
    var fmtM = function (m) { var h = Math.floor(m / 60), mm = m % 60, x = h > 12 ? h - 12 : h; return x + ':' + (mm < 10 ? '0' : '') + mm + ' PM'; };
    var tD = S.tDate ? self.fromKey(S.tDate) : null, tSlots = [], tFree = 0;
    if (tD) {
      var isToday = tD.getTime() === today.getTime(), nowM = new Date().getHours() * 60 + new Date().getMinutes();
      for (var m = 15 * 60; m < 23 * 60; m += 15) {
        (function (m) {
          var passed = isToday && m <= nowM;
          var blocked = ((tD.getDate() * 17 + m / 15 * 7) % 5) === 0;
          var on = S.tSlot === m, dis = passed || blocked;
          if (!dis) tFree++;
          tSlots.push({ label: fmtM(m), on: on, disabled: dis, cls: 'ts' + (on ? ' on' : ''), aria: fmtM(m) + ' to ' + fmtM(m + 15) + (dis ? ', unavailable' : ''),
            pick: function () { self.setState({ tSlot: on ? null : m }); } });
        })(m);
      }
    }
    var tour = { hasDate: !!tD, noDate: !tD, dateLong: tD ? self.longDate(tD) : '', slots: tSlots, freeLabel: tFree + ' slots free',
      when: tD && S.tSlot != null ? self.longDate(tD) + ' · ' + fmtM(S.tSlot) + ' – ' + fmtM(S.tSlot + 15) : '',
      summary: tD ? (S.tSlot != null ? self.longDate(tD) + ' · ' + fmtM(S.tSlot) : self.longDate(tD) + ' · pick a time') : 'Pick a day and a time' };
    var E = S.showErr ? errs : { first: false, last: false, email: false, pw: false, phone: false };
    var acctEmailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((S.acctEmail || '').trim());
    var cellsFor = function (s, e) { var a = []; for (var h = 15; h < 23; h++) a.push('tlc' + (h >= s && h < e ? ' on' : '')); return a; };
    var last = S.last ? Object.assign({}, S.last, { cells: cellsFor(S.last.start || 0, S.last.end || 0), isBundle: S.last.kind === 'bundle', isSession: S.last.kind === 'session', acctCls: S.last.kind === 'bundle' ? 'btn-gold' : 'btn-ghost' }) :
      { email: '', ref: '', headline: '', kicker: '', big: '', sub: '', totalLabel: '', payState: '', payCls: '', rows: [], note: '', cells: cellsFor(0, 0), isBundle: false, isSession: true, acctCls: 'btn-ghost' };
    var mk = function (g) { return function (f) { return function (e) { self.setF(g, f, e.target.value); }; }; };
    var fC = mk('cf'), fT = mk('tf'), fI = mk('info');
    var fmtNum = function (v) { return v.replace(/\D/g, '').slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 '); };
    var fmtExp = function (v) { var d = v.replace(/\D/g, '').slice(0, 4); return d.length > 2 ? d.slice(0, 2) + '/' + d.slice(2) : d; };
    var legalTitles = { privacy: 'Privacy Policy', terms: 'Terms & Conditions', refund: 'Refund & Cancellation' };
    // ----- reschedule (My account) -----
    var pad2 = function (n) { return (n < 10 ? '0' : '') + n; };
    var nowC = cairoParts(new Date().toISOString());
    var todayIso = nowC.y + '-' + pad2(nowC.m) + '-' + pad2(nowC.d);
    var maxD = new Date(nowC.y, nowC.m - 1, nowC.d + 60), maxIso = maxD.getFullYear() + '-' + pad2(maxD.getMonth() + 1) + '-' + pad2(maxD.getDate());
    var moveSlotsFor = function (b) {
      if (!S.moveDate) return { slots: [], note: 'Pick a new date to see the free times.' };
      var p = S.moveDate.split('-').map(Number), dt = new Date(p[0], p[1] - 1, p[2]);
      if (dt.getDay() === 5) return { slots: [], note: 'The studio is closed on Fridays. Pick another date.' };
      if (S.moveDate < todayIso || S.moveDate > maxIso) return { slots: [], note: 'Pick a date within the next 60 days.' };
      var dur = b.end - b.start, key = p[0] + '-' + p[1] + '-' + p[2];
      var taken = (S.busy[key + '|' + b.setup] || []).filter(function (r) { return !(key === b.key && r[0] === b.start && r[1] === b.end); });
      var slots = [];
      for (var h = 15; h + dur <= 23; h++) {
        var past = S.moveDate === todayIso && h <= nowC.h;
        var clash = taken.some(function (r) { return h < r[1] && h + dur > r[0]; });
        var same = key === b.key && h === b.start;
        if (past || clash || same) continue;
        (function (hh) {
          slots.push({ label: self.range(hh, hh + dur), cls: 'slot ' + (S.moveStart === hh ? 'slot-selected' : 'slot-available'), on: S.moveStart === hh,
            pick: function () { self.setState({ moveStart: hh }); } });
        })(h);
      }
      return { slots: slots, note: slots.length ? '' : 'No free times on this date for ' + b.setupLabel + '. Try another date.' };
    };
    var bookingList = S.bookings.slice().reverse().map(function (b) {
      var open = S.moveRef === b.ref, mv = open ? moveSlotsFor(b) : { slots: [], note: '' };
      return Object.assign({}, b, { cells: cellsFor(b.start, b.end), cardCls: 'card mpad' + (b.statusCls === 'pill-cx' ? ' cxcard' : ''),
        canMove: !!b.canMove, tooLate: !!b.upcoming && !b.canMove, moveOpen: open,
        moveLabel: open ? 'Keep this time' : 'Reschedule',
        toggleMove: function () { if (!open) self.loadBusy(); self.setState({ moveRef: open ? null : b.ref, moveDate: '', moveStart: null }); },
        moveDate: S.moveDate, moveMin: todayIso, moveMax: maxIso,
        onMoveDate: function (e) { self.setState({ moveDate: e.target.value, moveStart: null }); },
        moveSlots: mv.slots, hasMoveNote: !!mv.note, moveNote: mv.note,
        moveBlocked: S.moveBusy || S.moveStart == null, moveBtn: S.moveBusy ? 'Moving\u2026' : 'Confirm new time',
        confirmMove: function () {
          if (S.moveStart == null) return;
          self.setState({ moveBusy: true });
          supabase.auth.getSession().then(function (r) {
            var token = r.data.session && r.data.session.access_token;
            if (!token) throw new Error('Please sign in again.');
            return rescheduleBooking(b.ref, S.moveDate, S.moveStart, token);
          }).then(function () {
            self.setState({ moveBusy: false, moveRef: null, moveDate: '', moveStart: null });
            self.showToast('Done! Your session was moved. We emailed you the new time.');
            self.loadMyBookings(); self.loadBusy();
          }).catch(function (err) {
            self.setState({ moveBusy: false });
            self.showToast(err.message);
            if (err.code === 'slot_taken') { self.setState({ moveStart: null }); self.loadBusy(); }
          });
        } });
    });
    var creditList = S.credits.slice().reverse().map(function (c) {
      return { title: (c.pack ? c.pack + ' · ' : '') + c.name, left: c.left + ' of ' + c.count + (c.count === 1 ? ' session' : ' sessions') + ' left',
        expires: 'Valid until ' + c.expires + (c.unpaid ? ' · pay at the studio' : '') + ' · Order ' + c.id,
        canBook: c.left > 0, book: function () { self.startSession({ svc: c.svc, setup: null, w: 2, useCredit: true }); } };
    });

    return {
      setRoot: function (el) { self.rootEl = el; },
      setCar: function (el) { self.carEl = el; if (el) setTimeout(function () { self.fx(el); }, 60); },
      dragStart: function (e) {
        if (e.pointerType !== 'mouse' || e.button !== 0) return;
        var el = e.currentTarget; self._drag = { x: e.clientX, left: el.scrollLeft, moved: 0, el: el };
        el.classList.add('dragging');
      },
      dragMove: function (e) {
        var d = self._drag; if (!d) return;
        var dx = e.clientX - d.x; d.moved = Math.max(d.moved, Math.abs(dx));
        d.el.scrollLeft = d.left - dx;
      },
      dragEnd: function () {
        var d = self._drag; if (!d) return; self._drag = null;
        var el = d.el; el.classList.remove('dragging');
        self._justDragged = d.moved > 6; setTimeout(function () { self._justDragged = false; }, 80);
        if (!el.children.length) return;
        var w = el.children[0].offsetWidth + Number(el.getAttribute('data-gap') || 0);
        var i = Math.round(el.scrollLeft / w), dir = el.scrollLeft - d.left;
        if (Math.abs(dir) > 40 && Math.round(d.left / w) === i) i += dir > 0 ? 1 : -1;
        self.carTo(i);
      },
      onCarScroll: function (e) {
        var el = e.currentTarget; if (!el.children.length) return;
        self.fx(el);
        var w = el.children[0].offsetWidth + Number(el.getAttribute('data-gap') || 0), i = Math.round(el.scrollLeft / w);
        if (i !== self.state.carIdx) self.setState({ carIdx: i });
      },
      carPrev: function () { self.carTo(S.carIdx - 1); }, carNext: function () { self.carTo(S.carIdx + 1); }, carDots: carDots,
      is: { home: S.screen === 'home', studios: S.screen === 'studios', cyclorama: S.screen === 'cyclorama', audio: S.screen === 'audio',
        services: S.screen === 'services', contact: S.screen === 'contact', tour: S.screen === 'tour', account: S.screen === 'account',
        legal: S.screen === 'legal', book: S.screen === 'book', confirm: S.screen === 'confirm', packages: S.screen === 'packages', pkgDetail: S.screen === 'pkgDetail' },
      st: st,
      nav: { home: goTo('home'), packages: goTo('packages'), studios: goTo('studios'), services: goTo('services'),
        contact: goTo('contact'), tour: goTo('tour'), account: goTo('account') },
      legal: { privacy: function () { self.go('legal', { legal: 'privacy' }); }, terms: function (e) { if (e) e.preventDefault(); self.go('legal', { legal: 'terms' }); }, refund: function (e) { if (e) e.preventDefault(); self.go('legal', { legal: 'refund' }); } },
      legalTitle: legalTitles[S.legal],
      legalBack: function () { self.goBack(); },
      legalBackLabel: S.prevScreen === 'book' ? 'Back to your booking' : 'Back',
      showBack: ['home', 'book', 'confirm'].indexOf(S.screen) < 0, goBack: function () { self.goBack(); },
      social: { fb: function () { self.showToast('Opens the Nilepods Facebook page'); }, ig: function () { self.showToast('Opens the Nilepods Instagram page'); } },
      toastArabic: function () { self.setState({ menu: false }); self.showToast('Switches the site to Arabic'); },
      navItems: navItems, menuOpen: S.menu,
      openMenu: function () { self.setState({ menu: true }); }, closeMenu: function () { self.setState({ menu: false }); },
      bookNow: bookNow, pkgs: pkgs,
      bookS1: function () { self.startSession({ setup: 's1' }); }, bookS2: function () { self.startSession({ setup: 's2' }); },
      howSteps: [{ n: '01', t: 'Choose your service', d: 'Pick the service and the setup you want to record in.' }, { n: '02', t: 'Set date & time', d: 'Choose your hours between 3 and 11 PM.' }, { n: '03', t: 'Pay securely', d: 'Online, at the studio, or with a package credit.' }, { n: '04', t: 'Start your shoot', d: 'Walk in, sit down, and hit record.' }],
      stages: [{ stage: 'Stage 01', t: 'Strategy Development', d: 'We help you sharpen your concept and turn it into a show worth tuning into.', img: IM.shelves },
        { stage: 'Stage 02', t: 'Studios & Production', d: 'Fully equipped studios and a production team running every session.', img: IM.mics },
        { stage: 'Stage 03', t: 'Distribution & Post-Production', d: 'Editing, mastering and the final polish — ready to publish.', img: IM.win }],
      faqs: [{ q: 'What is Nilepods and how can it help me?', a: 'Nilepods is a set of ready-to-record studios with everything you need to shoot, record, edit and distribute your content — from podcasts to masterclasses.' },
        { q: 'What makes Nilepods unique?', a: 'Our equipment is automated, so shooting is simple and fast — and your edit is ready soon after you finish recording.' },
        { q: 'Do packages save me money?', a: 'Yes. Pilot (3 sessions) saves 5%, Series (5) saves 10%, Season (10) saves 15% and Full Season (20) saves 20%. Book each session whenever you like within ' + validDays + ' days, or 180 days for Full Season.' },
        { q: 'How can I book a studio?', a: 'Book online in a few minutes — pick a service, a setup and your hours between 3 and 11 PM, then pay online, at the studio, or with a package credit.' }],
      // catalog
      catalog: catalog, fCount: fCount,
      saveChips: counts.map(function (n) { return self.packName(n) + ' · ' + n + ' sessions · save ' + Math.round(D[n] * 100) + '%'; }),
      maxSave: Math.round(D[20] * 100) + '%', longValid: '180',
      packHead: { name: self.packName(pkN), sub: pkN + ' sessions · save ' + Math.round(D[pkN] * 100) + '% · valid ' + self.validFor(pkN) + ' days' },
      validDays: String(validDays), pd: pd,
      bq: isBundle ? { tier: P.tier, svc: P.name, img: catImg[P.id], inc: P.inc,
        counts: segFor(P, S.bCount, function (n) { self.setState({ bCount: n }); }),
        countLabel: self.packLabel(S.bCount), valid: String(self.validFor(S.bCount)), per: self.money(BP.per) + ' per session',
        hasSave: BP.saved > 0, saved: self.money(BP.saved) } : { tier: '', svc: '', img: IM.hero, inc: [], counts: [], countLabel: '', per: '', hasSave: false, saved: '' },
      // contact / tour / account
      cf: S.cf, onC: { name: fC('name'), phone: fC('phone'), email: fC('email'), msg: fC('msg') },
      contactSent: S.contactSent, contactForm: !S.contactSent,
      contactBlocked: !(S.cf.name.trim() && (S.cf.phone.trim() || S.cf.email.trim()) && S.cf.msg.trim()),
      sendContact: function () { self.setState({ contactSent: true }); self.scrollTop(); },
      tf: S.tf, onT: { name: fT('name'), phone: fT('phone'), note: fT('note') },
      tourSent: S.tourSent, tourForm: !S.tourSent,
      tourBlocked: !(S.tf.name.trim() && S.tf.phone.replace(/\D/g, '').length >= 8 && S.tDate && S.tSlot != null),
      tcal: tcal, tour: tour,
      sendTour: function () { self.setState({ tourSent: true }); self.scrollTop(); },
      signedIn: S.signedIn, signedOut: !S.signedIn, acctEmail: S.acctEmail,
      onAcct: function (e) { self.setState({ acctEmail: e.target.value }); },
      signinBlocked: S.signInBusy || !acctEmailOk || !S.acctPw,
      signInLabel: S.signInBusy ? 'Signing in…' : 'Sign in',
      hasSignInNote: !!S.signInNote, signInNote: S.signInNote,
      acctPw: S.acctPw, onAcctPw: function (e) { self.setState({ acctPw: e.target.value }); },
      signIn: function () {
        self.setState({ signInBusy: true, signInNote: '' });
        signInWithPassword(S.acctEmail, S.acctPw).then(function () { self.setState({ signInBusy: false, acctPw: '' }); })
          .catch(function (err) { self.setState({ signInBusy: false, signInNote: err.message }); });
      },
      forgotPw: function () {
        if (!acctEmailOk) { self.setState({ signInNote: 'Type your email above first, then tap "Forgot password?".' }); return; }
        sendPasswordReset(S.acctEmail).then(function () { self.setState({ signInNote: 'We sent a password reset link to ' + S.acctEmail.trim() + '. Open it on this device to choose a new password.' }); })
          .catch(function (err) { self.setState({ signInNote: err.message }); });
      },
      emailLink: function () {
        if (!acctEmailOk) { self.setState({ signInNote: 'Type your email above first.' }); return; }
        sendSignInLink(S.acctEmail, '/?account=1').then(function () { self.setState({ signInNote: 'Check your inbox at ' + S.acctEmail.trim() + ' and tap the link to sign in. It can take a minute; check spam too.' }); })
          .catch(function (err) { self.setState({ signInNote: err.message }); });
      },
      showPwPanel: S.showPwPanel, pwPanelLabel: S.showPwPanel ? 'Close' : 'Change password',
      pwPanelTitle: S.pwReset ? 'Choose a new password' : 'Change your password',
      togglePwPanel: function () { self.setState({ showPwPanel: !S.showPwPanel, pwReset: false, newPw: '' }); },
      newPw: S.newPw, onNewPw: function (e) { self.setState({ newPw: e.target.value }); }, newPwBlocked: (S.newPw || '').length < 8,
      saveNewPw: function () {
        setPassword(S.newPw).then(function () { self.setState({ showPwPanel: false, pwReset: false, newPw: '' }); self.showToast('Password saved. Use it next time you sign in.'); })
          .catch(function (err) { self.showToast(err.message); });
      },
      needPassword: !S.signedIn,
      hasBookingAs: S.signedIn && cur === 'pay' && steps.indexOf('info') < 0, bookingAs: (I.first + ' ' + I.last).trim() + ' · ' + S.acctEmail,
      editInfo: function () { self.setState({ editInfo: true, w: isBundle ? 2 : 6 }); },
      signOut: function () { authSignOut().then(function () { self.setState({ signedIn: false, bookings: [], credits: [], acctEmail: '', showPwPanel: false, info: { first: '', last: '', email: '', phone: '', wa: false, pw: '' } }); }); },
      bookingList: bookingList, noBookings: bookingList.length === 0 && creditList.length === 0,
      creditList: creditList, hasCredits: creditList.length > 0, hasBookings: bookingList.length > 0,
      // wizard
      wz: { n: String(S.w), of: String(steps.length), title: titleMap[cur], backLabel: backMap[cur], kind: isBundle ? 'Buy a package' : 'Book a session', progCls: 'prog' + (isBundle ? ' p3' : '') },
      progBars: progBars, wzNext: wzNext, wzBack: wzBack,
      nextBlocked: blockedMap[cur], nextLabel: nextLabel, nextShort: nextShort,
      setupList: setupList,
      setupTabs: SU.map(function (s, si) { return { name: s.name, on: S.carIdx === si, cls: 'stab' + (S.carIdx === si ? ' on' : ''), go: function () { self.carTo(si); } }; }),
      setupIntro: isBundle ? 'Pick the setup you would like to record in. You can switch setups for any session when you book it. Swipe to see them all.' : 'Swipe through the setups and choose the one you want to record in.',
      setupName: SET ? SET.n : 'Your setup', setupCap: String(cap),
      people: String(S.people), peopleMin: S.people <= 1, peopleMax: S.people >= cap,
      peopleDown: function () { self.setState({ people: Math.max(1, S.people - 1) }); },
      peopleUp: function () { self.setState({ people: Math.min(cap, S.people + 1) }); },
      extraList: extraList, durLabel: hoursText,
      cal: cal, hasDate: !!date, noDate: !date, dateLong: date ? self.longDate(date) : '',
      slotList: slotList, noSlots: !!date && freeCount === 0,
      info: I, onI: { first: fI('first'), last: fI('last'), email: fI('email'), phone: fI('phone'), pw: fI('pw') },
      toggleWa: function () { self.setF('info', 'wa', !I.wa); },
      err: { firstBad: E.first, lastBad: E.last, emailBad: E.email, pwBad: !!E.pw, phoneBad: !!E.phone, phoneCls: 'inp' + (E.phone ? ' bad' : ''),
        firstCls: 'inp' + (E.first ? ' bad' : ''), lastCls: 'inp' + (E.last ? ' bad' : ''), emailCls: 'inp' + (E.email ? ' bad' : ''), pwCls: 'inp' + (E.pw ? ' bad' : '') },
      canCredit: !isBundle && !!credit, useCredit: S.useCredit, toggleCredit: function () { self.setState({ useCredit: !S.useCredit }); },
      creditNote: credit ? (credit.pack ? credit.pack + ' · ' : '') + credit.name + ' · ' + credit.left + ' left · covers the first hour' : '',
      needsPay: needsPay, noPay: !needsPay || usingCredit,
      showSummary: needsPay && !usingCredit, // full order summary before paying (credit bookings show their own breakdown)
      // Breakdown shown instead of payment options when a package credit is used.
      creditPayTitle: usingCredit && needsPay ? '1 hour is deducted from your package. Only the extras are paid:' : 'Nothing to pay: 1 hour is deducted from your package',
      creditLines: lines.map(function (l) { var covered = l.v === 'Package credit';
        return { k: l.k, v: covered ? 'Covered by package credit' : l.v, cls: covered ? 'pill-ok' : '' }; }),
      hasCreditDue: usingCredit && needsPay, creditDue: self.money(total), creditDueLabel: 'Extras to pay',
      // Card only, on Paymob's hosted checkout. Card details are never entered on this site.
      payMethods: [{ id: 'card', label: 'Card', sub: 'Visa · Mastercard · Meeza' }, { id: 'cash', label: 'At the studio', sub: isBundle ? 'Pay cash at the studio' : 'Pay cash on the day' }].map(function (m) {
        return { label: m.label, sub: m.sub, on: S.method === m.id, cls: 'opt' + (S.method === m.id ? ' on' : ''), pick: function () { self.setState({ method: m.id }); } }; }),
      payOnline: false,
      payHelp: usingCredit
        ? (S.method === 'cash' ? 'Your time is confirmed now. You pay ' + self.money(total) + ' for the extras at the studio.' : 'You will pay ' + self.money(total) + " for the extras on Paymob's secure checkout page, then come straight back here.")
        : S.method === 'cash'
        ? (isBundle ? 'Your package is reserved now. You pay ' : 'Your time is confirmed now. You pay ') + self.money(total) + ' at the studio.'
        : 'You will pay ' + self.money(total) + " on Paymob's secure checkout page, then come straight back here." + (isBundle ? '' : ' Your time is held for 20 minutes while you pay.'),
      card: C,
      onP: { holder: function (e) { self.setF('card', 'holder', e.target.value); }, num: function (e) { self.setF('card', 'num', fmtNum(e.target.value)); },
        exp: function (e) { self.setF('card', 'exp', fmtExp(e.target.value)); }, cvc: function (e) { self.setF('card', 'cvc', e.target.value.replace(/\D/g, '').slice(0, 4)); } },
      agreed: S.agreed, toggleAgree: function () { self.setState({ agreed: !S.agreed }); },
      q: q, notSetup: cur !== 'setup',
      last: last, addCal: function () { self.showToast('Added to your calendar'); },
      scheduleFirst: function () { self.startSession({ svc: S.last.svc, setup: null, w: 2 }); },
      hasToast: !!S.toast, toast: S.toast
    };
  }
}
