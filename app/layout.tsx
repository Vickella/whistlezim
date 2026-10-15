import type { Metadata } from "next";
import { connection } from "next/server";
import "./globals.css";
import "./theme.css";
import { Shell } from "@/components/layout/Shell";

export const metadata: Metadata = {
  title: { default: "WhistleZim", template: "%s · WhistleZim" },
  description: "Confidential whistleblowing, protected reporter communication and accountable case management."
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  await connection();
  return <html lang="en"><body><Shell>{children}</Shell></body></html>;
}
