
'use client';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Home, LayoutDashboard, PlusCircle, Settings, Sword, Backpack, Zap, Shield, Skull } from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: '/', label: 'The Arena', icon: Home },
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/challenges', label: 'Quests', icon: Sword },
  { href: '/create', label: 'Forge Artifact', icon: PlusCircle },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r-4 border-black bg-zinc-950">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-600 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Skull className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-foreground uppercase italic leading-none comic-text-stroke">Affluence</h1>
            <p className="text-[10px] font-black text-red-600 tracking-[0.2em] uppercase">Dungeon Protocol</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-4 space-y-2">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className={cn(
                  "hover:bg-primary/10 transition-all py-6 rounded-none border-2 border-transparent",
                  pathname === item.href && "border-black bg-primary/20 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                )}
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5", pathname === item.href ? "text-primary" : "text-zinc-500")} />
                  <span className={cn("font-black uppercase tracking-tight text-xs", pathname === item.href ? "text-foreground" : "text-zinc-500")}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-6 space-y-4">
        <div className="p-4 bg-zinc-900 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
          <div className="halftone-bg absolute inset-0 opacity-10" />
          <div className="relative z-10">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[9px] font-black uppercase text-primary tracking-widest">Protocol Rank</span>
              <Shield className="w-3 h-3 text-primary" />
            </div>
            <p className="text-sm font-black text-foreground uppercase italic leading-none comic-text-stroke">Operator Novice</p>
          </div>
        </div>

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-none border-2 border-black bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Link href="#" className="gap-3">
                <Backpack className="w-4 h-4 text-primary" />
                <span className="text-[10px] font-black uppercase italic">Operator Vault</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="rounded-none border-2 border-black bg-zinc-900 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Link href="#" className="gap-3">
                <Settings className="w-4 h-4 text-zinc-500"/>
                <span className="text-[10px] font-black uppercase italic">System Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
