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
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalOrders: number;
  setTotalOrders: (total: number) => void;
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


  const [currentPage, setCurrentPage] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  // Modificamos setFilters para que siempre resetee a la página 1
  const handleSetFilters = (newFilters: OrderFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); 
  };

  return (
    <OrderContext.Provider
      value={{
        filters,
        setFilters: handleSetFilters, 
        currentPage,
        setCurrentPage,
        totalOrders,
        setTotalOrders,
      }}
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