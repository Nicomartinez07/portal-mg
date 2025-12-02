// app/(dashboard)/repuestos/page.tsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getTalleres } from "./actions";
import { getCompanies } from "@/app/(dashboard)/actions/companies"; 
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import { RepuestosProvider } from "@/contexts/PartsContext"; 
import { TalleresTable } from "@/components/parts/WorkshopsTable"; 
import { RepuestosFilters } from "@/components/parts/PartsFilters"; 
import { RepuestosTable } from "@/components/parts/PartsTable"; 
import { ImportPartForm } from "@/components/parts/ImportPartForm"; 
import { DeletePartForm } from "@/components/parts/DeletePartForm";

// === TIPOS ===
interface Workshop {
    id: number;
    name: string;
    manager: string | null;
    managerEmail: string | null; 
    address: string;
    state: string;
    city: string | null;
    phone1: string | null;
    email: string | null; 
}
interface Company { 
    id: number; 
    name: string;
}
// =============

export default function RepuestosPage() {
  const router = useRouter();
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [talleres, setTalleres] = useState<Workshop[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("Usuario");

  // 💡 Lógica para determinar si es importador
  const isImporter = userRole === 'IMPORTER';

  // --- Efecto para cargar datos del usuario ---
  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("/api/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) {
          // Si no está autorizado, lo mandamos al login
          router.push("/login");
          return;
        }

        const data = await res.json();
        setUsername(data.username);
        setRole(data.role);
      } catch {
        // Si hay cualquier error, al login
        setUsername("Usuario");
        router.push("/login");
      }
    }
    fetchUser();
  }, [router]);

  // --- Efecto para cargar datos de la página ---
  useEffect(() => {
    async function loadPageData() {
      if (!userRole) return; // Esperamos a tener el rol del usuario

      try {
        const [talleresData, companiesData] = await Promise.all([
          getTalleres(),
          getCompanies(),
        ]);
        
        setTalleres(talleresData as Workshop[]);
        setCompanies(companiesData.map(c => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error("Error loading page data:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadPageData();
  }, [userRole]); // Se ejecuta cuando userRole cambia

  // Función auxiliar para setRole (ya que usas setRole en fetchUser pero no está declarado)
  const setRole = (role: string) => {
    setUserRole(role);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6 flex items-center justify-center">
        <p>Cargando datos y verificando permisos...</p>
      </div>
    );
  }

  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };
  
  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const eximarId = companies.find((c) => c.name === "Eximar MG")?.id ?? null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        
        {/* === HEADER CON LOS BOTONES === */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Stock de Repuestos</h1>
          </div>
          <div className="flex gap-4">
            
            {/* 💡 BOTÓN DE BORRADO - SÓLO VISIBLE SI ES IMPORTADOR */}
            {isImporter && (
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 1.989a1.5 1.5 0 00-1.023-.746H6.843c-.477 0-.931.29-1.093.746L4.256 6.556c-.058.158-.112.317-.165.476L12 18l7.567-11.411z" />
                    </svg>
                    Borrar Repuestos
                </button>
            )}

            {/* BOTÓN DE IMPORTACIÓN (EXISTENTE) */}
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l6-6m-6 6l-6-6M9 10h6" />
              </svg>
              Importar Stock
            </button>
          </div>
        </div>
        
        <Tabs defaultValue="talleres" className="w-full">
          <TabsList>
            <TabsTrigger value="talleres">Datos de Talleres</TabsTrigger>
            <TabsTrigger value="repuestos">Listado de Repuestos</TabsTrigger>
          </TabsList>

          {/* TAB DE TALLERES */}
          <TabsContent value="talleres">
            <TalleresTable talleres={talleres} />
          </TabsContent>

          {/* TAB DE REPUESTOS */}
          <TabsContent value="repuestos">
            <RepuestosProvider>
              <RepuestosFilters companies={companies} />
              <RepuestosTable />
            </RepuestosProvider>
          </TabsContent>
        </Tabs>
      </div>

      {/* === MODAL DE IMPORTACIÓN === */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center bg-black/50 z-[60]">
          <ImportPartForm
            companies={companies}
            onClose={handleCloseImportModal}
            eximarId={eximarId}
          />
        </div>
      )}
      
      {/* === MODAL DE BORRADO === */}
      {isDeleteModalOpen && isImporter && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center bg-black/50 z-[60]">
          <DeletePartForm
            companies={companies}
            onClose={handleCloseDeleteModal}
          />
        </div>
      )}
    </>
  );
}