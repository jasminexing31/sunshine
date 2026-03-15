import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { JetBrains_Mono } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Sunshine Snow School — Scheduler',
  description: 'Banff Sunshine Village Snow School Scheduling System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-navy-900 text-white min-h-screen">
        <Nav />
        <main className="pt-16 min-h-screen">{children}</main>
      </body>
    </html>
  );
}
