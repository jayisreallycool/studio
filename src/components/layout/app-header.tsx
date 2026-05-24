'use client';
import { useEffect, useState } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Bell, LogIn, LogOut, PanelLeft, User as UserIcon, Github } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth, useUser, useFirestore } from "@/firebase";
import { GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useToast } from "@/hooks/use-toast";


export function AppHeader() {
  const { user, loading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleSignIn = async (providerType: 'google' | 'github') => {
    if (!auth || !firestore) return;
    const provider = providerType === 'google' ? new GoogleAuthProvider() : new GithubAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user document exists, if not create it along with dashboard data
      const userDocRef = doc(firestore, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        const newUserProfile = {
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          createdAt: serverTimestamp(),
          level: 1,
          karma: 0,
        };

        const statsDocRef = doc(firestore, `users/${user.uid}/dashboard/stats`);
        const earningsDocRef = doc(firestore, `users/${user.uid}/dashboard/earnings`);
        const postsDocRef = doc(firestore, `users/${user.uid}/dashboard/posts`);
        
        // Use a batch write for atomicity
        const batch = writeBatch(firestore);
        
        batch.set(userDocRef, newUserProfile);
        batch.set(statsDocRef, { 
          totalEarnings: { value: 0, change: 0 },
          totalViews: { value: 0, change: 0 },
          totalClicks: { value: 0, change: 0 },
          avgConversionRate: { value: 0, change: 0 },
        });
        batch.set(earningsDocRef, { data: [] });
        batch.set(postsDocRef, { data: [] });
        
        await batch.commit();
      }
    } catch (error: any) {
      if (error.code === 'auth/popup-closed-by-user') {
        return;
      }
      console.error("Error during sign-in:", error);
      toast({
        title: "Connection Failed",
        description: error.message || "Establishing neural link failed.",
        variant: "destructive"
      });
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
        <Button variant="ghost" className="relative h-8 w-8 rounded-full" disabled>
            <Skeleton className="h-9 w-9 rounded-full" />
        </Button>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur-sm px-4 md:px-6">
      <SidebarTrigger className="md:hidden" />
      <div className="flex-1">
        {/* Search can be implemented here */}
      </div>
      <Button variant="ghost" size="icon" className="rounded-full">
        <Bell className="h-5 w-5" />
        <span className="sr-only">Notifications</span>
      </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                <AvatarImage src={user?.photoURL ?? "https://picsum.photos/seed/operator/200/200"} alt={user?.displayName ?? "Affiliate User"} data-ai-hint="operator portrait"/>
                <AvatarFallback>{user?.displayName?.charAt(0) ?? 'A'}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            {user ? (
              <>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </>
            ) : (
              <>
                <DropdownMenuItem onClick={() => handleSignIn('google')}>
                  <LogIn className="mr-2 h-4 w-4" />
                  <span>Sign in with Google</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSignIn('github')}>
                  <Github className="mr-2 h-4 w-4" />
                  <span>Sign in with GitHub</span>
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
    </header>
  );
}