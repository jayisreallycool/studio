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
import { Home, LayoutDashboard, Trophy, PlusCircle, Settings, HelpCircle, BotMessageSquare, Sword, Backpack, Zap, Shield } from "lucide-react";

const menuItems = [
  { href: '/', label: 'The Arena', icon: Home },
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/challenges', label: 'Quests', icon: Sword },
  { href: '/create', label: 'Forge Post', icon: PlusCircle },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-white/5 bg-black/40 backdrop-blur-xl">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl border border-primary/30 shadow-[0_0_15px_rgba(34,197,94,0.3)]">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-foreground uppercase italic leading-none">Affluence</h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Arena Protocol</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2 mt-4">
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.href}
                className="hover:bg-primary/10 transition-all duration-200 py-6"
              >
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className={cn("w-5 h-5 transition-colors", pathname === item.href ? "text-primary drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]" : "text-muted-foreground")} />
                  <span className={cn("font-black uppercase tracking-tight text-[11px]", pathname === item.href ? "text-foreground" : "text-muted-foreground")}>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-2">
        <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase text-accent tracking-widest">Rank</span>
            <Shield className="w-3 h-3 text-accent" />
          </div>
          <p className="text-[10px] font-bold text-foreground">Operator Novice</p>
        </div>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#" className="gap-3">
                <Backpack className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-tighter">Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#" className="gap-3">
                <Settings className="w-4 h-4 text-muted-foreground"/>
                <span className="text-xs font-bold uppercase tracking-tighter">Protocol</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
