import Link from "next/link";
import { TrustPage } from "@/components/legal/TrustPage";

export default function Page(){return <TrustPage title="How reporting works">
  <p>WhistleZim gives reporters a private route to an authorised case team and a way to continue the conversation without creating an account.</p>
  <div className="grid steps">
    <div className="card"><h2>Open the channel</h2><p>Use the reporting page or channel code supplied by your organisation.</p></div>
    <div className="card"><h2>Share the concern</h2><p>Select how you want to report and include the information needed to understand what happened.</p></div>
    <div className="card"><h2>Save private access</h2><p>Keep the case reference and recovery secret shown after submission.</p></div>
    <div className="card"><h2>Follow the case</h2><p>Return to read updates and exchange messages with the assigned case team.</p></div>
  </div>
  <div className="actions"><Link className="button" href="/report">Submit a report</Link><Link className="button quiet" href="/track">Track a report</Link></div>
</TrustPage>}
