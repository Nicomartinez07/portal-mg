"use client";

import { MGDashboard } from "@/components/mg-dashboard";
import { CertificateProvider, useCertificate } from "@/contexts/CertificateContext";
import { CertificateFilters } from "@/components/certificate/CertificateFilters";
import { CertificateTable } from "@/components/certificate/CertificateTable";
// 🚨 Importamos el componente de Modal de Importación
import { CertificateImportModal } from "@/components/certificate/import/CertificateImportModal"; // Ajusta la ruta si es necesario
import { getCertificate } from "../certificados/actions";
import { useEffect } from "react"; 

const CertificadosContent = () => {
    const { filters, setResults, setLoading, loading } = useCertificate();

    const handleSearch = async () => {
        setLoading(true);
        try {
            // Lógica para obtener los certificados (Garantías + Vehicle)
            const data = await getCertificate(filters);
            setResults(data);
        } catch (err) {
            console.error("Error al buscar certificados:", err);
        } finally {
            setLoading(false);
        }
    };

    // Función que se llama cuando la importación termina exitosamente
    const handleImportSuccess = () => {
        // Ejecutamos la búsqueda para refrescar la tabla con los datos recién importados/actualizados
        handleSearch();
    };

    useEffect(() => {
        handleSearch();
    }, [filters]); 

    return (
        <div className="bg-white rounded-lg shadow-sm h-full p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Consulta de Certificados</h1>
                <CertificateImportModal onImportSuccess={handleImportSuccess} />
            </div>
            <CertificateFilters onSearch={handleSearch} />
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