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
import { Home, LayoutDashboard, Trophy, PlusCircle, Settings, HelpCircle, BotMessageSquare, Sword, Backpack, Zap } from "lucide-react";

const menuItems = [
  { href: '/', label: 'The Arena', icon: Home },
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/challenges', label: 'Quests', icon: Sword },
  { href: '/create', label: 'Forge Post', icon: PlusCircle },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="border-r border-white/5">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-xl">
            <Zap className="w-6 h-6 text-primary animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tighter text-foreground uppercase">Affluence</h1>
            <p className="text-[10px] font-bold text-primary tracking-widest uppercase">Arena Beta</p>
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
                className="hover:bg-primary/10 transition-all duration-200"
              >
                <Link href={item.href} className="flex items-center gap-3 py-6">
                  <item.icon className={pathname === item.href ? "text-primary" : ""} />
                  <span className="font-bold uppercase tracking-tight text-xs">{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#" className="gap-3">
                <Backpack className="w-4 h-4" />
                <span className="text-xs font-bold uppercase">Inventory</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="#" className="gap-3">
                <Settings className="w-4 h-4"/>
                <span className="text-xs font-bold uppercase">Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
