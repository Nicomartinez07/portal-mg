import { DraftTable } from "@/components/orders/drafts/DraftsTable";
import { DraftFilters } from "@/components/orders/drafts/DraftsFilters";
import { DraftProvider } from "@/contexts/DraftContext";

export default function OrdersDraftsPage() {
  return (
      <DraftProvider>
        <div className="p-6">
          <h1 className="text-xl font-bold mb-4">Listado de borradores de órdenes</h1>
          <DraftFilters />
          <DraftTable />
        </div>
      </DraftProvider>
  );
}
