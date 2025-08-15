"use client";

import type React from "react";
import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";

import {
  Home,
  Shield,
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

import { Menu, Transition } from "@headlessui/react";

const navigationItems = [
  { name: "Inicio", icon: Home, href: "/" },
  { name: "Garantías", icon: Shield, href: "/garantias" },
  { name: "Ordenes", icon: ShoppingCart, href: "/ordenes" },
  { name: "General", icon: Settings, href: "/general" },
  { name: "Empresas", icon: Building2, href: "/empresas" },
  { name: "Certificados", icon: Award, href: "/certificados" },
  { name: "Repuestos", icon: Wrench, href: "/repuestos" },
  { name: "Tarifario", icon: DollarSign, href: "/archivos/tarifario.pdf", download: true },
  { name: "Info Técnica", icon: FileText, href: "https://drive.google.com/drive/folders/1unjLakNYCpBBbOorUzeuMp0N5jAs1qSt", external: true },
];

const highlightedItems = ["Inicio", "Garantías", "Ordenes", "Configuración"];

function AppSidebar() {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  return (
    <Sidebar className="bg-[#424f63] text-white border-r-0">
      <SidebarHeader className="border-b  bg-[#424f63] border-slate-600 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-lg">MG</span>
          </div>
          <span className="text-xl font-semibold group-data-[collapsible=icon]:hidden">MG</span>
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
                      className={`text-white border-b border-slate-600 rounded-none h-12 justify-start ${
                        highlightedItems.includes(item.name)
                          ? "bg-[#424f63] hover:bg-[#505f78]"
                          : "hover:bg-slate-600"
                      }`}
                    >
                      {item.external ? (
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
                        <a href={item.href} download className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.name}</span>
                        </a>
                      ) : (
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
              onClick={handleLogout}
              className="text-white hover:bg-slate-600 rounded-none h-12 justify-start"
            >
              <button className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-sm">Salir</span>
              </button>
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

export function MGDashboard({ children, defaultOpen = true }: MGDashboardProps) {
  const [vin, setVin] = useState("");
  const [username, setUsername] = useState("Usuario");
  const router = useRouter();

  // Traer username del backend
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          setUsername(data.username);
        }
      } catch (err) {
        console.error(err);
      }
    }
    fetchUser();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && vin.trim() !== "") {
      router.push(`/buscador/${vin.trim()}`);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar />

        <SidebarInset className="flex flex-col flex-1 min-h-0">
          {/* Header */}
          <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-white px-4">
            <SidebarTrigger className="text-slate-700" />

            {/* Buscador */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar vehiculo por VIN"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-70 rounded-md border border-gray-300 bg-gray-50 px-3 py-1 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1" />

            {/* Usuario desplegable */}
            <Menu as="div" className="relative ml-4">
              <Menu.Button className="flex items-center gap-2 text-gray-600 focus:outline-none">
                <User className="w-5 h-5" />
                <span>{username}</span>
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-40 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          onClick={() => router.push("/perfil")}
                        >
                          Mi Cuenta
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`${
                            active ? "bg-gray-100" : ""
                          } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                          onClick={handleLogout}
                        >
                          <LogOut className="inline w-4 h-4 mr-2" />
                          Salir
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-6 bg-gray-100">
            {children || (
              <div className="bg-white rounded-lg shadow-sm h-full p-6">
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📊</div>
                    <h2 className="text-2xl font-semibold mb-2">Panel de Control MG</h2>
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
