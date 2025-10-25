"use client";

import { WarrantyProvider, useWarranty } from "@/contexts/WarrantyContext";
import { WarrantyFilters } from "@/components/warranty/WarrantyFilters";
import { WarrantyTable } from "@/components/warranty/WarrantyTable";
import { ExportButton } from "@/components/warranty/export/ExportButton";
import { getFilteredWarranties } from "./actions";

const GarantiasContent = () => {
  const { filters, setResults, setLoading, loading } = useWarranty();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await getFilteredWarranties(filters);
      setResults(data);
    } catch (err) {
      console.error("Error al buscar garantías:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
            <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Gestión de Garantias</h1>
                <ExportButton /> 
            </div>
            <WarrantyFilters onSearch={handleSearch} />
            {loading ? <p>Cargando...</p> : <WarrantyTable />}
        </div>
  );
};

export default function GarantiasPage() {
  return (
      <WarrantyProvider>
        <GarantiasContent />
      </WarrantyProvider>
  );
}
