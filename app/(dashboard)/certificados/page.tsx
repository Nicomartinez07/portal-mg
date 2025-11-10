"use client";

import { CertificateProvider, useCertificate } from "@/contexts/CertificateContext";
import { CertificateFilters } from "@/components/certificate/CertificateFilters";
import { CertificateTable } from "@/components/certificate/CertificateTable";
import { CertificateImportModal } from "@/components/certificate/import/CertificateImportModal"; 

const CertificadosContent = () => {
    const { filters, setFilters } = useCertificate();

    const handleImportSuccess = async () => {
        setFilters({ ...filters }); 
    };

    return (
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Consulta de Certificados</h1>
                <CertificateImportModal onImportSuccess={handleImportSuccess} />
            </div>
            <CertificateFilters />
            <CertificateTable />
        </div>
    );
};

export default function CertificadosPage() { 
    return (
            <CertificateProvider>
                <CertificadosContent />
            </CertificateProvider>
    );
}