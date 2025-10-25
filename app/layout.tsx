import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stream Project",
  description: "A Next.js app with Supabase authentication and Stripe payments",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
