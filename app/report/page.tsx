import Link from "next/link";
import { ChannelAccess } from "@/components/reporting/ChannelAccess";

export default function Page() {
  return <div className="entry-page">
    <section className="entry-panel">
      <p className="eyebrow dark">Secure reporting</p>
      <h1>Open your organisation’s reporting channel</h1>
      <p>Your organisation will provide its channel code or direct reporting page address. No officer account is required to submit or track a report.</p>
      <ChannelAccess />
      <div className="entry-support">
        <p><strong>Already submitted?</strong></p>
        <Link href="/track">Track your report using your case reference and recovery secret</Link>
      </div>
    </section>
  </div>;
}
