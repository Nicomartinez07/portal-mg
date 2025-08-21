"use client";

import { MGDashboard } from "../../components/mg-dashboard";
import { WarrantyProvider, useWarranty } from "@/contexts/WarrantyContext";
import { WarrantyFilters } from "../../components/warranty/WarrantyFilters.tsx";
import { WarrantyTable } from "../../components/warranty/WarrantyTable";
import { getFilteredWarranties } from "./actions";

const GarantiasContent = () => {
  const { filters, setResults, setLoading, loading } = useWarranty();

  const handleSearch = async () => {
    setLoading(true);
    const data = await getFilteredWarranties(filters);
    setResults(data);
    setLoading(false);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-full p-6">
      <h1 className="text-3xl font-bold mb-6">Gestión de Garantías</h1>
      <WarrantyFilters onSearch={handleSearch} />
      {loading ? <p>Cargando...</p> : <WarrantyTable />}
    </div>
  );
};

export default function GarantiasPage() {
  return (
    <MGDashboard>
      <WarrantyProvider>
        <GarantiasContent />
      </WarrantyProvider>
    </MGDashboard>
  );
}
