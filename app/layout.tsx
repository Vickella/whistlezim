import type { Metadata } from "next";
import "./globals.css";
import "./theme.css";
import { Shell } from "@/components/layout/Shell";
export const metadata: Metadata = { title: { default: "WhistleZim", template: "%s · WhistleZim" }, description: "Privacy focused whistleblowing and case management, with real data intake controlled by safety gates." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body><Shell>{children}</Shell></body></html>; }
