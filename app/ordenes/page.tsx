import { OrderProvider } from "@/contexts/OrdersContext";
import { OrderFilters } from "@/components/orders/OrdersFilters";
import OrdersTable  from "@/components/orders/OrdersTable";

import { MGDashboard } from "@/components/mg-dashboard";

export default function OrdersPage() {
  return (
    <MGDashboard>
      <OrderProvider>
        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">Órdenes</h1>
          <OrderFilters />
          <OrdersTable />
        </div>
      </OrderProvider>
    </MGDashboard>
  );
}
