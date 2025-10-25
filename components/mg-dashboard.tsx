"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { VehicleModal } from "@/components/vehiculos/vehicle-modal";
import { ActivationModal } from "@/components/warranty/modal/WarrantyActivation";
import InsertPreAuthorizationModal from "@/components/orders/modals/InsertPreAuthorizationModal";
import InsertClaimModal from "@/components/orders/modals/InsertClaimModal";
import InsertServiceModal from "@/components/orders/modals/InsertServiceModal";
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
  Car,
  User,
  Star,
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

// Configuración de las rutas de navegación
const navigationItems = [
  { name: "Inicio", icon: Home, href: "/" },
  { name: "Garantías", icon: Shield, href: "/garantias" },
  { name: "Activar Garantia", icon: Shield, modal: "warranty", color: "text-yellow-500", fill: "yellow" },
  { name: "Ordenes", icon: ShoppingCart, href: "/ordenes" },
  { name: "Borradores", icon: ShoppingCart, href: "/ordenes/borradores" },
  { name: "Pre-autorización", icon: Star, modal: "insertPreAuthorization", color: "text-yellow-500", fill: "yellow" },
  { name: "Reclamo", icon: Star, modal: "insertClaim", color: "text-yellow-500", fill: "yellow" },
  { name: "Servicio", icon: Star, modal: "insertService", color: "text-yellow-500", fill: "yellow" },
  { name: "General", icon: Settings, href: "/general" },
  { name: "Empresas", icon: Building2, href: "/empresas" },
  { name: "Certificados", icon: Award, href: "/certificados" },
  { name: "Repuestos", icon: Wrench, href: "/repuestos" },
  { name: "Tarifario", icon: DollarSign, href: "/archivos/tarifario.xlsx", download: true },
  { name: "Info Técnica", icon: FileText, href: "https://drive.google.com/drive/folders/1unjLakNYCpBBbOorUzeuMp0N5jAs1qSt", external: true },
  { name: "Cargar Auto", icon: Car, modal: "vehicle", color: "text-yellow-500", fill: "yellow" },
];

// Rutas visibles según rol
const roleAccess: Record<string, string[]> = {
  ADMIN: navigationItems.map((i) => i.name), // todo
  IMPORTER: ["Inicio", "Garantías", "Ordenes", "General", "Empresas", "Certificados", "Repuestos", "Tarifario", "Info Técnica"],
  DEALER: ["Inicio", "Garantías", "Activar Garantia", "Repuestos", "Tarifario", "Info Técnica"],
  WORKSHOP: ["Inicio", "Ordenes", "Borradores", "Servicio", "Pre-autorización", "Reclamo",  "Repuestos", "Tarifario", "Info Técnica"],
};
type MGDashboardProps = {
  children?: React.ReactNode;
  defaultOpen?: boolean;
};

