import type { Metadata } from 'next';
import './globals.css';
import { IBM_Plex_Sans } from 'next/font/google';
import { Toaster } from "@/components/ui/toaster";
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { FirebaseClientProvider } from '@/firebase';

const ibmPlexSans = IBM_Plex_Sans({ 
  subsets: ['latin'],
  weight: ["400", "500", "600", "700"],
  variable: '--font-body' 
});

export const metadata: Metadata = {
  title: 'Affluence Arena',
  description: 'A gamified social content platform designed for users to earn money through SEO and affiliate marketing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className={`${ibmPlexSans.variable} font-body antialiased`}>
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <div className="flex-1 flex flex-col">
                <AppHeader />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-auto">
                  {children}
                </main>
              </div>
            </div>
          </SidebarProvider>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
