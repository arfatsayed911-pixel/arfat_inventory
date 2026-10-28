import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockPulse | Minimalist Inventory & Stock Management System",
  description: "Modern, responsive Inventory & Stock Management System built with Next.js, Supabase, Resend, and Tailwind CSS.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-slate-900 selection:text-white">
        {children}
      </body>
    </html>
  );
}

