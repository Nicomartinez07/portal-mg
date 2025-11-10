"use client";
import { createContext, useContext, useState } from "react";

export type RepuestosFilters = {
  model: string;
  companyId: string;
  code: string;
};

type RepuestosContextType = {
  filters: RepuestosFilters;
  setFilters: (f: RepuestosFilters) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalRepuestos: number;
  setTotalRepuestos: (total: number) => void;
};

const RepuestosContext = createContext<RepuestosContextType | null>(null);

export const RepuestosProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<RepuestosFilters>({
    model: "",
    companyId: "",
    code: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalRepuestos, setTotalRepuestos] = useState(0);

  const handleSetFilters = (newFilters: RepuestosFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Resetea a la página 1 en cada nueva búsqueda
  };

  return (
    <RepuestosContext.Provider
      value={{
        filters,
        setFilters: handleSetFilters,
        currentPage,
        setCurrentPage,
        totalRepuestos,
        setTotalRepuestos,
      }}
    >
      {children}
    </RepuestosContext.Provider>
  );
};

export const useRepuestos = () => {
  const ctx = useContext(RepuestosContext);
  if (!ctx) throw new Error("useRepuestos debe usarse dentro de RepuestosProvider");
  return ctx;
};