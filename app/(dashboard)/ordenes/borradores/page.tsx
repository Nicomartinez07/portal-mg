"use client";
import { DraftTable } from "@/components/orders/drafts/DraftsTable";
import { DraftFilters } from "@/components/orders/drafts/DraftsFilters";
import { DraftProvider, useDraft } from "@/contexts/DraftContext";
import { getDraftOrders } from "./actions";
import { useEffect } from "react";

const DraftsContent = () => {
  const { 
    filters, 
    setResults, 
    setLoading, 
    currentPage, 
    setTotalDrafts,
  } = useDraft();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const result = await getDraftOrders({
        filters,
        page: currentPage,
        pageSize: 25
      });
      
      setResults(result.data ?? []);
      setTotalDrafts(result.total ?? 0);
    } catch (err) {
      console.error("Error al buscar borradores:", err);
      setResults([]);
      setTotalDrafts(0);
    } finally {
      setLoading(false);
    }
  };

  // Búsqueda inicial al cargar la página (sin filtros)
  useEffect(() => {
    handleSearch();
  }, []); 

  // Búsqueda cuando cambia la página O LOS FILTROS
  useEffect(() => {
    handleSearch();
  }, [currentPage, filters]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Listado de borradores de órdenes</h1>
      {/* Ya no pasamos onSearch, no hace falta */}
      <DraftFilters /> 
      <DraftTable />
    </div>
  );
};

export default function OrdersDraftsPage() {
  return (
    <DraftProvider>
      <DraftsContent />
    </DraftProvider>
  );
}