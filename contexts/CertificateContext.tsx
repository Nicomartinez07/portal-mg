"use client";
import { createContext, useContext, useState } from "react";

type CertificateFilters = {
  orderNumber?: string;
  vin?: string;
  customerName?: string;
  status?: string;
  type?: string;  
  internalStatus: string;
  fromDate?: string;
  toDate?: string;
  companyId?: number;
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
    orderNumber: "",
    vin: "",
    customerName: "",
    status: "",
    type: "",
    fromDate: "",
    internalStatus: "",
    toDate: "",
    companyId: undefined,
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
