"use client";
import { createContext, useContext, useState } from "react";

type Filters = {
  vin: string;
  model: string;
  certificateNumber: string;
  status: string;
  fromDate?: string;
  toDate?: string;
  licensePlate?: string;
  customerName?: string;
  companyId?: number;
};


type WarrantyContextType = {
  filters: Filters;
  setFilters: (f: Filters) => void;
  results: any[];
  setResults: (r: any[]) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalWarranty: number;
  setTotalWarranty: (total: number) => void;
};

const WarrantyContext = createContext<WarrantyContextType | null>(null);

export const WarrantyProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<Filters>({
    vin: "",
    model: "",
    certificateNumber: "",
    status: "",
    fromDate: "",
    toDate: "",
    licensePlate: "",
    customerName: "",
    companyId: undefined,
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalWarranty, setTotalWarranty] = useState(0);

  return (
    <WarrantyContext.Provider
      value={{ filters, setFilters, results, setResults, loading, setLoading, currentPage, setCurrentPage, totalWarranty, setTotalWarranty }}
    >
      {children}
    </WarrantyContext.Provider>
  );
};

export const useWarranty = () => {
  const ctx = useContext(WarrantyContext);
  if (!ctx) throw new Error("useWarranty debe usarse dentro de WarrantyProvider");
  return ctx;
};