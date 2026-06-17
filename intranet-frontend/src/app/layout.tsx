import { ThemeProvider } from '@/components/ThemeProvider';
import { AccessControlProvider } from '@/contexts/AccessControlContext';
import { QueryProvider } from '@/app/providers/QueryProvider';
import { SessionProvider } from '@/app/providers/SessionProvider';
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Intranet Corporativa',
  description: 'Sistema de intranet corporativa desenvolvido com Next.js e Material UI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          <QueryProvider>
            <AccessControlProvider>
              <ThemeProvider>{children}</ThemeProvider>
            </AccessControlProvider>
          </QueryProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
