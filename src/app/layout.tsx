import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "ProjectHub — Agency Management",
  description: "Project management SaaS for digital agencies",
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
        <Sidebar />
        {/* pt-14 on mobile for the fixed mobile header, lg:pt-0 + lg:ml-64 for desktop sidebar */}
        <main className="pt-14 lg:pt-0 lg:ml-64 min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8">{children}</div>
        </main>
      </body>
    </html>
  );
}
