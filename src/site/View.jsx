// Generated from design/Main.dc.html by tools/convert-design.mjs - edit the design or the converter, not this file.
import { Fragment } from 'react';

export default function View(v) {
  return (
    <div className="np-root" ref={v.setRoot}>
      <header className="hdr">
        <div className="wrap" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", paddingTop: "12px", paddingBottom: "12px" }}>
          <button aria-label="Nilepods home" onClick={v.nav.home} className="ttl" style={{ display: "flex", alignItems: "center", fontWeight: "600", letterSpacing: "-0.5px", lineHeight: "1", color: "#FFFFFF", minHeight: "44px" }}>
            <img src="/images/nilepods-logo.svg" alt="Nilepods" draggable="false" style={{ height: "36px", width: "auto", display: "block" }} />
          </button>
          <nav aria-label="Main" className="desk" style={{ display: "flex", flexWrap: "wrap", gap: "6px 26px" }}>
            {(v.navItems || []).map((n, n_i0) => (<Fragment key={n_i0}>
              <button className={n.cls} onClick={n.go}>
                {n.label}
              </button>
            </Fragment>))}
          </nav>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button className="desk navlink" onClick={v.toastArabic} style={{ padding: "8px 4px" }}>
              {"عربي"}
            </button>
            {v.signedOut ? (<>
              <button className="iconbtn desk" aria-label="My account" onClick={v.nav.account}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                </svg>
              </button>
            </>) : null}
            {v.signedIn ? (<>
              <button className="iconbtn desk acct-on" aria-label={v.acctAria} title={v.acctAria} onClick={v.nav.account}>
                <span className="acct-av" aria-hidden="true">
                  {v.acctInitial}
                  <span className="acct-dot" />
                </span>
              </button>
            </>) : null}
            <button className="btn-gold desk" onClick={v.bookNow} style={{ padding: "11px 22px", minHeight: "44px", fontSize: "14px" }}>
              {"Book Session"}
            </button>
            {v.signedOut ? (<>
              <button className="iconbtn mob" aria-label="My account" onClick={v.nav.account}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6" />
                </svg>
              </button>
            </>) : null}
            {v.signedIn ? (<>
              <button className="iconbtn mob acct-on" aria-label={v.acctAria} title={v.acctAria} onClick={v.nav.account}>
                <span className="acct-av" aria-hidden="true">
                  {v.acctInitial}
                  <span className="acct-dot" />
                </span>
              </button>
            </>) : null}
            <button className="iconbtn mob" aria-label="Open menu" onClick={v.openMenu}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      {v.showBack ? (<>
        <div className="backbar">
          <div className="wrap">
            <button className="backpill" onClick={v.goBack} aria-label="Go back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
              {"Back"}
            </button>
          </div>
        </div>
      </>) : null}
      {v.menuOpen ? (<>
        <div className="mmenu" role="dialog" aria-label="Menu">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <button onClick={v.nav.home} className="ttl" style={{ display: "flex", alignItems: "center", fontWeight: "600", color: "#FFFFFF", minHeight: "44px" }}>
              <img src="/images/nilepods-logo.svg" alt="Nilepods" draggable="false" style={{ height: "34px", width: "auto", display: "block" }} />
            </button>
            <button className="iconbtn" aria-label="Close menu" onClick={v.closeMenu}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>
          {(v.navItems || []).map((n, n_i1) => (<Fragment key={n_i1}>
            <button className={n.mcls} onClick={n.go}>
              {n.label}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          </Fragment>))}
          <button className="mlink" onClick={v.nav.account}>
            {"My Account"}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <button className="mlink" onClick={v.toastArabic}>
            {"عربي"}
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
          <div style={{ flexGrow: "1", minHeight: "32px" }} />
          <button className="btn-gold btn-lg" onClick={v.bookNow} style={{ width: "100%" }}>
            {"Book Session"}
          </button>
        </div>
      </>) : null}
      {v.is.home ? (<>
        <section className="hero">
          <div className="wrap hero-in">
            <div style={{ maxWidth: "640px" }}>
              <p className="eyebrow" style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
                <span style={{ width: "32px", height: "1px", background: "#E2B872" }} />
                {"Podcast & video studios"}
              </p>
              <h1 className="ttl" style={{ margin: "0", fontWeight: "700", fontSize: "clamp(42px, 6vw, 80px)", lineHeight: "1.02", letterSpacing: "-1.5px", color: "#FFFFFF" }}>
                {"Every voice deserves the right tools"}
              </h1>
              <p style={{ margin: "24px 0 0", fontSize: "19px", lineHeight: "1.6", fontWeight: "300", color: "#E3DACB", maxWidth: "520px" }}>
                {"Book your room, pick your setup, start recording — no calls, no waiting, no hassle."}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "40px" }}>
                <button className="btn-gold btn-lg" onClick={v.bookNow}>
                  {"Book Session"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
                <button className="btn-ghost btn-lg" onClick={v.nav.packages}>
                  {"View Packages"}
                </button>
              </div>
            </div>
            <div style={{ marginTop: "64px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1px", background: "rgba(241,234,223,0.12)", border: "1px solid rgba(241,234,223,0.12)", borderRadius: "16px", overflow: "hidden" }}>
              <div style={{ background: "rgba(14,12,10,0.78)", padding: "22px 24px" }}>
                <p className="ttl" style={{ margin: "0", fontSize: "28px", fontWeight: "700", color: "#E2B872" }}>
                  {"3"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#CFC5B5" }}>
                  {"Cinema cameras per session"}
                </p>
              </div>
              <div style={{ background: "rgba(14,12,10,0.78)", padding: "22px 24px" }}>
                <p className="ttl" style={{ margin: "0", fontSize: "28px", fontWeight: "700", color: "#E2B872" }}>
                  {"2"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#CFC5B5" }}>
                  {"Shure microphones"}
                </p>
              </div>
              <div style={{ background: "rgba(14,12,10,0.78)", padding: "22px 24px" }}>
                <p className="ttl" style={{ margin: "0", fontSize: "28px", fontWeight: "700", color: "#E2B872" }}>
                  {"3–11 PM"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#CFC5B5" }}>
                  {"Open daily, except Friday"}
                </p>
              </div>
              <div style={{ background: "rgba(14,12,10,0.78)", padding: "22px 24px" }}>
                <p className="ttl" style={{ margin: "0", fontSize: "28px", fontWeight: "700", color: "#E2B872" }}>
                  {"14 days"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "14px", color: "#CFC5B5" }}>
                  {"Raw footage backup"}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section id="packages" className="sec">
          <div className="wrap">
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "20px", marginBottom: "48px" }}>
              <div>
                <p className="eyebrow">
                  {"Book by the hour"}
                </p>
                <h2 className="h2">
                  {"Want to book a studio?"}
                </h2>
              </div>
              <button className="btn-ghost" onClick={v.nav.packages}>
                {"Save up to "}{v.maxSave}{" with session packs →"}
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
              {(v.pkgs || []).map((p, p_i2) => (<Fragment key={p_i2}>
                <article className={p.cardCls}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px" }}>
                    <h3 className="ttl" style={{ margin: "0", fontSize: "24px", fontWeight: "600", color: "#FFFFFF" }}>
                      {p.name}
                    </h3>
                    {p.featured ? (<>
                      <span className="badge">
                        {p.badge}
                      </span>
                    </>) : null}
                  </div>
                  <p style={{ margin: "18px 0 0", display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span className="ttl" style={{ fontSize: "52px", fontWeight: "700", color: "#FFFFFF", lineHeight: "1" }}>
                      {p.priceLabel}
                    </span>
                    <span style={{ fontSize: "15px", color: "#BDB2A2" }}>
                      {"EGP / hour"}
                    </span>
                  </p>
                  <p style={{ margin: "14px 0 0", fontSize: "14px", lineHeight: "1.6", color: "#A89C8B" }}>
                    {p.blurb}
                  </p>
                  <div style={{ height: "1px", background: "rgba(241,234,223,0.1)", margin: "28px 0" }} />
                  <p className="lbl">
                    {"What's included"}
                  </p>
                  <ul className="chk">
                    {(p.items || []).map((li, li_i3) => (<Fragment key={li_i3}>
                      <li>
                        {li}
                      </li>
                    </Fragment>))}
                  </ul>
                  <button className={p.btnCls} onClick={p.choose} style={{ marginTop: "32px", alignSelf: "end", width: "100%" }}>
                    {"Select & Continue"}
                  </button>
                </article>
              </Fragment>))}
            </div>
            <p style={{ margin: "28px 0 0", fontSize: "13px", color: "#9A8E7D", textAlign: "center" }}>
              {"Prices are per hour of recording."}
            </p>
          </div>
        </section>
        <section className="sec" style={{ background: "#15120E", borderTop: "1px solid rgba(241,234,223,0.06)", borderBottom: "1px solid rgba(241,234,223,0.06)" }}>
          <div className="wrap">
            <p className="eyebrow" style={{ textAlign: "center" }}>
              {"How it works"}
            </p>
            <h2 className="h2" style={{ maxWidth: "720px", margin: "0 auto", textAlign: "center" }}>
              {"From booking to recording in four steps"}
            </h2>
            <div style={{ marginTop: "56px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px" }}>
              {(v.howSteps || []).map((h, h_i4) => (<Fragment key={h_i4}>
                <div className="card static" style={{ textAlign: "left", padding: "32px 28px", background: "#1C1813" }}>
                  <p className="ttl" style={{ margin: "0", fontSize: "44px", fontWeight: "700", color: "#E2B872", lineHeight: "1" }}>
                    {h.n}
                  </p>
                  <h3 className="ttl" style={{ margin: "26px 0 10px", fontSize: "22px", fontWeight: "600", color: "#FFFFFF" }}>
                    {h.t}
                  </h3>
                  <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.65", color: "#B0A595" }}>
                    {h.d}
                  </p>
                </div>
              </Fragment>))}
            </div>
          </div>
        </section>
        <section className="sets">
          <div className="wrap" style={{ textAlign: "center" }}>
            <p className="eyebrow">
              {"Set designs"}
            </p>
            <h2 className="h2">
              {"Choose the room that tells your story"}
            </h2>
            <p className="lead" style={{ margin: "16px auto 0", maxWidth: "620px" }}>
              {"Ready-made sets you can book by the hour — walk in, sit down and record. Swipe through to see each one in full."}
            </p>
          </div>
          <div className="hs-wrap">
            <div className="hs-track" ref={v.setCar} onScroll={v.onCarScroll} onPointerDown={v.dragStart} onPointerMove={v.dragMove} onPointerUp={v.dragEnd} onPointerLeave={v.dragEnd} onPointerCancel={v.dragEnd} data-gap="24">
              {(v.setupList || []).map((su, su_i5) => (<Fragment key={su_i5}>
                <div className={su.hcls}>
                  <img src={su.bg} alt="" className="hs-bg" draggable="false" aria-hidden="true" />
                  <img src={su.img} srcSet={su.srcset} sizes="100vw" alt={su.alt} className="hs-img" draggable="false" />
                  <div className="hs-shade" />
                  <div className="hs-info">
                    <div style={{ minWidth: "0" }}>
                      <p className="hs-name">
                        {su.name}
                      </p>
                      <p className="hs-meta">
                        {"Capacity "}{su.cap}
                      </p>
                    </div>
                    <button className="btn-gold hs-book" onClick={su.book}>
                      {"Book Now"}
                    </button>
                  </div>
                </div>
              </Fragment>))}
            </div>
            <button className="hs-arrow l" aria-label="Previous setup" onClick={v.carPrev}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M19 12H5M11 18l-6-6 6-6" />
              </svg>
            </button>
            <button className="hs-arrow r" aria-label="Next setup" onClick={v.carNext}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          </div>
          <div className="wrap" style={{ textAlign: "center", marginTop: "28px" }}>
            <button className="btn-ghost" onClick={v.nav.studios}>
              {"Explore all studios"}
            </button>
          </div>
        </section>
        <section style={{ paddingBottom: "110px" }}>
          <div className="wrap">
            <div className="pitch">
              <div style={{ maxWidth: "560px" }}>
                <p className="eyebrow">
                  {"Have a show in mind?"}
                </p>
                <h2 className="ttl" style={{ margin: "0", fontSize: "clamp(38px, 5vw, 64px)", lineHeight: "1.02", fontWeight: "700", color: "#FFFFFF" }}>
                  {"Pitch us your ideas!"}
                </h2>
                <p style={{ margin: "20px 0 0", fontSize: "17px", lineHeight: "1.7", color: "#DCD3C4" }}>
                  {"Only have an idea? That's enough to start. Tell us about it and we'll help shape it into a show."}
                </p>
                <button className="btn-gold btn-lg" onClick={v.nav.contact} style={{ marginTop: "36px" }}>
                  {"Contact us"}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </section>
        <section style={{ paddingBottom: "110px" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "48px" }}>
            <div style={{ flex: "1 1 300px" }}>
              <p className="eyebrow">
                {"FAQ"}
              </p>
              <h2 className="h2">
                {"Questions, answered"}
              </h2>
              <p className="lead" style={{ marginTop: "20px" }}>
                {"Can't find what you're looking for? "}
                <button className="link" onClick={v.nav.contact} style={{ fontSize: "16px" }}>
                  {"Talk to our team"}
                </button>
                {"."}
              </p>
            </div>
            <div style={{ flex: "999 1 520px", minWidth: "0", display: "flex", flexDirection: "column", gap: "12px" }}>
              {(v.faqs || []).map((f, f_i6) => (<Fragment key={f_i6}>
                <details className="card" style={{ padding: "0 24px" }}>
                  <summary style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", padding: "22px 0", fontSize: "17px", fontWeight: "500", color: "#FFFFFF" }}>
                    {f.q}
                    <svg className="plus" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#E2B872" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: "0", transition: "transform .25s ease" }}>
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </summary>
                  <p style={{ margin: "0 0 22px", fontSize: "15px", lineHeight: "1.7", color: "#BDB2A2" }}>
                    {f.a}
                  </p>
                </details>
              </Fragment>))}
            </div>
          </div>
        </section>
        <section style={{ paddingBottom: "100px" }}>
          <div className="wrap">
            <div style={{ textAlign: "center", padding: "80px 24px", borderRadius: "28px", background: "radial-gradient(ellipse at 50% 0%, rgba(226,184,114,0.18) 0%, rgba(226,184,114,0) 60%), #15120E", border: "1px solid rgba(241,234,223,0.08)" }}>
              <p className="ttl" style={{ margin: "0", display: "inline-flex", alignItems: "center", fontWeight: "600", letterSpacing: "-0.5px", lineHeight: "1", color: "#FFFFFF" }}>
                <img src="/images/nilepods-logo.svg" alt="Nilepods" draggable="false" style={{ height: "53px", width: "auto", display: "block" }} />
              </p>
              <p style={{ margin: "14px 0 0", fontSize: "14px", letterSpacing: "2px", textTransform: "uppercase", color: "#A89C8B" }}>
                {"Powered by NileStudios"}
              </p>
              <h2 className="ttl" style={{ margin: "36px auto 0", maxWidth: "620px", fontSize: "clamp(30px, 4vw, 48px)", lineHeight: "1.1", fontWeight: "700", color: "#FFFFFF" }}>
                {"See the studios before you book"}
              </h2>
              <div style={{ marginTop: "36px", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "14px" }}>
                <button className="btn-gold btn-lg" onClick={v.nav.tour}>
                  {"Book a Tour"}
                </button>
                <button className="btn-ghost btn-lg" onClick={v.bookNow}>
                  {"Book Session"}
                </button>
              </div>
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.studios ? (<>
        <section className="fs" aria-label="Our studios">
          <div className="fs-car" ref={v.setCar} onScroll={v.onCarScroll} onPointerDown={v.dragStart} onPointerMove={v.dragMove} onPointerUp={v.dragEnd} onPointerLeave={v.dragEnd} onPointerCancel={v.dragEnd} data-gap="0">
            {(v.setupList || []).map((su, su_i7) => (<Fragment key={su_i7}>
              <div className="fs-slide">
                <img src={su.bg} alt="" className="fs-bg" draggable="false" aria-hidden="true" />
                <img src={su.img} srcSet={su.srcset} sizes="100vw" alt={su.alt} className="fs-img" draggable="false" />
                <div className="fs-shade" />
                <div className="fs-top">
                  <p className="fs-n">
                    {su.n}
                  </p>
                  <p className="fs-cap">
                    {"Capacity | "}{su.cap}
                  </p>
                  <button className="fs-choose" onClick={su.book}>
                    {"Book "}{su.n}
                  </button>
                </div>
              </div>
            </Fragment>))}
          </div>
          <div className="fs-head" style={{ justifyContent: "flex-end" }}>
            <span className="fs-step">
              {"Swipe to explore"}
            </span>
          </div>
          <button className="fs-arrow l" aria-label="Previous studio" onClick={v.carPrev}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <button className="fs-arrow r" aria-label="Next studio" onClick={v.carNext}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <div className="fs-dots">
            {(v.carDots || []).map((d, d_i8) => (<Fragment key={d_i8}>
              <button className={d.cls} aria-label={d.label} onClick={d.go} />
            </Fragment>))}
          </div>
        </section>
      </>) : null}
      {v.is.cyclorama ? (<>
        <section className="page-hero">
          <div className="wrap">
            <p className="eyebrow">
              {"Cyclorama"}
            </p>
            <h1 className="h2" style={{ fontSize: "clamp(40px, 5vw, 68px)" }}>
              {"Cyclorama studio"}
            </h1>
            <p className="lead" style={{ marginTop: "18px", maxWidth: "600px", color: "#DCD3C4" }}>
              {"A seamless white cyclorama for video, podcasts on camera and photo shoots. Book it for 2 hours or more."}
            </p>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "0" }}>
          <div className="wrap">
            <div className="cyc-stage">
              <img src="/images/cyclorama.jpg" srcSet="/images/cyclorama-1200.jpg 1200w, /images/cyclorama.jpg 2400w, /images/cyclorama-3600.jpg 3600w" sizes="(max-width: 1280px) 100vw, 1200px" alt="The Nilepods cyclorama studio: a seamless white cyc under studio lights" draggable="false" />
              <p className="cyc-tag">
                <i />
                {"Our cyclorama studio"}
              </p>
            </div>
            <div className="cyc-bar">
              <div>
                <p className="lbl" style={{ marginBottom: "6px" }}>
                  {"White cyclorama"}
                </p>
                <p style={{ margin: "0", fontSize: "18px", color: "#FFFFFF" }}>
                  {"From 2 hours · open 3 to 11 PM, Saturday to Thursday"}
                </p>
              </div>
              <button className="btn-gold" onClick={v.cycBook}>
                {"Book the cyclorama"}
              </button>
            </div>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <div style={{ marginBottom: "30px" }}>
              <p className="eyebrow">
                {"Services"}
              </p>
              <h2 className="h2">
                {"What you can book"}
              </h2>
              <p className="lead" style={{ marginTop: "12px", maxWidth: "620px" }}>
                {"Recording services come with an operator, 3 cameras and 2 microphones. The photo shoot is the space and the lighting, for your own crew. Prices are per hour, with a 2-hour minimum."}
              </p>
            </div>
            <div className="cyc-svcs">
              {(v.cycSvcs || []).map((p, p_i9) => (<Fragment key={p_i9}>
                <div className="card static cyc-svc">
                  <p className="ttl" style={{ margin: "0", fontSize: "21px", fontWeight: "600", color: "#FFFFFF" }}>
                    {p.name}
                  </p>
                  <p style={{ margin: "0" }}>
                    <span className="ttl" style={{ fontSize: "30px", fontWeight: "700", color: "#E2B872" }}>
                      {p.priceLabel}
                    </span>
                    <span style={{ fontSize: "13px", color: "#A89C8B" }}>
                      {" EGP / hour"}
                    </span>
                  </p>
                  <p style={{ margin: "0", fontSize: "13px", color: "#8C8172" }}>
                    {p.minLabel}
                  </p>
                  <div className="cyc-svc-list">
                    {(p.items || []).map((li, li_i10) => (<Fragment key={li_i10}>
                      <span>
                        {li}
                      </span>
                    </Fragment>))}
                  </div>
                  <button className="btn-ghost" onClick={p.book}>
                    {"Book "}{p.name}
                  </button>
                </div>
              </Fragment>))}
            </div>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <div style={{ textAlign: "center", marginBottom: "34px" }}>
              <p className="eyebrow">
                {"How it works"}
              </p>
              <h2 className="h2">
                {"Booking the cyclorama"}
              </h2>
            </div>
            <div className="cyc-steps">
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"01"}
                </p>
                <h3>
                  {"Choose a service"}
                </h3>
                <p>
                  {"Record with our crew and cameras, or book a photo shoot with just the space and lighting."}
                </p>
              </div>
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"02"}
                </p>
                <h3>
                  {"Choose your time"}
                </h3>
                <p>
                  {"Pick a date and start time. Bookings are 2 hours minimum; add more hours if you need them."}
                </p>
              </div>
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"03"}
                </p>
                <h3>
                  {"Your details"}
                </h3>
                <p>
                  {"Tell us who is coming, then pay online or at the studio."}
                </p>
              </div>
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"04"}
                </p>
                <h3>
                  {"Shoot"}
                </h3>
                <p>
                  {"The cyc is lit and ready when you arrive."}
                </p>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", marginTop: "40px" }}>
              <button className="btn-gold" onClick={v.cycBook}>
                {"Book the cyclorama"}
              </button>
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.audio ? (<>
        <section className="page-hero ph-mics">
          <div className="wrap">
            <p className="eyebrow">
              {"Audio"}
            </p>
            <h1 className="h2" style={{ fontSize: "clamp(40px, 5vw, 68px)" }}>
              {"Audio recording"}
            </h1>
            <p className="lead" style={{ marginTop: "18px", maxWidth: "560px", color: "#DCD3C4" }}>
              {"Shure microphones and a professional mixer, for audio-first shows."}
            </p>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "40px" }}>
          <div className="wrap" style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            <div className="ph">
              {"[AUDIO-ONLY PACKAGES — what's included and the price go here.]"}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
              <button className="btn-gold" onClick={v.bookNow}>
                {"Book Session"}
              </button>
              <button className="btn-ghost" onClick={v.nav.contact}>
                {"Ask a question"}
              </button>
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.auditions ? (<>
        <section className="page-hero ph-shelves">
          <div className="wrap">
            <p className="eyebrow">
              {"Auditions"}
            </p>
            <h1 className="h2" style={{ fontSize: "clamp(40px, 5vw, 68px)" }}>
              {"Your first episode, on us"}
            </h1>
            <p className="lead" style={{ marginTop: "18px", maxWidth: "640px", color: "#DCD3C4" }}>
              {"Got a podcast idea but not the budget to rent a studio yet? Apply for a free pilot. If we pick your show, you record one episode with three hosts in our studio, and we publish it on the Nilepods YouTube channel."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px", marginTop: "28px" }}>
              <button className="btn-gold" onClick={v.aud.toForm}>
                {"Apply for a free pilot"}
              </button>
              <button className="btn-ghost" onClick={v.aud.toRules}>
                {"Read the rules"}
              </button>
            </div>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <div style={{ marginBottom: "30px" }}>
              <p className="eyebrow">
                {"How it works"}
              </p>
              <h2 className="h2">
                {"From idea to episode"}
              </h2>
            </div>
            <div className="aud-steps">
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"01"}
                </p>
                <h3>
                  {"Apply"}
                </h3>
                <p>
                  {"Tell us about your show and your three hosts, and agree to the pilot rules."}
                </p>
              </div>
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"02"}
                </p>
                <h3>
                  {"We review"}
                </h3>
                <p>
                  {"Our team reads every application and gets in touch with the shows we like."}
                </p>
              </div>
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"03"}
                </p>
                <h3>
                  {"Pilot day"}
                </h3>
                <p>
                  {"Accepted shows record on our pilot day: "}{v.aud.slot}{"."}
                </p>
              </div>
              <div className="card static cyc-step">
                <p className="ttl cyc-n">
                  {"04"}
                </p>
                <h3>
                  {"Goes live"}
                </h3>
                <p>
                  {"We edit and publish your episode on the Nilepods YouTube channel."}
                </p>
              </div>
            </div>
          </div>
        </section>
        <section className="sec" id="aud-rules" style={{ paddingTop: "20px" }}>
          <div className="wrap">
            <div style={{ marginBottom: "30px" }}>
              <p className="eyebrow">
                {"The rules"}
              </p>
              <h2 className="h2">
                {"Before you apply"}
              </h2>
              <p className="lead" style={{ marginTop: "12px", maxWidth: "640px" }}>
                {"The pilot is free because the episode belongs to the Nilepods channel. Please read these carefully: you agree to all of them when you apply."}
              </p>
            </div>
            <div className="aud-rules">
              {(v.aud.rules || []).map((r, r_i11) => (<Fragment key={r_i11}>
                <div className="card static aud-rule">
                  <b>
                    {r.n}
                  </b>
                  <div>
                    <h3>
                      {r.t}
                    </h3>
                    <p>
                      {r.d}
                    </p>
                  </div>
                </div>
              </Fragment>))}
            </div>
          </div>
        </section>
        <section className="sec" id="aud-form" style={{ paddingTop: "20px" }}>
          <div className="wrap" style={{ maxWidth: "860px" }}>
            <div className="card mpad" style={{ padding: "36px" }}>
              {v.aud.sent ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" }}>
                  <p className="eyebrow" style={{ margin: "0" }}>
                    {"Application sent"}
                  </p>
                  <h2 className="ttl" style={{ margin: "0", fontSize: "30px", color: "#FFFFFF" }}>
                    {"Thanks, we have your pitch"}
                  </h2>
                  <p className="lead">
                    {"Our team reviews applications every week. If your show is picked, we'll call or email you to plan your pilot day."}
                  </p>
                  <button className="btn-ghost" onClick={v.nav.home}>
                    {"Back to home"}
                  </button>
                </div>
              </>) : null}
              {v.aud.form ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div>
                    <p className="eyebrow" style={{ margin: "0 0 6px" }}>
                      {"Apply"}
                    </p>
                    <h2 className="ttl" style={{ margin: "0", fontSize: "30px", color: "#FFFFFF" }}>
                      {"Pitch your show"}
                    </h2>
                  </div>
                  <div className="field">
                    <label htmlFor="a-show">
                      {"Show name"}
                    </label>
                    <input id="a-show" className="inp" value={v.af.show} onChange={v.onA.show} placeholder="What's your podcast called?" />
                  </div>
                  <div className="field">
                    <label htmlFor="a-idea">
                      {"The idea"}
                    </label>
                    <textarea id="a-idea" className="inp" value={v.af.idea} onChange={v.onA.idea} placeholder="What is the show about, and what would the first episode cover?" />
                  </div>
                  <div className="field">
                    <label htmlFor="a-aud">
                      {"Who is it for? (optional)"}
                    </label>
                    <input id="a-aud" className="inp" value={v.af.audience} onChange={v.onA.audience} placeholder="Your audience" />
                  </div>
                  <div className="field">
                    <label>
                      {"The three hosts"}
                    </label>
                    <div className="aud-hosts">
                      <input className="inp" aria-label="Host 1" value={v.af.h1} onChange={v.onA.h1} placeholder="Host 1" />
                      <input className="inp" aria-label="Host 2" value={v.af.h2} onChange={v.onA.h2} placeholder="Host 2" />
                      <input className="inp" aria-label="Host 3" value={v.af.h3} onChange={v.onA.h3} placeholder="Host 3" />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                    <div className="field">
                      <label htmlFor="a-name">
                        {"Your name"}
                      </label>
                      <input id="a-name" className="inp" value={v.af.name} onChange={v.onA.name} placeholder="Main contact" />
                    </div>
                    <div className="field">
                      <label htmlFor="a-phone">
                        {"Phone"}
                      </label>
                      <input id="a-phone" className="inp" type="tel" value={v.af.phone} onChange={v.onA.phone} placeholder="01x xxxx xxxx" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="a-email">
                      {"Email"}
                    </label>
                    <input id="a-email" className="inp" type="email" value={v.af.email} onChange={v.onA.email} placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label htmlFor="a-links">
                      {"Links (optional)"}
                    </label>
                    <input id="a-links" className="inp" value={v.af.links} onChange={v.onA.links} placeholder="Instagram, TikTok, a sample clip..." />
                  </div>
                  <label className="chkbox">
                    <input type="checkbox" checked={v.af.agreed} onChange={v.aud.toggleAgree} />
                    <span>
                      {"I have read the pilot rules and agree to them on behalf of all three hosts."}
                    </span>
                  </label>
                  {v.aud.hasErr ? (<>
                    <p className="aud-err">
                      {v.aud.err}
                    </p>
                  </>) : null}
                  <button className="btn-gold btn-lg" disabled={v.aud.blocked} onClick={v.aud.send} style={{ alignSelf: "flex-start" }}>
                    {v.aud.sendLabel}
                  </button>
                </div>
              </>) : null}
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.contact ? (<>
        <section className="page-hero ph-window">
          <div className="wrap">
            <p className="eyebrow">
              {"Contact us"}
            </p>
            <h1 className="h2" style={{ fontSize: "clamp(40px, 5vw, 68px)" }}>
              {"Let's talk about your show"}
            </h1>
            <p className="lead" style={{ marginTop: "18px", maxWidth: "560px", color: "#DCD3C4" }}>
              {"Pitch an idea, ask about a package or plan a custom set."}
            </p>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "40px" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "24px" }}>
            <div className="card mpad" style={{ flex: "999 1 520px", minWidth: "0", padding: "36px" }}>
              {v.contactSent ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" }}>
                  <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#E2B872", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#17120B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12l5 5 9-10" />
                    </svg>
                  </div>
                  <h2 className="ttl" style={{ margin: "0", fontSize: "30px", color: "#FFFFFF" }}>
                    {"Message sent"}
                  </h2>
                  <p className="lead">
                    {"Thanks, "}{v.cf.name}{". The team will get back to you soon."}
                  </p>
                  <button className="btn-ghost" onClick={v.nav.home}>
                    {"Back to home"}
                  </button>
                </div>
              </>) : null}
              {v.contactForm ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                    <div className="field">
                      <label htmlFor="c-name">
                        {"Full name"}
                      </label>
                      <input id="c-name" className="inp" value={v.cf.name} onChange={v.onC.name} placeholder="Your name" />
                    </div>
                    <div className="field">
                      <label htmlFor="c-phone">
                        {"Phone"}
                      </label>
                      <input id="c-phone" className="inp" type="tel" value={v.cf.phone} onChange={v.onC.phone} placeholder="01x xxxx xxxx" />
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="c-email">
                      {"Email"}
                    </label>
                    <input id="c-email" className="inp" type="email" value={v.cf.email} onChange={v.onC.email} placeholder="you@example.com" />
                  </div>
                  <div className="field">
                    <label htmlFor="c-msg">
                      {"Message"}
                    </label>
                    <textarea id="c-msg" className="inp" value={v.cf.msg} onChange={v.onC.msg} placeholder="Tell us about your idea or question" />
                  </div>
                  <button className="btn-gold btn-lg" disabled={v.contactBlocked} onClick={v.sendContact} style={{ alignSelf: "flex-start" }}>
                    {"Send message"}
                  </button>
                </div>
              </>) : null}
            </div>
            <div className="card" style={{ flex: "1 1 280px", padding: "32px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <p className="lbl" style={{ margin: "0" }}>
                {"Reach us"}
              </p>
              <div>
                <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                  {"Phone"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "16px", color: "#FFFFFF" }}>
                  {"[PHONE NUMBER]"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                  {"Email"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "16px", color: "#FFFFFF" }}>
                  {"[EMAIL]"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                  {"Address"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "16px", color: "#FFFFFF" }}>
                  {"[STUDIO ADDRESS]"}
                </p>
              </div>
              <div>
                <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                  {"Opening hours"}
                </p>
                <p style={{ margin: "4px 0 0", fontSize: "16px", color: "#FFFFFF" }}>
                  {"Saturday–Thursday, 3 PM – 11 PM"}
                </p>
                <p style={{ margin: "2px 0 0", fontSize: "14px", color: "#C98A7A" }}>
                  {"Closed on Fridays"}
                </p>
              </div>
              <button className="btn-ghost" onClick={v.nav.tour} style={{ marginTop: "auto" }}>
                {"Book a Tour"}
              </button>
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.tour ? (<>
        <section className="page-hero ph-studios">
          <div className="wrap">
            <p className="eyebrow">
              {"Book a tour"}
            </p>
            <h1 className="h2" style={{ fontSize: "clamp(40px, 5vw, 68px)" }}>
              {"See the studios in person"}
            </h1>
            <p className="lead" style={{ marginTop: "18px", maxWidth: "560px", color: "#DCD3C4" }}>
              {"Pick a day and a 15-minute slot. Come by, sit at the table, try the mics — free of charge."}
            </p>
          </div>
        </section>
        <section className="sec" style={{ paddingTop: "40px" }}>
          <div className="wrap" style={{ maxWidth: "920px" }}>
            {v.tourSent ? (<>
              <div className="wz mpad" style={{ padding: "40px", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px" }}>
                <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#E2B872", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#17120B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12l5 5 9-10" />
                  </svg>
                </div>
                <h2 className="ttl" style={{ margin: "6px 0 0", fontSize: "32px", color: "#FFFFFF" }}>
                  {"Your tour is booked"}
                </h2>
                <p className="ttl" style={{ margin: "0", fontSize: "22px", fontWeight: "600", color: "#E2B872" }}>
                  {v.tour.when}
                </p>
                <p className="lead" style={{ fontSize: "15px" }}>
                  {"See you then, "}{v.tf.name}{". We've sent the details to "}{v.tf.phone}{"."}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "10px" }}>
                  <button className="btn-gold" onClick={v.addCal}>
                    {"Add to calendar"}
                  </button>
                  <button className="btn-ghost" onClick={v.nav.home}>
                    {"Back to home"}
                  </button>
                </div>
              </div>
            </>) : null}
            {v.tourForm ? (<>
              <div className="wz">
                <div className="wz-b" style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                      <p className="ttl" style={{ margin: "0", fontSize: "22px", fontWeight: "600", color: "#FFFFFF" }}>
                        {v.tcal.title}
                      </p>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="back-c" aria-label="Previous month" onClick={v.tcal.prev} disabled={v.tcal.noPrev}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M15 6l-6 6 6 6" />
                          </svg>
                        </button>
                        <button className="back-c" aria-label="Next month" onClick={v.tcal.next} disabled={v.tcal.noNext}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M9 6l6 6-6 6" />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <div className="cal-h">
                      <span>
                        {"Sat"}
                      </span>
                      <span>
                        {"Sun"}
                      </span>
                      <span>
                        {"Mon"}
                      </span>
                      <span>
                        {"Tue"}
                      </span>
                      <span>
                        {"Wed"}
                      </span>
                      <span>
                        {"Thu"}
                      </span>
                      <span>
                        {"Fri"}
                      </span>
                    </div>
                    <div className="cal">
                      {(v.tcal.cells || []).map((c, c_i12) => (<Fragment key={c_i12}>
                        <button className={c.cls} onClick={c.pick} disabled={c.dis} aria-label={c.aria}>
                          {c.label}
                        </button>
                      </Fragment>))}
                    </div>
                    <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#8C8172" }}>
                      {"Tours run Saturday–Thursday, 3 PM – 11 PM. Closed on Fridays."}
                    </p>
                  </div>
                  {v.tour.hasDate ? (<>
                    <div>
                      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", marginBottom: "14px" }}>
                        <div>
                          <p style={{ margin: "0", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#E2B872" }}>
                            {v.tour.dateLong}
                          </p>
                          <p style={{ margin: "6px 0 0", fontSize: "15px", color: "#DCD3C4" }}>
                            {"Choose a 15-minute slot"}
                          </p>
                        </div>
                        <p style={{ margin: "0", fontSize: "13px", color: "#8C8172" }}>
                          {v.tour.freeLabel}
                        </p>
                      </div>
                      <div className="tslots" role="list">
                        {(v.tour.slots || []).map((t, t_i13) => (<Fragment key={t_i13}>
                          <button className={t.cls} onClick={t.pick} disabled={t.disabled} aria-pressed={t.on} aria-label={t.aria}>
                            {t.label}
                          </button>
                        </Fragment>))}
                      </div>
                    </div>
                  </>) : null}
                  {v.tour.noDate ? (<>
                    <div className="ph" style={{ padding: "20px 24px" }}>
                      {"Pick a day to see the free 15-minute slots."}
                    </div>
                  </>) : null}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                    <div className="field">
                      <label htmlFor="t-name">
                        {"Full name"}
                      </label>
                      <input id="t-name" className="inp" value={v.tf.name} onChange={v.onT.name} autoComplete="name" placeholder="Your name" />
                    </div>
                    <div className="field">
                      <label htmlFor="t-phone">
                        {"Phone"}
                      </label>
                      <input id="t-phone" className="inp" type="tel" inputMode="tel" value={v.tf.phone} onChange={v.onT.phone} autoComplete="tel" placeholder="+20 1x xxxx xxxx" />
                    </div>
                  </div>
                </div>
                <div className="wz-f">
                  <p style={{ margin: "0", fontSize: "14px", color: "#DCD3C4" }}>
                    {v.tour.summary}
                  </p>
                  <button className="btn-gold" disabled={v.tourBlocked} onClick={v.sendTour} style={{ minWidth: "180px" }}>
                    {"Book tour"}
                  </button>
                </div>
              </div>
            </>) : null}
          </div>
        </section>
      </>) : null}
      {v.is.account ? (<>
        <section className="sec" style={{ paddingTop: "72px" }}>
          <div className="wrap" style={{ maxWidth: "900px" }}>
            {v.signedOut ? (<>
              <div className="card mpad" style={{ maxWidth: "480px", margin: "0 auto", padding: "40px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <p className="eyebrow" style={{ margin: "0" }}>
                  {"My account"}
                </p>
                <h1 className="ttl" style={{ margin: "0", fontSize: "34px", color: "#FFFFFF" }}>
                  {"Sign in"}
                </h1>
                <p className="lead" style={{ fontSize: "15px" }}>
                  {"See your bookings, packages and sessions left."}
                </p>
                <div className="field">
                  <label htmlFor="a-email">
                    {"Email"}
                  </label>
                  <input id="a-email" className="inp" type="email" value={v.acctEmail} onChange={v.onAcct} autoComplete="email" placeholder="you@example.com" />
                </div>
                <div className="field">
                  <label htmlFor="a-pass">
                    {"Password"}
                  </label>
                  <input id="a-pass" className="inp" type="password" value={v.acctPw} onChange={v.onAcctPw} autoComplete="current-password" placeholder="Your password" />
                </div>
                <button className="btn-gold btn-lg" disabled={v.signinBlocked} onClick={v.signIn}>
                  {v.signInLabel}
                </button>
                {v.hasSignInNote ? (<>
                  <p role="status" style={{ margin: "0", fontSize: "14px", color: "#E2B872", textAlign: "center", lineHeight: "1.6" }}>
                    {v.signInNote}
                  </p>
                </>) : null}
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "10px" }}>
                  <button className="link" onClick={v.forgotPw}>
                    {"Forgot password?"}
                  </button>
                  <button className="link" onClick={v.emailLink}>
                    {"Email me a sign-in link instead"}
                  </button>
                </div>
                <p style={{ margin: "0", fontSize: "14px", color: "#A89C8B", textAlign: "center" }}>
                  {"New here? You create your account with a password when you book. "}
                  <button className="link" onClick={v.bookNow}>
                    {"Book a session"}
                  </button>
                </p>
              </div>
            </>) : null}
            {v.signedIn ? (<>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", marginBottom: "32px" }}>
                <div>
                  <p className="eyebrow">
                    {"My account"}
                  </p>
                  <h1 className="h2">
                    {"My bookings"}
                  </h1>
                  <p style={{ margin: "10px 0 0", fontSize: "14px", color: "#A89C8B" }}>
                    {"Signed in as "}{v.acctEmail}
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  <button className="btn-gold" onClick={v.bookNow}>
                    {"New booking"}
                  </button>
                  <button className="btn-ghost" onClick={v.togglePwPanel}>
                    {v.pwPanelLabel}
                  </button>
                  <button className="btn-ghost" onClick={v.signOut}>
                    {"Sign out"}
                  </button>
                </div>
              </div>
              {v.showPwPanel ? (<>
                <div className="card mpad" style={{ padding: "28px 32px", marginBottom: "32px", display: "flex", flexDirection: "column", gap: "14px", maxWidth: "520px" }}>
                  <p className="lbl" style={{ margin: "0" }}>
                    {v.pwPanelTitle}
                  </p>
                  <div className="field">
                    <label htmlFor="a-newpw">
                      {"New password"}
                    </label>
                    <input id="a-newpw" className="inp" type="password" value={v.newPw} onChange={v.onNewPw} autoComplete="new-password" placeholder="At least 8 characters" />
                  </div>
                  <button className="btn-gold" disabled={v.newPwBlocked} onClick={v.saveNewPw} style={{ alignSelf: "flex-start" }}>
                    {"Save password"}
                  </button>
                </div>
              </>) : null}
              {v.hasCredits ? (<>
                <p className="lbl">
                  {"My packages"}
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px", marginBottom: "36px" }}>
                  {(v.creditList || []).map((c, c_i14) => (<Fragment key={c_i14}>
                    <div className="wz" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "10px" }}>
                      <p className="ttl" style={{ margin: "0", fontSize: "22px", fontWeight: "600", color: "#FFFFFF" }}>
                        {c.title}
                      </p>
                      <p style={{ margin: "0", fontSize: "15px", color: "#E2B872" }}>
                        {c.left}
                      </p>
                      <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                        {c.expires}
                      </p>
                      {c.canBook ? (<>
                        <button className="btn-gold" onClick={c.book} style={{ marginTop: "6px", alignSelf: "flex-start" }}>
                          {"Book a session"}
                        </button>
                      </>) : null}
                    </div>
                  </Fragment>))}
                </div>
              </>) : null}
              {v.hasBookings ? (<>
                <div style={{ display: "flex", flexDirection: "column", gap: "20px", marginBottom: "20px" }}>
                  <p className="lbl" style={{ margin: "0" }}>
                    {"My sessions"}
                  </p>
                  <div className="sseg" role="tablist" aria-label="Sessions">
                    {(v.sessTabs || []).map((t, t_i15) => (<Fragment key={t_i15}>
                      <button className={t.cls} role="tab" aria-selected={t.on} onClick={t.go}>
                        {t.name}
                        <span className="sseg-n">
                          {t.count}
                        </span>
                      </button>
                    </Fragment>))}
                  </div>
                  {v.hasSessSvcs ? (<>
                    <div className="sfilt" role="group" aria-label="Filter by service">
                      <span className="sfilt-k">
                        {"Service"}
                      </span>
                      {(v.sessSvcs || []).map((f, f_i16) => (<Fragment key={f_i16}>
                        <button className={f.cls} aria-pressed={f.on} onClick={f.go}>
                          {f.label}
                        </button>
                      </Fragment>))}
                    </div>
                  </>) : null}
                  {v.sessEmpty ? (<>
                    <div className="card" style={{ padding: "28px", textAlign: "center" }}>
                      <p style={{ margin: "0", color: "#A89C8B" }}>
                        {v.sessEmptyText}
                      </p>
                      <button className="btn-ghost" onClick={v.bookNow} style={{ marginTop: "14px" }}>
                        {"Book a session"}
                      </button>
                    </div>
                  </>) : null}
                </div>
              </>) : null}
              {v.noBookings ? (<>
                <div className="card" style={{ padding: "40px", textAlign: "center" }}>
                  <p className="lead">
                    {"You have no bookings yet."}
                  </p>
                  <button className="btn-gold" onClick={v.bookNow} style={{ marginTop: "18px" }}>
                    {"Book your first session"}
                  </button>
                </div>
              </>) : null}
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {(v.bookingList || []).map((b, b_i17) => (<Fragment key={b_i17}>
                  <div className={b.cardCls} style={{ padding: "24px 28px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "16px", alignItems: "flex-start" }}>
                      <div className="cxdim">
                        <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                          {"Booking "}{b.ref}
                        </p>
                        <h2 className="ttl" style={{ margin: "6px 0 0", fontSize: "24px", color: "#FFFFFF" }}>
                          {b.pkgName}
                        </h2>
                        <p style={{ margin: "8px 0 0", fontSize: "15px", color: "#DCD3C4" }}>
                          {b.dateLabel}{" · "}{b.timeLabel}
                        </p>
                        <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#A89C8B" }}>
                          {b.setupLabel}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span className={b.statusCls}>
                          {b.statusLabel}
                        </span>
                        <p className="ttl" style={{ margin: "14px 0 0", fontSize: "22px", fontWeight: "700", color: "#FFFFFF" }}>
                          {b.totalLabel}
                        </p>
                      </div>
                    </div>
                    {b.full ? (<>
                      <div className="cxdim" style={{ marginTop: "22px" }}>
                        <div className="tl">
                          {(b.cells || []).map((c, c_i18) => (<Fragment key={c_i18}>
                            <div className={c} />
                          </Fragment>))}
                        </div>
                        <div className="tll">
                          <span>
                            {"3 PM"}
                          </span>
                          <span>
                            {"4"}
                          </span>
                          <span>
                            {"5"}
                          </span>
                          <span>
                            {"6"}
                          </span>
                          <span>
                            {"7"}
                          </span>
                          <span>
                            {"8"}
                          </span>
                          <span>
                            {"9"}
                          </span>
                          <span>
                            {"10–11"}
                          </span>
                        </div>
                      </div>
                    </>) : null}
                    {b.canMove ? (<>
                      <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px" }}>
                        <button className="btn-ghost" onClick={b.toggleMove}>
                          {b.moveLabel}
                        </button>
                        <span style={{ fontSize: "13px", color: "#A89C8B" }}>
                          {"You can move this session yourself until 48 hours before it starts."}
                        </span>
                      </div>
                    </>) : null}
                    {b.tooLate ? (<>
                      <p style={{ margin: "20px 0 0", fontSize: "13px", color: "#A89C8B" }}>
                        {"Less than 48 hours to go, so this session can no longer be moved online. To ask for a change, reply to your booking email."}
                      </p>
                    </>) : null}
                    {b.moveOpen ? (<>
                      <div style={{ marginTop: "18px", paddingTop: "18px", borderTop: "1px solid rgba(241,234,223,0.10)", display: "flex", flexDirection: "column", gap: "16px" }}>
                        <p style={{ margin: "0", fontSize: "15px", fontWeight: "600", color: "#FFFFFF" }}>
                          {"Pick a new time · same setup and length"}
                        </p>
                        <div className="field" style={{ maxWidth: "260px" }}>
                          <label htmlFor="mv-date">
                            {"New date"}
                          </label>
                          <input id="mv-date" className="inp" type="date" value={b.moveDate} min={b.moveMin} max={b.moveMax} onChange={b.onMoveDate} />
                        </div>
                        {b.hasMoveNote ? (<>
                          <p style={{ margin: "0", fontSize: "14px", color: "#A89C8B" }}>
                            {b.moveNote}
                          </p>
                        </>) : null}
                        <div className="slots" role="list">
                          {(b.moveSlots || []).map((s, s_i19) => (<Fragment key={s_i19}>
                            <button className={s.cls} onClick={s.pick} aria-pressed={s.on}>
                              <span className="t">
                                {s.label}
                              </span>
                            </button>
                          </Fragment>))}
                        </div>
                        <button className="btn-gold" disabled={b.moveBlocked} onClick={b.confirmMove} style={{ alignSelf: "flex-start" }}>
                          {b.moveBtn}
                        </button>
                      </div>
                    </>) : null}
                  </div>
                </Fragment>))}
              </div>
            </>) : null}
          </div>
        </section>
      </>) : null}
      {v.is.legal ? (<>
        <section className="sec" style={{ paddingTop: "72px" }}>
          <div className="wrap" style={{ maxWidth: "860px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <p className="eyebrow" style={{ margin: "0" }}>
              {"Legal"}
            </p>
            <h1 className="h2">
              {v.legalTitle}
            </h1>
            <div className="ph">
              {"["}{v.legalTitle}{" — paste your final text here.]"}
            </div>
            <button className="btn-ghost" onClick={v.legalBack} style={{ alignSelf: "flex-start" }}>
              {v.legalBackLabel}
            </button>
          </div>
        </section>
      </>) : null}
      {v.is.packages ? (<>
        <section style={{ borderBottom: "1px solid rgba(241,234,223,0.08)" }}>
          <div className="wrap" style={{ paddingTop: "72px", paddingBottom: "48px" }}>
            <p className="eyebrow">
              {"Packages"}
            </p>
            <h1 className="h2" style={{ fontSize: "clamp(40px, 5vw, 64px)" }}>
              {"Book more, pay less per session"}
            </h1>
            <p className="lead" style={{ marginTop: "16px", maxWidth: "620px" }}>
              {"Buy a pack of sessions now and book each one whenever it suits you. The more sessions you take, the more you save."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "26px" }}>
              {(v.saveChips || []).map((sc, sc_i20) => (<Fragment key={sc_i20}>
                <span className="savechip">
                  {sc}
                </span>
              </Fragment>))}
            </div>
          </div>
        </section>
        <section style={{ padding: "48px 0 110px" }}>
          <div className="wrap" style={{ display: "flex", flexWrap: "wrap", gap: "40px", alignItems: "flex-start" }}>
            <aside className="frail" aria-label="Filters">
              <div className="fgroup">
                <p className="fhead">
                  {"Number of sessions"}
                </p>
                <div className="fopts" role="radiogroup" aria-label="Number of sessions">
                  {(v.fCount || []).map((o, o_i21) => (<Fragment key={o_i21}>
                    <button className={o.cls} role="radio" aria-checked={o.on} onClick={o.pick}>
                      <span className="rdot" />
                      <span className="fname">
                        {o.name}
                        <small>
                          {o.sub}
                        </small>
                      </span>
                    </button>
                  </Fragment>))}
                </div>
              </div>
            </aside>
            <div style={{ flex: "999 1 600px", minWidth: "0" }}>
              <div className="phead" aria-live="polite">
                <h2 className="ttl">
                  {v.packHead.name}
                </h2>
                <p>
                  {v.packHead.sub}
                </p>
              </div>
              <div className="pgrid">
                {(v.catalog || []).map((c, c_i22) => (<Fragment key={c_i22}>
                  <article className={c.cls}>
                    <div className="pimg">
                      <img src={c.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      {c.hasSave ? (<>
                        <span className="savetag">
                          {"Save "}{c.savePct}
                        </span>
                      </>) : null}
                      {c.pop ? (<>
                        <span className="poptag">
                          {"Most popular"}
                        </span>
                      </>) : null}
                    </div>
                    <div style={{ padding: "24px 24px 0" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px" }}>
                        <h2 className="ttl" style={{ margin: "0", fontSize: "24px", fontWeight: "700", color: "#FFFFFF", lineHeight: "1.15" }}>
                          {c.svc}
                        </h2>
                      </div>
                    </div>
                    <div className="pprice">
                      <p style={{ margin: "0", fontSize: "13px", color: "#A89C8B" }}>
                        {c.countLabel}
                      </p>
                      <p style={{ margin: "6px 0 0", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "10px" }}>
                        {c.hasSave ? (<>
                          <s style={{ fontSize: "16px", color: "#7D7365" }}>
                            {c.full}
                          </s>
                        </>) : null}
                        <span className="ttl" style={{ fontSize: "30px", fontWeight: "700", color: "#FFFFFF" }}>
                          {c.total}
                        </span>
                      </p>
                      <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#E2B872" }}>
                        {c.per}
                      </p>
                    </div>
                    <div style={{ padding: "20px 24px 24px", flexGrow: "1" }}>
                      <p style={{ margin: "0 0 12px", fontSize: "13px", fontWeight: "600", color: "#DCD3C4" }}>
                        {"Included for each session:"}
                      </p>
                      <ul className="chk">
                        {(c.inc || []).map((li, li_i23) => (<Fragment key={li_i23}>
                          <li>
                            {li}
                          </li>
                        </Fragment>))}
                      </ul>
                    </div>
                    <div className="pfoot">
                      <button onClick={c.details}>
                        {"More Details"}
                      </button>
                      <button className="buy" onClick={c.buy}>
                        {c.buyLabel}
                      </button>
                    </div>
                  </article>
                </Fragment>))}
              </div>
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.pkgDetail ? (<>
        <section style={{ padding: "40px 0 110px" }}>
          <div className="wrap">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "32px", marginTop: "40px", alignItems: "stretch" }}>
              <div className="zoom" style={{ flex: "999 1 520px", minHeight: "380px", position: "relative", borderRadius: "24px", border: "1px solid rgba(241,234,223,0.08)" }}>
                <img src={v.pd.img} alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover" }} />
              </div>
              <div className="wz mpad" style={{ flex: "1 1 380px", padding: "36px", display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <p className="lbl" style={{ margin: "0 0 6px" }}>
                    {"Session package"}
                  </p>
                  <h1 className="ttl" style={{ margin: "0", fontSize: "44px", fontWeight: "700", color: "#FFFFFF", lineHeight: "1" }}>
                    {v.pd.tier}
                  </h1>
                </div>
                <div>
                  <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#A89C8B" }}>
                    {"Number of sessions"}
                  </p>
                  <div className="segs" role="radiogroup" aria-label="Number of sessions">
                    {(v.pd.counts || []).map((k, k_i24) => (<Fragment key={k_i24}>
                      <button className={k.cls} onClick={k.pick} aria-pressed={k.on}>
                        {k.label}
                        {k.hasSave ? (<>
                          <small>
                            {"save "}{k.save}
                          </small>
                        </>) : null}
                      </button>
                    </Fragment>))}
                  </div>
                </div>
                <div style={{ padding: "20px", borderRadius: "16px", background: "#0E0C0A", border: "1px solid rgba(241,234,223,0.07)" }}>
                  <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#A89C8B" }}>
                    {v.pd.countLabel}
                  </p>
                  <p style={{ margin: "0", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: "10px" }}>
                    {v.pd.hasSave ? (<>
                      <s style={{ fontSize: "17px", color: "#7D7365" }}>
                        {v.pd.full}
                      </s>
                    </>) : null}
                    <span className="ttl" style={{ fontSize: "38px", fontWeight: "700", color: "#FFFFFF" }}>
                      {v.pd.total}
                    </span>
                  </p>
                  <p style={{ margin: "6px 0 0", fontSize: "14px", color: "#E2B872" }}>
                    {v.pd.per}
                    {v.pd.hasSave ? (<>
                      {" · you save "}{v.pd.saved}
                    </>) : null}
                  </p>
                </div>
                <button className="btn-gold btn-lg" onClick={v.pd.buy}>
                  {"Purchase Now"}
                </button>
                <p style={{ margin: "0", fontSize: "13px", color: "#8C8172", textAlign: "center" }}>
                  {"Valid "}{v.pd.valid}{" days · book each session whenever you like"}
                </p>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px", marginTop: "32px" }}>
              <div className="wz" style={{ padding: "28px" }}>
                <p className="lbl">
                  {"What's included in each session"}
                </p>
                <ul className="chk">
                  {(v.pd.items || []).map((li, li_i25) => (<Fragment key={li_i25}>
                    <li>
                      {li}
                    </li>
                  </Fragment>))}
                </ul>
              </div>
              <div className="wz" style={{ padding: "28px" }}>
                <p className="lbl">
                  {"How it works"}
                </p>
                <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", fontSize: "14px", color: "#DCD3C4", lineHeight: "1.5" }}>
                  <li style={{ display: "flex", gap: "12px" }}>
                    <span className="num">
                      {"1"}
                    </span>
                    {"Buy the package — your sessions are added to your account."}
                  </li>
                  <li style={{ display: "flex", gap: "12px" }}>
                    <span className="num">
                      {"2"}
                    </span>
                    {"Sign in and book each session when you're ready."}
                  </li>
                  <li style={{ display: "flex", gap: "12px" }}>
                    <span className="num">
                      {"3"}
                    </span>
                    {"Reschedule free up to 48 hours before your session."}
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </section>
      </>) : null}
      {v.is.book ? (<>
        {v.st.setup ? (<>
          <section className="fs" aria-label="Choose your setup">
            <div className="fs-car" ref={v.setCar} onScroll={v.onCarScroll} onPointerDown={v.dragStart} onPointerMove={v.dragMove} onPointerUp={v.dragEnd} onPointerLeave={v.dragEnd} onPointerCancel={v.dragEnd} data-gap="0">
              {(v.setupList || []).map((su, su_i26) => (<Fragment key={su_i26}>
                <div className="fs-slide">
                  <img src={su.bg} alt="" className="fs-bg" draggable="false" aria-hidden="true" />
                  <img src={su.img} srcSet={su.srcset} sizes="100vw" alt={su.alt} className="fs-img" draggable="false" />
                  <div className="fs-shade" />
                  <div className="fs-top">
                    <p className="fs-n">
                      {su.n}
                    </p>
                    <p className="fs-cap">
                      {"Capacity | "}{su.cap}
                    </p>
                    <button className="fs-choose" onClick={su.choose}>
                      {"Choose "}{su.n}
                    </button>
                  </div>
                </div>
              </Fragment>))}
            </div>
            <div className="fs-head">
              <button className="back-c fs-back" aria-label={v.wz.backLabel} onClick={v.wzBack}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M15 6l-6 6 6 6" />
                </svg>
              </button>
              <span className="fs-step">
                {"Step "}{v.wz.n}{" of "}{v.wz.of}{" · Choose your setup"}
              </span>
            </div>
            <button className="fs-arrow l" aria-label="Previous setup" onClick={v.carPrev}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="fs-arrow r" aria-label="Next setup" onClick={v.carNext}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <div className="fs-dots">
              {(v.carDots || []).map((d, d_i27) => (<Fragment key={d_i27}>
                <button className={d.cls} aria-label={d.label} onClick={d.go} />
              </Fragment>))}
            </div>
          </section>
        </>) : null}
        {v.notSetup ? (<>
          <section className="bk">
            <div className="wrap" style={{ maxWidth: "920px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", marginBottom: "28px" }}>
                <div>
                  <p className="eyebrow" style={{ marginBottom: "10px" }}>
                    {v.wz.kind}
                  </p>
                  <h1 className="ttl" style={{ margin: "0", fontSize: "clamp(30px, 3.4vw, 44px)", lineHeight: "1.1", fontWeight: "700", color: "#FFFFFF" }}>
                    {v.wz.title}
                  </h1>
                </div>
                <p style={{ margin: "0", fontSize: "13px", letterSpacing: "2px", textTransform: "uppercase", color: "#8C8172" }}>
                  {"Step "}{v.wz.n}{" of "}{v.wz.of}
                </p>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "flex-start" }}>
                <div className="wz" style={{ flex: "1 1 100%", minWidth: "0" }}>
                  <div className="wz-h">
                    <button className="back-c" aria-label={v.wz.backLabel} onClick={v.wzBack}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M15 6l-6 6 6 6" />
                      </svg>
                    </button>
                    <div style={{ flex: "1", minWidth: "0" }}>
                      <p style={{ margin: "0", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#8C8172" }}>
                        {v.wz.backLabel}
                      </p>
                      <p style={{ margin: "2px 0 0", fontSize: "17px", fontWeight: "500", color: "#FFFFFF" }}>
                        {v.wz.title}
                      </p>
                    </div>
                  </div>
                  <div className={v.wz.progCls} aria-hidden="true">
                    {(v.progBars || []).map((pb, pb_i28) => (<Fragment key={pb_i28}>
                      <i className={pb} />
                    </Fragment>))}
                  </div>
                  <div className="wz-b">
                    {v.st.service ? (<>
                      <p className="lead" style={{ fontSize: "15px", marginBottom: "22px" }}>
                        {v.svcLead}
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {(v.pkgs || []).map((p, p_i29) => (<Fragment key={p_i29}>
                          <button className={p.optCls} onClick={p.pick} aria-pressed={p.on}>
                            <span style={{ display: "flex", alignItems: "center", gap: "14px", width: "100%" }}>
                              <span className={p.radio} />
                              <span className="ttl" style={{ fontSize: "21px", fontWeight: "600", color: "#FFFFFF", whiteSpace: "nowrap" }}>
                                {p.name}
                              </span>
                            </span>
                            <span style={{ paddingLeft: "36px", whiteSpace: "nowrap" }}>
                              <span className="ttl" style={{ fontSize: "22px", fontWeight: "700", color: "#E2B872" }}>
                                {p.priceLabel}
                              </span>
                              <span style={{ fontSize: "13px", color: "#A89C8B" }}>
                                {" EGP / hour"}
                              </span>
                            </span>
                            <span className="svc-inc">
                              {p.base ? (<>
                                <span className="svc-base">
                                  {"Everything in Recording Only, plus"}
                                </span>
                              </>) : null}
                              {(p.brief || []).map((li, li_i30) => (<Fragment key={li_i30}>
                                <span className="svc-li">
                                  {li}
                                </span>
                              </Fragment>))}
                            </span>
                            {p.hasCredit ? (<>
                              <span className="creditchip" style={{ marginLeft: "36px" }}>
                                {p.creditLabel}
                              </span>
                            </>) : null}
                          </button>
                        </Fragment>))}
                      </div>
                    </>) : null}
                    {v.st.bundle ? (<>
                      <div style={{ display: "flex", gap: "18px", alignItems: "center", flexWrap: "wrap" }}>
                        <div style={{ width: "140px", height: "96px", borderRadius: "14px", overflow: "hidden", flexShrink: "0" }}>
                          <img src={v.bq.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        </div>
                        <div>
                          <p className="lbl" style={{ margin: "0 0 4px" }}>
                            {"Your package"}
                          </p>
                          <p className="ttl" style={{ margin: "0", fontSize: "30px", fontWeight: "700", color: "#FFFFFF" }}>
                            {v.bq.tier}
                          </p>
                        </div>
                      </div>
                      <p style={{ margin: "26px 0 10px", fontSize: "13px", color: "#A89C8B" }}>
                        {"Number of sessions"}
                      </p>
                      <div className="segs">
                        {(v.bq.counts || []).map((k, k_i31) => (<Fragment key={k_i31}>
                          <button className={k.cls} onClick={k.pick} aria-pressed={k.on}>
                            {k.label}
                            {k.hasSave ? (<>
                              <small>
                                {"save "}{k.save}
                              </small>
                            </>) : null}
                          </button>
                        </Fragment>))}
                      </div>
                      <div className="xrow" style={{ marginTop: "22px", flexWrap: "wrap" }}>
                        <div>
                          <p style={{ margin: "0", fontSize: "15px", color: "#FFFFFF" }}>
                            {v.bq.countLabel}{" · "}{v.bq.per}
                          </p>
                          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#A89C8B" }}>
                            {"Valid "}{v.bq.valid}{" days · one hour of recording each"}
                          </p>
                        </div>
                        {v.bq.hasSave ? (<>
                          <span className="savechip">
                            {"You save "}{v.bq.saved}
                          </span>
                        </>) : null}
                      </div>
                      <div className="xrow" style={{ marginTop: "14px" }}>
                        <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.6", color: "#DCD3C4" }}>
                          {"Your sessions are added to your account as credits. When you book each one, you choose the setup, any extras, and the date and time."}
                        </p>
                      </div>
                      <p className="lbl" style={{ marginTop: "26px" }}>
                        {"Included in each session"}
                      </p>
                      <ul className="chk">
                        {(v.bq.inc || []).map((li, li_i32) => (<Fragment key={li_i32}>
                          <li>
                            {li}
                          </li>
                        </Fragment>))}
                      </ul>
                    </>) : null}
                    {v.st.people ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div className="xrow" style={{ padding: "28px" }}>
                          <div>
                            <p style={{ margin: "0", fontSize: "17px", fontWeight: "500", color: "#FFFFFF" }}>
                              {"People on camera"}
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#A89C8B" }}>
                              {"Everyone who will appear in the recording. "}{v.setupName}{" seats up to "}{v.setupCap}{"."}
                            </p>
                          </div>
                          <div className="qty">
                            <button className="qb" aria-label="Fewer people" onClick={v.peopleDown} disabled={v.peopleMin}>
                              {"−"}
                            </button>
                            <span className="qv" aria-live="polite">
                              {v.people}
                            </span>
                            <button className="qb" aria-label="More people" onClick={v.peopleUp} disabled={v.peopleMax}>
                              {"+"}
                            </button>
                          </div>
                        </div>
                        <div className="xrow" style={{ padding: "28px" }}>
                          <div>
                            <p style={{ margin: "0", fontSize: "17px", fontWeight: "500", color: "#FFFFFF" }}>
                              {"Guests coming along"}
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: "13px", lineHeight: "1.5", color: "#A89C8B" }}>
                              {"Friends, family or team joining you who won't be on camera. Up to "}{v.guestMaxLabel}{"."}
                            </p>
                          </div>
                          <div className="qty">
                            <button className="qb" aria-label="Fewer guests" onClick={v.guestsDown} disabled={v.guestsMin}>
                              {"−"}
                            </button>
                            <span className="qv" aria-live="polite">
                              {v.guests}
                            </span>
                            <button className="qb" aria-label="More guests" onClick={v.guestsUp} disabled={v.guestsMax}>
                              {"+"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>) : null}
                    {v.st.extras ? (<>
                      {v.isCyc ? (<>
                        <p className="lead" style={{ fontSize: "15px", margin: "0 0 18px" }}>
                          {v.extrasLead}
                        </p>
                      </>) : null}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "16px" }}>
                        <p style={{ margin: "0", fontSize: "15px", color: "#DCD3C4" }}>
                          {"Booked: "}
                          <strong style={{ color: "#FFFFFF" }}>
                            {v.durLabel}
                          </strong>
                        </p>
                        <p style={{ margin: "0", fontSize: "13px", color: "#8C8172" }}>
                          {"All optional"}
                        </p>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        {(v.extraList || []).map((x, x_i33) => (<Fragment key={x_i33}>
                          <div className={x.cls}>
                            <div style={{ minWidth: "0" }}>
                              <p style={{ margin: "0", fontSize: "16px", fontWeight: "500", color: "#FFFFFF" }}>
                                {x.name}
                              </p>
                              <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#A89C8B" }}>
                                {x.priceLabel}{" · "}{x.basis}
                              </p>
                            </div>
                            <div className="qty">
                              <button className="qb" aria-label={x.minusLabel} onClick={x.down} disabled={x.atMin}>
                                {"−"}
                              </button>
                              <span className="qv">
                                {x.qty}
                              </span>
                              <button className="qb" aria-label={x.plusLabel} onClick={x.up} disabled={x.atMax}>
                                {"+"}
                              </button>
                            </div>
                          </div>
                        </Fragment>))}
                      </div>
                    </>) : null}
                    {v.st.time ? (<>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
                        <p className="ttl" style={{ margin: "0", fontSize: "22px", fontWeight: "600", color: "#FFFFFF" }}>
                          {v.cal.title}
                        </p>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="back-c" aria-label="Previous month" onClick={v.cal.prev} disabled={v.cal.noPrev}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M15 6l-6 6 6 6" />
                            </svg>
                          </button>
                          <button className="back-c" aria-label="Next month" onClick={v.cal.next} disabled={v.cal.noNext}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="cal-h">
                        <span>
                          {"Sat"}
                        </span>
                        <span>
                          {"Sun"}
                        </span>
                        <span>
                          {"Mon"}
                        </span>
                        <span>
                          {"Tue"}
                        </span>
                        <span>
                          {"Wed"}
                        </span>
                        <span>
                          {"Thu"}
                        </span>
                        <span>
                          {"Fri"}
                        </span>
                      </div>
                      <div className="cal">
                        {(v.cal.cells || []).map((c, c_i34) => (<Fragment key={c_i34}>
                          <button className={c.cls} onClick={c.pick} disabled={c.dis} aria-label={c.aria}>
                            {c.label}
                          </button>
                        </Fragment>))}
                      </div>
                      <p style={{ margin: "12px 0 0", fontSize: "12px", color: "#8C8172" }}>
                        {"Open Saturday–Thursday, 3 PM – 11 PM (Cairo time). Closed on Fridays."}
                      </p>
                      {v.hasDate ? (<>
                        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", margin: "30px 0 14px" }}>
                          <div>
                            <p style={{ margin: "0", fontSize: "12px", letterSpacing: "2px", textTransform: "uppercase", color: "#E2B872" }}>
                              {v.dateLong}{" · "}{v.setupName}
                            </p>
                            <p style={{ margin: "6px 0 0", fontSize: "15px", color: "#DCD3C4" }}>
                              {"Start times for a "}{v.durLabel}{" session"}
                            </p>
                          </div>
                          <div className="legend">
                            <span>
                              <i className="sw" style={{ background: "#17140F", border: "1px solid rgba(241,234,223,0.3)" }} />
                              {"Free"}
                            </span>
                            <span>
                              <i className="sw" style={{ background: "#E2B872" }} />
                              {"Yours"}
                            </span>
                            <span>
                              <i className="sw" style={{ background: "#2A241C", border: "1px dashed #6F6659" }} />
                              {"Taken"}
                            </span>
                          </div>
                        </div>
                        <div className="slots" role="list" aria-live="polite">
                          {(v.slotList || []).map((s, s_i35) => (<Fragment key={s_i35}>
                            <button className={s.cls} onClick={s.pick} disabled={s.disabled} aria-pressed={s.on}>
                              <span className="t">
                                {s.label}
                              </span>
                              <span className="s">
                                {s.status}
                              </span>
                            </button>
                          </Fragment>))}
                        </div>
                        {v.noSlots ? (<>
                          <div className="ph" style={{ marginTop: "12px" }}>
                            {"No "}{v.durLabel}{" window is free in this setup on this day. Try another date or setup, or remove the extra hour."}
                          </div>
                        </>) : null}
                      </>) : null}
                      {v.noDate ? (<>
                        <div className="ph" style={{ marginTop: "22px" }}>
                          {"Pick a date to see the free start times."}
                        </div>
                      </>) : null}
                    </>) : null}
                    {v.st.info ? (<>
                      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "18px" }}>
                          <div className="field">
                            <label htmlFor="i-first">
                              {"First name"}
                            </label>
                            <input id="i-first" className={v.err.firstCls} value={v.info.first} onChange={v.onI.first} autoComplete="given-name" aria-invalid={v.err.firstBad} />
                            {v.err.firstBad ? (<>
                              <span className="ferr">
                                {"Please enter your first name."}
                              </span>
                            </>) : null}
                          </div>
                          <div className="field">
                            <label htmlFor="i-last">
                              {"Last name"}
                            </label>
                            <input id="i-last" className={v.err.lastCls} value={v.info.last} onChange={v.onI.last} autoComplete="family-name" aria-invalid={v.err.lastBad} />
                            {v.err.lastBad ? (<>
                              <span className="ferr">
                                {"Please enter your last name."}
                              </span>
                            </>) : null}
                          </div>
                        </div>
                        <div className="field">
                          <label htmlFor="i-email">
                            {"Email"}
                          </label>
                          <input id="i-email" className={v.err.emailCls} type="email" value={v.info.email} onChange={v.onI.email} readOnly={v.signedIn} autoComplete="email" placeholder="you@example.com" aria-invalid={v.err.emailBad} />
                          {v.err.emailBad ? (<>
                            <span className="ferr">
                              {"Enter a valid email — your confirmation goes here."}
                            </span>
                          </>) : null}
                        </div>
                        <div className="field">
                          <label htmlFor="i-phone">
                            {"Phone (optional)"}
                          </label>
                          <input id="i-phone" className={v.err.phoneCls} type="tel" inputMode="tel" value={v.info.phone} onChange={v.onI.phone} autoComplete="tel" placeholder="+20 1x xxxx xxxx" />
                          {v.err.phoneBad ? (<>
                            <span className="ferr">
                              {"Add a phone number so we can send WhatsApp updates."}
                            </span>
                          </>) : null}
                        </div>
                        <label className="chkbox">
                          <input type="checkbox" checked={v.info.wa} onChange={v.toggleWa} />
                          <span>
                            {"Send my booking updates on WhatsApp"}
                          </span>
                        </label>
                        {v.needPassword ? (<>
                          <div className="field">
                            <label htmlFor="i-pw">
                              {"Create a password"}
                            </label>
                            <input id="i-pw" className={v.err.pwCls} type="password" value={v.info.pw} onChange={v.onI.pw} autoComplete="new-password" placeholder="At least 8 characters" aria-invalid={v.err.pwBad} />
                            {v.err.pwBad ? (<>
                              <span className="ferr">
                                {"Use at least 8 characters."}
                              </span>
                            </>) : null}
                            <span style={{ fontSize: "13px", color: "#A89C8B" }}>
                              {"You will use this email and password to see your bookings and packages. Already have an account? "}
                              <button className="link" onClick={v.nav.account}>
                                {"Sign in first"}
                              </button>
                            </span>
                          </div>
                        </>) : null}
                      </div>
                    </>) : null}
                    {v.st.pay ? (<>
                      {v.hasBookingAs ? (<>
                        <p style={{ margin: "0 0 18px", fontSize: "14px", color: "#A89C8B" }}>
                          {"Booking as "}
                          <strong style={{ color: "#FFFFFF" }}>
                            {v.bookingAs}
                          </strong>
                          {" · "}
                          <button className="link" onClick={v.editInfo}>
                            {"Edit details"}
                          </button>
                        </p>
                      </>) : null}
                      {v.showSummary ? (<>
                        <div className="xrow on" style={{ marginBottom: "22px", flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                          <p style={{ margin: "0", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8C8172" }}>
                            {v.q.label}
                          </p>
                          <p style={{ margin: "0", fontSize: "16px", fontWeight: "600", color: "#FFFFFF" }}>
                            {v.q.title}
                          </p>
                          <p style={{ margin: "0", fontSize: "14px", color: "#CFC5B5" }}>
                            {v.q.meta}
                          </p>
                          <p style={{ margin: "0", fontSize: "14px", color: "#E2B872" }}>
                            {v.q.when}
                          </p>
                          <div style={{ marginTop: "6px", paddingTop: "10px", borderTop: "1px solid rgba(241,234,223,0.12)", display: "flex", flexDirection: "column", gap: "8px" }}>
                            {(v.q.lines || []).map((ln, ln_i36) => (<Fragment key={ln_i36}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "14px" }}>
                                <span style={{ color: "#CFC5B5" }}>
                                  {ln.k}
                                </span>
                                <span style={{ color: "#FFFFFF" }}>
                                  {ln.v}
                                </span>
                              </div>
                            </Fragment>))}
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "2px", fontSize: "15px", fontWeight: "600" }}>
                              <span style={{ color: "#FFFFFF" }}>
                                {"Total"}
                              </span>
                              <span style={{ color: "#E2B872" }}>
                                {v.q.total}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>) : null}
                      {v.canCredit ? (<>
                        <label className="xrow" style={{ cursor: "pointer", marginBottom: "22px" }}>
                          <span style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                            <input type="checkbox" checked={v.useCredit} onChange={v.toggleCredit} style={{ width: "20px", height: "20px", accentColor: "#E2B872", margin: "0" }} />
                            <span>
                              <span style={{ display: "block", fontSize: "15px", fontWeight: "500", color: "#FFFFFF" }}>
                                {"Use 1 package credit"}
                              </span>
                              <span style={{ display: "block", marginTop: "3px", fontSize: "13px", color: "#A89C8B" }}>
                                {v.creditNote}
                              </span>
                            </span>
                          </span>
                        </label>
                      </>) : null}
                      {v.noPay ? (<>
                        <div className="xrow on" style={{ marginBottom: "22px", flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
                          <p style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: "600", color: "#FFFFFF" }}>
                            {v.creditPayTitle}
                          </p>
                          {(v.creditLines || []).map((cl, cl_i37) => (<Fragment key={cl_i37}>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", fontSize: "14px" }}>
                              <span style={{ color: "#CFC5B5" }}>
                                {cl.k}
                              </span>
                              <span className={cl.cls}>
                                {cl.v}
                              </span>
                            </div>
                          </Fragment>))}
                          {v.hasCreditDue ? (<>
                            <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "4px", paddingTop: "10px", borderTop: "1px solid rgba(241,234,223,0.12)", fontSize: "15px", fontWeight: "600" }}>
                              <span style={{ color: "#E2B872" }}>
                                {v.creditDueLabel}
                              </span>
                              <span style={{ color: "#E2B872" }}>
                                {v.creditDue}
                              </span>
                            </div>
                          </>) : null}
                        </div>
                      </>) : null}
                      {v.needsPay ? (<>
                        <p className="lbl">
                          {"Payment method"}
                        </p>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
                          {(v.payMethods || []).map((m, m_i38) => (<Fragment key={m_i38}>
                            <button className={m.cls} onClick={m.pick} aria-pressed={m.on} style={{ alignItems: "center", textAlign: "center", padding: "20px 14px" }}>
                              <span style={{ fontSize: "16px", fontWeight: "600", color: "#FFFFFF" }}>
                                {m.label}
                              </span>
                              <span style={{ fontSize: "12px", color: "#A89C8B" }}>
                                {m.sub}
                              </span>
                            </button>
                          </Fragment>))}
                        </div>
                        <p style={{ margin: "12px 0 0", fontSize: "13px", color: "#A89C8B", textAlign: "center" }}>
                          {v.payHelp}
                        </p>
                        {v.payOnline ? (<>
                          <div style={{ marginTop: "22px", display: "flex", flexDirection: "column", gap: "18px" }}>
                            <div className="field">
                              <label htmlFor="p-holder">
                                {"Name on card"}
                              </label>
                              <input id="p-holder" className="inp" value={v.card.holder} onChange={v.onP.holder} autoComplete="cc-name" />
                            </div>
                            <div className="field">
                              <label htmlFor="p-num">
                                {"Card number"}
                              </label>
                              <input id="p-num" className="inp" inputMode="numeric" value={v.card.num} onChange={v.onP.num} autoComplete="cc-number" placeholder="1234 5678 9012 3456" />
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "18px" }}>
                              <div className="field">
                                <label htmlFor="p-exp">
                                  {"Expiry"}
                                </label>
                                <input id="p-exp" className="inp" inputMode="numeric" value={v.card.exp} onChange={v.onP.exp} autoComplete="cc-exp" placeholder="MM/YY" />
                              </div>
                              <div className="field">
                                <label htmlFor="p-cvc">
                                  {"CVC"}
                                </label>
                                <input id="p-cvc" className="inp" inputMode="numeric" value={v.card.cvc} onChange={v.onP.cvc} autoComplete="cc-csc" placeholder="123" />
                              </div>
                            </div>
                            <p style={{ margin: "0", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#8C8172" }}>
                              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <rect x="5" y="11" width="14" height="9" rx="2" />
                                <path d="M8 11V8a4 4 0 0 1 8 0v3" />
                              </svg>
                              {"Prototype — no real payment is taken."}
                            </p>
                          </div>
                        </>) : null}
                      </>) : null}
                      <label className="chkbox" style={{ marginTop: "22px" }}>
                        <input type="checkbox" checked={v.agreed} onChange={v.toggleAgree} />
                        <span>
                          {"I agree to the "}
                          <button className="link" onClick={v.legal.terms}>
                            {"Terms"}
                          </button>
                          {" and "}
                          <button className="link" onClick={v.legal.refund}>
                            {"Refund & Cancellation"}
                          </button>
                          {" policy."}
                        </span>
                      </label>
                    </>) : null}
                  </div>
                  <div className="wz-f desk">
                    <button className="btn-ghost" onClick={v.wzBack}>
                      {"Back"}
                    </button>
                    <div style={{ marginLeft: "auto", marginRight: "20px", textAlign: "right" }}>
                      <p style={{ margin: "0", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8C8172" }}>
                        {"Total"}
                      </p>
                      <p className="ttl" style={{ margin: "0", fontSize: "22px", fontWeight: "700", color: "#FFFFFF" }}>
                        {v.q.total}
                      </p>
                    </div>
                    <button className="btn-gold" onClick={v.wzNext} disabled={v.nextBlocked} style={{ minWidth: "200px" }}>
                      {v.nextLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
          <div className="mbar">
            <button className="back-c" aria-label={v.wz.backLabel} onClick={v.wzBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 6l-6 6 6 6" />
              </svg>
            </button>
            <div style={{ flex: "1", minWidth: "0" }}>
              <p style={{ margin: "0", fontSize: "11px", letterSpacing: "1.5px", textTransform: "uppercase", color: "#8C8172" }}>
                {"Total"}
              </p>
              <p className="ttl" style={{ margin: "0", fontSize: "22px", fontWeight: "700", color: "#FFFFFF" }}>
                {v.q.total}
              </p>
            </div>
            <button className="btn-gold" onClick={v.wzNext} disabled={v.nextBlocked}>
              {v.nextShort}
            </button>
          </div>
        </>) : null}
      </>) : null}
      {v.is.confirm ? (<>
        <section style={{ padding: "64px 0 110px" }}>
          <div className="wrap" style={{ maxWidth: "820px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "#E2B872", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}>
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="#17120B" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12l5 5 9-10" />
                </svg>
              </div>
              <h1 className="h2" style={{ marginTop: "24px" }}>
                {v.last.headline}
              </h1>
              <p className="lead" style={{ marginTop: "12px" }}>
                {"Booked by "}{v.last.email}{" · Order "}{v.last.ref}
              </p>
            </div>
            <div className="wz" style={{ marginTop: "36px" }}>
              <div className="mpad" style={{ padding: "36px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ minWidth: "0" }}>
                    <p className="lbl" style={{ marginBottom: "8px" }}>
                      {v.last.kicker}
                    </p>
                    <p className="ttl" style={{ margin: "0", fontSize: "28px", fontWeight: "700", color: "#FFFFFF" }}>
                      {v.last.big}
                    </p>
                    <p style={{ margin: "6px 0 0", fontSize: "18px", color: "#E2B872" }}>
                      {v.last.sub}
                    </p>
                  </div>
                  <span className={v.last.payCls} style={{ flexShrink: "0", whiteSpace: "nowrap" }}>
                    {v.last.payState}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", marginTop: "24px", paddingTop: "18px", borderTop: "1px solid rgba(241,234,223,0.08)" }}>
                  <span style={{ fontSize: "15px", color: "#A89C8B" }}>
                    {"Total"}
                  </span>
                  <span className="ttl" style={{ fontSize: "28px", fontWeight: "700", color: "#FFFFFF" }}>
                    {v.last.totalLabel}
                  </span>
                </div>
                {v.last.isSession ? (<>
                  <div style={{ marginTop: "28px" }}>
                    <p style={{ margin: "0 0 10px", fontSize: "13px", color: "#A89C8B" }}>
                      {"Your slot in the studio day (3 PM – 11 PM)"}
                    </p>
                    <div className="tl">
                      {(v.last.cells || []).map((c, c_i39) => (<Fragment key={c_i39}>
                        <div className={c} />
                      </Fragment>))}
                    </div>
                    <div className="tll">
                      <span>
                        {"3 PM"}
                      </span>
                      <span>
                        {"4"}
                      </span>
                      <span>
                        {"5"}
                      </span>
                      <span>
                        {"6"}
                      </span>
                      <span>
                        {"7"}
                      </span>
                      <span>
                        {"8"}
                      </span>
                      <span>
                        {"9"}
                      </span>
                      <span>
                        {"10–11"}
                      </span>
                    </div>
                  </div>
                </>) : null}
                <div style={{ marginTop: "28px" }}>
                  {(v.last.rows || []).map((r, r_i40) => (<Fragment key={r_i40}>
                    <div className="row">
                      <span className="k">
                        {r.k}
                      </span>
                      <span className="v">
                        {r.v}
                      </span>
                    </div>
                  </Fragment>))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginTop: "28px" }}>
              {v.last.isSession ? (<>
                <button className="btn-gold" onClick={v.addCal}>
                  {"Add to calendar"}
                </button>
              </>) : null}
              <button className={v.last.acctCls} onClick={v.nav.account}>
                {"Go to my account"}
              </button>
              <button className="btn-ghost" onClick={v.nav.home}>
                {"Back to home"}
              </button>
            </div>
            <p style={{ margin: "28px 0 0", textAlign: "center", fontSize: "14px", color: "#A89C8B" }}>
              {v.last.note}
            </p>
          </div>
        </section>
      </>) : null}
      <footer className="foot">
        <div className="wrap foot-in">
          <nav className="foot-legal" aria-label="Legal">
            <button onClick={v.legal.privacy}>
              {"Privacy Policy"}
            </button>
            <button onClick={v.legal.terms}>
              {"Terms & Conditions"}
            </button>
            <button onClick={v.legal.refund}>
              {"Refund & Cancellation"}
            </button>
            <button onClick={v.nav.account}>
              {"My Account"}
            </button>
          </nav>
          <div className="foot-soc">
            <button className="iconbtn" aria-label="Facebook" onClick={v.social.fb}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M15 3h-2.5A3.5 3.5 0 0 0 9 6.5V9H6.5v3.5H9V21h3.5v-8.5H15l.5-3.5h-3V7a1 1 0 0 1 1-1H15z" />
              </svg>
            </button>
            <button className="iconbtn" aria-label="Instagram" onClick={v.social.ig}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="0.6" />
              </svg>
            </button>
            <button className="iconbtn" aria-label="Location" onClick={v.nav.contact}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z" />
                <circle cx="12" cy="9.5" r="2.5" />
              </svg>
            </button>
          </div>
          <div className="foot-rule" />
          <p className="foot-copy">
            {"© Nilepods · Powered by Capital Studios · "}
            <a href="/admin/" style={{ color: "inherit" }}>
              {"Team login"}
            </a>
          </p>
        </div>
      </footer>
      {v.hasToast ? (<>
        <div className="toast" role="status">
          {v.toast}
        </div>
      </>) : null}
    </div>
  );
}