function AppSidebar({
  onOpenVehicleModal,
  onOpenWarrantyModal,
  onOpenInsertPreAuthorizationModal,
  onOpenInsertClaimModal,
  onOpenInsertServiceModal,
  role,
}: {
  onOpenVehicleModal: () => void;
  onOpenWarrantyModal: () => void;
  onOpenInsertPreAuthorizationModal: () => void;
  onOpenInsertClaimModal: () => void;
  onOpenInsertServiceModal: () => void;
  role: string;
}) {
  const router = useRouter();

  // Filtrar items según rol
  const allowedItems =
    roleAccess[role?.toUpperCase()] || ["Inicio"]; // fallback si no hay rol

  const filteredItems = navigationItems.filter((item) =>
    allowedItems.includes(item.name)
  );

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  return (
    <Sidebar className="bg-[#424f63] text-white border-r-0">
      <SidebarHeader className="border-b bg-[#424f63] border-slate-600 p-4">
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
              {filteredItems.map((item, index) => {
                const Icon = item.icon;

                // --- tus botones modales y condicionales intactos ---
                if (item.modal === "vehicle") {
                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton
                        asChild
                        className="text-white border-b border-slate-600 rounded-none h-12 justify-start hover:bg-slate-600"
                      >
                        <button onClick={onOpenVehicleModal} className="flex items-center gap-3 w-full text-left">
                          <Icon className={`w-5 h-5 ${item.color || "text-white"}`} fill={item.fill ? "currentColor" : "none"} />
                          <span className="text-sm">{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                if (item.modal === "warranty") {
                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild className="text-white border-b border-slate-600 rounded-none h-12 justify-start hover:bg-slate-600">
                        <button onClick={onOpenWarrantyModal} className="flex items-center gap-3 w-full text-left">
                          <Icon className={`w-5 h-5 ${item.color || "text-white"}`} fill={item.fill ? "currentColor" : "none"} />
                          <span className="text-sm">{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                if (item.modal === "insertPreAuthorization") {
                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild className="text-white border-b border-slate-600 rounded-none h-12 justify-start hover:bg-slate-600">
                        <button onClick={onOpenInsertPreAuthorizationModal} className="flex items-center gap-3 w-full text-left">
                          <Icon className={`w-5 h-5 ${item.color || "text-white"}`} fill={item.fill ? "currentColor" : "none"} />
                          <span className="text-sm">{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                if (item.modal === "insertClaim") {
                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild className="text-white border-b border-slate-600 rounded-none h-12 justify-start hover:bg-slate-600">
                        <button onClick={onOpenInsertClaimModal} className="flex items-center gap-3 w-full text-left">
                          <Icon className={`w-5 h-5 ${item.color || "text-white"}`} fill={item.fill ? "currentColor" : "none"} />
                          <span className="text-sm">{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                if (item.modal === "insertService") {
                  return (
                    <SidebarMenuItem key={index}>
                      <SidebarMenuButton asChild className="text-white border-b border-slate-600 rounded-none h-12 justify-start hover:bg-slate-600">
                        <button onClick={onOpenInsertServiceModal} className="flex items-center gap-3 w-full text-left">
                          <Icon className={`w-5 h-5 ${item.color || "text-white"}`} fill={item.fill ? "currentColor" : "none"} />
                          <span className="text-sm">{item.name}</span>
                        </button>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                }

                // --- enlaces normales ---
                return (
                  <SidebarMenuItem key={index}>
                    <SidebarMenuButton asChild className="text-white border-b border-slate-600 rounded-none h-12 justify-start hover:bg-slate-600">
                      <a href={item.href} target={item.external ? "_blank" : "_self"} download={item.download}>
                        <div className="flex items-center gap-3">
                          <Icon className="w-5 h-5" />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}

              <SidebarMenuButton asChild onClick={handleLogout} className="text-white hover:bg-slate-600 rounded-none h-12 justify-start">
                <button className="flex items-center gap-3">
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm">Salir</span>
                </button>
              </SidebarMenuButton>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

export function MGDashboard({ children, defaultOpen = true }: MGDashboardProps) {
  const [vin, setVin] = useState("");
  const [username, setUsername] = useState("Cargando...");
  const [role, setRole] = useState(""); // 👈 nuevo
  const [openVehicleModal, setOpenVehicleModal] = useState(false);
  const [openWarrantyModal, setOpenWarrantyModal] = useState(false);
  const [openInsertPreAuthorizationModal, setOpenInsertPreAuthorizationModal] = useState(false);
  const [openInsertClaimModal, setOpenInsertClaimModal] = useState(false);
  const [openInsertServiceModal, setOpenInsertServiceModal] = useState(false);

  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/logout");
    router.push("/login");
  };

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", { method: "GET", credentials: "include" });
        if (!res.ok) throw new Error("No autorizado");

        const data = await res.json();
        setUsername(data.username);
        setRole(data.role); 
      } catch {
        setUsername("Usuario");
      }
    }
    fetchUser();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && vin.trim() !== "") {
      router.push(`/buscador/${vin.trim()}`);
    }
  };

  return (
    <SidebarProvider defaultOpen={defaultOpen}>
      <div className="flex h-screen w-full">
        <AppSidebar
          role={role}
          onOpenVehicleModal={() => setOpenVehicleModal(true)}
          onOpenWarrantyModal={() => setOpenWarrantyModal(true)}
          onOpenInsertPreAuthorizationModal={() => setOpenInsertPreAuthorizationModal(true)}
          onOpenInsertClaimModal={() => setOpenInsertClaimModal(true)}
          onOpenInsertServiceModal={() => setOpenInsertServiceModal(true)}
        />

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

        {/* Modal para cargar vehículo */}
        <VehicleModal
          open={openVehicleModal}
          onClose={() => setOpenVehicleModal(false)}
        />

        {/* Modal para activar garantía */}
        <ActivationModal
          open={openWarrantyModal}
          onClose={() => setOpenWarrantyModal(false)}
        />
        {/* Modal para pre-autorización */}
        <InsertPreAuthorizationModal
          open={openInsertPreAuthorizationModal}
          onClose={() => setOpenInsertPreAuthorizationModal(false)}
        />
        <InsertClaimModal
          open={openInsertClaimModal}
          onClose={() => setOpenInsertClaimModal(false)}
        />
        {/* Modal para pre-autorización */}
        <InsertServiceModal
          open={openInsertServiceModal}
          onClose={() => setOpenInsertServiceModal(false)}
        />
      </div>
    </SidebarProvider>
  );
}
