"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export interface WarrantyFilters {
  vin: string;
  model: string;
  certificateNumber: string;
  hasWarranty: "si" | "no" | "";
  status: "activa" | "pendiente" | "";
}

interface Warranty {
  id: number;
  activationDate: string;
  vehicle: any;
  user: any;
  company: any;
}

interface WarrantyContextType {
  filters: WarrantyFilters;
  setFilters: (filters: WarrantyFilters) => void;
  results: Warranty[];
  setResults: (results: Warranty[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const WarrantyContext = createContext<WarrantyContextType | undefined>(
  undefined
);

export const useWarranty = () => {
  const context = useContext(WarrantyContext);
  if (!context) throw new Error("useWarranty must be used within WarrantyProvider");
  return context;
};

export const WarrantyProvider = ({ children }: { children: ReactNode }) => {
  const [filters, setFilters] = useState<WarrantyFilters>({
    vin: "",
    model: "",
    certificateNumber: "",
    hasWarranty: "",
    status: "",
  });
  const [results, setResults] = useState<Warranty[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <WarrantyContext.Provider
      value={{ filters, setFilters, results, setResults, loading, setLoading }}
    >
      {children}
    </WarrantyContext.Provider>
  );
};
