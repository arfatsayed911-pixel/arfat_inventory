import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arfat Inventory",
  description: "Minimalist Inventory & Stock Management System.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 font-sans selection:bg-slate-900 selection:text-white"
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  );
}
