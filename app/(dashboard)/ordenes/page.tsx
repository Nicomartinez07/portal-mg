import { OrderProvider } from "@/contexts/OrdersContext";
import { OrderFilters } from "@/components/orders/OrdersFilters";
import OrdersTable  from "@/components/orders/OrdersTable";
import { ExportOrdersButton } from "@/components/orders/export/ExportButton";

export default function OrdersPage() {
  return (
      <OrderProvider>
       <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Gestión de Órdenes</h1>
            <ExportOrdersButton />
          </div>
          
          <OrderFilters />
          <OrdersTable />
        </div>
      </OrderProvider>
  );
}
