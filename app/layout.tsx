import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from 'sonner';

const appName = process.env.NEXT_PUBLIC_APP_NAME || "SaaS Boilerplate";

export const metadata: Metadata = {
  title: appName,
  description: "A Next.js app with Supabase authentication and Stripe payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
