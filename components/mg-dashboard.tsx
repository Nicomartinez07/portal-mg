"use client";

import type React from "react";

import {
  Home,
  Shield,
  List,
  ShoppingCart,
  Settings,
  Building2,
  Award,
  Wrench,
  DollarSign,
  FileText,
  LogOut,
  User,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
const navigationItems = [
  { name: "Inicio", icon: Home, href: "/" },
  { name: "Garantías", icon: Shield, href: "/garantias" },
  { name: "Listado", icon: List, href: "/garantias" },
  { name: "Ordenes", icon: ShoppingCart, href: "/ordenes" },
  { name: "Listado", icon: List, href: "/ordenes" },
  { name: "Configuración", icon: Settings, href: "/configuracion" },
  { name: "General", icon: Settings, href: "/general" },
  { name: "Empresas", icon: Building2, href: "/empresas" },
  { name: "Certificados", icon: Award, href: "/certificados" },
  { name: "Repuestos", icon: Wrench, href: "/repuestos" },
  // descarga un archivo PDF que esté en /public/archivos/tarifario.pdf
  {
    name: "Tarifario",
    icon: DollarSign,
    href: "/archivos/tarifario.pdf", // Debe estar en /public/archivos/
    download: true,
  },
  // link externo a Google Drive
  {
    name: "Info Técnica",
    icon: FileText,
    href: "https://drive.google.com/drive/folders/1unjLakNYCpBBbOorUzeuMp0N5jAs1qSt",
    external: true,
  },
  { name: "Login", icon: User, href: "/login" },
];

const highlightedItems = ["Inicio", "Garantías", "Ordenes", "Configuración"];

function AppSidebar() {
  return (
    <Sidebar className="bg-[#424f63] text-white border-r-0">
      <SidebarHeader className="border-b  bg-[#424f63] border-slate-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">MG</span>
          </div>
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">
            MG
          </span>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#424f63]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={`${item.name}-${index}`}>
                    <SidebarMenuButton
                      asChild
                      className={`text-white border-b border-slate-600 rounded-none h-12 justify-start
    ${
      highlightedItems.includes(item.name)
        ? "bg-[#424f63] hover:bg-[#505f78]"
        : "hover:bg-slate-600"
    }`}
                    >
                      {item.external ? (
                        //Enlace externo
                        <a
                          href={item.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.name}</span>
                        </a>
                      ) : item.download ? (
                        //Enlace de descarga
                        <a
                          href={item.href}
                          download
                          className="flex items-center gap-3"
                        >
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.name}</span>
                        </a>
                      ) : (
                        //Enlace interno
                        <a href={item.href} className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.name}</span>
                        </a>
                      )}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="text-white bg-[#424f63] hover:bg-[#505f78] rounded-none h-12 justify-start">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="text-white hover:bg-slate-600 rounded-none h-12 justify-start"
            >
              <a href="/salir" className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Salir</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

interface MGDashboardProps {
  children?: React.ReactNode;
  defaultOpen?: boolean;
}
export function MGDashboard({
  children,
  defaultOpen = true,
}: MGDashboardProps) {
  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="text-slate-700" />
            <div className="flex-1" />
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-5 h-5" />
              <span>Usuario</span>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-100">
            {children || (
              <div className="bg-white rounded-lg shadow-sm h-full p-6">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-semibold mb-2">
                      Panel de Control MG
                    </h2>
                    <p>Selecciona una opción del menú para comenzar</p>
                  </div>
                </div>
              </div>
            )}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
