'use client';
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, LogIn, LogOut, PanelLeft, User as UserIcon, Github, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";

export function AppHeader() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSignIn = async (providerType: 'google' | 'github') => {
    if (!auth || !firestore) return;
    
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    
    try {
      // Trigger popup immediately to prevent browser blocking
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      setIsSyncing(true);
      const userDocRef = doc(firestore, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const batch = writeBatch(firestore);
        
        batch.set(userDocRef, {
          displayName: firebaseUser.displayName || 'Operator',
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL || '',
          createdAt: serverTimestamp(),
          level: 1,
          karma: 0,
          potions: 3,
        });

        const statsDocRef = doc(firestore, `users/${firebaseUser.uid}/dashboard/stats`);
        batch.set(statsDocRef, { 
          totalEarnings: { value: 0, change: 0 },
          totalViews: { value: 0, change: 0 },
          totalClicks: { value: 0, change: 0 },
          avgConversionRate: { value: 0, change: 0 },
        });

        await batch.commit();
      }
      
      toast({
        title: "Neural Link Established",
        description: `Welcome to the Arena, ${firebaseUser.displayName || 'Operator'}.`,
      });
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
        return;
      }
      
      if (error.code === 'auth/popup-blocked') {
        toast({
          title: "Protocol Blocked",
          description: "Please allow popups in your browser settings to establish the neural link.",
          variant: "destructive"
        });
        return;
      }
      
      console.error("Link Failure:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Establishing neural link failed.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSignOut = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error during sign-out:", error);
    }
  };

  if (!isClient || loading) {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
        <Button variant="ghost" size="icon" className="h-7 w-7 md:hidden" disabled>
            <PanelLeft />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="rounded-full" disabled>
            <Bell className="h-5 w-5" />
        </Button>
        <div className="relative h-8 w-8 rounded-full">
            <Skeleton className="h-9 w-9 rounded-full" />
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1"></div>
      {isSyncing && (
        <div className="flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 animate-pulse">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Syncing Protocol...</span>
        </div>
      )}
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9 border-2 border-black">
                <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/operator/200/200"} alt={user?.displayName ?? "Operator"} data-ai-hint="operator portrait"/>
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'O'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 comic-card bg-zinc-950" align="end" forceMount>
            {user ? (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-xs font-black uppercase tracking-widest text-primary">{user.displayName}</p>
                    <p className="text-[10px] leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />
                <DropdownMenuItem className="focus:bg-primary/20 cursor-pointer">
                  <UserIcon className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut} className="focus:bg-red-600/20 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4 text-red-600" />
                  <span className="text-[10px] font-black uppercase">Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => handleSignIn('google')} className="focus:bg-primary/20 cursor-pointer">
                  <LogIn className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase">Link via Google</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSignIn('github')} className="focus:bg-primary/20 cursor-pointer">
                  <Github className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-[10px] font-black uppercase">Link via GitHub</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
    </header>
  );
}