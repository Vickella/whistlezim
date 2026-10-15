import Link from "next/link";
import type { ReactNode } from "react";

export type LegalSection = { id: string; title: string; content: ReactNode };

export function LegalDocument({ title, summary, sections, version = "1.1", effective = "15 October 2026" }: { title: string; summary: string; sections: LegalSection[]; version?: string; effective?: string }) {
  return <div className="legal-page">
    <header className="legal-header">
      <div className="wrap legal-header-inner">
        <p className="eyebrow dark">WhistleZim legal centre</p>
        <h1>{title}</h1>
        <p>{summary}</p>
        <div className="legal-meta"><span>Effective {effective}</span><span>Version {version}</span><span>Last updated {effective}</span></div>
      </div>
    </header>
    <div className="wrap legal-layout">
      <aside className="legal-sidebar">
        <nav aria-label={`${title} contents`}>
          <strong>Contents</strong>
          {sections.map((section, index) => <a key={section.id} href={`#${section.id}`}>{index + 1}. {section.title}</a>)}
        </nav>
        <div className="legal-support"><strong>Questions?</strong><p>Use the <Link href="/contact">contact page</Link> without including report content or access secrets.</p></div>
      </aside>
      <article className="legal-article">
        {sections.map((section, index) => <section id={section.id} key={section.id}>
          <h2><span>{index + 1}</span>{section.title}</h2>
          {section.content}
        </section>)}
        <div className="legal-related"><strong>Related documents</strong><div><Link href="/privacy">Privacy Notice</Link><Link href="/terms">Terms of Service</Link><Link href="/acceptable-use">Acceptable Use Policy</Link><Link href="/data-retention">Data Retention Policy</Link></div></div>
      </article>
    </div>
  </div>;
}
