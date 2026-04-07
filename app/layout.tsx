import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ayman & Abdul Bari — Wedding",
  description: "You are warmly invited to celebrate the wedding of Ayman & Abdul Bari.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}