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
  results: any[];
  setResults: (r: any[]) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
};

const CertificateContext = createContext<CertificateContextType | null>(null);

export const CertificateProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<CertificateFilters>({
    fromDate: undefined, // undefined es mejor que ""
    toDate: undefined,
    vin: undefined,
    model: undefined,
    certificateNumber: undefined,
    importDateFrom: undefined,
    importDateTo: undefined,
    combinacion: undefined,
    blocked: null, // <-- Inicializar con null para evitar el string ""
    garantia: null, // <-- Inicializar con null para evitar el string ""
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <CertificateContext.Provider
      value={{ filters, setFilters, results, setResults, loading, setLoading }}
    >
      {children}
    </CertificateContext.Provider>
  );
};

export const useCertificate = () => {
  const ctx = useContext(CertificateContext);
  if (!ctx) throw new Error("useCertificate debe usarse dentro de CertificateProvider");
  return ctx;
};