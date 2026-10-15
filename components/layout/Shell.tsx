import Link from "next/link";

export function Shell({ children }: { children: React.ReactNode }) {
  return <>
    <a className="skip" href="#main">Skip to main content</a>
    <header className="site-header">
      <nav className="site-nav" aria-label="Main navigation">
        <Link className="brand" href="/" aria-label="WhistleZim home">
          <span className="brand-mark" aria-hidden="true">W</span>
          <span>WhistleZim</span>
        </Link>
        <div className="nav-links">
          <Link href="/report">Submit report</Link>
          <Link href="/track">Track report</Link>
          <Link className="nav-login" href="/login">Officer portal</Link>
        </div>
      </nav>
    </header>
    <main id="main">{children}</main>
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-intro">
          <Link className="footer-brand" href="/">WhistleZim</Link>
          <p>Confidential reporting and case management for organisations that take concerns seriously.</p>
        </div>
        <div>
          <h2>Reporting</h2>
          <div className="footer-column">
            <Link href="/report">Submit a report</Link>
            <Link href="/track">Track a report</Link>
            <Link href="/how-it-works">How it works</Link>
          </div>
        </div>
        <div>
          <h2>Trust centre</h2>
          <div className="footer-column">
            <Link href="/security">Security</Link>
            <Link href="/privacy">Privacy</Link>
            <Link href="/data-retention">Data retention</Link>
            <Link href="/status">Service status</Link>
          </div>
        </div>
        <div>
          <h2>Organisation</h2>
          <div className="footer-column">
            <Link href="/login">Officer portal</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/accessibility">Accessibility</Link>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} WhistleZim</span>
        <div className="footer-legal">
          <Link href="/terms">Terms</Link>
          <Link href="/acceptable-use">Acceptable use</Link>
          <Link href="/cookies">Cookies</Link>
          <Link href="/whistleblowing-policy">Whistleblowing policy</Link>
          <Link href="/data-processing-agreement">Data processing agreement</Link>
        </div>
      </div>
    </footer>
  </>;
}
