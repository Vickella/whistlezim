import Link from "next/link";

const documents = [
  {href:"/terms",title:"Terms of Service",description:"The agreement governing accounts, organisation workspaces and use of the service."},
  {href:"/privacy",title:"Privacy Notice",description:"How report information, account data and security records are handled."},
  {href:"/acceptable-use",title:"Acceptable Use Policy",description:"Rules protecting reporters, organisations, case integrity and service availability."},
  {href:"/whistleblowing-policy",title:"Whistleblowing Policy",description:"The framework for speaking up, impartial investigations and protection from retaliation."},
  {href:"/data-retention",title:"Data Retention Policy",description:"Retention schedules, legal holds, deletion and backup lifecycle controls."},
  {href:"/data-processing-agreement",title:"Data Processing Terms",description:"Controller and processor responsibilities for organisation case information."},
  {href:"/cookies",title:"Cookie Notice",description:"Essential authentication, security and reporter session storage."},
  {href:"/security",title:"Security",description:"Technical and organisational safeguards protecting the platform."},
  {href:"/accessibility",title:"Accessibility",description:"Accessibility approach, supported interaction and assistance route."}
];

export default function Page(){return <div className="legal-page"><header className="legal-header"><div className="wrap legal-header-inner"><p className="eyebrow dark">Governance and transparency</p><h1>Legal centre</h1><p>Policies, service terms and governance information for reporters, organisation owners and authorised case teams.</p><div className="legal-meta"><span>Current documents</span><span>Version controlled</span><span>Effective 15 October 2026</span></div></div></header><section className="wrap legal-hub"><div className="legal-hub-grid">{documents.map((document)=><Link className="legal-hub-card" href={document.href} key={document.href}><h2>{document.title}</h2><p>{document.description}</p><span>Read document</span></Link>)}</div><div className="notice"><strong>Organisation notices also apply.</strong> Each reporting channel identifies the organisation responsible for handling its reports. Its privacy notice and investigation process apply alongside these platform documents.</div></section></div>}
