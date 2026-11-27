// Generated from design/Admin.dc.html by tools/convert-design.mjs - edit the design or the converter, not this file.
import { Fragment } from 'react';

export default function View(v) {
  return (
    <div className="ad" ref={v.setRoot}>
      {v.loggedOut ? (<>
        <div className="login">
          <div className="panel" style={{ width: "100%", maxWidth: "420px", padding: "40px 32px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", textAlign: "center" }}>
              <p className="ttl" style={{ margin: "0", display: "inline-flex", alignItems: "center", fontWeight: "600", letterSpacing: "-0.5px", lineHeight: "1", color: "#FFFFFF" }}>
                <img src="/images/nilepods-logo.svg" alt="Nilepods" draggable="false" style={{ height: "41px", width: "auto", display: "block" }} />
              </p>
              <p className="lbl" style={{ color: "#E2B872" }}>
                {"Studio admin"}
              </p>
            </div>
            <div style={{ textAlign: "center" }}>
              <h1 className="ttl" style={{ margin: "0", fontSize: "26px", color: "#FFFFFF" }}>
                {"Sign in"}
              </h1>
              <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                {"Only team members the owner has invited can sign in."}
              </p>
            </div>
            <div className="field">
              <label htmlFor="l-email">
                {"Work email"}
              </label>
              <input id="l-email" className="inp" type="email" value={v.email} onChange={v.onEmail} autoComplete="username" placeholder="you@nilepods.com" />
            </div>
            <div className="field">
              <label htmlFor="l-pw">
                {"Password"}
              </label>
              <input id="l-pw" className="inp" type="password" value={v.pw} onChange={v.onPw} onKeyDown={v.pwKey} autoComplete="current-password" placeholder="Your password" />
            </div>
            {v.hasLoginErr ? (<>
              <p className="ferr" role="alert" style={{ margin: "0" }}>
                {v.loginErr}
              </p>
            </>) : null}
            <button className="btn-gold" disabled={v.signInBusy} onClick={v.signIn} style={{ minHeight: "50px", fontSize: "15px" }}>
              {v.signInLabel}
            </button>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", fontSize: "13px" }}>
              <button className="link" onClick={v.forgotPw}>
                {"Forgot password?"}
              </button>
              <button className="link" onClick={v.emailLink}>
                {v.linkLabel}
              </button>
            </div>
            <p style={{ margin: "0", fontSize: "12.5px", color: "#7D7365", textAlign: "center", lineHeight: "1.6" }}>
              {v.loginNote}
            </p>
          </div>
        </div>
      </>) : null}
      {v.loggedIn ? (<>
        <header className="top">
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <p className="ttl" style={{ margin: "0", display: "inline-flex", alignItems: "center", fontWeight: "600", letterSpacing: "-0.5px", lineHeight: "1", color: "#FFFFFF" }}>
              <img src="/images/nilepods-logo.svg" alt="Nilepods" draggable="false" style={{ height: "31px", width: "auto", display: "block" }} />
            </p>
            <span className="pill p-in desk">
              {"Admin"}
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="desk" style={{ textAlign: "right" }}>
              <p style={{ margin: "0", fontSize: "14px", fontWeight: "500", color: "#FFFFFF" }}>
                {v.me.name}
              </p>
              <p style={{ margin: "0", fontSize: "12px", color: "#8C8172" }}>
                {v.me.role}
              </p>
            </div>
            <span style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2A241C", color: "#E2B872", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px" }} aria-hidden="true">
              {v.me.initials}
            </span>
            <button className="btn-ghost" onClick={v.togglePwPanel} style={{ minHeight: "40px" }}>
              {v.pwPanelLabel}
            </button>
            <button className="btn-ghost" onClick={v.signOut} style={{ minHeight: "40px" }}>
              {"Sign out"}
            </button>
          </div>
        </header>
        {v.showPwNudge ? (<>
          <div style={{ padding: "12px 24px", background: "rgba(226,184,114,0.10)", borderBottom: "1px solid rgba(226,184,114,0.25)", fontSize: "14px", color: "#E8D9BE", display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
            {"Set a password so next time you can sign in straight away, without waiting for an email. "}
            <button className="link" onClick={v.togglePwPanel}>
              {"Set a password"}
            </button>
          </div>
        </>) : null}
        {v.showPwPanel ? (<>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(241,234,223,0.08)", display: "flex", gap: "12px", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div className="field" style={{ minWidth: "260px" }}>
              <label htmlFor="n-pw">
                {v.pwPanelTitle}
              </label>
              <input id="n-pw" className="inp" type="password" value={v.newPw} onChange={v.onNewPw} autoComplete="new-password" placeholder="At least 8 characters" />
            </div>
            <button className="btn-gold" disabled={v.newPwBlocked} onClick={v.saveNewPw} style={{ minHeight: "46px" }}>
              {"Save password"}
            </button>
          </div>
        </>) : null}
        <div className="shell">
          <nav className="side" aria-label="Admin">
            <p className="lbl" style={{ padding: "4px 14px 10px" }}>
              {"Studio"}
            </p>
            {(v.tabs || []).map((t, t_i39) => (<Fragment key={t_i39}>
              <button className={t.cls} onClick={t.go} aria-current={t.cur}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d={t.icon} />
                </svg>
                {t.label}
              </button>
            </Fragment>))}
            <div className="grow" style={{ flexGrow: "1" }} />
            <div className="foot" style={{ padding: "12px 14px", fontSize: "12px", color: "#7D7365", lineHeight: "1.6" }}>
              {"Open Sat–Thu, 3–11 PM"}
              <br />
              {"Closed Fridays"}
            </div>
          </nav>
          <main className="main">
            {v.is.overview ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Overview"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {"Good to see you, "}{v.me.first}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {v.todayLong}{" · "}{v.dataNote}
                  </p>
                </div>
                <div className="seg" role="group" aria-label="Period">
                  {(v.ranges || []).map((r, r_i40) => (<Fragment key={r_i40}>
                    <button className={r.cls} onClick={r.go}>
                      {r.label}
                    </button>
                  </Fragment>))}
                </div>
              </div>
              <div className="kpis">
                <div className="panel kpi">
                  <p className="lbl">
                    {"Money in"}
                  </p>
                  <p className="v">
                    {v.k.revenue}
                  </p>
                  <p className="s">
                    {v.k.revenueSub}
                  </p>
                </div>
                <div className="panel kpi">
                  <p className="lbl">
                    {"Bookings"}
                  </p>
                  <p className="v">
                    {v.k.bookings}
                  </p>
                  <p className="s">
                    {v.k.bookingsSub}
                  </p>
                </div>
                <div className="panel kpi">
                  <p className="lbl">
                    {"Studio use"}
                  </p>
                  <p className="v">
                    {v.k.util}
                  </p>
                  <p className="s">
                    {v.k.utilSub}
                  </p>
                </div>
                <div className="panel kpi">
                  <p className="lbl">
                    {"Due at studio"}
                  </p>
                  <p className="v">
                    {v.k.due}
                  </p>
                  <p className="s">
                    {v.k.dueSub}
                  </p>
                </div>
                <div className="panel kpi">
                  <p className="lbl">
                    {"Packages sold"}
                  </p>
                  <p className="v">
                    {v.k.packs}
                  </p>
                  <p className="s">
                    {v.k.packsSub}
                  </p>
                </div>
              </div>
              <div className="grid2">
                <div className="panel" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                    <p className="lbl">
                      {"Money in · last 14 days"}
                    </p>
                    <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                      {v.chartTotal}
                    </p>
                  </div>
                  <div className="chart" role="img" aria-label={v.chartAria}>
                    {(v.chart || []).map((c, c_i41) => (<Fragment key={c_i41}>
                      <div className={c.cls} title={c.tip}>
                        <i style={{ height: `${c.h}%` }} />
                        <span>
                          {c.d}
                        </span>
                      </div>
                    </Fragment>))}
                  </div>
                </div>
                <div className="panel" style={{ padding: "22px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                    <p className="lbl">
                      {"Today in the studio"}
                    </p>
                    <button className="btn-ghost" onClick={v.goSchedule} style={{ minHeight: "34px", fontSize: "13px" }}>
                      {"Full schedule"}
                    </button>
                  </div>
                  <div className="list" style={{ marginTop: "8px" }}>
                    {(v.todayList || []).map((b, b_i42) => (<Fragment key={b_i42}>
                      <button className="li" onClick={b.open}>
                        <span className="time">
                          {b.time}
                        </span>
                        <span style={{ flex: "1", minWidth: "0" }}>
                          <span style={{ display: "block", fontSize: "14px", color: "#FFFFFF" }}>
                            {b.customer}
                          </span>
                          <span className="muted">
                            {b.setup}{" · "}{b.service}
                          </span>
                        </span>
                        <span className={b.pillCls}>
                          {b.status}
                        </span>
                      </button>
                    </Fragment>))}
                    {v.noToday ? (<>
                      <p style={{ margin: "18px 0 4px", fontSize: "14px", color: "#8C8172" }}>
                        {v.noTodayMsg}
                      </p>
                    </>) : null}
                  </div>
                </div>
                <div className="panel" style={{ padding: "22px" }}>
                  <p className="lbl">
                    {"Money in by service · "}{v.rangeLabel}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "18px" }}>
                    {(v.bySvc || []).map((v, v_i43) => (<Fragment key={v_i43}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", marginBottom: "8px" }}>
                          <span>
                            {v.name}
                          </span>
                          <span style={{ color: "#FFFFFF", fontWeight: "500" }}>
                            {v.amount}
                          </span>
                        </div>
                        <div className="mbar">
                          <i style={{ width: `${v.pct}%` }} />
                        </div>
                      </div>
                    </Fragment>))}
                  </div>
                </div>
                <div className="panel" style={{ padding: "22px" }}>
                  <p className="lbl">
                    {"What's happening"}
                  </p>
                  <div className="list" style={{ marginTop: "8px" }}>
                    {(v.activity || []).map((a, a_i44) => (<Fragment key={a_i44}>
                      <div className="li">
                        <span className="dot" aria-hidden="true" />
                        <span style={{ flex: "1", minWidth: "0", fontSize: "14px", color: "#DCD3C4" }}>
                          {a.text}
                        </span>
                        <span className="muted" style={{ whiteSpace: "nowrap" }}>
                          {a.when}
                        </span>
                      </div>
                    </Fragment>))}
                  </div>
                </div>
              </div>
            </>) : null}
            {v.is.schedule ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Schedule"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {v.sched.title}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {v.sched.sub}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="iconbtn" aria-label="Previous day" onClick={v.sched.prev}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <button className="btn-ghost" onClick={v.sched.today}>
                    {"Today"}
                  </button>
                  <button className="iconbtn" aria-label="Next day" onClick={v.sched.next}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
              {v.sched.closed ? (<>
                <div className="panel" style={{ padding: "40px", textAlign: "center" }}>
                  <p className="ttl" style={{ margin: "0", fontSize: "24px", color: "#FFFFFF" }}>
                    {"Closed on Fridays"}
                  </p>
                  <p style={{ margin: "8px 0 0", color: "#8C8172" }}>
                    {"No sessions or tours are booked on this day."}
                  </p>
                </div>
              </>) : null}
              {v.sched.open ? (<>
                <div className="panel sched" style={{ padding: "18px 18px 10px" }}>
                  <div className="sg">
                    <div />
                    {(v.hours || []).map((h, h_i45) => (<Fragment key={h_i45}>
                      <div className="hh">
                        {h}
                      </div>
                    </Fragment>))}
                    {(v.sched.rows || []).map((r, r_i46) => (<Fragment key={r_i46}>
                      <div className="rh">
                        {r.name}
                      </div>
                      <div className="lane">
                        {(r.blocks || []).map((b, b_i47) => (<Fragment key={b_i47}>
                          <button className={b.cls} style={{ gridColumn: b.gc, gridRow: "1" }} onClick={b.open} aria-label={b.aria}>
                            <b>
                              {b.customer}
                            </b>
                            {b.time}
                          </button>
                        </Fragment>))}
                      </div>
                    </Fragment>))}
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginTop: "14px", fontSize: "12.5px", color: "#A89C8B" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="b-up" style={{ width: "14px", height: "14px", borderRadius: "4px", display: "inline-block" }} />
                    {"Upcoming"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="b-in" style={{ width: "14px", height: "14px", borderRadius: "4px", display: "inline-block" }} />
                    {"In studio now"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="b-done" style={{ width: "14px", height: "14px", borderRadius: "4px", display: "inline-block" }} />
                    {"Completed"}
                  </span>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <i className="b-ns" style={{ width: "14px", height: "14px", borderRadius: "4px", display: "inline-block" }} />
                    {"No-show"}
                  </span>
                </div>
              </>) : null}
            </>) : null}
            {v.is.bookings ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Bookings"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {"All bookings"}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {v.listCount}
                  </p>
                </div>
                <div style={{ width: "min(320px, 100%)" }}>
                  <label htmlFor="q" className="lbl" style={{ display: "block", marginBottom: "6px" }}>
                    {"Search"}
                  </label>
                  <input id="q" className="inp" value={v.q} onChange={v.onQ} placeholder="Name, booking ID or setup" />
                </div>
              </div>
              <div className="chips" style={{ marginBottom: "16px" }} role="group" aria-label="Filter by status">
                {(v.statusChips || []).map((c, c_i48) => (<Fragment key={c_i48}>
                  <button className={c.cls} onClick={c.go} aria-pressed={c.on}>
                    {c.label}
                  </button>
                </Fragment>))}
              </div>
              <div className="panel tbox">
                <div className="trow head">
                  <span>
                    {"Booking"}
                  </span>
                  <span>
                    {"Customer"}
                  </span>
                  <span>
                    {"Setup · service"}
                  </span>
                  <span>
                    {"Date & time"}
                  </span>
                  <span>
                    {"Amount"}
                  </span>
                  <span>
                    {"Payment"}
                  </span>
                  <span>
                    {"Status"}
                  </span>
                </div>
                {(v.rows || []).map((b, b_i49) => (<Fragment key={b_i49}>
                  <button className="trow" onClick={b.open}>
                    <span className="muted" style={{ fontSize: "13px" }}>
                      {b.id}
                    </span>
                    <span style={{ color: "#FFFFFF" }}>
                      {b.customer}
                    </span>
                    <span>
                      {b.setup}{" · "}
                      <span className="muted">
                        {b.serviceShort}
                      </span>
                    </span>
                    <span>
                      {b.dateShort}{" · "}
                      <span className="muted">
                        {b.time}
                      </span>
                    </span>
                    <span style={{ color: "#FFFFFF", fontWeight: "500" }}>
                      {b.amountLabel}
                    </span>
                    <span className={b.payCls} style={{ fontSize: "13px", fontWeight: "500" }}>
                      {b.payLabel}
                    </span>
                    <span>
                      <span className={b.pillCls}>
                        {b.status}
                      </span>
                    </span>
                  </button>
                </Fragment>))}
                {v.noRows ? (<>
                  <p style={{ margin: "0", padding: "32px", textAlign: "center", color: "#8C8172" }}>
                    {"No bookings match. "}
                    <button className="btn-ghost" onClick={v.clearFilters} style={{ marginLeft: "8px", minHeight: "36px" }}>
                      {"Clear filters"}
                    </button>
                  </p>
                </>) : null}
              </div>
            </>) : null}
            {v.is.packages ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Packages"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {"Session packages"}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {v.pk.count}
                  </p>
                </div>
                <div style={{ width: "min(320px, 100%)" }}>
                  <label htmlFor="pkq" className="lbl" style={{ display: "block", marginBottom: "6px" }}>
                    {"Search"}
                  </label>
                  <input id="pkq" className="inp" value={v.pk.q} onChange={v.pk.onQ} placeholder="Name, email or order ID" />
                </div>
              </div>
              <div className="chips" style={{ marginBottom: "16px" }} role="group" aria-label="Filter packages">
                {(v.pk.chips || []).map((c, c_i50) => (<Fragment key={c_i50}>
                  <button className={c.cls} onClick={c.go} aria-pressed={c.on}>
                    {c.label}
                  </button>
                </Fragment>))}
              </div>
              {v.pk.hasSel ? (<>
                <div className="panel" style={{ padding: "22px", marginBottom: "14px", display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "12px", alignItems: "flex-start" }}>
                    <div>
                      <p className="muted" style={{ margin: "0", fontSize: "13px" }}>
                        {"Order "}{v.pk.sel.ref}{" · bought "}{v.pk.sel.bought}
                      </p>
                      <h2 className="ttl" style={{ margin: "6px 0 0", fontSize: "24px", color: "#FFFFFF" }}>
                        {v.pk.sel.customer}
                      </h2>
                      <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#DCD3C4" }}>
                        {v.pk.sel.pack}{" · "}{v.pk.sel.svc}
                      </p>
                      <p className="muted" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                        {v.pk.sel.email}{" · "}{v.pk.sel.phone}
                      </p>
                    </div>
                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <span className={v.pk.sel.statusCls}>
                        {v.pk.sel.statusLabel}
                      </span>
                      <button className="btn-ghost" onClick={v.pk.close} style={{ minHeight: "36px" }}>
                        {"Close"}
                      </button>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", fontSize: "14px" }}>
                    <span>
                      <span className="muted">
                        {"Used"}
                      </span>
                      {" "}{v.pk.sel.usedLabel}
                    </span>
                    <span>
                      <span className="muted">
                        {"Booked ahead"}
                      </span>
                      {" "}{v.pk.sel.upcoming}
                    </span>
                    <span>
                      <span className="muted">
                        {"Valid until"}
                      </span>
                      {" "}{v.pk.sel.expires}
                    </span>
                    <span>
                      <span className="muted">
                        {"Amount"}
                      </span>
                      {" "}{v.pk.sel.amountLabel}
                    </span>
                    <span>
                      <span className="muted">
                        {"Payment"}
                      </span>
                      {" "}
                      <span className={v.pk.sel.payCls}>
                        {v.pk.sel.payLabel}
                      </span>
                      {" · "}{v.pk.sel.method}
                    </span>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                    {v.pk.canPay ? (<>
                      <button className="btn-gold" onClick={v.pk.markPaid}>
                        {"Mark as paid · "}{v.pk.sel.amountLabel}
                      </button>
                    </>) : null}
                    {v.pk.canCancel ? (<>
                      <button className="btn-danger" disabled={v.pk.busy} onClick={v.pk.cancel}>
                        {v.pk.cancelLabel}
                      </button>
                    </>) : null}
                    {v.pk.armed ? (<>
                      <button className="btn-ghost" onClick={v.pk.keep}>
                        {"Keep it"}
                      </button>
                    </>) : null}
                  </div>
                  {v.pk.armed ? (<>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#DCD3C4" }}>
                      <p style={{ margin: "0" }}>
                        {"The remaining sessions can no longer be booked, and the customer gets an email. Refund them in Paymob if they paid by card."}
                      </p>
                      {v.pk.hasUpcoming ? (<>
                        <label style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer" }}>
                          <input type="checkbox" checked={v.pk.also} onChange={v.pk.toggleAlso} style={{ width: "18px", height: "18px", accentColor: "#E2B872", margin: "0" }} />
                          <span>
                            {v.pk.upcomingLabel}
                          </span>
                        </label>
                      </>) : null}
                    </div>
                  </>) : null}
                </div>
              </>) : null}
              <div className="panel tbox">
                <div className="trow head" style={{ gridTemplateColumns: "110px 1.3fr 1.3fr 1fr 1fr 110px 110px" }}>
                  <span>
                    {"Order"}
                  </span>
                  <span>
                    {"Customer"}
                  </span>
                  <span>
                    {"Package"}
                  </span>
                  <span>
                    {"Used"}
                  </span>
                  <span>
                    {"Amount"}
                  </span>
                  <span>
                    {"Payment"}
                  </span>
                  <span>
                    {"Status"}
                  </span>
                </div>
                {(v.pk.rows || []).map((p, p_i51) => (<Fragment key={p_i51}>
                  <button className="trow" onClick={p.open} style={{ gridTemplateColumns: "110px 1.3fr 1.3fr 1fr 1fr 110px 110px" }}>
                    <span className="muted" style={{ fontSize: "13px" }}>
                      {p.ref}
                    </span>
                    <span style={{ color: "#FFFFFF" }}>
                      {p.customer}
                    </span>
                    <span>
                      {p.pack}{" · "}
                      <span className="muted">
                        {p.svc}
                      </span>
                    </span>
                    <span>
                      {p.usedLabel}
                    </span>
                    <span style={{ color: "#FFFFFF", fontWeight: "500" }}>
                      {p.amountLabel}
                    </span>
                    <span className={p.payCls}>
                      {p.payLabel}
                    </span>
                    <span>
                      <span className={p.statusCls}>
                        {p.statusLabel}
                      </span>
                    </span>
                  </button>
                </Fragment>))}
                {v.pk.none ? (<>
                  <p style={{ margin: "0", padding: "32px", textAlign: "center", color: "#8C8172" }}>
                    {"No packages here."}
                  </p>
                </>) : null}
              </div>
            </>) : null}
            {v.is.payments ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Payments"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {"Money in"}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {v.rangeLabel}{" · "}{v.dataNote}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div className="seg" role="group" aria-label="Period">
                    {(v.ranges || []).map((r, r_i52) => (<Fragment key={r_i52}>
                      <button className={r.cls} onClick={r.go}>
                        {r.label}
                      </button>
                    </Fragment>))}
                  </div>
                  <button className="btn-ghost" onClick={v.exportCsv}>
                    {"Export CSV"}
                  </button>
                </div>
              </div>
              <div className="kpis">
                {(v.payTotals || []).map((p, p_i53) => (<Fragment key={p_i53}>
                  <div className="panel kpi">
                    <p className="lbl">
                      {p.label}
                    </p>
                    <p className="v">
                      {p.amount}
                    </p>
                    <p className="s">
                      {p.sub}
                    </p>
                  </div>
                </Fragment>))}
              </div>
              <div className="panel tbox" style={{ marginTop: "14px" }}>
                <div className="trow head" style={{ gridTemplateColumns: "110px 1.2fr 1.6fr 1fr 1fr 110px" }}>
                  <span>
                    {"Date"}
                  </span>
                  <span>
                    {"Customer"}
                  </span>
                  <span>
                    {"Item"}
                  </span>
                  <span>
                    {"Method"}
                  </span>
                  <span>
                    {"Amount"}
                  </span>
                  <span>
                    {"Status"}
                  </span>
                </div>
                {(v.txns || []).map((t, t_i54) => (<Fragment key={t_i54}>
                  <div className="trow" style={{ gridTemplateColumns: "110px 1.2fr 1.6fr 1fr 1fr 110px" }}>
                    <span className="muted" style={{ fontSize: "13px" }}>
                      {t.date}
                    </span>
                    <span style={{ color: "#FFFFFF" }}>
                      {t.customer}
                    </span>
                    <span>
                      {t.item}
                    </span>
                    <span className="muted" style={{ fontSize: "13px" }}>
                      {t.method}
                    </span>
                    <span style={{ color: "#FFFFFF", fontWeight: "500" }}>
                      {t.amount}
                    </span>
                    <span className={t.stCls} style={{ fontSize: "13px", fontWeight: "500" }}>
                      {t.status}
                    </span>
                  </div>
                </Fragment>))}
              </div>
            </>) : null}
            {v.is.tours ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Tours"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {"Tour availability"}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {"Tap a slot to open or block it. Booked slots can't be blocked."}
                  </p>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button className="iconbtn" aria-label="Previous day" onClick={v.tour.prev}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 6l-6 6 6 6" />
                    </svg>
                  </button>
                  <p style={{ margin: "0", minWidth: "150px", textAlign: "center", fontSize: "15px", fontWeight: "500" }}>
                    {v.tour.dayLabel}
                  </p>
                  <button className="iconbtn" aria-label="Next day" onClick={v.tour.next}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M9 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
              {v.tour.closed ? (<>
                <div className="panel" style={{ padding: "40px", textAlign: "center" }}>
                  <p className="ttl" style={{ margin: "0", fontSize: "24px", color: "#FFFFFF" }}>
                    {"Closed on Fridays"}
                  </p>
                </div>
              </>) : null}
              {v.tour.open ? (<>
                <div className="grid2" style={{ marginTop: "0" }}>
                  <div className="panel" style={{ padding: "22px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                      <p className="lbl">
                        {"15-minute slots · 3:00 – 11:00 PM"}
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-ghost" onClick={v.tour.openAll} style={{ minHeight: "36px", fontSize: "13px" }}>
                          {"Open all"}
                        </button>
                        <button className="btn-ghost" onClick={v.tour.blockAll} style={{ minHeight: "36px", fontSize: "13px" }}>
                          {"Block all"}
                        </button>
                      </div>
                    </div>
                    <div className="tslots">
                      {(v.tour.slots || []).map((s, s_i55) => (<Fragment key={s_i55}>
                        <button className={s.cls} onClick={s.toggle} disabled={s.booked} aria-label={s.aria}>
                          {s.label}
                          <small>
                            {s.state}
                          </small>
                        </button>
                      </Fragment>))}
                    </div>
                    <p style={{ margin: "14px 0 0", fontSize: "13px", color: "#8C8172" }}>
                      {v.tour.summary}
                    </p>
                  </div>
                  <div className="panel" style={{ padding: "22px" }}>
                    <p className="lbl">
                      {"Tours booked this day"}
                    </p>
                    <div className="list" style={{ marginTop: "8px" }}>
                      {(v.tour.booked || []).map((b, b_i56) => (<Fragment key={b_i56}>
                        <div className="li">
                          <span className="time">
                            {b.time}
                          </span>
                          <span style={{ flex: "1" }}>
                            <span style={{ display: "block", fontSize: "14px", color: "#FFFFFF" }}>
                              {b.name}
                            </span>
                            <span className="muted">
                              {b.phone}
                            </span>
                          </span>
                          <button className="btn-ghost" onClick={b.call} style={{ minHeight: "34px", fontSize: "13px" }}>
                            {"Call"}
                          </button>
                        </div>
                      </Fragment>))}
                      {v.tour.none ? (<>
                        <p style={{ margin: "18px 0 4px", fontSize: "14px", color: "#8C8172" }}>
                          {"No tours booked yet for this day."}
                        </p>
                      </>) : null}
                    </div>
                  </div>
                </div>
              </>) : null}
            </>) : null}
            {v.is.team ? (<>
              <div className="ph">
                <div>
                  <p className="lbl">
                    {"Team & access"}
                  </p>
                  <h1 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                    {"Who can sign in"}
                  </h1>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {"Only people on this list can open the admin. Only the owner can change it."}
                  </p>
                </div>
              </div>
              <div className="grid2" style={{ marginTop: "0" }}>
                <div className="panel" style={{ padding: "8px 22px" }}>
                  {(v.teamRows || []).map((m, m_i57) => (<Fragment key={m_i57}>
                    <div className="li" style={{ flexWrap: "wrap" }}>
                      <span style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#2A241C", color: "#E2B872", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "600", fontSize: "14px", flexShrink: "0" }} aria-hidden="true">
                        {m.initials}
                      </span>
                      <span style={{ flex: "1", minWidth: "160px" }}>
                        <span style={{ display: "block", fontSize: "14px", color: "#FFFFFF" }}>
                          {m.name}
                          <span className="muted">
                            {m.youTag}
                          </span>
                        </span>
                        <span className="muted">
                          {m.email}{" · "}
                          <span className={m.stCls}>
                            {m.status}
                          </span>
                        </span>
                      </span>
                      {m.editable ? (<>
                        <select className="inp" style={{ width: "auto", minHeight: "40px", padding: "8px 12px", fontSize: "13px" }} value={m.role} onChange={m.setRole} aria-label={m.roleAria}>
                          <option value="Manager">
                            {"Manager"}
                          </option>
                          <option value="Front desk">
                            {"Front desk"}
                          </option>
                        </select>
                        <button className="btn-ghost" onClick={m.toggle} style={{ minHeight: "40px", fontSize: "13px" }}>
                          {m.toggleLabel}
                        </button>
                        <button className="btn-danger" onClick={m.remove} style={{ minHeight: "40px", fontSize: "13px" }}>
                          {"Remove"}
                        </button>
                      </>) : null}
                      {m.locked ? (<>
                        <span className="pill p-in">
                          {"Owner"}
                        </span>
                      </>) : null}
                    </div>
                  </Fragment>))}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div className="panel" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <p className="lbl">
                      {"Invite someone"}
                    </p>
                    <div className="field">
                      <label htmlFor="i-email">
                        {"Email"}
                      </label>
                      <input id="i-email" className="inp" type="email" value={v.invite.email} onChange={v.onInvEmail} placeholder="name@nilepods.com" />
                    </div>
                    <div className="field">
                      <label htmlFor="i-role">
                        {"Role"}
                      </label>
                      <select id="i-role" className="inp" value={v.invite.role} onChange={v.onInvRole}>
                        <option value="Manager">
                          {"Manager"}
                        </option>
                        <option value="Front desk">
                          {"Front desk"}
                        </option>
                      </select>
                    </div>
                    <button className="btn-gold" disabled={v.invite.blocked} onClick={v.sendInvite}>
                      {"Send invite"}
                    </button>
                    <p style={{ margin: "0", fontSize: "12.5px", color: "#8C8172", lineHeight: "1.6" }}>
                      {"Then ask them to open this admin page and sign in with that email. They get a sign-in link by email, no password. Until their first sign-in they show as Invited."}
                    </p>
                  </div>
                  <div className="panel" style={{ padding: "22px" }}>
                    <p className="lbl">
                      {"What each role can see"}
                    </p>
                    <div className="row">
                      <span className="k">
                        {"Owner"}
                      </span>
                      <span className="v">
                        {"Everything, including team & access"}
                      </span>
                    </div>
                    <div className="row">
                      <span className="k">
                        {"Manager"}
                      </span>
                      <span className="v">
                        {"Everything except team & access"}
                      </span>
                    </div>
                    <div className="row" style={{ borderBottom: "0" }}>
                      <span className="k">
                        {"Front desk"}
                      </span>
                      <span className="v">
                        {"Schedule, bookings and tours — no money totals"}
                      </span>
                    </div>
                  </div>
                  <div className="panel" style={{ padding: "22px" }}>
                    <p className="lbl">
                      {"Recent sign-ins"}
                    </p>
                    {v.noLogins ? (<>
                      <p className="muted" style={{ margin: "0" }}>
                        {"No sign-ins yet."}
                      </p>
                    </>) : null}
                    {(v.logins || []).map((lg, lg_i58) => (<Fragment key={lg_i58}>
                      <div className="row">
                        <span className="k">
                          {lg.who}
                          <span className="muted">
                            {" · "}{lg.kind}
                          </span>
                        </span>
                        <span className="v">
                          {lg.when}
                        </span>
                      </div>
                    </Fragment>))}
                  </div>
                  {v.canClearTest ? (<>
                    <div className="panel" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <p className="lbl">
                        {"Test data"}
                      </p>
                      <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B", lineHeight: "1.6" }}>
                        {v.testNote}
                      </p>
                      <button className="btn-danger" disabled={v.testBusy} onClick={v.clearTest}>
                        {v.clearTestLabel}
                      </button>
                    </div>
                  </>) : null}
                </div>
              </div>
            </>) : null}
          </main>
        </div>
        {v.hasSel ? (<>
          <div className="scrim" onClick={v.closeSel} />
          <aside className="drawer" role="dialog" aria-label="Booking details">
            <div style={{ padding: "22px 24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", borderBottom: "1px solid rgba(241,234,223,0.08)" }}>
              <div>
                <p className="lbl">
                  {"Booking "}{v.sel.id}
                </p>
                <h2 className="ttl" style={{ margin: "6px 0 0", fontSize: "26px", color: "#FFFFFF" }}>
                  {v.sel.customer}
                </h2>
                <p style={{ margin: "6px 0 0" }}>
                  <span className={v.sel.pillCls}>
                    {v.sel.status}
                  </span>
                </p>
              </div>
              <button className="iconbtn" aria-label="Close" onClick={v.closeSel}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: "8px 24px 24px" }}>
              <div className="row">
                <span className="k">
                  {"When"}
                </span>
                <span className="v">
                  {v.sel.dateLong}
                  <br />
                  {v.sel.time}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"Setup"}
                </span>
                <span className="v">
                  {v.sel.setup}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"Service"}
                </span>
                <span className="v">
                  {v.sel.service}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"People on camera"}
                </span>
                <span className="v">
                  {v.sel.people}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"Extras"}
                </span>
                <span className="v">
                  {v.sel.extras}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"Phone"}
                </span>
                <span className="v">
                  {v.sel.phone}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"Email"}
                </span>
                <span className="v">
                  {v.sel.email}
                </span>
              </div>
              <div className="row">
                <span className="k">
                  {"Payment"}
                </span>
                <span className="v">
                  <span className={v.sel.payCls}>
                    {v.sel.payLabel}
                  </span>
                  {" · "}{v.sel.methodLabel}
                </span>
              </div>
              <div className="row" style={{ borderBottom: "0" }}>
                <span className="k">
                  {"Amount"}
                </span>
                <span className="v ttl" style={{ fontSize: "22px", fontWeight: "700" }}>
                  {v.sel.amountLabel}
                </span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "18px" }}>
                {v.sel.canPay ? (<>
                  <button className="btn-gold" onClick={v.act.pay}>
                    {"Mark as paid · "}{v.sel.amountLabel}
                  </button>
                </>) : null}
                {v.sel.canCheckIn ? (<>
                  <button className="btn-gold" onClick={v.act.checkIn}>
                    {"Check in"}
                  </button>
                </>) : null}
                {v.sel.canComplete ? (<>
                  <button className="btn-gold" onClick={v.act.complete}>
                    {"Mark as completed"}
                  </button>
                </>) : null}
                {v.sel.canNoShow ? (<>
                  <button className="btn-ghost" onClick={v.act.noShow}>
                    {"Mark as no-show"}
                  </button>
                </>) : null}
                {v.sel.canMove ? (<>
                  <button className="btn-ghost" onClick={v.act.reschedule}>
                    {v.mv.label}
                  </button>
                </>) : null}
                {v.mv.open ? (<>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px", border: "1px solid rgba(241,234,223,0.12)", borderRadius: "14px" }}>
                    <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                      {"Same setup and length. The customer and the team get an email with the new time."}
                    </p>
                    <div className="field">
                      <label htmlFor="mv-date">
                        {"New date"}
                      </label>
                      <input id="mv-date" className="inp" type="date" value={v.mv.date} onChange={v.mv.onDate} />
                    </div>
                    <div className="field">
                      <label htmlFor="mv-hour">
                        {"Start time"}
                      </label>
                      <select id="mv-hour" className="inp" value={v.mv.hour} onChange={v.mv.onHour}>
                        {(v.mv.hours || []).map((h, h_i59) => (<Fragment key={h_i59}>
                          <option value={h.v}>
                            {h.label}
                          </option>
                        </Fragment>))}
                      </select>
                    </div>
                    <button className="btn-gold" disabled={v.mv.blocked} onClick={v.mv.go}>
                      {v.mv.btn}
                    </button>
                  </div>
                </>) : null}
                <button className="btn-ghost" onClick={v.act.message}>
                  {"Message on WhatsApp"}
                </button>
                {v.sel.canChange ? (<>
                  <button className="btn-danger" onClick={v.act.cancel}>
                    {"Cancel booking"}
                  </button>
                </>) : null}
              </div>
              <p style={{ margin: "18px 0 0", fontSize: "12px", color: "#7D7365" }}>
                {"Booked "}{v.sel.created}
              </p>
            </div>
          </aside>
        </>) : null}
        {v.hasToast ? (<>
          <div className="toast" role="status">
            {v.toast}
          </div>
        </>) : null}
      </>) : null}
    </div>
  );
}
