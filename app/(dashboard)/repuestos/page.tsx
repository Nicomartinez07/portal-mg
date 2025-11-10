"use client";
import { useState, useEffect } from "react";
// 💡 Asegúrate de que las rutas a las actions sean correctas
import { getTalleres } from "./actions"; 
import { getCompanies } from "@/app/(dashboard)/actions/companies"; 
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

// 💡 Asegúrate de que las rutas a los nuevos componentes sean correctas
import { RepuestosProvider } from "@/contexts/PartsContext"; 
import { TalleresTable } from "@/components/parts/WorkshopsTable"; 
import { RepuestosFilters } from "@/components/parts/PartsFilters"; 
import { RepuestosTable } from "@/components/parts/PartsTable"; 
import { ImportPartForm } from "@/components/parts/ImportPartForm"; 

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
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [talleres, setTalleres] = useState<Workshop[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [talleresData, companiesData] = await Promise.all([
          getTalleres(),
          getCompanies(),
        ]);
        setTalleres(talleresData as Workshop[]);
        setCompanies(companiesData.map(c => ({ id: c.id, name: c.name })));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []); 

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  // Función para cerrar el modal de importación
  const handleCloseImportModal = () => {
    setIsImportModalOpen(false);
  };

  // Obtenemos el ID de Eximar para pasarlo al modal
  const eximarId = companies.find((c) => c.name === "Eximar MG")?.id ?? null;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm min-h-screen p-6">
        
        {/* === HEADER CON EL BOTÓN DE IMPORTACIÓN === */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Stock de Repuestos</h1>
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
    </>
  );
}