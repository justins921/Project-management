import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Solo Agency OS",
  description: "The operating system for solo agency owners and freelance teams",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="min-h-full bg-background font-sans">
        {children}
      </body>
    </html>
  );
}
