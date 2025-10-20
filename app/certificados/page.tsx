"use client";

import { MGDashboard } from "@/components/mg-dashboard";
import { CertificateProvider, useCertificate } from "@/contexts/CertificateContext";
import { CertificateFilters } from "@/components/certificate/CertificateFilters";
import { CertificateTable } from "@/components/certificate/CertificateTable";
// 🚨 Importamos el componente de Modal de Importación
import { CertificateImportModal } from "@/components/certificate/import/CertificateImportModal"; // Ajusta la ruta si es necesario
import { getCertificate } from "../certificados/actions";
const CertificadosContent = () => {
    const { filters, setResults, setLoading, loading } = useCertificate();

    const handleImportSuccess = async () => {
        console.log("Importación OK. Refrescando tabla...");
        setLoading(true);
        try {
            const data = await getCertificate(filters);
            setResults(data);
        } catch (err) {
            console.error("Error al refrescar certificados:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm h-full p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Consulta de Certificados</h1>
                <CertificateImportModal onImportSuccess={handleImportSuccess} />
            </div>
            <CertificateFilters />
            {loading && <p>Cargando...</p>}
            <CertificateTable />
        </div>
    );
};

export default function CertificadosPage() { 
    return (
        <MGDashboard>
            <CertificateProvider>
                <CertificadosContent />
            </CertificateProvider>
        </MGDashboard>
    );
}