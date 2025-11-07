
// @ts-nocheck
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { LayoutDashboard, Send, BarChart3, Zap, MessageCircle, Wrench, Shield, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import ChatSupport from "@/components/ChatSupport";
import { useAuth } from "@/lib/AuthContext";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Campanhas",
    url: createPageUrl("Campanhas"),
    icon: Send,
  },
  {
    title: "Automações",
    url: createPageUrl("Automacoes"),
    icon: Zap,
  },
  {
    title: "Nova Campanha",
    url: createPageUrl("NovaCampanha"),
    icon: Zap,
  },
  {
    title: "Inbox",
    url: createPageUrl("Inbox"),
    icon: MessageCircle,
  },
  {
    title: "Omnicanal",
    url: createPageUrl("Omnicanal"),
    icon: BarChart3,
  },
  {
    title: "Relatórios",
    url: createPageUrl("Relatorios"),
    icon: BarChart3,
  },
  {
    title: "Faturamento",
    url: createPageUrl("Faturamento"),
    icon: BarChart3,
  },
  {
    title: "Ferramentas",
    url: createPageUrl("Ferramentas"),
    icon: Wrench,
  },
  {
    title: "Admin",
    url: createPageUrl("Admin"),
    icon: Shield,
  },
  {
    title: "Análises",
    url: createPageUrl("Analises"),
    icon: BarChart3,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { user, logout } = useAuth();

  const displayName = user?.username || user?.name || user?.email || "Usuário";
  const displayEmail = user?.email || user?.type || "Administrador";

  return (
    <SidebarProvider>
      <style>{`
        :root {
          --primary: #0F172A;
          --primary-light: #1E293B;
          --accent: #06B6D4;
          --accent-purple: #8B5CF6;
          --success: #10B981;
          --warning: #F59E0B;
          --danger: #EF4444;
        }
      `}</style>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-50 via-white to-cyan-50">
        <Sidebar className="border-r border-slate-200/60 backdrop-blur-xl bg-white/80">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69015e3875e36824538e7d64/af6022d55_Printpostlogo.png" 
                alt="Print Post Logo"
                className="w-10 h-10 object-contain"
              />
              <div>
                <h2 className="font-bold text-slate-900 text-lg tracking-tight">Print Post</h2>
                <p className="text-xs text-slate-500 font-medium">Conexões sem limites</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="p-3">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`hover:bg-gradient-to-r hover:from-cyan-50 hover:to-purple-50 hover:text-slate-900 transition-all duration-300 rounded-xl mb-1 group ${
                          location.pathname === item.url ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/30' : ''
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3 px-4 py-3">
                          <item.icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                            location.pathname === item.url ? '' : 'text-slate-500'
                          }`} />
                          <span className="font-semibold text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4">
            <div className="flex items-center gap-3 px-2">
              <div className="w-9 h-9 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                <span className="text-slate-700 font-bold text-sm">
                  {(displayName || "U").charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 text-sm truncate">{displayName}</p>
                <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
              </div>
              <Button
                size="icon"
                variant="ghost"
                onClick={logout}
                className="text-slate-500 hover:text-slate-900"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-6 py-4 md:hidden sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-lg font-bold text-slate-900">Print Post</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>

        {/* Chat de Suporte Fixo */}
        <ChatSupport />
      </div>
    </SidebarProvider>
  );
}
