import Link from "next/link";
import { Icon } from "@/components/ui/Icon";

export default function Home() {
  return <>
    <section className="hero">
      <div className="hero-content">
        <p className="eyebrow">Confidential reporting</p>
        <h1>Speak up.<br />Stay in control.</h1>
        <p className="hero-lead">Submit a concern through your organisation’s secure channel, then return for updates without creating an account.</p>
        <div className="actions">
          <Link className="button" href="/report">Submit a report</Link>
          <Link className="button secondary" href="/track">Track a report</Link>
        </div>
        <p className="hero-note">Your name and contact details are optional when anonymous reporting is available.</p>
      </div>
      <div className="hero-visual" aria-hidden="true">
        <div className="signal signal-one" />
        <div className="signal signal-two" />
        <div className="shield-mark">W</div>
      </div>
    </section>
    <section className="wrap section product-section">
      <div className="section-heading">
        <p className="eyebrow dark">A protected reporting journey</p>
        <h2>From first report to final outcome</h2>
        <p>WhistleZim keeps communication open while limiting access to authorised case teams.</p>
      </div>
      <div className="grid feature-grid">
        <article className="card feature-card">
          <span className="icon-shell"><Icon name="shield" /></span>
          <div><h3>Report confidentially</h3><p>Choose anonymous or confidential reporting and share only what is relevant to the concern.</p></div>
        </article>
        <article className="card feature-card">
          <span className="icon-shell"><Icon name="key" /></span>
          <div><h3>Keep private access</h3><p>Receive a unique case reference and recovery secret for future access.</p></div>
        </article>
        <article className="card feature-card">
          <span className="icon-shell"><Icon name="conversation" /></span>
          <div><h3>Continue the conversation</h3><p>Read updates and respond to the case team through the protected case channel.</p></div>
        </article>
      </div>
    </section>
    <section className="workflow-band">
      <div className="wrap workflow-content">
        <div><p className="eyebrow">For reporting officers</p><h2>One place to manage every concern</h2><p>Review assigned cases, record decisions, manage access and maintain an accountable case history.</p></div>
        <div className="actions workflow-actions"><Link className="button light" href="/register">Create organisation</Link><Link className="button secondary" href="/login">Officer sign in</Link></div>
      </div>
    </section>
    <section className="wrap safety-note" aria-label="Safety information">
      <strong>Immediate danger?</strong>
      <span>Contact the appropriate emergency service. WhistleZim is intended for reporting and case communication.</span>
    </section>
  </>;
}
