// contexts/CertificateContext.ts
"use client";
import { createContext, useContext, useState } from "react";

export type CertificateFilters = {
  fromDate?: string;
  toDate?: string;
  vin?: string;
  model?: string;
  certificateNumber?: string;
  importDateFrom?: string;
  importDateTo?: string;
  combinacion?: "AMBOS" | "NRO_CERTIFICADO" | "F_IMPORTACION" | "NINGUNO";
  garantia?: "ACTIVA" | "NO_ACTIVA" | null;
  blocked?: "BLOQUEADO" | "NO_BLOQUEADO" | null;
};

type CertificateContextType = {
  filters: CertificateFilters;
  setFilters: (f: CertificateFilters) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalCertificates: number;
  setTotalCertificates: (total: number) => void;
};

const CertificateContext = createContext<CertificateContextType | null>(null);

export const CertificateProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<CertificateFilters>({
    fromDate: undefined,
    toDate: undefined,
    vin: undefined,
    model: undefined,
    certificateNumber: undefined,
    importDateFrom: undefined,
    importDateTo: undefined,
    combinacion: undefined,
    blocked: null,
    garantia: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCertificates, setTotalCertificates] = useState(0);


  const handleSetFilters = (newFilters: CertificateFilters) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  return (
    <CertificateContext.Provider
      value={{
        filters,
        setFilters: handleSetFilters, 
        currentPage,
        setCurrentPage,
        totalCertificates,
        setTotalCertificates,
      }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificate = () => {
  const ctx = useContext(CertificateContext);
  if (!ctx)
    throw new Error(
      "useCertificate debe usarse dentro de CertificateProvider"
    );
  return ctx;
};