"use client";
import { createContext, useContext, useState } from "react";

type DraftFilters = {
  orderNumber?: string;
  vin?: string;
  status?: string;
  type?: string;  
  fromDate?: string;
  toDate?: string;
};



type DraftContextType = {
  filters: DraftFilters;
  setFilters: (f: DraftFilters) => void;
  results: any[];
  setResults: (r: any[]) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
};

const DraftContext = createContext<DraftContextType | null>(null);

export const DraftProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<DraftFilters>({
    orderNumber: "",
    vin: "",
    status: "",
    type: "",
    fromDate: "",
    toDate: "",
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <DraftContext.Provider
      value={{ filters, setFilters, results, setResults, loading, setLoading }}
    >
      {children}
    </DraftContext.Provider>
  );
};

export const useDraft = () => {
  const ctx = useContext(DraftContext);
  if (!ctx) throw new Error("useDraft debe usarse dentro de DraftProvider");
  return ctx;
};
