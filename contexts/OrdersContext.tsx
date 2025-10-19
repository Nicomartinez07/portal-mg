"use client";
import { createContext, useContext, useState } from "react";

const getFirstDayOfMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  return `${year}-${month.toString().padStart(2, "0")}-01`;
};

const getLastDayOfMonth = () => {
  const date = new Date();
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${month.toString().padStart(2, "0")}-${lastDay.toString().padStart(2, "0")}`;
};

type OrderFilters = {
  orderNumber?: string;
  vin?: string;
  customerName?: string;
  status?: string;
  type?: string;
  internalStatus: string;
  fromDate?: string;
  toDate?: string;
  companyId?: string; 
};

type OrderContextType = {
  filters: OrderFilters;
  setFilters: (f: OrderFilters) => void;
  results: any[];
  setResults: (r: any[]) => void;
  loading: boolean;
  setLoading: (l: boolean) => void;
};

const OrderContext = createContext<OrderContextType | null>(null);

export const OrderProvider = ({ children }: { children: React.ReactNode }) => {
  const [filters, setFilters] = useState<OrderFilters>({
    orderNumber: "",
    vin: "",
    customerName: "",
    status: "",
    type: "",
    internalStatus: "",
    companyId: "", 
    fromDate: getFirstDayOfMonth(),
    toDate: getLastDayOfMonth(),
  });

  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  return (
    <OrderContext.Provider
      value={{ filters, setFilters, results, setResults, loading, setLoading }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder debe usarse dentro de OrderProvider");
  return ctx;
};