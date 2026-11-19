import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "Daily Growth Tracker", description: "Track outreach, habits, points and consistency." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}