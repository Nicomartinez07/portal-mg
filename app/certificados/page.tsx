"use client";

import { MGDashboard } from "@/components/mg-dashboard";
import { CertificateProvider, useCertificate } from "@/contexts/CertificateContext";
import { CertificateFilters } from "@/components/certificate/CertificateFilters";
import { CertificateTable } from "@/components/certificate/CertificateTable";
import { getFilteredCertificates } from "../certificados/actions";

const CertificadosContent = () => {
  const { filters, setResults, setLoading, loading } = useCertificate();

  const handleSearch = async () => {
    setLoading(true);
    try {
      const data = await getFilteredCertificates(filters);
      setResults(data);
    } catch (err) {
      console.error("Error al buscar certificados:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm h-full p-6">
      <h1 className="text-3xl font-bold mb-6">Consulta de Certificados</h1>
      <CertificateFilters onSearch={handleSearch} />
      {loading ? <p>Cargando...</p> : <CertificateTable />}
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
