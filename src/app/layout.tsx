
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
  title: 'Affluence Arena | Social Gaming Protocol',
  description: 'Forge legendary artifacts, complete quests, and climb the leaderboards in the ultimate social competition.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${ibmPlexSans.variable} font-body antialiased selection:bg-primary selection:text-primary-foreground`}>
        <FirebaseClientProvider>
          <SidebarProvider>
            <div className="flex min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background">
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
