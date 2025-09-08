// app/certificados/page.tsx

"use client";

import { MGDashboard } from "@/components/mg-dashboard";
import { CertificateProvider, useCertificate } from "@/contexts/CertificateContext";
import { CertificateFilters } from "@/components/certificate/CertificateFilters";
import { CertificateTable } from "@/components/certificate/CertificateTable";
import { getCertificate } from "../certificados/actions";
import { useEffect } from "react"; 

const CertificadosContent = () => {
  const { filters, setResults, setLoading, loading } = useCertificate();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await getCertificate(filters);
      setResults(data);
    } catch (err) {
      console.error("Error al buscar certificados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
  }, [filters]); // Dependency array: run search when filters change

  return (
    <div className="bg-white rounded-lg shadow-sm h-full p-6">
      <h1 className="text-3xl font-bold mb-6">Consulta de Certificados</h1>
      <CertificateFilters onSearch={handleSearch} />
      {loading && <p>Cargando...</p>}
      {/* Render the table, which will now get its data from the context */}
      <CertificateTable />
    </div>
  );
};

export default function GarantiasPage() {
  return (
    <MGDashboard>
      <CertificateProvider>
        <CertificadosContent />
      </CertificateProvider>
    </MGDashboard>
  );
}